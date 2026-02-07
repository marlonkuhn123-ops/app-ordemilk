import React, { useState, useEffect } from 'react';
import { Header, BottomNav } from './components/Estrutura';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LoginScreen } from './components/LoginScreen';

// COMPONENTES DE FERRAMENTAS
import { Ferramenta_1_Assistente } from './components/Ferramenta_1_Assistente';
import { Ferramenta_2_Erros } from './components/Ferramenta_2_Erros';
import { Ferramenta_3_Calculadora } from './components/Ferramenta_3_Calculadora';
import { Ferramenta_4_Dimensionamento } from './components/Ferramenta_4_Dimensionamento';
import { Ferramenta_5_Relatorio } from './components/Ferramenta_5_Relatorio';
import { Ferramenta_6_Catalogo } from './components/Ferramenta_6_Catalogo';

import { ViewState } from './types';
import { GlobalProvider } from './contexts/GlobalContext';

const AppContent: React.FC = () => {
    // --- AUTH STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- APP STATE ---
    const [view, setView] = useState<ViewState>(ViewState.DIAGNOSTIC);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isTutorialActive, setIsTutorialActive] = useState(false);
    
    // --- CHECK LOGIN ON LOAD ---
    useEffect(() => {
        const checkAuth = () => {
            const today = new Date().toDateString(); // Ex: "Mon Oct 02 2025"
            const savedDate = localStorage.getItem('om_auth_date');
            
            if (savedDate === today) {
                setIsAuthenticated(true);
            }
            setIsCheckingAuth(false);
        };
        checkAuth();
    }, []);

    // --- NETWORK STATUS ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleLoginSuccess = () => {
        const today = new Date().toDateString();
        localStorage.setItem('om_auth_date', today);
        setIsAuthenticated(true);
    };

    const renderView = () => {
        switch (view) {
            case ViewState.DIAGNOSTIC: return <Ferramenta_1_Assistente />;
            case ViewState.ERRORS: return <Ferramenta_2_Erros />;
            case ViewState.CALCULATOR: return <Ferramenta_3_Calculadora />;
            case ViewState.SIZING: return <Ferramenta_4_Dimensionamento />;
            case ViewState.REPORT: return <Ferramenta_5_Relatorio />;
            case ViewState.TECH_DATA: return <Ferramenta_6_Catalogo />;
            default: return <Ferramenta_1_Assistente />;
        }
    };

    // --- RENDER LOADING OR LOGIN ---
    if (isCheckingAuth) return null; // Or a simple spinner

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLoginSuccess} />;
    }

    // --- RENDER MAIN APP ---
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a] text-white relative">
            
            {/* Fundo Industrial (Mesh Pattern) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                style={{ 
                    backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
                    backgroundSize: '20px 20px' 
                }}
            ></div>
            
            <div className="relative flex flex-col h-full z-10">
                <Header isOnline={isOnline} />
                
                <main className="flex-1 overflow-y-auto px-4 pt-4 scroll-smooth max-w-2xl mx-auto w-full pb-safe">
                    {renderView()}
                </main>
                
                <BottomNav activeView={view} setView={setView} />
            </div>

            {/* TUTORIAL LAYER */}
            <TutorialOverlay 
                isActive={isTutorialActive} 
                onClose={() => setIsTutorialActive(false)} 
                setView={setView} 
            />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <GlobalProvider>
            <AppContent />
        </GlobalProvider>
    );
};

export default App;