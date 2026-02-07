
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

const handleApiError = (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error?.message || "";
    
    if (msg.includes("429") || msg.includes("quota")) {
        return "⚠️ LIMITE DE USO EXCEDIDO: O sistema atingiu o limite de consultas gratuitas por minuto. Aguarde 60 segundos.";
    }
    return "⚠️ ERRO DE CONEXÃO: Verifique sua internet ou tente novamente.";
};

/**
 * Generates a response for technical tools using the specified prompt and context.
 */
export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${(TOOL_PROMPTS as any)[toolType] || ""}`,
                temperature: 0.1,
                topP: 0.8
            }
        });

        return response.text || "";
    } catch (error: any) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Generates a response for the interactive diagnostic chat.
 */
export const generateChatResponse = async (
    history: { role: string; parts: any[] }[],
    newMessage: string,
    imageBase64?: string
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const contents = [...history];
        const currentParts: any[] = [{ text: newMessage }];
        
        if (imageBase64) {
            currentParts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg',
                },
            });
        }
        
        contents.push({ role: 'user', parts: currentParts });

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: {
                systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${TOOL_PROMPTS.DIAGNOSTIC}`,
                temperature: 0.2,
                topP: 0.9
            }
        });
        
        return response.text || "";

    } catch (error: any) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Analyzes an image of a motor plate to extract technical data.
 */
export const analyzePlateImage = async (imageBase64: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: 'image/jpeg',
                        },
                    },
                    { text: "Analise a placa deste motor ou compressor. Extraia APENAS os dados técnicos em JSON: {volts: string, amps: string, phase: 'tri'|'mono', model: string}." }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });
        
        return response.text || "{}";
    } catch (error) {
        console.error("Plate Analysis Error:", error);
        return "{}";
    }
};