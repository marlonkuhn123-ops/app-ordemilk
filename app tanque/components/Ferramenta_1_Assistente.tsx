
import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Button, FileUpload } from './ComponentesUI';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

// --- SUB-COMPONENT: CHAT BUBBLE ---
const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const hasImage = !!msg.image;
    
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="min-h-[1em] mb-1">
                     {line.trim().startsWith('- ') && <span className="inline-block w-2 h-2 mr-2 rounded-full text-[0px] align-middle opacity-60 bg-orange-500">•</span>}
                     {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            // Bold text logic
                            return <strong key={j} className={isUser ? "text-white font-black border-b border-white/20" : "text-orange-400 font-bold"}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    // User = Vibrant Orange, AI = Dark Gray/Steel
    const userBubbleClass = 'bg-orange-600 text-white border border-orange-500/50 shadow-md shadow-orange-900/30';
    const aiBubbleClass = 'bg-[#2a2a2a] text-gray-100 border border-[#404040] shadow-sm';

    return (
        <div className={`flex flex-col max-w-[95%] mb-3 animate-slide-up ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`p-3.5 rounded-lg text-sm leading-relaxed shadow-sm ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'} ${isUser ? userBubbleClass : aiBubbleClass}`}>
                {hasImage && (
                    <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-2 border border-white/10" />
                )}
                <div className="text-sm font-medium">
                    {formatText(msg.text)}
                </div>
            </div>
        </div>
    );
};

// --- FERRAMENTA UNIFICADA: SUPORTE ---
export const Ferramenta_1_Assistente: React.FC = () => {
    // --- CHAT STATE ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- HANDLERS ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async (isInitial = false, manualText?: string) => {
        let textToSend = manualText || input;
        
        if (!textToSend && !selectedImage && !isInitial) return;

        const userMsg: ChatMessage = {
            role: 'user',
            text: isInitial ? `RELATO INICIAL: "${textToSend}"` : textToSend,
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

    const handleStartChat = async () => {
        setIsStarted(true);
        await sendMessage(true);
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
        
        const fullText = `*DIAGNÓSTICO V33 - SUPORTE TÉCNICO*\n\n${historyText}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
    };

    return (
        <div className="animate-fadeIn pb-20">
            <SectionTitle icon="fa-solid fa-screwdriver-wrench" title="1. SUPORTE TÉCNICO" />
            
            <Card className="min-h-[60vh] flex flex-col">
                
                {/* --- MODO INICIAL --- */}
                {!isStarted && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase flex justify-between text-white">
                                <span>Relato do Problema</span>
                            </label>
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={4} 
                                className="w-full p-3 rounded-lg focus:outline-none placeholder-gray-500 transition-all border 
                                bg-[#252525] border-[#404040] text-white focus:border-orange-500 shadow-inner"
                                placeholder="Ex: Compressor congelando, pressão baixa..."
                            />
                        </div>

                        <FileUpload onChange={handleImageUpload} label={selectedImage ? "Trocar Imagem" : "FOTO DO PROBLEMA"} />
                        {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-600" />}

                        <div className="p-3 rounded-lg flex items-start gap-2 border bg-[#252525] border-[#404040]">
                            <i className="fa-solid fa-circle-info mt-0.5 text-xs text-orange-500"></i>
                            <p className="text-[10px] leading-tight text-gray-300">
                                <strong className="text-orange-400">DICA TÉCNICA:</strong> Para um diagnóstico preciso, informe: <strong>pressões</strong>, <strong>corrente</strong> e <strong>tipo de fluido</strong>.
                            </p>
                        </div>

                        <Button onClick={handleStartChat} disabled={!input && !selectedImage}>
                            INICIAR DIAGNÓSTICO
                        </Button>
                    </div>
                )}

                {/* --- MODO CHAT --- */}
                {isStarted && (
                    <>
                         <div className="flex gap-2 mb-4">
                            <button onClick={resetDiag} className="flex-1 py-2 rounded-lg text-[9px] uppercase font-bold border flex items-center justify-center gap-2 bg-[#2a2a2a] text-white border-[#404040] hover:bg-[#333]">
                                <i className="fa-solid fa-rotate-right"></i> Novo Atendimento
                            </button>
                            <button onClick={shareChatWhatsapp} className="flex-1 py-2 bg-[#25D366]/20 rounded-lg text-[9px] uppercase font-bold text-[#25D366] border border-[#25D366]/50 hover:bg-[#25D366]/30 flex items-center justify-center gap-2 transition-colors">
                                <i className="fa-brands fa-whatsapp text-sm"></i> Compartilhar
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[500px]">
                            {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
                            {isLoadingChat && (
                                <div className="flex flex-col items-center justify-center gap-2 my-4 opacity-70">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                        
                        <div className="flex gap-2 mt-auto pt-4 border-t border-[#333]">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(false)}
                                placeholder="Digite aqui..."
                                className="flex-1 rounded-lg px-4 text-sm focus:outline-none border bg-[#252525] border-[#404040] text-white focus:border-orange-500 placeholder-gray-500"
                            />
                            <button onClick={() => sendMessage(false)} disabled={isLoadingChat || !input} className="w-12 h-12 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-500">
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
