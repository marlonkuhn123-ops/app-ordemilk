
import React, { useState } from 'react';
import { Card, SectionTitle } from './UI';
import { useTheme } from '../contexts/ThemeContext';

interface InstallStep {
    title: string;
    icon: string;
    points: string[];
    warnings?: string[];
}

export const InstallationTool: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const toggleCheck = (id: string) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setCheckedItems(newSet);
    };

    const steps: InstallStep[] = [
        {
            title: "1. Posicionamento e Infraestrutura (A Base)",
            icon: "fa-solid fa-dungeon",
            points: [
                "Inspeção do Local: Antes de descarregar, verifique se o piso suporta o peso (tanque cheio) e se há desnível excessivo.",
                "Posição do Tanque: A boca de saída deve facilitar a conexão com o caminhão de coleta.",
                "Espaço para abrir a tampa e sacar a régua sem bater no teto/vigas.",
                "Posição da Unidade Condensadora (Vital): Regra: Lugar arejado, com ventilação.",
                "Proibido: Lugares fechados, 'casinhas' sem exaustão para evitar o looping de ar quente."
            ]
        },
        {
            title: "Fase 2: Nivelamento",
            icon: "fa-solid fa-scale-balanced",
            points: [
                "Nivelamento Grosso: Usar mangueira de nível ou laser para alinhar os 4 pontos marcados de fábrica.",
                "Nivelamento Fino: Colocar água mínima até tocar alguns pontos da régua.",
                "Conferir frente e trás (precisa ser a mesma medição)."
            ]
        },
        {
            title: "Fase 3: Tubulação",
            icon: "fa-solid fa-fire-burner",
            points: [
                "Brasagem Técnica (Nitrogênio): Passar nitrogênio durante a brasagem (fluxo baixo) para evitar borra preta (oxidação) dentro do tubo, que entope filtro e capilar.",
                "Se não der durante, passar uma carga forte de nitrogênio depois para limpar.",
                "Teste de Estanqueidade (Pressurização): Pressurizar com Nitrogênio (aprox. 150-200 PSI) e deixar por tempo hábil.",
                "Usar espuma/sabão em todas as soldas e porcas.",
                "Desidratação (Vácuo): Obrigatório: Vácuo não é por tempo, é por leitura no vacuômetro. Isso remove umidade que vira ácido no óleo.",
                "Isolamento: Isolar tubulação de sucção (retorno) para não condensar e não ganhar calor.",
                "Isolar o Bulbo da válvula de expansão perfeitamente (para leitura real do SH)."
            ]
        },
        {
            title: "Fase 4: Elétrica",
            icon: "fa-solid fa-bolt",
            points: [
                "Conferir Aterramento (Segurança).",
                "Conferir parafusos ou cabos soltos no painel elétrico.",
                "Alimentação Geral: Conectar cabo de força no painel. Verificar aperto dos bornes (evitar ponto quente).",
                "Conectar cabos de comando entre Unidade e Tanque (respeitando as marcações)."
            ]
        },
        {
            title: "Fase 5: Hidráulica de Limpeza",
            icon: "fa-solid fa-faucet",
            points: [
                "Conectar água quente (>70°C na chegada) e fria."
            ]
        },
        {
            title: "Fase 6: Startup e Testes",
            icon: "fa-solid fa-power-off",
            points: [
                "Testes Manuais (Sentido de Giro): Ligar bomba de limpeza (verificar seta de giro).",
                "Ligar agitador (verificar se a pá empurra o leite para baixo/fundo).",
                "Teste de Refrigeração: Com água ou leite (que cubra as pás dos agitadores).",
                "Ajuste Fino: Regular Válvula de Expansão.",
                "Meta: Superaquecimento (SH) entre 8K e 12K (buscando 8K limite com leite abaixo de 5 graus).",
                "Meta: Sub-resfriamento (SR) entre 4K e 8K.",
                "Conferência de Óleo: Com o sistema estável, olhar o visor do compressor. Nível deve estar entre 1/4 e 3/4 do visor."
            ]
        },
        {
            title: "Fase 7: Teste de CIP (Limpeza Ciclo Completo)",
            icon: "fa-solid fa-soap",
            points: [
                "Calcular dosagem de químicos e tempo de enchimento de água (nível mínimo).",
                "Rodar um ciclo completo com químicos (Ácido/Alcalino/Sanitizante).",
                "Verificar drenagem final (não pode sobrar água no fundo).",
                "Calibração da Régua Eletrônica: Realizar o procedimento de igualar resultados da régua eletrônica conforme a régua física.",
                "Treinamento do Produtor: Ensinar a limpar o condensador, olhar o visor de óleo e operar o painel."
            ]
        }
    ];

    const progress = Math.round((checkedItems.size / steps.reduce((acc, s) => acc + s.points.length, 0)) * 100);

    return (
        <div className="animate-fadeIn pb-10">
            <SectionTitle icon="fa-solid fa-clipboard-check" title="7. GUIA DE INSTALAÇÃO" />
            
            {/* PROGRESS BAR */}
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 sticky top-0 z-20 backdrop-blur-md ${
                isDark ? 'bg-[#0f172a]/90 border-slate-700' : 'bg-white/90 border-slate-200'
            }`}>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Progresso</span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <button 
                    onClick={() => setCheckedItems(new Set())}
                    className="text-[10px] underline text-slate-500 hover:text-red-400"
                >
                    Resetar
                </button>
            </div>

            <div className="space-y-4">
                {steps.map((step, stepIdx) => (
                    <Card key={stepIdx} className="overflow-hidden">
                        <div className={`flex items-center gap-3 mb-4 pb-2 border-b ${
                            isDark ? 'border-slate-700/50' : 'border-slate-200'
                        }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDark ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-100 text-sky-700'
                            }`}>
                                <i className={step.icon}></i>
                            </div>
                            <h3 className={`font-bold text-sm uppercase tracking-wide ${
                                isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>
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
                                                ? (isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200') 
                                                : (isDark ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100')
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                            isChecked
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : (isDark ? 'border-slate-600 text-transparent' : 'border-slate-300 text-transparent')
                                        }`}>
                                            <i className="fa-solid fa-check text-xs"></i>
                                        </div>
                                        <p className={`text-xs font-medium leading-relaxed select-none ${
                                            isChecked 
                                                ? (isDark ? 'text-emerald-400 line-through opacity-70' : 'text-emerald-700 line-through opacity-70') 
                                                : (isDark ? 'text-slate-300' : 'text-slate-600')
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
