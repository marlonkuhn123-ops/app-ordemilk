
import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Button, FileUpload, Select, Input, AIOutputBox } from './UI';
import { generateChatResponse, analyzePlateImage, generateTechResponse } from '../services/geminiService';
import { ChatMessage, ElectricReading } from '../types';
import { useGlobal } from '../contexts/GlobalContext';

// --- SUB-COMPONENTE: BALÃO DE CHAT ---
const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const isError = msg.isError;
    
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)|(⚠️.*?):|(🔧.*?):|(✅.*?):/g); // Capture bold, and specific action prefixes
            return (
                <p key={i} className="min-h-[1em] mb-0.5">
                     {line.trim().startsWith('* ') && <span className="inline-block w-1.5 h-1.5 mr-2 rounded-full bg-orange-500 opacity-80"></span>}
                     {parts.map((part, j) => {
                        if (part === undefined) return null;
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className={isUser ? "text-white font-bold" : "text-orange-400 font-bold"}>{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('⚠️')) {
                            return <span key={j} className="text-red-400 font-bold">{part}</span>;
                        }
                        if (part.startsWith('🔧')) {
                            return <span key={j} className="text-yellow-400 font-bold">{part}</span>;
                        }
                        if (part.startsWith('✅')) {
                            return <span key={j} className="text-emerald-400 font-bold">{part}</span>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className={`flex flex-col max-w-[95%] mb-3 animate-slide-up ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
            <span className={`text-[8px] font-black uppercase mb-1 px-1 tracking-widest ${isUser ? 'text-gray-500' : 'text-orange-500'}`}>
                {isUser ? 'TÉCNICO' : 'SUPERVISOR ORDEMILK'}
            </span>
            <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-lg ${isUser ? 'bg-orange-700 text-white rounded-tr-sm' : 'bg-[#1a1a1a] text-gray-100 border border-[#333] rounded-tl-sm shadow-black/60'} ${isError ? 'bg-red-900/80 border-red-500 text-red-100' : ''}`}>
                {msg.image && (
                    <img src={msg.image} alt="Evidência" className="w-full rounded-lg mb-3 border border-white/10" />
                )}
                <div className="text-sm font-medium">
                    {formatText(msg.text)}
                </div>
            </div>
        </div>
    );
};

// --- FERRAMENTA 1: ASSISTENTE (CHAT + ELÉTRICA) ---
export const Tool_Assistant: React.FC = () => {
    const { techData } = useGlobal(); 
    const [activeTab, setActiveTab] = useState<'chat' | 'electric'>('chat');

    // --- CHAT IA ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // --- ANÁLISE ELÉTRICA ---
    const [reading, setReading] = useState<ElectricReading>({ phase: 'tri' });
    const [voltR, setVoltR] = useState('');
    const [voltS, setVoltS] = useState('');
    const [voltT, setVoltT] = useState('');
    const [ampNow, setAmpNow] = useState('');
    const [ampNominal, setAmpNominal] = useState('');
    const [electricResult, setElectricResult] = useState('');
    const [isLoadingElectric, setIsLoadingElectric] = useState(false);
    const [isReadingPlate, setIsReadingPlate] = useState(false);

    useEffect(() => {
        if(activeTab === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleStartChat = async () => {
        if (!input && !selectedImage) return;
        setIsStarted(true);
        await sendMessage();
    };

    const sendMessage = async () => { 
        const textToSend = input;
        if (!textToSend && !selectedImage) return;

        const userMsg: ChatMessage = {
            role: 'user',
            text: textToSend,
            image: selectedImage || undefined
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSelectedImage(null);
        setIsLoadingChat(true);

        try {
            const apiHistory = messages.map(m => ({
                role: m.role,
                parts: m.image ? [{ text: m.text }, { inlineData: { mimeType: 'image/jpeg', data: m.image.split(',')[1] } }] : [{ text: m.text }]
            }));
            const imgBase64 = userMsg.image ? userMsg.image.split(',')[1] : undefined;
            const responseText = await generateChatResponse(apiHistory, userMsg.text, imgBase64);
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', text: "⚠️ FALHA DE CONEXÃO. Tente novamente.", isError: true }]);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const resetMessages = () => {
        if(confirm("Reiniciar suporte do Supervisor?")) {
            setMessages([]);
            setIsStarted(false);
            setInput(''); 
            setSelectedImage(null);
        }
    };

    const shareChatWhatsapp = () => {
        if (messages.length === 0) return;
        const historyText = messages.map(m => {
            const sender = m.role === 'user' ? 'TÉCNICO' : 'SUPERVISOR ORDEMILK';
            // Format text to remove markdown bolding for WhatsApp plain text
            const cleanText = m.text.replace(/\*\*(.*?)\*\*/g, '$1'); 
            return `*[${sender}]*: ${cleanText}`;
        }).join('\n\n');
        
        // Ensure the specified prefix is used
        const fullText = `*ORDEMILK Tech Assist*\n\n*DIAGNÓSTICO V33*\n\n${historyText}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
    };

    // --- FUNÇÕES ELÉTRICAS ---
    const handlePlateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsReadingPlate(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const jsonStr = await analyzePlateImage(base64);
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.volts) {
                        setVoltR(data.volts.toString());
                        if (data.phase === 'tri') { setVoltS(data.volts); setVoltT(data.volts); setReading({ ...reading, phase: 'tri' }); }
                        else if (data.phase === 'bi') { setVoltS(data.volts); setReading({ ...reading, phase: 'bi' }); }
                        else { setReading({ ...reading, phase: 'mono' }); }
                    }
                    if (data.amps) setAmpNominal(data.amps.toString());
                    if (data.phase) setReading(prev => ({ ...prev, phase: data.phase }));
                } catch (parseError) {
                    alert("Leitura manual necessária.");
                }
            };
            reader.readAsDataURL(file);
        } catch (error) { console.error(error); } 
        finally { setIsReadingPlate(false); }
    };

    const analyzeElectric = async () => {
        setIsLoadingElectric(true);
        const prompt = `Fase: ${reading.phase}. R=${voltR}, S=${voltS}, T=${voltT}. Corrente: ${ampNow}A (Nom: ${ampNominal}A). Analise.`;
        try {
            const text = await generateTechResponse(prompt, "ELECTRIC");
            setElectricResult(text);
        } catch (error) { setElectricResult("Erro ao analisar."); } 
        finally { setIsLoadingElectric(false); }
    };

    return (
        <div className="animate-fadeIn pb-24">
            <SectionTitle icon="fa-solid fa-headset" title="1. SUPORTE DIRETO" />
            
            <div className="flex justify-between items-center mb-3">
                <div className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                    SUPERVISOR ATIVO
                </div>
            </div>

            <Card className="min-h-[65vh] flex flex-col border-t-4 border-t-orange-600 !bg-[#121212]">
                {activeTab === 'chat' && (
                    <>
                        {!isStarted ? (
                            <div className="flex flex-col gap-4 py-4 animate-fadeIn">
                                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] shadow-inner">
                                    <p className="text-xs text-gray-300 leading-relaxed font-bold">
                                        "Tô na escuta. Qual a situação aí no campo? Manda o relato ou uma foto do painel."
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <textarea 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        rows={4} 
                                        className="w-full p-4 rounded-xl focus:outline-none placeholder-gray-600 transition-all border bg-[#0a0a0a] border-[#333] text-white focus:border-orange-500 shadow-inner text-sm"
                                        placeholder="Relate o problema (Ex: Alta pressão e desarme)..."
                                    />
                                </div>

                                <FileUpload onChange={handleImageUpload} label={selectedImage ? "FOTO CARREGADA" : "FOTO DO QUADRO / MANÔMETRO"} />
                                {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-[#333]" />}

                                <Button onClick={handleStartChat} disabled={!input && !selectedImage}>
                                    ACIONAR SUPERVISOR
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[500px] flex flex-col scroll-smooth">
                                    {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
                                    {isLoadingChat && (
                                        <div className="self-start items-start animate-pulse p-4 bg-[#1a1a1a] rounded-xl border border-[#333] flex gap-2">
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                                
                                <div className="flex gap-2 mt-auto pt-4 border-t border-[#333]">
                                    <button onClick={resetMessages} className="w-12 h-12 rounded-xl bg-[#1a1a1a] text-gray-600 flex items-center justify-center border border-[#333] hover:text-red-500 transition-colors">
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                    <input 
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Responda o supervisor..."
                                        className="flex-1 rounded-xl px-4 text-sm focus:outline-none border bg-[#0a0a0a] border-[#333] text-white focus:border-orange-500 placeholder-gray-700"
                                    />
                                    <button onClick={() => sendMessage()} disabled={isLoadingChat || !input} className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-500 disabled:opacity-30">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                    {messages.length > 0 && ( 
                                        <button 
                                            onClick={shareChatWhatsapp}
                                            className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20bd5a] ml-2"
                                            title="Compartilhar no WhatsApp"
                                        >
                                            <i className="fa-brands fa-whatsapp"></i>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

                {activeTab === 'electric' && (
                    <div className="flex flex-col gap-3 animate-fadeIn">
                         <div className="bg-yellow-500/10 border border-yellow-600/30 p-3 rounded-lg mb-2">
                            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider text-center">
                                <i className="fa-solid fa-triangle-exclamation mr-1"></i> Atenção: Alta Tensão
                            </p>
                        </div>

                        <FileUpload 
                            label={isReadingPlate ? "LENDO..." : "LER PLACA (FOTO)"} 
                            icon="fa-id-card"
                            onChange={handlePlateUpload} 
                        />
                        
                        <Select label="Tipo de Rede" value={reading.phase} onChange={(e) => setReading({ ...reading, phase: e.target.value as any })}>
                            <option value="tri">Trifásico (R S T)</option>
                            <option value="bi">Bifásico (F1 F2)</option>
                            <option value="mono">Monofásico (F1 N)</option>
                            <option value="mrt">Monofásico Rural (MRT)</option>
                        </Select>

                        <div className="grid grid-cols-3 gap-2">
                            <Input label={reading.phase === 'mono' ? "Fase" : "Fase R"} type="number" value={voltR} onChange={e => setVoltR(e.target.value)} placeholder="0" />
                            {(reading.phase === 'tri' || reading.phase === 'bi') && (
                                <Input label={reading.phase === 'bi' ? "Fase 2" : "Fase S"} type="number" value={voltS} onChange={e => setVoltS(e.target.value)} placeholder="0" />
                            )}
                            {reading.phase === 'tri' && (
                                <Input label="Fase T" type="number" value={voltT} onChange={e => setVoltT(e.target.value)} placeholder="0" />
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Input label="Corrente (A)" type="number" value={ampNow} onChange={e => setAmpNow(e.target.value)} placeholder="A" />
                            <Input label="Corrente Nom. (A)" type="number" value={ampNominal} onChange={e => setAmpNominal(e.target.value)} placeholder="A" />
                        </div>

                        <Button onClick={analyzeElectric} disabled={isLoadingElectric} variant="secondary">
                            ANALISAR
                        </Button>
                        <AIOutputBox content={electricResult} isLoading={isLoadingElectric} title="LAUDO ELÉTRICO" />
                    </div>
                )}
            </Card>
        </div>
    );
};