import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

// CONFIGURAÇÃO DA CHAVE DE API
// Prioridade: 1. Variável de Ambiente (process.env) 2. Chave Fixa (Inserida pelo Usuário)
const HARDCODED_KEY = "AIzaSyDqcYW0iwXxWsLMqHxHgMlR48j3ttiBUuQ";
const apiKey = process.env.API_KEY || HARDCODED_KEY || ""; 

const ai = new GoogleGenAI({ apiKey: apiKey });
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    if (!apiKey) {
        return "⚠️ ERRO DE SISTEMA: Chave de API não detectada.\n\nAdicione sua chave no código em 'services/geminiService.ts' ou no arquivo .env.";
    }

    const toolInstruction = (TOOL_PROMPTS as any)[toolType] || "";
    const fullSystemInstruction = `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${toolInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: { role: "user", parts: [{ text: userPrompt }] },
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.0,
                maxOutputTokens: 2000,
            }
        });

        return response.text || "Sem resposta da IA.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        // Mensagem de erro amigável para o técnico
        return `⚠️ FALHA DE CONEXÃO:\n${error.message || "Erro desconhecido ao contatar a IA."}\n\nVerifique se a chave de API é válida.`;
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    if (!apiKey) return "⚠️ ERRO: API_KEY não configurada.";

    const contents = history.map(h => ({ role: h.role, parts: h.parts }));
    
    const newParts: any[] = [{ text: newMessage }];
    if (imageBase64) {
        newParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }
    contents.push({ role: "user", parts: newParts });

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
            config: {
                systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${TOOL_PROMPTS.DIAGNOSTIC}`,
                temperature: 0.0
            }
        });
        
        return response.text || "Sem resposta.";
    } catch (error: any) {
        console.error("Chat Error:", error);
        return `⚠️ Erro de Conexão: ${error.message || "Servidor não respondeu."}`;
    }
};

export const analyzePlateImage = async (imageBase64: string) => {
    if (!apiKey) return "{}";

    const prompt = "Leia a placa do motor. Retorne APENAS JSON: {volts: numero, amps: numero, phase: 'tri'|'bi'|'mono'}. Se não conseguir ler com certeza absoluta, retorne {}.";
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                temperature: 0.0
            }
        });

        return response.text || "{}";
    } catch (error) {
        console.error("Image Analysis Error:", error);
        return "{}";
    }
};