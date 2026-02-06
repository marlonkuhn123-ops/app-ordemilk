
import React, { createContext, useContext, useState } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isAuto: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {}, isAuto: false });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default to LIGHT mode for the new Blue/Grey/Orange design
    const [theme, setTheme] = useState<Theme>('light');
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isAuto: false }}>
            {children}
        </ThemeContext.Provider>
    );
};
