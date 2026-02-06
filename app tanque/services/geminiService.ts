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
    // Se o usuário colocou uma chave manual, ignoramos o bloqueio de ambiente
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.length > 20 && localKey.startsWith('AIza')) {
        return new GoogleGenAI({ apiKey: localKey });
    }

    // Se não tem chave manual e a do ambiente está bloqueada, retorna NULL (Modo Offline)
    if (isEnvBlocked) {
        return null;
    }

    // 2. Tenta pegar do Ambiente (Apenas se não estiver bloqueada)
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        if (process.env.REACT_APP_GEMINI_API_KEY) return new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
    }

    // 3. Tenta pegar do Vite
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
            // @ts-ignore
            return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        }
    } catch (e) {}
    
    return null;
};

const MODEL_NAME = 'gemini-2.0-flash';

// --- FUNÇÕES DE FALLBACK (OFFLINE - BASE DE DADOS INTERNA) ---

// 1. Extrair Dados Técnicos do Arquivo constants.ts (Sem IA)
const getOfflineTechData = (prompt: string): string => {
    try {
        // Regex robusto para pegar o modelo, ignorando o ponto final se houver
        const match = prompt.match(/MODELO SOLICITADO: (.*?)(?:\.|[\r\n]|$)/);
        if (!match) return "Modelo não identificado no modo offline.";
        
        const modelName = match[1].trim();
        
        // Busca o bloco no TECHNICAL_CONTEXT
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

// 2. Cálculo Matemático Local (Sem IA)
const getOfflineCalc = (prompt: string): string => {
    try {
        const fluidoMatch = prompt.match(/Fluido: (R-.*?)\s/);
        const pressMatch = prompt.match(/Pressão Lida.*?: (\d+(\.\d+)?) PSI/);
        const tempMatch = prompt.match(/Temperatura Lida.*?: (\d+(\.\d+)?) °C/);
        
        if (!fluidoMatch || !pressMatch) return "Dados insuficientes para cálculo offline.";

        const fluido = fluidoMatch[1] as string;
        const P = parseFloat(pressMatch[1]); // PSI
        const T_lida = tempMatch ? parseFloat(tempMatch[1]) : 0; // °C
        const isSH = prompt.includes("Superaquecimento");
        
        // Lógica simplificada de Saturação (Aproximação linear segura)
        let T_sat = 0;
        const isR22 = fluido.includes("22");
        
        if (isR22) {
             // R22 (Aprox Regua Danfoss)
            if (P < 100) T_sat = (P - 58) * 0.6; // Baixa
            else T_sat = (P - 200) * 0.2 + 40; // Alta
        } else {
            // R404A
            if (P < 80) T_sat = (P - 30) * 0.5 - 20; // Baixa
            else T_sat = (P - 250) * 0.15 + 40; // Alta
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
    
    // FALLBACK IMEDIATO SE NÃO TIVER CHAVE (OU SE ESTIVER BLOQUEADA)
    if (!ai) {
        if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
        if (toolType === "CALC") return getOfflineCalc(userPrompt);
        return "⚠️ MODO OFFLINE: Funcionalidade indisponível sem chave de API. Adicione uma chave válida nas configurações.";
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
        console.warn("Gemini API Error (Handled V47):", error.message);
        
        // --- TRATAMENTO DE CHAVE EXPIRADA/INVÁLIDA ---
        // Se a API retornar erro de chave, bloqueamos ela para não tentar de novo
        if (error.message && (error.message.includes("key") || error.message.includes("400") || error.message.includes("403"))) {
            const manualKey = localStorage.getItem(STORAGE_KEY);
            if (manualKey) {
                // Se era uma chave manual, remove ela
                localStorage.removeItem(STORAGE_KEY);
                console.log("Chave manual inválida removida.");
            } else {
                // Se NÃO era manual, era a do ambiente. BLOQUEIA ELA.
                localStorage.setItem(ENV_BLOCKED_KEY, 'true');
                console.log("Chave de ambiente inválida bloqueada permanentemente. Recarregue para aplicar o modo offline.");
            }
        }

        // --- FALLBACK PÓS-ERRO ---
        // Retorna o dado offline imediatamente para não mostrar erro na tela
        if (toolType === "TECH_DATA") return getOfflineTechData(userPrompt);
        if (toolType === "CALC") return getOfflineCalc(userPrompt);

        return `⚠️ ERRO DE CONEXÃO (MODO OFFLINE)\n\nO sistema ativou o modo offline para ferramentas essenciais. Tente usar o Catálogo ou Calculadora.`;
    }
};

export const generateChatResponse = async (
    history: { role: string; parts: any[] }[], 
    newMessage: string, 
    imageBase64?: string
) => {
    const ai = getAI();
    if (!ai) return "⚠️ CHAT OFFLINE: A chave de API expirou ou não está configurada. O Chat Inteligente requer conexão válida.";

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
             
             return "⛔ CHAVE EXPIRADA: O sistema removeu/bloqueou a chave inválida. O Chat ficará indisponível até que uma nova chave seja inserida manualmente.";
        }
        return `Erro: ${error.message}`;
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