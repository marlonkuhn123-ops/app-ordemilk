
import React, { useState, useEffect } from 'react';
import { Header, BottomNav } from './components/Estrutura';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LoginScreen } from './components/LoginScreen';

// COMPONENTES DE FERRAMENTAS (Oficiais)
import { Tool_Assistant } from './components/Tool_1_Assistant';
import { Tool_Errors } from './components/Tool_2_Errors';
import { Tool_Calculator } from './components/Tool_3_Calculator';
import { Tool_Sizing } from './components/Tool_4_Sizing';
import { Tool_Report } from './components/Tool_5_Report';
import { Tool_Catalog } from './components/Tool_6_Catalog';

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
            const today = new Date().toDateString();
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
            case ViewState.DIAGNOSTIC: return <Tool_Assistant />;
            case ViewState.ERRORS: return <Tool_Errors />;
            case ViewState.CALCULATOR: return <Tool_Calculator />;
            case ViewState.SIZING: return <Tool_Sizing />;
            case ViewState.REPORT: return <Tool_Report />;
            case ViewState.TECH_DATA: return <Tool_Catalog />;
            default: return <Tool_Assistant />;
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
                <Header isOnline={isOnline} onStartTutorial={() => setIsTutorialActive(true)} />
                
                <main className="flex-1 overflow-y-auto px-4 pt-6 scroll-smooth max-w-2xl mx-auto w-full pb-safe">
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