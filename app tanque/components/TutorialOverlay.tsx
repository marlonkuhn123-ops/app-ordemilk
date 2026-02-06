
import React, { useEffect } from 'react';
import { ViewState } from '../types';

export interface TutorialStep {
    targetView: ViewState;
    title: string;
    content: React.ReactNode;
    icon: string;
}

interface Props {
    isActive: boolean;
    onClose: () => void;
    setView: (view: ViewState) => void;
}

export const TutorialOverlay: React.FC<Props> = ({ isActive, onClose, setView }) => {
    const [stepIndex, setStepIndex] = React.useState(0);

    const steps: TutorialStep[] = [
        {
            targetView: ViewState.DIAGNOSTIC,
            title: "BEM-VINDO AO ORDEMILK TECH V33",
            icon: "fa-solid fa-handshake",
            content: (
                <>
                    <p>Este é o seu <strong>Assistente de Campo Inteligente</strong>. Ele foi treinado com todos os manuais, esquemas elétricos e parâmetros da Ordemilk.</p>
                    <p className="mt-2">Vamos fazer um tour rápido para você dominar a ferramenta?</p>
                </>
            )
        },
        {
            targetView: ViewState.DIAGNOSTIC,
            title: "1. DIAGNÓSTICO INTELIGENTE",
            icon: "fa-solid fa-user-doctor",
            content: (
                <>
                    <p>Aqui é o cérebro do app. Você pode descrever o problema (ex: "Compressor congelando") ou <strong>tirar uma foto</strong> do equipamento.</p>
                    <p className="mt-2 text-orange-400"><strong>Dica de Ouro:</strong> Sempre informe pressões e corrente para a IA ser precisa.</p>
                </>
            )
        },
        {
            targetView: ViewState.ERRORS,
            title: "2. DECODIFICADOR DE ERROS",
            icon: "fa-solid fa-triangle-exclamation",
            content: (
                <>
                    <p>Apareceu um código estranho no painel (E04, E05)?</p>
                    <p className="mt-2">Digite o código aqui e saiba na hora a causa e a solução, seja para controladores Full Gauge ou Soft-Starters WEG.</p>
                </>
            )
        },
        {
            targetView: ViewState.CALCULATOR,
            title: "3. CALCULADORA DE GÁS",
            icon: "fa-solid fa-calculator",
            content: (
                <>
                    <p>A ferramenta mais importante para garantir o compressor. Calcule o <strong>Superaquecimento (SH)</strong> e <strong>Sub-resfriamento (SC)</strong>.</p>
                    <p className="mt-2">Isso evita retorno de líquido e garante a eficiência do tanque.</p>
                </>
            )
        },
        {
            targetView: ViewState.REPORT,
            title: "4. RELATÓRIOS TÉCNICOS",
            icon: "fa-solid fa-file-contract",
            content: (
                <>
                    <p>Profissionalize seu atendimento. Gere laudos técnicos detalhados ou certificados de entrega técnica em segundos.</p>
                    <p className="mt-2">Basta preencher os dados e clicar em gerar. O texto sai pronto para o WhatsApp.</p>
                </>
            )
        },
        {
            targetView: ViewState.DIAGNOSTIC,
            title: "TUDO PRONTO!",
            icon: "fa-solid fa-check-double",
            content: (
                <>
                    <p>Você está pronto para usar o <strong>Ordemilk Tech V33</strong>.</p>
                    <p className="mt-2">Se tiver dúvida, volte aqui no ícone de ajuda (?) no topo da tela.</p>
                    <p className="mt-2 font-bold text-emerald-400">Bom trabalho, parceiro!</p>
                </>
            )
        }
    ];

    const currentStep = steps[stepIndex];

    // Sync view with step
    useEffect(() => {
        if (isActive) {
            setView(currentStep.targetView);
        }
    }, [stepIndex, isActive, setView, currentStep]);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setStepIndex(0);
        onClose();
    };

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border bg-[#1e1e1e] border-[#444]">
                {/* Header do Card */}
                <div className="bg-gradient-to-r from-orange-600 to-red-700 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg shadow-inner border border-white/30">
                        <i className={currentStep.icon}></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">TREINAMENTO INTERATIVO</p>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide">{currentStep.title}</h3>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 text-sm leading-relaxed text-gray-200">
                    {currentStep.content}
                </div>

                {/* Footer / Controles */}
                <div className="p-4 border-t flex justify-between items-center border-[#333] bg-[#222]">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === stepIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-[#444]'
                                }`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors text-gray-400 hover:text-white hover:bg-[#333]"
                            >
                                Voltar
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase shadow-lg shadow-orange-900/50 transition-all active:scale-95"
                        >
                            {stepIndex === steps.length - 1 ? "CONCLUIR" : "PRÓXIMO"}
                        </button>
                    </div>
                </div>

                {/* Botão Fechar (X) */}
                <button 
                    onClick={handleClose}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    );
};
