
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';

// --- FERRAMENTA 2: DECODIFICADOR DE ERROS ---
export const Tool_Errors: React.FC = () => {
    const [model, setModel] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const prompt = `Controlador: ${model}. Código: ${code}. O que significa e como resolver? Responda curto.`;
            const text = await generateTechResponse(prompt, "ERRORS");
            setResult(text);
        } catch (e) { setResult("Erro ao processar."); }
        setLoading(false);
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-triangle-exclamation" title="2. ERROS E LIMPEZA (CIP)" />
            <Card>
                <Input label="Modelo do Controlador" placeholder="Ex: Full Gauge, TC-900..." value={model} onChange={e => setModel(e.target.value)} />
                <Input label="Código no Visor ou Sintoma de Sujeira" placeholder="Ex: E1, AH, Pedra do Leite, Gordura..." value={code} onChange={e => setCode(e.target.value)} />
                <Button onClick={run} disabled={loading}>ANALISAR FALHA</Button>
                <AIOutputBox content={result} isLoading={loading} />
            </Card>
        </div>
    );
};
