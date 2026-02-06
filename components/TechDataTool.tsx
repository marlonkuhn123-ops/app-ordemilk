
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';

export const TechDataTool: React.FC = () => {
    const [volume, setVolume] = useState('4000L');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const prompt = `Forneça a Ficha Técnica para o modelo ${volume}. Liste apenas: Compressores, Solenoide, Válvula Expansão, Fluido Refrigerante (Kg) e Cabo. Use formato de lista simples.`;
            const text = await generateTechResponse(prompt, "TECH_DATA");
            setResult(text);
        } catch (e) {
            setResult("Erro ao buscar dados técnicos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-book-open" title="6. DADOS TÉCNICOS (BOM)" />
            <Card>
                <div className="mb-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">
                        SELECIONE O MODELO (PADRÃO FÁBRICA)
                    </p>
                    <Select 
                        value={volume} 
                        onChange={(e) => setVolume(e.target.value)}
                        label="Modelo do Equipamento"
                    >
                        <optgroup label="LINHA MTZ (Pequeno/Médio)">
                            <option value="500L">500 a 650 Litros</option>
                            <option value="800L">800 Litros</option>
                            <option value="1000L">1.000 Litros</option>
                            <option value="1300L">1.300 Litros</option>
                            <option value="1600L">1.600 Litros</option>
                            <option value="2000L">2.000 Litros</option>
                            <option value="2500L">2.500 Litros</option>
                            <option value="3000L">3.000 Litros</option>
                        </optgroup>
                        <optgroup label="LINHA INDUSTRIAL (MT)">
                            <option value="4000L">4.000 Litros (2x MT-50)</option>
                            <option value="6000L">6.000 Litros (3x MT-50)</option>
                            <option value="10000L">10.000 Litros (3x MT-100)</option>
                            <option value="12000L">12.000 Litros (3x MT-100)</option>
                            <option value="15000L">15.000 Litros (3x MT-125)</option>
                            <option value="20000L">20.000 Litros (4x MT-125)</option>
                        </optgroup>
                    </Select>
                </div>
                
                <Button onClick={fetchData} disabled={loading}>
                    <i className="fa-solid fa-microchip mr-2"></i>
                    CONSULTAR FICHA TÉCNICA
                </Button>
                
                <AIOutputBox 
                    content={result} 
                    isLoading={loading} 
                    title={`BOM - ${volume}`} 
                />
            </Card>
        </div>
    );
};
