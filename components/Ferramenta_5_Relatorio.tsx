
import React, { useState } from 'react';
import { Card, SectionTitle, Button, Input, Select, AIOutputBox } from './ComponentesUI';
import { generateTechResponse } from '../services/geminiService';
import { useGlobal } from '../contexts/GlobalContext';

// --- DADOS TÉCNICOS COMPLETOS E DETALHADOS (7 FASES) ---
const INSTALL_STEPS = [
    {
        title: "1. POSICIONAMENTO E INFRAESTRUTURA (A BASE)",
        points: [
            "Inspeção do Local: Verificar se o piso suporta o peso (tanque cheio) e desnível.",
            "Posição do Tanque: Boca de saída facilitando conexão com caminhão.",
            "Espaço livre para abrir tampa e sacar régua sem bater no teto.",
            "Unidade Condensadora: LOCAL AREJADO e ventilado (CRÍTICO).",
            "PROIBIDO: 'Casinhas' fechadas sem exaustão (evitar looping térmico)."
        ]
    },
    {
        title: "2. NIVELAMENTO DE PRECISÃO",
        points: [
            "Nivelamento Grosso: Mangueira de nível/laser nos 4 pontos de fábrica.",
            "Nivelamento Fino: Água mínima tocando pontos da régua.",
            "Conferência Cruzada: Medição Frente vs Trás idêntica."
        ]
    },
    {
        title: "3. TUBULAÇÃO E BRASAGEM",
        points: [
            "Brasagem com Nitrogênio (Passante): Evitar oxidação interna (borra).",
            "Limpeza Pós-Brasagem: Carga forte de N2 se não usou durante.",
            "Teste de Estanqueidade: Pressurizar 150-200 PSI (Espuma em tudo).",
            "Desidratação (Vácuo): <500 Microns (Obrigatório leitura, não tempo).",
            "Isolamento Térmico: Sucção completa e Bulbo da Válvula."
        ]
    },
    {
        title: "4. ELÉTRICA E SEGURANÇA",
        points: [
            "Aterramento: Conectado e Testado.",
            "Painel Elétrico: Reaperto geral de bornes (evitar ponto quente).",
            "Alimentação: Tensão de entrada dentro da faixa nominal.",
            "Comando: Cabos conectados seguindo as anilhas/diagrama."
        ]
    },
    {
        title: "5. HIDRÁULICA DE LIMPEZA",
        points: [
            "Água Quente: Conectada e com temperatura >70°C na chegada.",
            "Água Fria: Pressão adequada para enxágue."
        ]
    },
    {
        title: "6. STARTUP E AJUSTES FINOS",
        points: [
            "Sentido de Giro: Bomba de Limpeza e Agitador (Jogando p/ baixo).",
            "Nível de Óleo: Entre 1/4 e 3/4 do visor (estável).",
            "Superaquecimento (SH): Ajustar entre 8K e 12K.",
            "Sub-resfriamento (SC): Ajustar entre 4K e 8K.",
            "Teste de Gelo: Verificar retorno de líquido na sucção."
        ]
    },
    {
        title: "7. ENTREGA E TREINAMENTO",
        points: [
            "Ciclo CIP Completo: Ácido + Alcalino + Sanitizante.",
            "Drenagem: Fundo seco após lavagem (sem poças).",
            "Calibração Régua Eletrônica: Igualar com régua física.",
            "Treinamento: Ensinar limpeza condensador e operação."
        ]
    }
];

export const Ferramenta_5_Relatorio: React.FC = () => {
    const { techData, updateTechData } = useGlobal();

    // --- ESTADO GERAL ---
    const [serviceMode, setServiceMode] = useState<'maintenance' | 'installation'>('installation');
    
    // Dados do Relatório
    const [client, setClient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [model, setModel] = useState('');
    
    // Leituras Técnicas
    const [finalTemp, setFinalTemp] = useState('');
    const [superHeat, setSuperHeat] = useState('');
    const [subCooling, setSubCooling] = useState('');
    
    // Checklist Manutenção
    const [maintChecks, setMaintChecks] = useState({
        vacuum: false, nitrogen: false, electricCheck: false, cleaning: false
    });
    const [vacuumMicrons, setVacuumMicrons] = useState('');
    const [obs, setObs] = useState('');
    
    // Checklist Instalação
    const [installChecked, setInstallChecked] = useState<Set<string>>(new Set());

    // Resultado
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculo de progresso
    const totalPoints = INSTALL_STEPS.reduce((acc, s) => acc + s.points.length, 0);
    const installProgress = Math.round((installChecked.size / totalPoints) * 100);

    // --- HANDLERS ---
    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value === 'Instalação' ? 'installation' : 'maintenance';
        setServiceMode(mode);
        setReport('');
    };

    const toggleMaintCheck = (key: keyof typeof maintChecks) => {
        setMaintChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleInstallCheck = (id: string) => {
        const newSet = new Set(installChecked);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setInstallChecked(newSet);
    };

    const generate = async () => {
        if (!client) { alert("Preencha o nome do cliente."); return; }
        setLoading(true);

        try {
            const techNameStr = techData.name || "Técnico Responsável";
            
            let procedureText = "";
            if (serviceMode === 'installation') {
                const completedSteps = [];
                INSTALL_STEPS.forEach((step, sIdx) => {
                    step.points.forEach((pt, pIdx) => {
                        if (installChecked.has(`${sIdx}-${pIdx}`)) {
                            completedSteps.push(pt);
                        }
                    });
                });
                procedureText = `ITENS VISTORIADOS E APROVADOS NA ENTREGA TÉCNICA:\n- ${completedSteps.join('\n- ')}\n\nPROGRESSO TOTAL: ${installProgress}%`;
            } else {
                procedureText = `PROCEDIMENTOS REALIZADOS (MANUTENÇÃO):\n${maintChecks.vacuum ? '- Desidratação/Vácuo ('+vacuumMicrons+' microns)' : ''}\n${maintChecks.nitrogen ? '- Teste de Estanqueidade (N2)' : ''}\n${maintChecks.electricCheck ? '- Revisão/Reaperto Elétrico' : ''}\n${maintChecks.cleaning ? '- Limpeza Química do Condensador' : ''}`;
            }

            // Prompt Robótico
            const prompt = `
            COMANDO: GERAR TEXTO DE LAUDO TÉCNICO (ESTRITO).
            
            DADOS CADASTRAIS:
            - Cliente: ${client}
            - Data: ${date}
            - Técnico: ${techNameStr}
            - Equipamento: ${model}
            - Tipo de Serviço: ${serviceMode === 'installation' ? 'INSTALAÇÃO / ENTREGA TÉCNICA' : 'MANUTENÇÃO'}
            
            PARÂMETROS TÉCNICOS:
            - Temperatura Final: ${finalTemp || 'N/A'}°C
            - Superaquecimento (SH): ${superHeat || 'N/A'}K
            - Sub-resfriamento (SC): ${subCooling || 'N/A'}K
            
            ${procedureText}
            
            OBSERVAÇÕES:
            "${obs}"
            
            INSTRUÇÃO DE SAÍDA:
            Gere um documento técnico formal e direto.
            - Título em CAIXA ALTA.
            - Liste os itens verificados com bullet points.
            - NÃO use saudações.
            - Finalize com espaço para assinatura.
            `;

            const text = await generateTechResponse(prompt, "REPORT");
            setReport(text);
        } catch (e) {
            setReport("Erro ao gerar documento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn pb-24">
            <SectionTitle icon="fa-solid fa-file-signature" title="5. SERVIÇOS TÉCNICOS" />

            {/* --- SELETOR DE MODO --- */}
            <Card className="mb-3 !py-2 bg-[#252525]">
                <Select 
                    value={serviceMode === 'installation' ? 'Instalação' : 'Manutenção'} 
                    onChange={handleServiceChange}
                    className="!mb-0 font-bold text-orange-500 text-center bg-transparent border-none focus:bg-transparent"
                >
                    <option value="Instalação">INSTALAÇÃO / ENTREGA TÉCNICA</option>
                    <option value="Manutenção">MANUTENÇÃO / VISITA</option>
                </Select>
            </Card>

            <Card className="mb-4">
                {/* 1. DADOS CADASTRAIS (COMPACTO) */}
                <div className="mb-4 border-b border-[#333] pb-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-id-card"></i> Identificação
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="Cliente" 
                            value={client} 
                            onChange={e => setClient(e.target.value)} 
                            placeholder="Nome / Fazenda" 
                            className="!p-2 text-xs !mb-0"
                        />
                        <Input 
                            label="Data" 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className="!p-2 text-xs !mb-0"
                        />
                        <Input 
                            label="Técnico" 
                            value={techData.name} 
                            onChange={e => updateTechData({ name: e.target.value })} 
                            placeholder="Resp. Técnico"
                            className="!p-2 text-xs !mb-0"
                        />
                        <Input 
                            label="Modelo" 
                            value={model} 
                            onChange={e => setModel(e.target.value)} 
                            placeholder="Ex: 4000L" 
                            className="!p-2 text-xs !mb-0"
                        />
                    </div>
                </div>

                {/* 2. LEITURAS TÉCNICAS (COMPACTO) */}
                <div className="mb-4 border-b border-[#333] pb-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <i className="fa-solid fa-gauge-high"></i> Parâmetros
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input label="SH (K)" type="number" value={superHeat} onChange={e => setSuperHeat(e.target.value)} placeholder="0" className="!p-2 text-xs !mb-0 border-orange-500/30" />
                        <Input label="SC (K)" type="number" value={subCooling} onChange={e => setSubCooling(e.target.value)} placeholder="0" className="!p-2 text-xs !mb-0 border-orange-500/30" />
                        <Input label="Temp Final" type="number" value={finalTemp} onChange={e => setFinalTemp(e.target.value)} placeholder="°C" className="!p-2 text-xs !mb-0" />
                    </div>
                </div>

                {/* 3. ÁREA PRINCIPAL: CHECKLISTS DETALHADOS */}
                {serviceMode === 'maintenance' ? (
                    <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Procedimentos de Rotina</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <button onClick={() => toggleMaintCheck('vacuum')} className={`p-3 rounded-lg border text-[9px] font-bold uppercase ${maintChecks.vacuum ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-transparent border-[#404040] text-gray-500'}`}>Vácuo</button>
                            <button onClick={() => toggleMaintCheck('nitrogen')} className={`p-3 rounded-lg border text-[9px] font-bold uppercase ${maintChecks.nitrogen ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-transparent border-[#404040] text-gray-500'}`}>Nitrogênio</button>
                            <button onClick={() => toggleMaintCheck('electricCheck')} className={`p-3 rounded-lg border text-[9px] font-bold uppercase ${maintChecks.electricCheck ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-transparent border-[#404040] text-gray-500'}`}>Elétrica</button>
                            <button onClick={() => toggleMaintCheck('cleaning')} className={`p-3 rounded-lg border text-[9px] font-bold uppercase ${maintChecks.cleaning ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-transparent border-[#404040] text-gray-500'}`}>Limpeza</button>
                        </div>
                        {maintChecks.vacuum && <Input label="Microns" type="number" value={vacuumMicrons} onChange={e => setVacuumMicrons(e.target.value)} placeholder="450" className="!p-2" />}
                    </div>
                ) : (
                    <div className="mb-6">
                         <div className="flex justify-between items-center mb-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-orange-500">
                                ENTREGA TÉCNICA - DETALHADA ({installProgress}%)
                            </p>
                            <div className="w-1/3 h-1.5 bg-[#333] rounded-full">
                                <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{width: `${installProgress}%`}}></div>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                             {INSTALL_STEPS.map((step, idx) => (
                                 <div key={idx} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
                                    <p className="text-[10px] font-bold text-gray-300 mb-3 border-b border-[#333] pb-1 uppercase tracking-wide">
                                        {step.title}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        {step.points.map((pt, pIdx) => {
                                            const id = `${idx}-${pIdx}`;
                                            const checked = installChecked.has(id);
                                            return (
                                                <button 
                                                    key={pIdx} 
                                                    onClick={() => toggleInstallCheck(id)} 
                                                    className={`p-3 rounded text-[10px] font-medium transition-all flex items-start text-left gap-3 ${
                                                        checked 
                                                        ? 'bg-emerald-900/20 border border-emerald-500/40 text-emerald-400' 
                                                        : 'bg-[#252525] border border-[#404040] text-gray-400 hover:border-gray-500'
                                                    }`}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 min-w-[16px] rounded border flex items-center justify-center ${
                                                        checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#555]'
                                                    }`}>
                                                        {checked && <i className="fa-solid fa-check text-[8px]"></i>}
                                                    </div>
                                                    <span className="leading-relaxed">{pt}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}

                <Input label="Observações / Peças Trocadas" value={obs} onChange={e => setObs(e.target.value)} className="!p-3 text-xs" />
                
                <Button onClick={generate} disabled={loading}>
                    <i className="fa-solid fa-file-shield mr-2"></i> 
                    {serviceMode === 'installation' ? 'GERAR CERTIFICADO OFICIAL' : 'GERAR LAUDO TÉCNICO'}
                </Button>
            </Card>

            <AIOutputBox 
                content={report} 
                isLoading={loading} 
                title={serviceMode === 'installation' ? "CERTIFICADO DE ENTREGA TÉCNICA" : "RELATÓRIO DE SERVIÇO"} 
            />
        </div>
    );
};
