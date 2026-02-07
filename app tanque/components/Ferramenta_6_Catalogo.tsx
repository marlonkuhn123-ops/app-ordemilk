
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Select, AIOutputBox } from './ComponentesUI';
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

export const Ferramenta_6_Catalogo: React.FC = () => {
    const [volume, setVolume] = useState('RESFRIADOR 4 MIL LITROS 220V 3F - 2 COMPRESSOR MT 50');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        // Correctly using process.env.API_KEY as per the library guidelines
        setLoading(true);
        setResult(""); 
        
        try {
            // Initializing GoogleGenAI with a named parameter object as required by the latest SDK
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
            TAREFA: CONSULTA ESTRITA NA BASE DE DADOS V35.
            MODELO SOLICITADO: ${volume}.
            
            PROTOCOLO:
            1. Busque este cabeçalho EXATO na "BASE DE DADOS DOS EQUIPAMENTOS".
            2. Liste TODOS os itens (Código, Descrição e Quantidade) que estão abaixo deste cabeçalho.
            3. Formate como uma tabela ou lista limpa.
            
            REGRA CRÍTICA DE SAÍDA:
            - NÃO FALE NADA.
            - APENAS RETORNE A LISTA.
            `;

            // Using gemini-3-flash-preview for standard data extraction tasks as per guidelines
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${TOOL_PROMPTS.TECH_DATA}`,
                    temperature: 0.1
                }
            });

            // Directly accessing .text property on GenerateContentResponse
            setResult(response.text || "Nenhum dado encontrado para este modelo.");
        } catch (e: any) {
            setResult(`ERRO: ${e.message || "Falha na conexão com a API."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-boxes-stacked" title="6. DADOS TÉCNICOS (BOM)" />
            <Card>
                <div className="mb-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">
                        SELECIONE O MODELO EXATO (LISTA OFICIAL)
                    </p>
                    <Select 
                        value={volume} 
                        onChange={(e) => setVolume(e.target.value)}
                        label="Modelo do Equipamento"
                    >
                        <optgroup label="4.000 LITROS (2 COMPRESSORES)">
                            <option value="RESFRIADOR 4 MIL LITROS 220V 3F - 2 COMPRESSOR MT 50">4.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 4 MIL LITROS 220V MONO - 2 COMPRESSOR MT 50">4.000L - 220V Monofásico</option>
                            <option value="RESFRIADOR 4 MIL LITROS 380V 3F - 2 COMPRESSOR MT 50">4.000L - 380V Trifásico</option>
                        </optgroup>

                        <optgroup label="6.000 LITROS (3 COMPRESSORES)">
                            <option value="RESFRIADOR 6 MIL LITROS 220 V MONO - 3 COMPRESSOR MT 50">6.000L - 220V Monofásico</option>
                            <option value="RESFRIADOR 6 MIL LITROS 220V 3F - 3 COMPRESSOR MT 50">6.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 6 MIL LITROS 380V 3 F - 3 COMPRESSOR MT 50">6.000L - 380V Trifásico</option>
                        </optgroup>

                        <optgroup label="10.000 LITROS (3 COMPRESSORES)">
                            <option value="RESFRIADOR 10 MIL LITROS 220V 3F - 3 COMPRESSORES MT100">10.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 10 MIL LITROS 380V 3F - 3 COMPRESSORES MT100">10.000L - 380V Trifásico</option>
                        </optgroup>

                        <optgroup label="12.000 LITROS (3 COMPRESSORES)">
                            <option value="RESFRIADOR 12 MIL LITROS 220V 3F - 3 COMPRESSORES MT100">12.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 12 MIL LITROS 380V 3F - 3 COMPRESSORES MT100">12.000L - 380V Trifásico</option>
                        </optgroup>

                        <optgroup label="15.000 LITROS (3 COMPRESSORES)">
                            <option value="RESFRIADOR 15 MIL LITROS 220V 3F - 3 COMPRESSORES MT125">15.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 15 MIL LITROS 380V 3F - 3 COMPRESSORES MT125">15.000L - 380V Trifásico</option>
                        </optgroup>

                        <optgroup label="20.000 LITROS (4 COMPRESSORES)">
                            <option value="RESFRIADOR 20 MIL LITROS 220V 3F - 4 COMPRESSORES MT125">20.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 20 MIL LITROS 380V 3F - 4 COMPRESSORES MT125">20.000L - 380V Trifásico</option>
                        </optgroup>
                    </Select>
                </div>
                
                <div className="mb-4 p-3 rounded-lg border bg-[#252525] border-[#404040] flex items-start gap-2">
                    <i className="fa-solid fa-database text-orange-500 mt-0.5 text-xs"></i>
                    <p className="text-[10px] text-gray-300 leading-tight">
                        Consulta <strong>ESTRITA</strong> à Base V35 (Engenharia). Dados oficiais de fábrica.
                    </p>
                </div>

                <Button onClick={fetchData} disabled={loading}>
                    <i className="fa-solid fa-microchip mr-2"></i>
                    CONSULTAR FICHA TÉCNICA
                </Button>
                
                <AIOutputBox 
                    content={result} 
                    isLoading={loading} 
                    title="FICHA TÉCNICA OFICIAL (BOM)" 
                />
            </Card>
        </div>
    );
};
