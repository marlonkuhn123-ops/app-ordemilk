import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, AIOutputBox } from './UI';
import { HistoryItem } from '../types';

export const HistoryTool: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selected, setSelected] = useState<HistoryItem | null>(null);

    useEffect(() => {
        const existing = localStorage.getItem('ordemilk_history');
        if (existing) {
            setHistory(JSON.parse(existing));
        }
    }, []);

    const clearHistory = () => {
        if(confirm("Apagar todo o histórico?")) {
            localStorage.removeItem('ordemilk_history');
            setHistory([]);
            setSelected(null);
        }
    };

    return (
        <div className="animate-fadeIn">
            <SectionTitle icon="fa-solid fa-clock-rotate-left" title="8. HISTÓRICO" />
            <Card>
                {!selected ? (
                    <>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                            {history.length === 0 && <div className="text-center text-slate-500 text-xs py-10">Nenhum relatório salvo.</div>}
                            {history.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => setSelected(item)}
                                    className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sky-400 text-sm">{item.client}</span>
                                        <span className="text-[10px] text-slate-400">{item.date}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">{item.content.substring(0, 50)}...</div>
                                </div>
                            ))}
                        </div>
                        {history.length > 0 && (
                            <button onClick={clearHistory} className="w-full mt-4 text-xs text-red-400 underline decoration-red-900/50 hover:text-red-300">
                                Limpar Histórico
                            </button>
                        )}
                    </>
                ) : (
                    <div>
                        <button 
                            onClick={() => setSelected(null)}
                            className="mb-4 text-xs text-sky-400 flex items-center gap-2 font-bold"
                        >
                            <i className="fa-solid fa-arrow-left"></i> VOLTAR
                        </button>
                        <AIOutputBox content={selected.content} isLoading={false} title={`RELATÓRIO - ${selected.date}`} />
                    </div>
                )}
            </Card>
        </div>
    );
};
