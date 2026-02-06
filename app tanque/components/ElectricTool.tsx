
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, FileUpload, AIOutputBox } from './UI';
import { generateTechResponse, analyzePlateImage } from '../services/geminiService';
import { ElectricReading } from '../types';

export const ElectricTool: React.FC = () => {
    const [reading, setReading] = useState<ElectricReading>({ phase: 'tri' });
    const [voltR, setVoltR] = useState('');
    const [voltS, setVoltS] = useState('');
    const [voltT, setVoltT] = useState('');
    const [ampNow, setAmpNow] = useState('');
    const [ampNominal, setAmpNominal] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReadingPlate, setIsReadingPlate] = useState(false);

    const handlePlateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsReadingPlate(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const jsonStr = await analyzePlateImage(base64);
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.volts) {
                        setVoltR(data.volts.toString());
                        if (data.phase === 'tri') { setVoltS(data.volts); setVoltT(data.volts); setReading({ ...reading, phase: 'tri' }); }
                        else if (data.phase === 'bi') { setVoltS(data.volts); setReading({ ...reading, phase: 'bi' }); }
                        else { setReading({ ...reading, phase: 'mono' }); }
                    }
                    if (data.amps) setAmpNominal(data.amps.toString());
                    if (data.phase) setReading(prev => ({ ...prev, phase: data.phase }));
                } catch (parseError) {
                    alert("Não foi possível ler os dados da placa automaticamente.");
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
        } finally {
            setIsReadingPlate(false);
        }
    };

    const analyze = async () => {
        setIsLoading(true);
        const prompt = `Analise este cenário elétrico para um compressor de tanque de leite.
        Tipo: ${reading.phase}.
        Leituras: R=${voltR}V, S=${voltS}V, T=${voltT}V.
        Corrente Atual: ${ampNow}A. Nominal: ${ampNominal}A.
        Calcule o desequilíbrio e dê o veredito.`;

        try {
            // Use 'ELECTRIC' tool type for specialized analysis
            const text = await generateTechResponse(prompt, "ELECTRIC");
            setResult(text);
        } catch (error) {
            setResult("Erro ao analisar. Verifique conexão.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-bolt" title="3. ANÁLISE ELÉTRICA" />
            <Card>
                <FileUpload 
                    label={isReadingPlate ? "LENDO PLACA..." : "LER DADOS DA PLACA (IA)"} 
                    icon="fa-id-card"
                    onChange={handlePlateUpload} 
                />
                
                <Select 
                    label="Tipo de Rede" 
                    value={reading.phase} 
                    onChange={(e) => setReading({ ...reading, phase: e.target.value as any })}
                >
                    <option value="tri">Trifásico (R S T)</option>
                    <option value="bi">Bifásico (F1 F2)</option>
                    <option value="mono">Monofásico (F1 N)</option>
                    <option value="mrt">Monofásico Rural (MRT)</option>
                </Select>

                <div className="flex gap-2">
                    <Input label={reading.phase === 'mono' || reading.phase === 'mrt' ? "Fase (V)" : "Fase R (V)"} type="number" value={voltR} onChange={e => setVoltR(e.target.value)} />
                    {(reading.phase === 'tri' || reading.phase === 'bi') && (
                        <Input label={reading.phase === 'bi' ? "Fase 2 (V)" : "Fase S (V)"} type="number" value={voltS} onChange={e => setVoltS(e.target.value)} />
                    )}
                    {reading.phase === 'tri' && (
                        <Input label="Fase T (V)" type="number" value={voltT} onChange={e => setVoltT(e.target.value)} />
                    )}
                </div>

                <div className="flex gap-2">
                    <Input label="Corrente Medida (A)" type="number" value={ampNow} onChange={e => setAmpNow(e.target.value)} />
                    <Input label="Corrente Nom. (A)" type="number" value={ampNominal} onChange={e => setAmpNominal(e.target.value)} />
                </div>

                <Button onClick={analyze} disabled={isLoading}>VERIFICAR RISCO</Button>
                <AIOutputBox content={result} isLoading={isLoading} />
            </Card>
        </div>
    );
};
