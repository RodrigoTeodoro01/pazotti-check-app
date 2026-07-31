import React from 'react';
import { Check, Clock, User } from 'lucide-react';

export default function ChecklistItem({ item, onToggle, user }) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
        item.completed
          ? 'bg-emerald-50/70 border-emerald-300 text-slate-800'
          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-sm'
      }`}
    >
      {/* Checkbox customizado */}
      <div
        className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          item.completed
            ? 'bg-emerald-600 text-white shadow-sm scale-105'
            : 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
        }`}
      >
        {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
      </div>

      <div className="flex-1">
        <p
          className={`text-sm font-semibold leading-relaxed ${
            item.completed ? 'line-through text-slate-500' : 'text-slate-900'
          }`}
        >
          {item.text}
        </p>

        {item.completed && (
          <div className="mt-2 flex items-center gap-3 text-[11px] text-emerald-800/80 font-medium">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{item.completedBy || user?.name || 'Colaborador'}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{item.completedAtTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
