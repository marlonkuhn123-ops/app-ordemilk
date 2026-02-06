
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';
import { CalcMode, Refrigerant } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// 2. ERROR DECODER
export const ErrorDecoder: React.FC = () => {
    const [model, setModel] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const prompt = `Controlador: ${model}. Código: ${code}. O que significa e como resolver? Responda curto.`;
            const text = await generateTechResponse(prompt, "ERRORS");
            setResult(text);
        } catch (e) { setResult("Erro ao processar."); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-triangle-exclamation" title="2. ERROS E LIMPEZA (CIP)" />
            <Card>
                <Input label="Modelo do Controlador" placeholder="Ex: Full Gauge, TC-900..." value={model} onChange={e => setModel(e.target.value)} />
                <Input label="Código no Visor ou Sintoma de Sujeira" placeholder="Ex: E1, AH, Pedra do Leite, Gordura..." value={code} onChange={e => setCode(e.target.value)} />
                <Button onClick={run} disabled={loading}>ANALISAR FALHA</Button>
                <AIOutputBox content={result} isLoading={loading} />
            </Card>
        </div>
    );
};

// 3. CALCULATOR
export const Calculator: React.FC = () => {
    const [fluid, setFluid] = useState<Refrigerant>(Refrigerant.R22);
    const [press, setPress] = useState('');
    const [temp, setTemp] = useState('');
    const [mode, setMode] = useState<CalcMode>('SH');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const run = async () => {
        if (!press || !temp) return;
        setLoading(true);
        try {
            const prompt = `
            DADOS TÉCNICOS:
            - Fluido: ${fluid}
            - Pressão Lida (Manômetro): ${press} PSI
            - Temperatura Lida (Termômetro): ${temp} °C
            - Modo de Cálculo: ${mode === 'SH' ? 'Superaquecimento (Sucção)' : 'Sub-resfriamento (Líquido)'}
            `;
            const text = await generateTechResponse(prompt, "CALC");
            setResult(text);
        } catch (e) { setResult("Erro ao calcular."); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-calculator" title="3. CÁLCULO TÉCNICO" />
            <Card>
                <Select label="Fluido Refrigerante" value={fluid} onChange={e => setFluid(e.target.value as Refrigerant)}>
                    <option value={Refrigerant.R22}>R-22</option>
                    <option value={Refrigerant.R404A}>R-404A</option>
                </Select>
                
                <div className="flex gap-2">
                    <Input label="Pressão (PSI)" type="number" value={press} onChange={e => setPress(e.target.value)} placeholder="Manômetro" />
                    <Input label="Temp. Tubo (°C)" type="number" value={temp} onChange={e => setTemp(e.target.value)} placeholder="Termômetro" />
                </div>
                
                <Select label="Modo de Cálculo" value={mode} onChange={e => setMode(e.target.value as CalcMode)}>
                    <option value="SH">Superaquecimento (Baixa/Sucção)</option>
                    <option value="SR">Sub-resfriamento (Alta/Líquido)</option>
                </Select>

                {/* AVISO TÉCNICO DE POSIÇÃO DE MEDIÇÃO */}
                <div className={`mb-4 p-3 rounded-lg border text-[10px] font-medium leading-relaxed flex items-start gap-2 transition-colors ${
                    isDark ? 'bg-blue-900/20 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                    <i className="fa-solid fa-circle-info mt-0.5 text-xs text-blue-400"></i>
                    <span>
                        {mode === 'SH' 
                            ? "SUPER AQUECIMENTO (SH): Meça a temperatura na tubulação de sucção, a 10cm do compressor, com isolamento térmico."
                            : "SUB RESFRIAMENTO (SC): Meça a temperatura na linha de líquido, a 10cm da saída do condensador."}
                    </span>
                </div>

                <Button onClick={run} disabled={loading}>CALCULAR AGORA</Button>
                <AIOutputBox content={result} isLoading={loading} title={`RESULTADO ${mode}`} />
            </Card>
        </div>
    );
};

// 4. SIZING
export const Sizing: React.FC = () => {
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
