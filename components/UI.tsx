
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Industrial Tech Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`relative rounded-xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 animate-slide-up border border-t-white/10 ${
            isDark 
                ? 'bg-[#0f172a]/70 border-slate-700/60 shadow-black/50' 
                : 'bg-white/80 border-slate-200 shadow-slate-200'
        } ${className}`}>
            {children}
        </div>
    );
};

export const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <h2 className={`text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors duration-300 ${
            isDark ? 'text-cyan-400' : 'text-slate-700'
        }`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded ${
                isDark ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/50' : 'bg-slate-100 text-slate-600'
            }`}>
                <i className={`${icon} text-xs`}></i>
            </span>
            {title}
        </h2>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseStyle = "relative w-full py-3.5 px-6 rounded-lg font-bold text-xs tracking-widest transition-all duration-300 transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 overflow-hidden border uppercase";
    
    const variants = {
        // Primary: Tech Blue/Cyan Gradient (Cooling Vibe)
        primary: isDark 
            ? "bg-gradient-to-r from-sky-700 to-blue-800 text-white border-blue-500/30 shadow-blue-900/20 hover:shadow-blue-900/40 hover:border-blue-400/50" 
            : "bg-slate-900 text-white border-slate-700 hover:bg-slate-800",
        // Secondary: Slate/Dark Grey
        secondary: isDark
            ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white"
            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
        // Danger: Red (Warning)
        danger: isDark
            ? "bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/30"
            : "bg-red-50 text-red-600 border-red-200"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="mb-4 w-full group">
            {label && <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1.5 ml-1 transition-colors ${
                isDark ? 'text-slate-500 group-focus-within:text-cyan-400' : 'text-slate-500 group-focus-within:text-slate-800'
            }`}>{label}</label>}
            <input 
                className={`w-full p-3.5 rounded-lg text-sm font-medium outline-none transition-all duration-300 border ${
                    isDark 
                        ? 'bg-[#0b1221]/80 border-slate-800 text-slate-200 focus:border-cyan-500/50 focus:bg-[#0f182b] focus:shadow-[0_0_10px_rgba(6,182,212,0.1)] placeholder-slate-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-400 placeholder-slate-400'
                } ${className}`}
                {...props}
            />
        </div>
    );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="mb-4 w-full group">
            {label && <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1.5 ml-1 transition-colors ${
                isDark ? 'text-slate-500 group-focus-within:text-cyan-400' : 'text-slate-500 group-focus-within:text-slate-800'
            }`}>{label}</label>}
            <div className="relative">
                <select 
                    className={`w-full p-3.5 rounded-lg text-sm font-medium outline-none transition-all duration-300 appearance-none border cursor-pointer ${
                        isDark 
                            ? 'bg-[#0b1221]/80 border-slate-800 text-slate-200 focus:border-cyan-500/50 focus:bg-[#0f182b]' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-400'
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
            </div>
        </div>
    );
};

export const FileUpload: React.FC<{ onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; icon?: string }> = ({ onChange, label, icon = "fa-camera" }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <label className={`group relative flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-md border cursor-pointer transition-all duration-300 mb-4 overflow-hidden active:scale-[0.98] ${
            isDark 
                ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800' 
                : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}>
            {/* HUD Accent Line Left */}
            <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-300 ${
                 isDark ? 'bg-slate-800 group-hover:bg-cyan-500' : 'bg-slate-200 group-hover:bg-slate-400'
            }`}></div>

            <div className={`flex items-center justify-center transition-colors duration-300 ${
                isDark ? 'text-cyan-500 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-slate-700'
            }`}>
                <i className={`fa-solid ${icon} text-xs`}></i>
            </div>
            
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                isDark ? 'text-slate-400 group-hover:text-cyan-100' : 'text-slate-500 group-hover:text-slate-800'
            }`}>
                {label}
            </span>

            {/* HUD Corner Accent Right */}
            <div className={`absolute right-0 bottom-0 w-2 h-2 border-r border-b transition-colors duration-300 ${
                isDark ? 'border-slate-700 group-hover:border-cyan-500/50' : 'border-slate-300 group-hover:border-slate-500'
            }`}></div>
            
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
    );
};

export const AIOutputBox: React.FC<{ content: string; isLoading: boolean; title?: string }> = ({ content, isLoading, title = "ANÁLISE DO SISTEMA" }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const shareWhatsapp = () => {
        if (!content) return;
        const text = `*ORDEMILK TECH V33 - ${title}*\n\n${content}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <div className={`mt-6 p-4 rounded-lg text-center border animate-pulse ${
                isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
                <div className="flex flex-row items-center justify-center gap-3">
                    <div className={`w-4 h-4 rounded-full animate-spin border-2 border-t-transparent ${
                        isDark ? 'border-cyan-500' : 'border-slate-800'
                    }`}></div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Processando...</p>
                </div>
            </div>
        );
    }
    if (!content) return null;

    return (
        <div className={`mt-6 rounded-lg overflow-hidden shadow-xl animate-slide-up border ${
            isDark 
                ? 'bg-[#0b1221] border-cyan-900/30 shadow-black/50' 
                : 'bg-white border-slate-200 shadow-slate-200'
        }`}>
            <div className={`px-4 py-2.5 flex justify-between items-center border-b ${
                isDark ? 'bg-cyan-950/10 border-cyan-900/30' : 'bg-slate-50 border-slate-200'
            }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                    <h3 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-cyan-600' : 'text-slate-600'}`}>{title}</h3>
                </div>
                <button 
                    onClick={() => navigator.clipboard.writeText(content)}
                    className={`text-[9px] uppercase font-bold tracking-wider transition-colors ${
                        isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                    }`}
                >
                    <i className="fa-regular fa-copy mr-1"></i> Copiar
                </button>
            </div>
            
            <div className={`p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {content}
            </div>

            {/* BOTÃO WHATSAPP PADRÃO PARA TODAS AS FERRAMENTAS */}
            <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50'}`}>
                 <button 
                    onClick={shareWhatsapp}
                    className="w-full py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] hover:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Compartilhar no WhatsApp
                </button>
            </div>
        </div>
    );
};
