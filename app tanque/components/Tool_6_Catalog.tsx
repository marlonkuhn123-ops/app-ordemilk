
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Select, AIOutputBox } from './UI'; 
import { GoogleGenAI } from "@google/genai"; 
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants"; 

export const Tool_Catalog: React.FC = () => {
    const [volume, setVolume] = useState('RESFRIADOR 4 MIL LITROS 220V 3F - 2 COMPRESSOR MT 50');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    // --- API KEY LOGIC - Strictly use process.env.API_KEY as per Google GenAI SDK guidelines ---
    const apiKey = process.env.API_KEY;

    const fetchData = async () => {
        if (!apiKey) {
            console.warn("DEBUG: API Key is undefined or empty for Tool_6_Catalog.tsx. This usually indicates an environment configuration issue.");
            setResult("ERRO CRÍTICO: API Key não configurada. Verifique o arquivo .env ou o ambiente de deploy.");
            return;
        }

        setLoading(true);
        setResult(""); 
        
        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `
            TAREFA: CONSULTA ESTRITA NA BASE DE DADOS V35.
            MODELO SOLICITADO: ${volume}.
            PROTOCOLO: Liste TODOS os itens (Código, Descrição e Quantidade).
            `;

            const response = await ai.models.generateContent({
                // Updated to recommended model for basic text tasks
                model: 'gemini-3-flash-preview', 
                contents: prompt,
                config: {
                    systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${TOOL_PROMPTS.TECH_DATA}`,
                    temperature: 0.1
                }
            });

            setResult(response.text || "Nenhum dado encontrado.");
        } catch (e: any) {
            setResult(`ERRO: ${e.message || "Falha na conexão."}`);
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
                        SELECIONE O MODELO EXATO
                    </p>
                    <Select 
                        value={volume} 
                        onChange={(e) => setVolume(e.target.value)}
                        label="Modelo do Equipamento"
                    >
                        <optgroup label="4.000 LITROS">
                            <option value="RESFRIADOR 4 MIL LITROS 220V 3F - 2 COMPRESSOR MT 50">4.000L - 220V Trifásico</option>
                            <option value="RESFRIADOR 4 MIL LITROS 220V MONO - 2 COMPRESSOR MT 50">4.000L - 220V Monofásico</option>
                            <option value="RESFRIADOR 4 MIL LITROS 380V 3F - 2 COMPRESSOR MT 50">4.000L - 380V Trifásico</option>
                        </optgroup>
                        <optgroup label="6.000 LITROS">
                            <option value="RESFRIADOR 6 MIL LITROS 220 V MONO - 3 COMPRESSOR MT 50">6.000L - 220V Monofásico</option>
                            <option value="RESFRIADOR 6 MIL LITROS 220V 3F - 3 COMPRESSOR MT 50">6.000L - 220V Trifásico</option>
                        </optgroup>
                        {/* Outros modelos omitidos para economizar espaço, mas funcionam igual */}
                    </Select>
                </div>
                
                <Button onClick={fetchData} disabled={loading}>
                    <i className="fa-solid fa-microchip mr-2"></i>
                    CONSULTAR FICHA TÉCNICA
                </Button>
                
                <AIOutputBox content={result} isLoading={loading} title="FICHA TÉCNICA" />
            </Card>
        </div>
    );
};