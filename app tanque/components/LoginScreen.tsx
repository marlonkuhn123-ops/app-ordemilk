
import React, { useState } from 'react';
import { Card, Button, Input } from './ComponentesUI';

interface LoginScreenProps {
    onLogin: (success: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleLogin = () => {
        if (password === 'om2026') {
            onLogin(true);
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500); // Reset shake animation
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                style={{ 
                    backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }}
            ></div>

            {/* Container Central */}
            <div className="w-full max-w-sm z-10 animate-slide-up">
                
                {/* LOGO HERO */}
                <div className="flex flex-col items-center mb-10 select-none">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center shadow-[0_0_30px_rgba(206,17,38,0.2)] transform rotate-3">
                            <i className="fa-solid fa-shield-halved text-4xl text-[#ce1126]"></i>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#2a2a2a] rounded-lg border border-[#404040] flex items-center justify-center shadow-lg">
                            <i className="fa-solid fa-lock text-orange-500 text-xs"></i>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <h1 className="flex items-baseline gap-2 mb-1">
                            <span className="font-inter font-black italic text-4xl tracking-tighter leading-none text-white">OM</span>
                            <span className="font-inter font-black italic text-2xl tracking-tighter leading-none text-[#ce1126]">TECH V33</span>
                        </h1>
                        <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-gray-600 to-transparent rounded-full opacity-50"></div>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Acesso Restrito - Técnico</p>
                    </div>
                </div>

                {/* LOGIN CARD */}
                <Card className={`border-t-4 border-t-orange-600 !bg-[#151515] ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                    <div className="mb-6 text-center">
                        <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Identificação Necessária</h2>
                        <p className="text-[10px] text-gray-400">Insira a credencial mestre da fábrica.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Input 
                                type="password" 
                                placeholder="Senha de Acesso" 
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className={`!bg-[#0a0a0a] text-center tracking-widest font-mono text-lg !py-4 transition-all duration-300 ${error ? '!border-red-600 !text-red-500 placeholder-red-900/50' : 'focus:!border-orange-500'}`}
                            />
                            {error && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-pulse">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-wider animate-fadeIn">
                                <i className="fa-solid fa-xmark mr-1"></i> Senha Incorreta
                            </p>
                        )}

                        <Button onClick={handleLogin} className="mt-2 group">
                            <span className="group-hover:mr-2 transition-all">ACESSAR SISTEMA</span>
                            <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0"></i>
                        </Button>
                    </div>
                </Card>

                {/* FOOTER */}
                <div className="mt-8 text-center opacity-30">
                    <p className="text-[9px] font-mono text-gray-500">ORDEMILK ENGINEERING © 2026</p>
                    <p className="text-[8px] text-gray-600">Secure Access Protocol</p>
                </div>
            </div>

            {/* CSS Animation for Shake */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
};
