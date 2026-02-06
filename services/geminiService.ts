
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

const getApiKey = () => {
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
        return (window as any).process.env.API_KEY;
    }
    return "";
};

const API_KEY = getApiKey();
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    if (!API_KEY) return "ERRO: Chave API não configurada.";

    const toolInstruction = (TOOL_PROMPTS as any)[toolType] || "";
    const fullSystemInstruction = `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${toolInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: { role: "user", parts: [{ text: userPrompt }] },
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.0, // TEMPERATURA ZERO: Impede improvisação. A IA torna-se determinística.
                maxOutputTokens: 2000,
            }
        });

        return response.text || "Sem resposta da IA.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return "Serviço indisponível no momento. Verifique sua conexão.";
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    if (!API_KEY) return "ERRO: Chave API não configurada.";

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
                temperature: 0.0 // TEMPERATURA ZERO: Impede improvisação no chat.
            }
        });
        
        return response.text || "Sem resposta.";
    } catch (error: any) {
        console.error("Chat Error:", error);
        return "Erro de comunicação com a IA.";
    }
};

export const analyzePlateImage = async (imageBase64: string) => {
    if (!API_KEY) return "{}";

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
                temperature: 0.0 // Leitura OCR precisa ser exata.
            }
        });

        return response.text || "{}";
    } catch (error) {
        console.error("Image Analysis Error:", error);
        return "{}";
    }
};
