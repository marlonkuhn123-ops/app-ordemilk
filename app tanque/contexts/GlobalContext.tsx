
import React, { createContext, useContext, useState, useEffect } from 'react';

// Definição do Estado Global
interface TechData {
    name: string;
    company: string;
}

interface GlobalState {
    techData: TechData;
}

interface GlobalContextType extends GlobalState {
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
    // Removido, pois o tema agora é hardcoded para dark mode nos componentes UI

    // --- ESTADO 2: DADOS DO TÉCNICO ---
    const [techData, setTechData] = useState<TechData>(() => {
        const saved = localStorage.getItem('ordemilk_tech_data');
        return saved ? JSON.parse(saved) : { name: '', company: '' };
    });

    // Persistência dos Dados do Técnico
    useEffect(() => {
        localStorage.setItem('ordemilk_tech_data', JSON.stringify(techData));
    }, [techData]);

    const updateTechData = (data: Partial<TechData>) => {
        setTechData(prev => ({ ...prev, ...data }));
    };

    return (
        <GlobalContext.Provider value={{ techData, updateTechData }}>
            {children}
        </GlobalContext.Provider>
    );
};