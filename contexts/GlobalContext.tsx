
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types';

// Definição do Estado Global
interface TechData {
    name: string;
    company: string;
}

interface GlobalState {
    theme: Theme;
    techData: TechData;
}

interface GlobalContextType extends GlobalState {
    toggleTheme: () => void;
    updateTechData: (data: Partial<TechData>) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal deve ser usado dentro de um GlobalProvider');
    }
    return context;
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- ESTADO 1: TEMA ---
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('ordemilk_theme');
        return (saved as Theme) || 'light'; // Padrão Light para o novo design
    });

    // --- ESTADO 2: DADOS DO TÉCNICO ---
    const [techData, setTechData] = useState<TechData>(() => {
        const saved = localStorage.getItem('ordemilk_tech_data');
        return saved ? JSON.parse(saved) : { name: '', company: '' };
    });

    // Persistência do Tema
    useEffect(() => {
        localStorage.setItem('ordemilk_theme', theme);
    }, [theme]);

    // Persistência dos Dados do Técnico
    useEffect(() => {
        localStorage.setItem('ordemilk_tech_data', JSON.stringify(techData));
    }, [techData]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const updateTechData = (data: Partial<TechData>) => {
        setTechData(prev => ({ ...prev, ...data }));
    };

    return (
        <GlobalContext.Provider value={{ theme, techData, toggleTheme, updateTechData }}>
            {children}
        </GlobalContext.Provider>
    );
};
