
import React, { useState, memo } from 'react';

// --- CARD INDUSTRIAL ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = memo(({ children, className = '' }) => {
    return (
        <div className={`relative rounded-lg p-5 shadow-2xl transition-all duration-300 animate-slide-up 
            bg-[#1e1e1e] border border-[#333333] shadow-black/80 ${className}`}>
            {children}
        </div>
    );
});

// --- TÍTULO DA SEÇÃO ---
export const SectionTitle: React.FC<{ icon: string; title: string }> = memo(({ icon, title }) => {
    return (
        <h2 className="text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-[0.2em] text-white/90 select-none">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-[#2a2a2a] text-orange-500 border border-[#404040] shadow-sm">
                <i className={`${icon} text-xs`}></i>
            </span>
            {title}
        </h2>
    );
});

// --- BOTÃO INDUSTRIAL ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

const BUTTON_VARIANTS = {
    primary: "bg-orange-600 text-white border-orange-500 hover:bg-orange-500 shadow-orange-900/40 active:bg-orange-700",
    secondary: "bg-[#2a2a2a] text-white border-[#404040] hover:bg-[#333] hover:border-gray-500 active:bg-[#222]",
    danger: "bg-red-900/40 text-red-200 border-red-800 hover:bg-red-900/60 active:bg-red-900/80",
    success: "bg-emerald-700 text-white border-emerald-600 hover:bg-emerald-600 active:bg-emerald-800"
};

export const Button: React.FC<ButtonProps> = memo(({ children, variant = 'primary', className = '', ...props }) => {
    return (
        <button 
            className={`relative w-full py-3.5 px-6 rounded-lg font-bold text-xs tracking-widest transition-transform duration-100 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 overflow-hidden border uppercase disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
});

// --- INPUT INDUSTRIAL ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = memo(({ label, className = '', ...props }) => {
    return (
        <div className="mb-4 w-full group">
            {label && <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1 transition-colors text-white group-focus-within:text-orange-500">
                {label}
            </label>}
            <input 
                className={`w-full p-3.5 rounded-lg text-sm font-medium outline-none transition-colors duration-300 border 
                bg-[#252525] border-[#404040] text-white placeholder-gray-600 
                focus:border-orange-500 focus:bg-[#2a2a2a] ${className}`}
                {...props}
            />
        </div>
    );
});

// --- SELECT INDUSTRIAL ---
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = memo(({ label, children, className = '', ...props }) => {
    return (
        <div className="mb-4 w-full group">
            {label && <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1 transition-colors text-white group-focus-within:text-orange-500">
                {label}
            </label>}
            <div className="relative">
                <select 
                    className={`w-full p-3.5 rounded-lg text-sm font-medium outline-none transition-colors duration-300 appearance-none border cursor-pointer 
                    bg-[#252525] border-[#404040] text-white 
                    focus:border-orange-500 focus:bg-[#2a2a2a] ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
            </div>
        </div>
    );
});

// --- FILE UPLOAD INDUSTRIAL ---
export const FileUpload: React.FC<{ onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; icon?: string }> = memo(({ onChange, label, icon = "fa-camera" }) => {
    return (
        <label className="group relative flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border cursor-pointer transition-all duration-300 mb-4 overflow-hidden active:scale-[0.98]
            bg-[#252525] border-[#404040] hover:border-orange-500/50 hover:bg-[#2a2a2a]">
            
            <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-300 bg-[#404040] group-hover:bg-orange-500"></div>

            <div className="flex items-center justify-center transition-colors duration-300 text-white group-hover:text-orange-500">
                <i className={`fa-solid ${icon} text-sm`}></i>
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 text-white group-hover:text-white">
                {label}
            </span>
            
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
    );
});

// --- AI OUTPUT BOX INDUSTRIAL ---
export const AIOutputBox: React.FC<{ content: string; isLoading: boolean; title?: string }> = ({ content, isLoading, title = "ANÁLISE DO SISTEMA" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsapp = () => {
        if (!content) return;
        const text = `*ORDEMILK TECH V33 - ${title}*\n\n${content}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <div className="mt-6 p-4 rounded-lg text-center border animate-pulse bg-[#252525] border-[#333]">
                <div className="flex flex-row items-center justify-center gap-3">
                    <div className="w-4 h-4 rounded-full animate-spin border-2 border-t-transparent border-orange-500"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">Processando...</p>
                </div>
            </div>
        );
    }
    if (!content) return null;

    // Processamento leve do markdown simples (apenas negrito)
    const formattedContent = content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={i} className="min-h-[1.2em]">
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-orange-400 font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </div>
        );
    });

    return (
        <div className="mt-6 rounded-lg overflow-hidden shadow-xl animate-slide-up border bg-[#1a1a1a] border-[#333] shadow-black/50">
            {/* CABEÇALHO */}
            <div className="px-4 py-2.5 flex justify-between items-center border-b bg-[#222] border-[#333]">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-orange-500"></div>
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-orange-500 truncate max-w-[150px]">{title}</h3>
                </div>
                <button 
                    onClick={handleCopy}
                    className={`text-[9px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
                        copied ? 'text-emerald-400' : 'text-white hover:text-orange-400'
                    }`}
                >
                    <i className={`fa-regular ${copied ? 'fa-circle-check' : 'fa-copy'}`}></i> 
                    {copied ? 'COPIADO!' : 'COPIAR'}
                </button>
            </div>
            
            {/* CONTEÚDO */}
            <div className="p-4 text-sm leading-relaxed font-mono text-xs text-gray-200 break-words">
                {formattedContent}
            </div>

            {/* RODAPÉ */}
            <div className="p-3 border-t border-[#333] bg-[#222]">
                 <button 
                    onClick={shareWhatsapp}
                    className="w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] hover:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-brands fa-whatsapp text-sm"></i> Compartilhar
                </button>
            </div>
        </div>
    );
};
