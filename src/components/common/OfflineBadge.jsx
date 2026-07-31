import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function OfflineBadge() {
  const { isOnline, offlineQueue, syncOfflineQueue } = useData();

  if (isOnline && offlineQueue.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm animate-slide-up">
      <div className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
        !isOnline
          ? 'bg-rose-900/90 text-white border-rose-700'
          : 'bg-amber-500/95 text-slate-950 border-amber-400'
      }`}>
        {!isOnline ? (
          <div className="w-10 h-10 rounded-xl bg-rose-800/80 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-rose-200" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-amber-600/80 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          </div>
        )}

        <div className="flex-1 text-xs">
          <p className="font-extrabold text-sm leading-tight">
            {!isOnline ? 'Modo Offline PWA' : 'Sincronização Pendente'}
          </p>
          <p className="opacity-90 mt-0.5">
            {!isOnline
              ? `Sem internet. ${offlineQueue.length} tarefa(s) na fila local.`
              : `${offlineQueue.length} item(ns) salvos offline prontos para enviar.`}
          </p>
        </div>

        {isOnline && offlineQueue.length > 0 && (
          <button
            onClick={syncOfflineQueue}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 shadow-md flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sincronizar</span>
          </button>
        )}
      </div>
    </div>
  );
}
