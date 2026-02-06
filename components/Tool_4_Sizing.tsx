
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';

// --- FERRAMENTA 4: DIMENSIONAMENTO ---
export const Tool_Sizing: React.FC = () => {
    const [calcMode, setCalcMode] = useState<'tank' | 'milking'>('tank');
    const [inputValue, setInputValue] = useState(''); 
    const [milkings, setMilkings] = useState('2');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const run = async () => {
        if (!inputValue) return;
        setLoading(true);
        try {
            const inputNum = parseFloat(inputValue);
            const numMilkings = parseInt(milkings);
            let volPerMilking = calcMode === 'tank' ? inputNum / numMilkings : inputNum;

            const prompt = `Cenário: Resfriar ${volPerMilking} Litros de 35C a 4C em 3h. Fluido R404A. Calcule a Potência HP.`;
            const text = await generateTechResponse(prompt, "SIZING");
            setResult(text);
        } catch (e) { setResult("Erro ao dimensionar."); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-ruler-combined" title="4. DIMENSIONAMENTO" />
            
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => { setCalcMode('tank'); setInputValue(''); setResult(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        calcMode === 'tank' 
                        ? (isDark ? 'bg-sky-700 text-white shadow-lg border border-sky-500/50' : 'bg-slate-800 text-white')
                        : (isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-200 text-slate-500')
                    }`}
                >
                    Pelo Tanque Total
                </button>
                <button 
                    onClick={() => { setCalcMode('milking'); setInputValue(''); setResult(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        calcMode === 'milking' 
                        ? (isDark ? 'bg-sky-700 text-white shadow-lg border border-sky-500/50' : 'bg-slate-800 text-white')
                        : (isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-200 text-slate-500')
                    }`}
                >
                    Por Ordenha
                </button>
            </div>

            <Card>
                <div className="flex gap-2 mb-4">
                    <Input 
                        label={calcMode === 'tank' ? "Capacidade Total (L)" : "Litros por Ordenha"}
                        type="number" 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)} 
                        className="w-2/3" 
                    />
                    <Select label="Nº Ordenhas" value={milkings} onChange={e => setMilkings(e.target.value)} className="w-1/3">
                        <option value="2">2 (Diário)</option>
                        <option value="4">4 (2 Dias)</option>
                    </Select>
                </div>
                
                <Button onClick={run} disabled={loading}>CALCULAR CARGA</Button>
                <AIOutputBox content={result} isLoading={loading} title="POTÊNCIA ESTIMADA" />
            </Card>
        </div>
    );
};
