
import React from 'react';
import { ViewState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC<{ isOnline: boolean; onStartTutorial: () => void }> = ({ isOnline, onStartTutorial }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`pt-safe pb-3 px-6 sticky top-0 z-30 transition-colors duration-500 backdrop-blur-md border-b ${
            isDark ? 'bg-[#020617]/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
            <div className="flex justify-between items-end max-w-2xl mx-auto pt-2">
                
                <div className="flex items-end gap-3">
                    {/* Tool Symbol for Technician Identity */}
                    <div className={`flex items-center justify-center w-11 h-11 mb-0.5 rounded-lg shadow-lg transform -rotate-3 transition-all duration-500 ${
                        isDark 
                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-red-500 shadow-black/40' 
                            : 'bg-white border border-slate-200 text-red-600 shadow-slate-200'
                    }`}>
                        <i className="fa-solid fa-screwdriver-wrench text-xl"></i>
                    </div>

                    {/* LOGO RECREATION: ORDEMILK STYLE */}
                    <div className="flex flex-col select-none">
                        {/* Linha Superior (Preta/Branca) - Sobre 'RESFRIADORES' */}
                        <div className={`self-end w-[78%] h-[3px] mb-[-2px] z-10 rounded-sm transition-colors duration-500 ${isDark ? 'bg-slate-200' : 'bg-slate-900'}`}></div>
                        
                        <h1 className="flex items-baseline gap-1.5 z-0 transform translate-y-[1px]">
                            {/* OM */}
                            <span className={`font-inter font-black italic text-[28px] tracking-tighter leading-none transition-colors duration-500 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                OM
                            </span>
                            {/* RESFRIADORES */}
                            <span className="font-inter font-black italic text-[19px] tracking-tighter leading-none text-[#ce1126]">
                                RESFRIADORES
                            </span>
                        </h1>

                        {/* Linha Inferior (Vermelha) - Sob 'OM' */}
                        <div className="self-start w-[24%] h-[3px] mt-[-2px] bg-[#ce1126] z-10 rounded-sm"></div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                    {/* Botão Tutorial */}
                    <button 
                        onClick={onStartTutorial}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                            isDark ? 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-sky-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Iniciar Treinamento"
                    >
                        <i className="fa-solid fa-circle-question text-sm"></i>
                    </button>

                    <button 
                        onClick={toggleTheme}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
                    </button>

                    <div className={`px-2 py-1 rounded-md flex items-center gap-1.5 border ${
                        isOnline 
                            ? (isDark ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-600') 
                            : (isDark ? 'border-red-900/50 bg-red-900/20 text-red-400' : 'border-red-200 bg-red-50 text-red-600')
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-[9px] font-bold tracking-wider font-inter">V33</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NavItemProps {
    id: ViewState;
    icon: string;
    label: string;
    isActive: boolean;
    onClick: (id: ViewState) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon, label, isActive, onClick }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button 
            onClick={() => onClick(id)}
            className={`relative min-w-[55px] h-14 flex flex-col items-center justify-center transition-all duration-300 gap-0.5 px-1 ${
                isActive ? '-translate-y-1' : 'opacity-60 hover:opacity-100'
            }`}
        >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                    ? (isDark ? 'bg-gradient-to-b from-sky-600 to-blue-700 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-white shadow-xl') 
                    : 'bg-transparent text-slate-500'
            }`}>
                <i className={`${icon} text-base`}></i>
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-tight whitespace-nowrap ${
                isActive 
                    ? (isDark ? 'text-white' : 'text-slate-900') 
                    : 'text-slate-500'
            }`}>
                {label}
            </span>
        </button>
    );
};

export const BottomNav: React.FC<{ activeView: ViewState; setView: (v: ViewState) => void }> = ({ activeView, setView }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const items = [
        { id: ViewState.DIAGNOSTIC, icon: 'fa-solid fa-robot', label: '1.Apoio' },
        { id: ViewState.ERRORS, icon: 'fa-solid fa-triangle-exclamation', label: '2.Erros' },
        { id: ViewState.CALCULATOR, icon: 'fa-solid fa-calculator', label: '3.Calc' },
        { id: ViewState.SIZING, icon: 'fa-solid fa-ruler-combined', label: '4.Dim' },
        { id: ViewState.REPORT, icon: 'fa-solid fa-file-signature', label: '5.Rela' },
        { id: ViewState.TECH_DATA, icon: 'fa-solid fa-book-open', label: '6.Dados' },
    ];

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[96%] max-w-[480px] z-50">
            <div className={`rounded-2xl py-2 px-1 shadow-2xl backdrop-blur-xl border flex overflow-x-auto no-scrollbar justify-between items-center ${
                isDark 
                    ? 'bg-[#0f172a]/95 border-slate-700/50 shadow-black/60' 
                    : 'bg-white/95 border-slate-200 shadow-slate-200'
            }`}>
                {items.map(item => (
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
};
