
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, AIOutputBox } from './ComponentesUI';
import { generateTechResponse } from '../services/geminiService';

export const Ferramenta_2_Erros: React.FC = () => {
    const [model, setModel] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async () => {
        if (!code) return;
        setLoading(true);
        try {
            // Prompt Robótico
            const prompt = `
            COMANDO: BUSCAR CÓDIGO DE ERRO.
            CONTROLADOR: ${model || 'Genérico'}.
            CÓDIGO: ${code}.
            
            INSTRUÇÃO: Retorne APENAS o significado técnico e a solução direta.
            SEM BOM DIA. SEM TEXTO DE APOIO. APENAS O DADO TÉCNICO.
            `;
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
                <AIOutputBox content={result} isLoading={loading} title="DIAGNÓSTICO DO ERRO" />
            </Card>
        </div>
    );
};
