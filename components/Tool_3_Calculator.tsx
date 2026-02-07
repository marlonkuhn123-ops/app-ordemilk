
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';
import { CalcMode, Refrigerant } from '../types';

// --- FERRAMENTA 3: CALCULADORA DE GÁS ---
export const Tool_Calculator: React.FC = () => {
    const [fluid, setFluid] = useState<Refrigerant>(Refrigerant.R22);
    const [press, setPress] = useState('');
    const [temp, setTemp] = useState('');
    const [mode, setMode] = useState<CalcMode>('SH');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async () => {
        if (!press || !temp) return;
        setLoading(true);
        try {
            // Prompt Robótico e Preciso, com instruções para incluir recomendações
            const prompt = `
            COMANDO: CALCULAR ${mode === 'SH' ? 'Superaquecimento (SH)' : 'Sub-resfriamento (SC)'}.
            DADOS: Fluido ${fluid}, Pressão ${press} PSI, Temperatura ${temp} °C.
            
            CONTEXTO DE REFERÊNCIA:
            - Faixa IDEAL para Superaquecimento (SH): 7K a 12K.
            - Faixa IDEAL para Sub-resfriamento (SC): 4K a 8K.
            
            INSTRUÇÃO DE SAÍDA (Obrigatório seguir este formato):
            NÃO use formatação Markdown, LaTeX, negrito ou itálico. Não use símbolos como $ ou \textbf. Apenas texto puro e direto.
            1. Apresente o cálculo matemático do ${mode === 'SH' ? 'Superaquecimento (SH)' : 'Sub-resfriamento (SC)'} em Kelvin (K).
            2. Classifique o resultado como "DENTRO da faixa ideal", "ALTO" ou "BAIXO", comparando com as faixas de referência acima.
            3. Adicione uma **AÇÃO RECOMENDADA** prática e concisa, baseada na classificação:
                - Se SH estiver ALTO (acima de 12K): \n🔧 AÇÃO RECOMENDADA: Falta de fluido. Adicione carga de gás aos poucos e monitore.
                - Se SH estiver BAIXO (abaixo de 7K): \n⚠️ AÇÃO RECOMENDADA: Risco de retorno de líquido! Recolha fluido ou verifique se o evaporador está sujo/bloqueado.
                - Se SH estiver DENTRO (entre 7K e 12K): \n✅ AÇÃO: Sistema equilibrado. Não é necessário intervir.
                
                - Se SC estiver ALTO (acima de 8K): \n⚠️ AÇÃO RECOMENDADA: Supercarga de fluido ou restrição na linha de líquido. Verifique a carga e a válvula de expansão.
                - Se SC estiver BAIXO (abaixo de 4K): \n🔧 AÇÃO RECOMENDADA: Subcarga de fluido ou entrada de ar/umidade. Verifique vazamentos e vácuo.
                - Se SC estiver DENTRO (entre 4K e 8K): \n✅ AÇÃO: Sistema equilibrado. Não é necessário intervir.
            
            Comece a resposta diretamente com o cálculo.
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

                <div className={`mb-4 p-3 rounded-lg border text-[10px] font-medium leading-relaxed flex items-start gap-2 transition-colors bg-blue-900/20 border-blue-800 text-blue-200`}>
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