
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './ComponentesUI';
import { generateTechResponse } from '../services/geminiService';
import { CalcMode, Refrigerant } from '../types';
import { useGlobal } from '../contexts/GlobalContext';

export const Ferramenta_3_Calculadora: React.FC = () => {
    const [fluid, setFluid] = useState<Refrigerant>(Refrigerant.R22);
    const [press, setPress] = useState('');
    const [temp, setTemp] = useState('');
    const [mode, setMode] = useState<CalcMode>('SH');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const { theme } = useGlobal();
    const isDark = theme === 'dark';

    const run = async () => {
        if (!press || !temp) return;
        setLoading(true);
        try {
            // Prompt Robótico
            const prompt = `
            COMANDO: CALCULAR ${mode}.
            DADOS: Fluido ${fluid}, Pressão ${press} PSI, Temp ${temp} °C.
            
            INSTRUÇÃO: Retorne APENAS o cálculo matemático e se está DENTRO ou FORA da faixa ideal (SH: 7-12K, SC: 4-8K).
            SEM TEXTO INTRODUTÓRIO. APENAS NÚMEROS E STATUS.
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
