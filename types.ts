

export enum ViewState {
    DIAGNOSTIC = 'diag',
    ERRORS = 'errors',
    CALCULATOR = 'calc',
    SIZING = 'sizing',
    REPORT = 'report',
    TECH_DATA = 'tech_data'
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    image?: string; // base64
    isError?: boolean;
}

export interface ElectricReading {
    phase: 'tri' | 'bi' | 'mono' | 'mrt';
    voltsR?: string;
    voltsS?: string;
    voltsT?: string;
    amps?: string;
    nominal?: string;
}

export type CalcMode = 'SH' | 'SR';

export enum Refrigerant {
    R22 = 'R-22',
    R404A = 'R-404A'
}

export interface HistoryItem {
    id: string;
    client: string;
    date: string;
    content: string;
}