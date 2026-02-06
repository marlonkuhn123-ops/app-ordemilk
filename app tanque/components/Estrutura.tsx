import React, { memo, useState, useEffect } from 'react';
import { ViewState } from '../types';

// --- CABEÇALHO (TOPO) ---
export const Header: React.FC<{ isOnline: boolean }> = memo(({ isOnline }) => {
    const [hasCustomKey, setHasCustomKey] = useState(false);

    useEffect(() => {
        const key = localStorage.getItem('om_key_v41_force');
        setHasCustomKey(!!key);
    }, []);

    // Função oculta para atualizar chave clicando no ícone de chave
    const updateKey = () => {
        const current = localStorage.getItem('om_key_v41_force') || '';
        const newKey = window.prompt("CONFIGURAÇÃO TÉCNICA (API KEY):\n\nInsira sua chave aqui se a conexão falhar.\n\n(Deixe em branco para limpar a chave e resetar bloqueios)", current);
        
        if (newKey === "") {
            localStorage.removeItem('om_key_v41_force');
            // IMPORTANTE: Reseta o bloqueio de ambiente para permitir nova tentativa se o dev corrigiu o .env
            localStorage.removeItem('om_env_blocked');
            alert("Chave removida. Bloqueios resetados. O sistema tentará ler VITE_GOOGLE_API_KEY.");
            window.location.reload();
            return;
        }

        if (newKey !== null && newKey.trim().length > 20 && newKey.startsWith("AIza")) {
            localStorage.setItem('om_key_v41_force', newKey.trim());
            localStorage.removeItem('om_env_blocked'); // Desbloqueia se o user inseriu uma nova
            alert("Chave salva com sucesso.");
            window.location.reload(); 
        }
    };

    return (
        <div className="pt-safe pb-3 px-6 sticky top-0 z-30 transition-colors duration-500 backdrop-blur-md border-b bg-[#121212]/90 border-[#333]">
            <div className="flex justify-between items-end max-w-2xl mx-auto pt-2">
                
                <div className="flex items-end gap-3">
                    <div className="flex items-center justify-center w-11 h-11 mb-0.5 rounded-lg shadow-lg transform -rotate-3 transition-all duration-500 bg-[#1e1e1e] border border-[#333] text-[#ce1126] shadow-black/60">
                        <i className="fa-solid fa-wrench text-xl"></i>
                    </div>

                    <div className="flex flex-col select-none">
                        <div className="self-end w-[78%] h-[3px] mb-[-2px] z-10 rounded-sm transition-colors duration-500 bg-gray-400"></div>
                        
                        <h1 className="flex items-baseline gap-1.5 z-0 transform translate-y-[1px]">
                            <span className="font-inter font-black italic text-[28px] tracking-tighter leading-none text-white">
                                OM
                            </span>
                            <span className="font-inter font-black italic text-[19px] tracking-tighter leading-none text-[#ce1126]">
                                RESFRIADORES
                            </span>
                        </h1>

                        <div className="self-start w-[24%] h-[3px] mt-[-2px] bg-[#ce1126] z-10 rounded-sm"></div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 mb-1">
                    {/* Botão de Chave - Discreto */}
                    <button 
                        onClick={updateKey}
                        className={`w-7 h-7 flex items-center justify-center rounded-md border text-xs shadow-md transition-all ${
                            hasCustomKey 
                            ? 'border-emerald-800 bg-emerald-900/20 text-emerald-500' 
                            : 'border-[#333] bg-[#1e1e1e] text-gray-600 hover:text-white'
                        }`}
                        title="Configurar Chave de API"
                    >
                        <i className="fa-solid fa-key"></i>
                    </button>

                    <div className={`px-2 py-1 rounded-md flex items-center gap-1.5 border ${
                        isOnline 
                            ? 'border-emerald-900/50 bg-emerald-900/10 text-emerald-400' 
                            : 'border-red-900/50 bg-red-900/10 text-red-400'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-[9px] font-bold tracking-wider font-inter text-white">V49</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- ITEM DO MENU RODAPÉ ---
interface NavItemProps {
    id: ViewState;
    icon: string;
    label: string;
    isActive: boolean;
    onClick: (id: ViewState) => void;
}

const NavItem: React.FC<NavItemProps> = memo(({ id, icon, label, isActive, onClick }) => {
    return (
        <button 
            onClick={() => onClick(id)}
            className={`relative min-w-[55px] h-14 flex flex-col items-center justify-center transition-all duration-300 gap-0.5 px-1 ${
                isActive ? '-translate-y-1' : 'opacity-60 hover:opacity-100'
            }`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive 
                    ? 'bg-[#2a2a2a] text-orange-500 border border-[#404040] shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                    : 'bg-transparent text-white'
            }`}>
                <i className={`${icon} text-base`}></i>
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-tight whitespace-nowrap ${
                isActive ? 'text-orange-500' : 'text-white'
            }`}>
                {label}
            </span>
        </button>
    );
});

const NAV_ITEMS = [
    { id: ViewState.DIAGNOSTIC, icon: 'fa-solid fa-robot', label: '1.SUPORTE' },
    { id: ViewState.ERRORS, icon: 'fa-solid fa-triangle-exclamation', label: '2.Erros' },
    { id: ViewState.CALCULATOR, icon: 'fa-solid fa-calculator', label: '3.Calc' },
    { id: ViewState.SIZING, icon: 'fa-solid fa-ruler-combined', label: '4.Dim' },
    { id: ViewState.REPORT, icon: 'fa-solid fa-file-contract', label: '5.Serviço' },
    { id: ViewState.TECH_DATA, icon: 'fa-solid fa-boxes-stacked', label: '6.Dados' },
];

export const BottomNav: React.FC<{ activeView: ViewState; setView: (v: ViewState) => void }> = memo(({ activeView, setView }) => {
    return (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[96%] max-w-[480px] z-50">
            <div className="rounded-xl py-2 px-1 shadow-2xl backdrop-blur-xl border flex overflow-x-auto no-scrollbar justify-between items-center bg-[#1e1e1e]/95 border-[#333] shadow-black/80">
                {NAV_ITEMS.map(item => (
                    <NavItem 
                        key={item.id} 
                        {...item} 
                        isActive={activeView === item.id} 
                        onClick={setView} 
                    />
                ))}
            </div>
        </div>
    );
});