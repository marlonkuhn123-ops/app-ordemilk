
import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Button, FileUpload } from './ComponentesUI';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useGlobal } from '../contexts/GlobalContext';

const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const isError = msg.isError;
    
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="min-h-[1em] mb-0.5">
                     {line.trim().startsWith('* ') && <span className="inline-block w-1.5 h-1.5 mr-2 rounded-full bg-orange-500 opacity-80"></span>}
                     {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className={isUser ? "text-white font-bold" : "text-orange-400 font-bold"}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
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

export const Ferramenta_1_Assistente: React.FC = () => {
    const { techData } = useGlobal();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async (isInitial = false, manualText?: string) => {
        const textToSend = manualText || input;
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

    const handleStartChat = async () => {
        setIsStarted(true);
        await sendMessage(true);
    };

    const resetMessages = () => {
        if(confirm("Reiniciar suporte do Supervisor?")) {
            setMessages([]);
            setIsStarted(false);
        }
    };

    return (
        <div className="animate-fadeIn pb-24">
            <div className="flex justify-between items-center mb-3">
                <SectionTitle icon="fa-solid fa-headset" title="1. SUPORTE DIRETO" />
                <div className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                    SUPERVISOR ATIVO
                </div>
            </div>
            
            <Card className="min-h-[65vh] flex flex-col border-t-4 border-t-orange-600 !bg-[#121212]">
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
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(false)}
                                placeholder="Informe o resultado do teste..."
                                className="flex-1 rounded-xl px-4 text-sm focus:outline-none border bg-[#0a0a0a] border-[#333] text-white focus:border-orange-500 placeholder-gray-700"
                            />
                            <button onClick={() => sendMessage(false)} disabled={isLoadingChat || !input} className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-500 disabled:opacity-30">
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
