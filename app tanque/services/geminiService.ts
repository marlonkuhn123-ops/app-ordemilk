import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

// --- CONFIGURAÇÃO DE SEGURANÇA E CONEXÃO ---

// CHAVE DE STORAGE (NAVEGADOR)
const STORAGE_KEY = 'om_key_v41_force';

const getAI = () => {
    // 1. Tenta pegar do LocalStorage (Inserida manualmente)
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.length > 20 && localKey.startsWith('AIza')) {
        return new GoogleGenAI({ apiKey: localKey });
    }

    // 2. Tenta pegar do Ambiente (Vercel / .env)
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        if (process.env.REACT_APP_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
    }

    // 3. Tenta pegar do Ambiente VITE
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
            // @ts-ignore
            return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        }
    } catch (e) {
        // Ignora
    }
    
    // Se não achar chave, retorna null. O tratamento de erro será na chamada.
    return null;
};

// MODELO ESTÁVEL
const MODEL_NAME = 'gemini-2.0-flash';

export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    const ai = getAI();
    
    if (!ai) {
        return "⚠️ MODO OFFLINE (SEM CHAVE API)\n\nO aplicativo está sem uma chave de IA configurada. \n\nPara corrigir:\n1. Adicione a variável GEMINI_API_KEY no seu provedor (Vercel).\n2. Ou clique no ícone de chave no topo e cole uma API Key manualmente.";
    }

    const toolInstruction = (TOOL_PROMPTS as any)[toolType] || "";
    const fullSystemInstruction = `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${toolInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: { role: "user", parts: [{ text: userPrompt }] },
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.1,
                maxOutputTokens: 2000,
            }
        });

        return response.text || "Sem resposta da IA.";
    } catch (error: any) {
        console.error("Gemini API Error V44:", error);
        
        if (error.message) {
            if (error.message.includes("403") || error.message.includes("key")) {
                return `⛔ ERRO DE CHAVE (403)\n\nA chave API configurada no servidor ou dispositivo é inválida.`;
            }
            if (error.message.includes("429")) {
                return `⏳ COTA EXCEDIDA (429)\n\nAguarde alguns instantes e tente novamente.`;
            }
        }

        return `⚠️ ERRO TÉCNICO:\n${error.message || "Falha desconhecida."}`;
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    const ai = getAI();
    if (!ai) return "⚠️ ERRO: Sistema sem chave de API configurada. Verifique as configurações.";

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
                temperature: 0.1
            }
        });
        
        return response.text || "Sem resposta.";
    } catch (error: any) {
        console.error("Chat Error V44:", error);
        if (error.message && error.message.includes("key")) {
             return "⛔ ERRO: Chave de API inválida ou expirada.";
        }
        return `Erro: ${error.message}`;
    }
};

export const analyzePlateImage = async (imageBase64: string) => {
    const ai = getAI();
    if (!ai) return "{}";

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
        return "{}";
    }
};