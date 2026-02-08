
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';

// --- FERRAMENTA 4: DIMENSIONAMENTO ---
export const Tool_Sizing: React.FC = () => {
    // ESTADO: Sempre focar em "Litros por Ordenha" que é o dado real de carga térmica
    const [volumeOrdenha, setVolumeOrdenha] = useState(''); 
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    // INPUT AUXILIAR: Caso o usuário queira digitar o tanque total
    const [inputMode, setInputMode] = useState<'ordenha' | 'tanque'>('ordenha');
    const [inputRaw, setInputRaw] = useState('');

    const handleInputChange = (val: string) => {
        setInputRaw(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            // Se digitou tanque total (ex: 4000L), considera 2 ordenhas (padrão) -> 2000L por vez
            if (inputMode === 'tanque') setVolumeOrdenha((num / 2).toString());
            else setVolumeOrdenha(val);
        } else {
            setVolumeOrdenha('');
        }
    };

    const run = async () => {
        if (!volumeOrdenha) return;
        setLoading(true);
        
        try {
            const V = parseFloat(volumeOrdenha);
            
            // --- CÁLCULO DE ENGENHARIA (PADRÃO DANFOSS / ORDEMILK) ---
            // Delta T = 35°C (Entrada) - 4°C (Final) = 31°C
            // Tempo = 3 Horas (Norma ISO 5708 para 2 ordenhas)
            // Cp Leite = 0.93 kcal/kg°C
            // Densidade = 1.03 kg/L
            
            // 1. Carga Térmica Base (kcal/h)
            // Fórmula: Q = (Massa * Cp * DeltaT) / Tempo
            const massa = V * 1.03;
            const cargaBase = (massa * 0.93 * 31) / 3;
            
            // 2. Fator de Segurança (+10% p/ perdas térmicas, agitação e limpeza)
            const cargaTotalKcal = cargaBase * 1.10;
            
            // 3. Conversão para kW Térmico (1 kcal/h = 0.001162 kW ou dividir por 860)
            const cargaTotalKw = cargaTotalKcal / 860;
            
            // 4. Estimativa de HP (Referência Comercial: R404A @ Evap -5°C / Cond 40°C)
            // Eficiência média de compressores recíprocos nesse regime: ~1900 kcal/h por HP.
            // Usamos divisor conservador.
            const hpEstimado = cargaTotalKcal / 1900;

            // Prompt Robótico e Preciso - Passando os valores JÁ CALCULADOS
            const prompt = `
            COMANDO: DIMENSIONAMENTO TÉCNICO RIGOROSO (DANFOSS).
            
            PARÂMETROS DE PROJETO (FIXOS - NÃO ALTERAR):
            - Regime: Resfriamento de Leite.
            - Evaporação (SST): -5°C.
            - Condensação (SDT): 40°C (Verão Tropical).
            - Tempo de Resfriamento: 3 Horas (Norma ISO).
            
            DADOS CALCULADOS PELO SISTEMA (USAR EXATAMENTE ESTES):
            - Volume por Ordenha: ${V} Litros.
            - Carga Térmica Requerida: ${cargaTotalKcal.toFixed(0)} kcal/h.
            - Potência Frigorífica: ${cargaTotalKw.toFixed(2)} kW.
            - Estimativa Comercial: ${hpEstimado.toFixed(1)} HP (Ref. compressor recíproco).
            
            INSTRUÇÃO DE SAÍDA:
            1. Gere um "MEMORIAL DE CÁLCULO" listando os 3 principais indicadores: KCAL/H, KW e HP.
            2. Destaque em negrito a condição de projeto: "Considerando Evaporação -5°C e Condensação 40°C".
            3. Seja extremamente técnico e direto. Sem saudações.
            `;

            const text = await generateTechResponse(prompt, "SIZING");
            setResult(text);
            
        } catch (e) { setResult("Erro no cálculo."); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn pb-24">
            <SectionTitle icon="fa-solid fa-ruler-combined" title="4. DIMENSIONAMENTO" />
            
            {/* SWITCH DE MODO */}
            <div className="flex bg-[#252525] p-1 rounded-lg mb-4 border border-[#404040]">
                <button 
                    onClick={() => { setInputMode('ordenha'); setInputRaw(''); setVolumeOrdenha(''); setResult(''); }}
                    className={`flex-1 py-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                        inputMode === 'ordenha' 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Por Ordenha (Litros)
                </button>
                <button 
                    onClick={() => { setInputMode('tanque'); setInputRaw(''); setVolumeOrdenha(''); setResult(''); }}
                    className={`flex-1 py-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                        inputMode === 'tanque' 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Capacidade Tanque
                </button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input 
                        label={inputMode === 'ordenha' ? "Litros na Ordenha (Carga Real)" : "Capacidade Total do Tanque"}
                        placeholder={inputMode === 'ordenha' ? "Ex: 1000 Litros" : "Ex: 4000 Litros"}
                        type="number" 
                        value={inputRaw} 
                        onChange={e => handleInputChange(e.target.value)} 
                        autoFocus
                    />
                    
                    {volumeOrdenha && inputMode === 'tanque' && (
                        <div className="text-right text-[10px] text-orange-400 font-bold -mt-2 mb-2 px-1">
                            Considerando 2 ordenhas/dia: {volumeOrdenha} L/ordenha
                        </div>
                    )}
                </div>

                {/* VISUALIZAÇÃO DOS PARÂMETROS DE PROJETO (FIXOS) */}
                <div className="mb-4 p-3 rounded-lg border flex flex-col gap-2 bg-[#1a1a1a] border-[#333]">
                    <div className="flex items-center gap-2 border-b border-[#333] pb-2">
                        <i className="fa-solid fa-temperature-low text-orange-500 text-xs"></i>
                        <span className="text-[10px] font-bold text-gray-300 uppercase">Parâmetros de Projeto (Danfoss)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                        <div>Evaporação (SST): <span className="text-white font-bold">-5°C</span></div>
                        <div>Condensação (SDT): <span className="text-white font-bold">40°C</span></div>
                        <div>Delta T (Leite): <span className="text-white font-bold">31°C</span></div>
                        <div>Tempo Limite: <span className="text-white font-bold">3 Horas</span></div>
                    </div>
                </div>
                
                <Button onClick={run} disabled={loading}>
                    CALCULAR CARGA TÉRMICA
                </Button>
                
                <AIOutputBox content={result} isLoading={loading} title="MEMORIAL DE CÁLCULO" />
            </Card>
        </div>
    );
};