import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_BASE, TOOL_PROMPTS, TECHNICAL_CONTEXT } from "../constants";

// --- CONFIGURAÇÃO DE SEGURANÇA E CONEXÃO ---

// CHAVE DE STORAGE (NAVEGADOR) - Chave inserida manualmente pelo usuário
const STORAGE_KEY = 'om_key_v41_force';
// FLAG DE BLOQUEIO - Impede uso de chave de ambiente se ela estiver queimada
const ENV_BLOCKED_KEY = 'om_env_blocked';

const getAI = () => {
    // 0. Verifica se a chave do ambiente foi marcada como inválida/expirada
    const isEnvBlocked = localStorage.getItem(ENV_BLOCKED_KEY) === 'true';

    // 1. Tenta pegar do LocalStorage (Prioridade total - Manual Override)
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.length > 20 && localKey.startsWith('AIza')) {
        return new GoogleGenAI({ apiKey: localKey });
    }

    // Se a chave de ambiente foi bloqueada anteriormente, não tenta ler do env
    if (isEnvBlocked) {
        return null;
    }

    // 2. TENTATIVA ROBUSTA DE PEGAR DO AMBIENTE (VITE / VERCEL)
    try {
        // @ts-ignore
        if (import.meta.env.VITE_GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
        // @ts-ignore
        if (import.meta.env.VITE_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        // @ts-ignore
        if (import.meta.env.GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: import.meta.env.GOOGLE_API_KEY });
    } catch (e) {}

    // 3. Fallback para process.env (React clássico ou Node)
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        if (process.env.REACT_APP_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
        if (process.env.VITE_GOOGLE_API_KEY) return new GoogleGenAI({ apiKey: process.env.VITE_GOOGLE_API_KEY });
    }
    
    return null;
};

const MODEL_NAME = 'gemini-2.0-flash';

// --- FUNÇÕES DE FALLBACK (OFFLINE - BASE DE DADOS INTERNA) ---

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
    } catch (e) {
        return "Erro ao processar dados offline.";
    }
};

const getOfflineCalc = (prompt: string): string => {
    try {
        const fluidoMatch = prompt.match(/Fluido: (R-.*?)\s/);
        const pressMatch = prompt.match(/Pressão Lida.*?: (\d+(\.\d+)?) PSI/);
        const tempMatch = prompt.match(/Temperatura Lida.*?: (\d+(\.\d+)?) °C/);
        
        if (!fluidoMatch || !pressMatch) return "Dados insuficientes para cálculo offline.";

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
        const status = (delta >= 4 && delta <= 12) ? "NORMAL (IDEAL)" : "FORA DA FAIXA";

        return `CÁLCULO OFFLINE (ESTIMADO):\n\nFluido: ${fluido}\nPressão: ${P} PSI\nTemp. Saturação (Aprox): ${T_sat.toFixed(1)}°C\n\nRESULTADO ${isSH ? 'SH' : 'SC'}: ${delta.toFixed(1)} K\nSTATUS: ${status}\n\n(Conecte uma chave válida para cálculo de precisão)`;
    } catch (e) {
        return "Erro no cálculo local.";
    }
};

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
        console.warn("Gemini API Error (Handled V48):", error.message);
        
        if (error.message && (error.message.includes("key") || error.message.includes("400") || error.message.includes("403"))) {
            const manualKey = localStorage.getItem(STORAGE_KEY);
            if (manualKey) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(ENV_BLOCKED_KEY, 'true');
            }
        }

        if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
        if (toolType === "CALC") return getOfflineCalc(userPrompt);

        return `⚠️ ERRO DE CONEXÃO (MODO OFFLINE ATIVADO).\nTente novamente ou use as ferramentas manuais.`;
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    const ai = getAI();
    
    // MELHORIA V48: Resposta mais útil quando offline
    if (!ai) {
        const msg = newMessage.toLowerCase();
        if (msg.includes("erro") || msg.includes("código") || msg.includes("alarme")) {
            return "⚠️ CHAT OFFLINE.\n\nPara consultar códigos de falha sem internet, use a ferramenta '2. ERROS' no menu inferior.";
        }
        if (msg.includes("calcul") || msg.includes("pressão") || msg.includes("gás")) {
            return "⚠️ CHAT OFFLINE.\n\nPara cálculos de refrigeração sem internet, use a ferramenta '3. CALC' no menu inferior.";
        }
        if (msg.includes("peça") || msg.includes("ficha") || msg.includes("manual")) {
            return "⚠️ CHAT OFFLINE.\n\nPara ver listas de peças sem internet, use a ferramenta '6. DADOS' no menu inferior.";
        }
        return "⚠️ CHAT INDISPONÍVEL.\n\nNão foi detectada uma Chave de API válida. Verifique sua conexão ou adicione uma chave no ícone de 'Chave' no topo da tela.";
    }

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
        if (error.message && (error.message.includes("key") || error.message.includes("403") || error.message.includes("400"))) {
             if (localStorage.getItem(STORAGE_KEY)) localStorage.removeItem(STORAGE_KEY);
             else localStorage.setItem(ENV_BLOCKED_KEY, 'true');
             
             return "⛔ CHAVE EXPIRADA/INVÁLIDA.\nO sistema bloqueou a chave atual por segurança. Insira uma nova chave manualmente ou verifique a configuração do Vercel (VITE_GOOGLE_API_KEY).";
        }
        return `Erro de comunicação: ${error.message}`;
    }
};

export const analyzePlateImage = async (imageBase64: string) => {
    const ai = getAI();
    if (!ai) return "{}";

    const prompt = "Leia a placa do motor. Retorne APENAS JSON: {volts: numero, amps: numero, phase: 'tri'|'bi'|'mono'}.";
    
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