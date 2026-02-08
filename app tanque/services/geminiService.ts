
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

const handleApiError = (error: any) => {
    console.error("Gemini API Error:", error);
    const msg = error?.message || "";
    
    if (msg.includes("404") || msg.includes("not found")) {
        // Updated error message for model not found
        return "⚠️ ERRO DE MODELO: O modelo de IA selecionado está obsoleto ou indisponível. Por favor, contate o suporte.";
    }
    if (msg.includes("429") || msg.includes("quota")) {
        return "⚠️ LIMITE DE USO: Aguarde 30 segundos.";
    }
    return "⚠️ ERRO DE CONEXÃO: Verifique sua internet.";
};

export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    // API key must be obtained exclusively from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            // Updated to recommended model for basic text tasks
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

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[],
    newMessage: string,
    imageBase64?: string
) => {
    // API key must be obtained exclusively from process.env.API_KEY
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
            // Updated to recommended model for complex text/chat tasks with image support
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

export const analyzePlateImage = async (imageBase64: string) => {
    // API key must be obtained exclusively from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            // Updated to recommended model for image analysis tasks
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: 'image/jpeg',
                        },
                    },
                    { text: "Analise a placa deste motor. Extraia APENAS dados técnicos em JSON." }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return response.text || "{}";
    } catch (error) {
        console.error("Plate Analysis Error:", error); // Added console.error for better debugging
        return "{}";
    }
};