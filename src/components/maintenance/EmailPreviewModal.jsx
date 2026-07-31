import React from 'react';
import { Mail, X, Check, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

export default function EmailPreviewModal({ email, isOpen, onClose }) {
  if (!isOpen || !email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-unit-secondary" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Auditoria — E-mail Disparado</h3>
              <p className="text-xs text-slate-400">Firebase Trigger Email / Notificação Automática</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadados do E-mail */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Para (TO):</span>
            <span className="font-mono font-bold text-slate-800">{email.to}</span>
          </div>
          {email.cc && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cópia (CC):</span>
              <span className="font-mono font-bold text-slate-800">{email.cc}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Assunto:</span>
            <span className="font-bold text-slate-900">{email.subject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Data de Envio:</span>
            <span className="text-slate-600">{new Date(email.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Conteúdo HTML rendered */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div
            dangerouslySetInnerHTML={{ __html: email.html }}
            className="email-body-content"
          />
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            ✓ Cópia salva no log de auditoria do gestor.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
