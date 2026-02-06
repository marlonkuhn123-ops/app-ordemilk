
import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Button, FileUpload, Input, Select, AIOutputBox } from './UI';
import { generateChatResponse, analyzePlateImage, generateTechResponse } from '../services/geminiService';
import { ChatMessage, ElectricReading } from '../types';

// --- SUB-COMPONENTE: BALÃO DE CHAT ---
const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            let content = line;
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (line.trim().startsWith('- ') || line.trim().startsWith('1. ')) {
                return <li key={i} className="ml-4 pl-2 border-l-2 border-sky-400 mb-1" dangerouslySetInnerHTML={{__html: content}} />;
            }
            return <p key={i} className="mb-1" dangerouslySetInnerHTML={{__html: content}} />;
        });
    };

    return (
        <div className={`flex flex-col max-w-[95%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                ${isUser 
                    ? 'bg-emerald-700/90 text-white rounded-tr-sm border border-emerald-500/30' 
                    : 'bg-slate-800/95 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                {msg.image && (
                    <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-2 border border-white/10" />
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
        await sendMessage(true);
    };

    const sendMessage = async (isInitial = false) => {
        if (!input && !isInitial) return;
        const userMsg: ChatMessage = {
            role: 'user',
            text: isInitial ? `RELATO TÉCNICO: "${input}"` : input,
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
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Erro de conexão.", isError: true }]);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const resetDiag = () => {
        setMessages([]);
        setIsStarted(false);
        setInput('');
        setSelectedImage(null);
    };

    const shareChatWhatsapp = () => {
        if (messages.length === 0) return;
        const historyText = messages.map(m => {
            const sender = m.role === 'user' ? 'TÉCNICO' : 'IA';
            return `*[${sender}]*: ${m.text}`;
        }).join('\n\n');
        
        const fullText = `*DIAGNÓSTICO V33*\n\n${historyText}`;
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
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-wrench" title="1. CENTRAL DE APOIO" />
            
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40 border border-sky-400/50' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    <i className="fa-solid fa-comments mr-2"></i> IA / Chat
                </button>
                <button 
                    onClick={() => setActiveTab('electric')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'electric' 
                        ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/40 border border-yellow-400/50' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    <i className="fa-solid fa-bolt mr-2"></i> Elétrica
                </button>
            </div>

            <Card className="min-h-[60vh] flex flex-col">
                {activeTab === 'chat' && (
                    <>
                        {isStarted && (
                            <div className="flex gap-2 mb-4">
                                <button onClick={resetDiag} className="flex-1 py-2 bg-slate-800/50 rounded-lg text-[9px] uppercase font-bold text-slate-400 border border-slate-700 hover:text-white flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-rotate-right"></i> Reiniciar
                                </button>
                                <button onClick={shareChatWhatsapp} className="flex-1 py-2 bg-[#25D366]/20 rounded-lg text-[9px] uppercase font-bold text-[#25D366] border border-[#25D366]/50 hover:bg-[#25D366]/30 flex items-center justify-center gap-2">
                                    <i className="fa-brands fa-whatsapp"></i> Compartilhar
                                </button>
                            </div>
                        )}

                        {!isStarted ? (
                            <div className="flex flex-col gap-4">
                                <FileUpload onChange={handleImageUpload} label={selectedImage ? "Trocar Imagem" : "FOTO DO PROBLEMA"} />
                                {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-slate-600" />}
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
                                        <span>Relato do Problema</span>
                                        <span className="text-sky-500"><i className="fa-solid fa-user-doctor"></i> Supervisor Ativo</span>
                                    </label>
                                    <textarea 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        rows={4} 
                                        className="w-full bg-black/40 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-400 focus:outline-none placeholder-slate-600"
                                        placeholder="Descreva o que está acontecendo..."
                                    />
                                    <div className="bg-sky-900/20 border border-sky-800/50 p-3 rounded-lg flex items-start gap-2">
                                        <i className="fa-solid fa-info-circle text-sky-500 mt-0.5 text-xs"></i>
                                        <p className="text-[10px] text-sky-200 leading-tight">
                                            <strong>DICA TÉCNICA:</strong> Para um diagnóstico mais rápido e preciso, se possível, informe as <strong>pressões de trabalho</strong> e a <strong>corrente</strong>.
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={handleStartChat} disabled={!input && !selectedImage}>
                                    INICIAR DIAGNÓSTICO
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[400px]">
                                    {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
                                    {isLoadingChat && (
                                        <div className="flex flex-col items-center justify-center gap-2 my-4 opacity-70">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-700">
                                    <input 
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Responda o supervisor..."
                                        className="flex-1 bg-black/60 border border-slate-600 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-sky-400"
                                    />
                                    <button onClick={() => sendMessage()} disabled={isLoadingChat || !input} className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center disabled:opacity-50 shadow-lg shadow-sky-900/20">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
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
