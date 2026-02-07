
import React from 'react'; // Removed memo, use standard React.FC
import { ViewState } from '../types';

// --- CABEÇALHO (TOPO) ---
export const Header: React.FC<{ isOnline: boolean; onStartTutorial: () => void }> = ({ isOnline, onStartTutorial }) => {
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
                    {/* Botão Tutorial */}
                    <button 
                        onClick={onStartTutorial}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all border bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700"
                        title="Iniciar Treinamento"
                    >
                        <i className="fa-solid fa-circle-question text-sm"></i>
                    </button>

                    <div className={`px-2 py-1 rounded-md flex items-center gap-1.5 border ${
                        isOnline 
                            ? 'border-emerald-900/50 bg-emerald-900/10 text-emerald-400' 
                            : 'border-red-900/50 bg-red-900/10 text-red-400'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-50'}`}></div>
                        <span className="text-[9px] font-bold tracking-wider font-inter text-white text-opacity-80">V51.2</span>
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

const NavItem: React.FC<NavItemProps> = ({ id, icon, label, isActive, onClick }) => { // Removed memo
    return (
        <button 
            onClick={() => onClick(id)}
            className={`relative min-w-[55px] h-14 flex flex-col items-center justify-center transition-all duration-300 gap-0.5 px-1 ${
                isActive ? 'translate-y-[-4px]' : 'opacity-60 hover:opacity-100'
            }`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-orange-600 text-white shadow-lg' : 'bg-[#1a1a1a] text-gray-500 group-hover:bg-[#222]'
            }`}>
                <i className={`${icon} ${isActive ? 'text-lg' : 'text-sm'}`}></i>
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
                {label}
            </span>
            {isActive && <div className="absolute top-[calc(100%-4px)] w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}
        </button>
    );
};

// --- NAVEGAÇÃO INFERIOR (FOOTER) ---
export const BottomNav: React.FC<{ activeView: ViewState; setView: (view: ViewState) => void }> = ({ activeView, setView }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-20 pb-safe pt-2 px-4 backdrop-blur-md bg-[#121212]/90 border-t border-[#333]">
            <div className="flex justify-around items-center max-w-2xl mx-auto">
                <NavItem id={ViewState.DIAGNOSTIC} icon="fa-solid fa-headset" label="Assistente" isActive={activeView === ViewState.DIAGNOSTIC} onClick={setView} />
                <NavItem id={ViewState.ERRORS} icon="fa-solid fa-triangle-exclamation" label="Erros" isActive={activeView === ViewState.ERRORS} onClick={setView} />
                <NavItem id={ViewState.CALCULATOR} icon="fa-solid fa-calculator" label="Cálculo" isActive={activeView === ViewState.CALCULATOR} onClick={setView} />
                <NavItem id={ViewState.SIZING} icon="fa-solid fa-ruler-combined" label="Dimens." isActive={activeView === ViewState.SIZING} onClick={setView} />
                <NavItem id={ViewState.REPORT} icon="fa-solid fa-file-signature" label="Relatório" isActive={activeView === ViewState.REPORT} onClick={setView} />
                <NavItem id={ViewState.TECH_DATA} icon="fa-solid fa-boxes-stacked" label="Catálogo" isActive={activeView === ViewState.TECH_DATA} onClick={setView} />
            </div>
        </nav>
    );
};