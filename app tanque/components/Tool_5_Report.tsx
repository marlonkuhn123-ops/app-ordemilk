
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './UI';
import { generateTechResponse } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';

// --- FERRAMENTA 5: RELATÓRIO TÉCNICO ---
export const Tool_Report: React.FC = () => {
    // Basic Info
    const [client, setClient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [techName, setTechName] = useState('');
    
    // Technical Info
    const [model, setModel] = useState('');
    const [serviceType, setServiceType] = useState('Corretiva');
    
    // Measurements (FILOSOFIA ORDEMILK: SH e SC, não apenas pressão)
    const [finalTemp, setFinalTemp] = useState('');
    const [superHeat, setSuperHeat] = useState('');
    const [subCooling, setSubCooling] = useState('');
    
    // Quality Checklist (Instigar o técnico a fazer o correto)
    const [checks, setChecks] = useState({
        vacuum: false,
        nitrogen: false,
        electricCheck: false,
        cleaning: false
    });

    const [vacuumMicrons, setVacuumMicrons] = useState(''); // Só aparece se vacuum = true
    
    const [obs, setObs] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const generate = async () => {
        if (!client || !obs) return;
        setLoading(true);
        try {
            // Construção dos dados fiéis (sem invenção)
            const procedures = [
                checks.vacuum ? `Vácuo realizado (${vacuumMicrons || 'Microns não inf.'} microns)` : 'Vácuo: NÃO INFORMADO (Risco de umidade)',
                checks.nitrogen ? 'Teste de Estanqueidade (Nitrogênio): OK' : null,
                checks.electricCheck ? 'Reaperto Elétrico: Realizado' : null,
                checks.cleaning ? 'Limpeza Condensador: Realizada' : null
            ].filter(Boolean).join('\n- ');

            const prompt = `
            DADOS REAIS DO CAMPO (AUDITORIA RIGOROSA):
            - Cliente: ${client}
            - Data: ${date}
            - Técnico: ${techName}
            - Equipamento: ${model}
            - Tipo: ${serviceType}
            
            LEITURAS TÉCNICAS (PRIORIDADE SH/SC):
            - Temp. Final Leite: ${finalTemp ? finalTemp + '°C' : 'Não medida'}
            - Superaquecimento (SH): ${superHeat ? superHeat + 'K' : 'Não medido'}
            - Sub-resfriamento (SC): ${subCooling ? subCooling + 'K' : 'Não medido'}

            PROCEDIMENTOS VALIDADOS PELO TÉCNICO (CHECKLIST):
            - ${procedures || 'Nenhum procedimento padrão marcado.'}

            RELATO LIVRE DO TÉCNICO:
            "${obs}"

            INSTRUÇÃO PARA O RELATÓRIO:
            1. AJA COMO UM AUDITOR TÉCNICO. NÃO INVENTE DADOS.
            2. Se o técnico não marcou "Vácuo", NÃO escreva que o vácuo foi feito.
            3. Se SH ou SC não foram informados, adicione uma "NOTA TÉCNICA" no rodapé recomendando a medição para validar a garantia do compressor.
            4. Use linguagem técnica (Fluido, Corrente, Pressão).
            `;
            
            const text = await generateTechResponse(prompt, "REPORT");
            setReport(text);
        } catch (e) {
            setReport("Erro ao gerar relatório.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn pb-10">
            <SectionTitle icon="fa-solid fa-file-contract" title="5. RELATÓRIO TÉCNICO" />
            
            <Card className="mb-4">
                {/* 1. DADOS CADASTRAIS */}
                <div className="mb-6 pb-4 border-b border-dashed border-slate-600/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Identificação</p>
                    <Input label="Nome do Cliente / Fazenda" value={client} onChange={e => setClient(e.target.value)} placeholder="Ex: Sr. João - Fazenda Sta. Luzia" />
                    <div className="flex gap-2">
                        <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-1/3" />
                        <Input label="Técnico Responsável" value={techName} onChange={e => setTechName(e.target.value)} className="w-2/3" placeholder="Seu Nome" />
                    </div>
                </div>

                {/* 2. EQUIPAMENTO E SERVIÇO */}
                <div className="mb-6 pb-4 border-b border-dashed border-slate-600/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Equipamento</p>
                    <div className="flex gap-2 mb-2">
                        <Select label="Tipo de Serviço" value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-1/2">
                            <option value="Corretiva">Manut. Corretiva</option>
                            <option value="Preventiva">Manut. Preventiva</option>
                            <option value="Instalação">Instalação Nova</option>
                            <option value="Entrega Técnica">Entrega Técnica</option>
                            <option value="Garantia">Atendimento Garantia</option>
                        </Select>
                        <Input label="Modelo/Capacidade" value={model} onChange={e => setModel(e.target.value)} className="w-1/2" placeholder="Ex: 4000L" />
                    </div>
                </div>

                {/* 3. PARÂMETROS CRÍTICOS (SH/SC) - O CORAÇÃO DO SISTEMA */}
                <div className="mb-6 pb-4 border-b border-dashed border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500">
                            <i className="fa-solid fa-gauge-high mr-1"></i> Parâmetros (Eficiência)
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input label="Temp. Final (°C)" type="number" value={finalTemp} onChange={e => setFinalTemp(e.target.value)} placeholder="3.8" />
                        <Input label="Superaquec. (K)" type="number" value={superHeat} onChange={e => setSuperHeat(e.target.value)} placeholder="SH" className="border-sky-500/30" />
                        <Input label="Sub-resfr. (K)" type="number" value={subCooling} onChange={e => setSubCooling(e.target.value)} placeholder="SC" className="border-sky-500/30" />
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1 italic opacity-70">* O Superaquecimento garante que não retorne fluido líquido ao compressor.</p>
                </div>

                {/* 4. CHECKLIST DE PROCEDIMENTOS (INSTIGAR O TÉCNICO) */}
                <div className="mb-6 pb-4 border-b border-dashed border-slate-600/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Checklist de Execução</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button 
                            onClick={() => toggleCheck('vacuum')}
                            className={`p-3 rounded-lg border text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${checks.vacuum ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-transparent border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <i className={`fa-solid ${checks.vacuum ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i> Vácuo
                        </button>
                        <button 
                            onClick={() => toggleCheck('nitrogen')}
                            className={`p-3 rounded-lg border text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${checks.nitrogen ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-transparent border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <i className={`fa-solid ${checks.nitrogen ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i> Nitrogênio
                        </button>
                        <button 
                            onClick={() => toggleCheck('electricCheck')}
                            className={`p-3 rounded-lg border text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${checks.electricCheck ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-transparent border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <i className={`fa-solid ${checks.electricCheck ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i> Elétrica
                        </button>
                        <button 
                            onClick={() => toggleCheck('cleaning')}
                            className={`p-3 rounded-lg border text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${checks.cleaning ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-transparent border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <i className={`fa-solid ${checks.cleaning ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i> Limpeza
                        </button>
                    </div>
                    {checks.vacuum && (
                         <Input label="Leitura do Vacuômetro (Microns)" type="number" value={vacuumMicrons} onChange={e => setVacuumMicrons(e.target.value)} placeholder="Ex: 450" className="animate-slide-up border-green-500/50" />
                    )}
                </div>

                {/* 5. DESCRIÇÃO LIVRE */}
                <div className="mb-4 w-full">
                    <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        Peças Trocadas / Detalhes Adicionais
                    </label>
                    <textarea 
                        rows={3} 
                        className={`w-full p-3 rounded-xl text-sm font-medium outline-none border transition-all ${
                            isDark 
                            ? 'bg-[#0b1221]/80 border-slate-800 text-slate-200 focus:border-cyan-500/50' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                        placeholder="Descreva o serviço realizado..."
                        value={obs}
                        onChange={e => setObs(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col gap-3">
                    <Button onClick={generate} disabled={loading}>
                        <i className="fa-solid fa-file-shield mr-2"></i> GERAR LAUDO TÉCNICO
                    </Button>
                </div>

                <AIOutputBox content={report} isLoading={loading} title="LAUDO OFICIAL - ORDEMILK" />
            </Card>
        </div>
    );
};
