import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

// --- CONFIGURAÇÃO DE SEGURANÇA E CONEXÃO ---

const STORAGE_KEY = 'om_key_v41_force';
const ENV_BLOCKED_KEY = 'om_env_blocked';

// LISTA DE MODELOS PARA ROTAÇÃO (FALLBACK)
// Se o primeiro falhar (cota excedida), tenta o próximo.
const MODEL_FALLBACK_LIST = [
    'gemini-2.0-flash',          // Principal (Rápido, mas cota baixa)
    'gemini-1.5-flash',          // Secundário (O "Burro de Carga" estável)
    'gemini-1.5-pro-latest',     // Terciário (Mais inteligente, cota menor)
    'gemini-1.5-flash-8b'        // Emergência (Versão Lite)
];

const getAI = () => {
    // 0. Verifica bloqueio
    const isEnvBlocked = localStorage.getItem(ENV_BLOCKED_KEY) === 'true';

    // 1. Chave Manual
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.length > 20 && localKey.startsWith('AIza')) {
        return new GoogleGenAI({ apiKey: localKey });
    }

    if (isEnvBlocked) return null;

    // 2. Chave de Ambiente (Vite/Vercel)
    try {
        // @ts-ignore
        if (import.meta.env.VITE_GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
        // @ts-ignore
        if (import.meta.env.VITE_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        // @ts-ignore
        if (import.meta.env.GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.GOOGLE_API_KEY });
    } catch (e) {}

    // 3. Fallback process.env
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        if (process.env.REACT_APP_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
        if (process.env.VITE_GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: process.env.VITE_GOOGLE_API_KEY });
    }
    
    return null;
};

// --- FUNÇÕES DE FALLBACK (OFFLINE) ---

const getOfflineTechData = (prompt: string): string => {
    try {
        const match = prompt.match(/MODELO SOLICITADO: (.*?)(?:\.|[\r\n]|$)/);
        if (!match) return "Modelo não identificado no modo offline.";
        
        const modelName = match[1].trim();
        const lines = TECHNICAL_CONTEXT.split('\n');
        let capturing = false;
        let result = `📋 FICHA TÉCNICA (MODO OFFLINE)\nMODELO: ${modelName}\n\n`;
        let found = false;

        for (const line of lines) {
            if (line.includes(`[MODELO: ${modelName}]`)) {
                capturing = true;
                found = true;
                continue;
            }
            if (capturing) {
                if (line.trim().startsWith('[MODELO:') || line.trim() === '--- FIM DA BASE DE DADOS ---') {
                    break;
                }
                if (line.trim()) {
                    result += line.trim() + '\n';
                }
            }
        }
        if (!found) return `Modelo exato "${modelName}" não encontrado na base interna.`;
        return result;
    } catch (e) { return "Erro offline."; }
};

const getOfflineCalc = (prompt: string): string => {
    try {
        const fluidoMatch = prompt.match(/Fluido: (R-.*?)\s/);
        const pressMatch = prompt.match(/Pressão Lida.*?: (\d+(\.\d+)?) PSI/);
        const tempMatch = prompt.match(/Temperatura Lida.*?: (\d+(\.\d+)?) °C/);
        
        if (!fluidoMatch || !pressMatch) return "Dados insuficientes.";

        const fluido = fluidoMatch[1] as string;
        const P = parseFloat(pressMatch[1]);
        const T_lida = tempMatch ? parseFloat(tempMatch[1]) : 0;
        const isSH = prompt.includes("Superaquecimento");
        
        let T_sat = 0;
        const isR22 = fluido.includes("22");
        if (isR22) {
            if (P < 100) T_sat = (P - 58) * 0.6; 
            else T_sat = (P - 200) * 0.2 + 40; 
        } else {
            if (P < 80) T_sat = (P - 30) * 0.5 - 20; 
            else T_sat = (P - 250) * 0.15 + 40; 
        }
        const delta = Math.abs(T_lida - T_sat);
        const status = (delta >= 4 && delta <= 12) ? "NORMAL" : "FORA DA FAIXA";
        return `CÁLCULO OFFLINE:\nFluido: ${fluido}\nSaturação (Est.): ${T_sat.toFixed(1)}°C\nRESULTADO ${isSH ? 'SH' : 'SC'}: ${delta.toFixed(1)} K\nSTATUS: ${status}`;
    } catch (e) { return "Erro local."; }
};

// --- LÓGICA DE CHAMADA COM ROTAÇÃO ---

const tryGenerateContent = async (ai: GoogleGenAI, params: any): Promise<string> => {
    let lastError: any = null;

    // Tenta cada modelo da lista
    for (const model of MODEL_FALLBACK_LIST) {
        try {
            console.log(`Tentando conectar com modelo: ${model}...`);
            const response = await ai.models.generateContent({
                ...params,
                model: model // Sobrescreve o modelo
            });
            return response.text || "Sem resposta de texto.";
        } catch (error: any) {
            console.warn(`Falha no modelo ${model}:`, error.message);
            lastError = error;

            // Se for erro de Cota (429) ou Serviço Indisponível (503), continua para o próximo modelo.
            // Se for erro de Chave (400/403), não adianta trocar modelo, aborta.
            const msg = error.message || "";
            if (msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("exhausted")) {
                continue; // Tenta o próximo
            } else {
                throw error; // Erro fatal (ex: chave inválida), para tudo
            }
        }
    }

    throw lastError || new Error("Todos os modelos falharam.");
};

// --- EXPORTS ---

export const generateTechResponse = async (userPrompt: string, toolType: string = "ASSISTANT") => {
    const ai = getAI();
    
    if (!ai) {
        if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
        if (toolType === "CALC") return getOfflineCalc(userPrompt);
        return "⚠️ MODO OFFLINE: Funcionalidade indisponível sem chave de API.";
    }

    const toolInstruction = (TOOL_PROMPTS as any)[toolType] || "";
    const fullSystemInstruction = `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${toolInstruction}`;

    try {
        const text = await tryGenerateContent(ai, {
            contents: { role: "user", parts: [{ text: userPrompt }] },
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.1,
                maxOutputTokens: 2000,
            }
        });
        return text;
    } catch (error: any) {
        // TRATAMENTO DE ERRO LIMPO (SEM JSON NA TELA)
        const msg = error.message || "";
        
        // 1. Erro de Chave
        if (msg.includes("key") || msg.includes("400") || msg.includes("403")) {
            const manualKey = localStorage.getItem(STORAGE_KEY);
            if (manualKey) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(ENV_BLOCKED_KEY, 'true');
        }

        // 2. Erro de Cota (Se todos os modelos falharem)
        if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
            if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
            if (toolType === "CALC") return getOfflineCalc(userPrompt);
            return "⏳ SERVIDORES OCUPADOS. A IA atingiu o limite gratuito de requisições. Tente novamente em 1 minuto ou use as ferramentas manuais.";
        }

        // Fallback final
        if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
        if (toolType === "CALC") return getOfflineCalc(userPrompt);

        return `⚠️ ERRO DE CONEXÃO.`;
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    const ai = getAI();
    
    if (!ai) {
        const msg = newMessage.toLowerCase();
        if (msg.includes("erro")) return "⚠️ CHAT OFFLINE. Use a ferramenta '2. ERROS'.";
        if (msg.includes("calc")) return "⚠️ CHAT OFFLINE. Use a ferramenta '3. CALC'.";
        return "⚠️ CHAT INDISPONÍVEL. Sem chave de API válida.";
    }

    const contents = history.map(h => ({ role: h.role, parts: h.parts }));
    const newParts: any[] = [{ text: newMessage }];
    if (imageBase64) newParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    contents.push({ role: "user", parts: newParts });

    try {
        const text = await tryGenerateContent(ai, {
            contents: contents,
            config: {
                systemInstruction: `${SYSTEM_PROMPT_BASE}\n\n${TECHNICAL_CONTEXT}\n\n${TOOL_PROMPTS.DIAGNOSTIC}`,
                temperature: 0.1
            }
        });
        return text;
    } catch (error: any) {
        const msg = error.message || "";
        
        if (msg.includes("key") || msg.includes("403")) {
             if (localStorage.getItem(STORAGE_KEY)) localStorage.removeItem(STORAGE_KEY);
             else localStorage.setItem(ENV_BLOCKED_KEY, 'true');
             return "⛔ CHAVE INVÁLIDA. Verifique suas configurações.";
        }
        
        if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
            return "⏳ SISTEMA SOBRECARREGADO. Muitos acessos simultâneos. Aguarde alguns instantes e tente novamente.";
        }

        return "Erro de comunicação com o servidor.";
    }
};

export const analyzePlateImage = async (imageBase64: string) => {
    const ai = getAI();
    if (!ai) return "{}";
    
    try {
        const text = await tryGenerateContent(ai, {
            contents: {
                parts: [
                    { text: "Leia a placa do motor. Retorne APENAS JSON: {volts: numero, amps: numero, phase: 'tri'|'bi'|'mono'}." },
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
                ]
            },
            config: { responseMimeType: "application/json", temperature: 0.0 }
        });
        return text || "{}";
    } catch (error) { return "{}"; }
};