import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, X, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTaskChecklistItems } from '../../utils/googleSheetsIntegration';

export default function ApprovalModal({ task, isOpen, onClose, onApprove, onReject, unitName, sectorName }) {
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleApprove = () => {
    onApprove(task.id, unitName, sectorName);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  const handleReject = (e) => {
    e.preventDefault();
    setError('');

    if (!rejectReason.trim()) {
      setError('Por favor, digite o motivo da reprovação para que o colaborador saiba o que corrigir.');
      return;
    }

    onReject(task.id, rejectReason.trim(), unitName, sectorName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-unit-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Auditoria do Gestor</h3>
              <p className="text-xs opacity-90">{unitName} — {sectorName}</p>
            </div>
          </div>
        </div>

        {/* Informações da Tarefa */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Colaborador:</span>
              <span className="font-extrabold text-slate-800">{task.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Periodicidade:</span>
              <span className="font-bold uppercase text-unit-primary">{task.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Itens Concluídos:</span>
              <span className="font-bold text-slate-900">{task.completedItems} / {task.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Horário Conclusão:</span>
              <span className="text-slate-700">{new Date(task.completedAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Lista de Itens Executados no Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>📋 Itens Executados no Checklist</span>
              <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                {task.completedItems}/{task.totalItems} Feitos
              </span>
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-44 overflow-y-auto space-y-1.5">
              {getTaskChecklistItems(task).map((it, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                    it.completed ? 'bg-emerald-50/80 border border-emerald-200/70 text-slate-800 font-bold' : 'bg-white border border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {it.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <span className="leading-tight">{it.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fotos Anexadas na Limpeza */}
          {(task.beforePhotos?.length > 0 || task.afterPhotos?.length > 0) && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registro Fotográfico (Antes & Depois)
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                {task.beforePhotos?.map((p, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border">
                    <img src={p.dataUrl} alt="Antes" className="w-full h-16 object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-bold">ANTES</span>
                  </div>
                ))}
                {task.afterPhotos?.map((p, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border">
                    <img src={p.dataUrl} alt="Depois" className="w-full h-16 object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-700/90 text-white text-[9px] text-center font-bold">DEPOIS</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comentário Obrigatório de Reprovação */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-1.5">
              Justificativa de Reprovação (Obrigatório em caso de recusa)
            </label>
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o que precisa ser limpo ou corrigido para o colaborador ajustar..."
              className="w-full p-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-medium"
            />
            {error && (
              <p className="text-rose-600 font-bold text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Botões de Decisão */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleReject}
              className="py-3 px-4 rounded-xl font-extrabold text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors"
            >
              Reprovar com Comentário
            </button>

            <button
              type="button"
              onClick={handleApprove}
              className="py-3 px-4 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aprovar Limpeza</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
