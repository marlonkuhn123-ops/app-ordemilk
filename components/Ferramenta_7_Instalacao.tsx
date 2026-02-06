
import React, { useState } from 'react';
import { Card, SectionTitle } from './ComponentesUI';

// Dados estáticos fora do componente
const STEPS = [
    {
        title: "1. Posicionamento e Infraestrutura",
        icon: "fa-solid fa-dungeon",
        points: [
            "Inspeção do Local: Antes de descarregar, verifique se o piso suporta o peso e se há desnível excessivo.",
            "Posição do Tanque: A boca de saída deve facilitar a conexão com o caminhão.",
            "Posição da Unidade (Vital): Lugar arejado, com ventilação cruzada."
        ]
    },
    {
        title: "Fase 2: Nivelamento",
        icon: "fa-solid fa-scale-balanced",
        points: [
            "Nivelamento Grosso: Mangueira de nível nos 4 pontos.",
            "Nivelamento Fino: Com água mínima (tocar pontos da régua)."
        ]
    },
    {
        title: "Fase 3: Tubulação",
        icon: "fa-solid fa-fire-burner",
        points: [
            "Brasagem com Nitrogênio: Vital para evitar borra preta (oxidação).",
            "Teste de Estanqueidade: Pressurizar (150-200 PSI).",
            "Vácuo Obrigatório: Desidratar até atingir leitura de microns (não por tempo).",
            "Isolamento: Sucção e Bulbo da válvula de expansão."
        ]
    },
    {
        title: "Fase 4: Elétrica",
        icon: "fa-solid fa-bolt",
        points: [
            "Aterramento (Segurança Humana).",
            "Reaperto de bornes (Evitar ponto quente).",
            "Cabos de comando: Seguir diagrama."
        ]
    },
    {
        title: "Fase 5: Startup e Testes",
        icon: "fa-solid fa-power-off",
        points: [
            "Sentido de Giro da Bomba e Agitador.",
            "Teste de Refrigeração (com água).",
            "Ajuste Válvula Expansão (SH: 8K a 12K).",
            "Nível de Óleo (1/4 a 3/4 do visor)."
        ]
    },
    {
        title: "Fase 6: Teste de CIP",
        icon: "fa-solid fa-soap",
        points: [
            "Dosagem químicos e Nível de água.",
            "Ciclo completo.",
            "Drenagem final (fundo seco)."
        ]
    }
];

export const Ferramenta_7_Instalacao: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const toggleCheck = (id: string) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setCheckedItems(newSet);
    };

    const totalPoints = STEPS.reduce((acc, s) => acc + s.points.length, 0);
    const progress = Math.round((checkedItems.size / totalPoints) * 100);

    return (
        <div className="animate-fadeIn pb-24">
            <SectionTitle icon="fa-solid fa-clipboard-check" title="7. GUIA DE INSTALAÇÃO" />
            
            {/* BARRA DE PROGRESSO STICKY */}
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-4 sticky top-0 z-20 backdrop-blur-md bg-[#1e1e1e]/90 border-[#333]">
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progresso</span>
                        <span className="text-[10px] font-bold text-orange-400">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <button 
                    onClick={() => setCheckedItems(new Set())}
                    className="text-[10px] underline text-gray-500 hover:text-white"
                >
                    Resetar
                </button>
            </div>

            <div className="space-y-4">
                {STEPS.map((step, stepIdx) => (
                    <Card key={stepIdx} className="overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#333]">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2a2a2a] text-orange-500 border border-[#333]">
                                <i className={step.icon}></i>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                                {step.title}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {step.points.map((point, pIdx) => {
                                const id = `${stepIdx}-${pIdx}`;
                                const isChecked = checkedItems.has(id);
                                
                                return (
                                    <div 
                                        key={pIdx}
                                        onClick={() => toggleCheck(id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex gap-3 items-start group ${
                                            isChecked 
                                                ? 'bg-emerald-900/10 border-emerald-900/30' 
                                                : 'bg-[#252525] border-[#333] hover:bg-[#2a2a2a] hover:border-orange-500/50'
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                            isChecked
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-[#555] text-transparent'
                                        }`}>
                                            <i className="fa-solid fa-check text-xs"></i>
                                        </div>
                                        <p className={`text-xs font-medium leading-relaxed select-none ${
                                            isChecked 
                                                ? 'text-emerald-400 line-through opacity-70' 
                                                : 'text-gray-200'
                                        }`}>
                                            {point}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
