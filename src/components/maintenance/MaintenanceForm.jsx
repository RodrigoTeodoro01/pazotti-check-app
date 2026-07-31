import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Mail, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  Building2,
  MapPin,
  Flame
} from 'lucide-react';
import { SECTORS_DATA } from '../../data/sectorsData';
import { getAvailableSectorsForUnit } from '../../utils/googleSheetsIntegration';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import PhotoUploader from '../cleaning/PhotoUploader';
import EmailPreviewModal from './EmailPreviewModal';

export default function MaintenanceForm() {
  const { currentUnit, user, selectedSectorId, setSelectedSectorId } = useApp();
  const { submitMaintenanceTicket, maintenanceTickets, updateMaintenanceStatus } = useData();

  const [priority, setPriority] = useState('Corretiva'); // 'Preventiva' | 'Corretiva' | 'Urgência'
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [activeEmailPreview, setActiveEmailPreview] = useState(null);

  const availableSectors = React.useMemo(() => getAvailableSectorsForUnit(currentUnit), [currentUnit]);
  const currentSector = availableSectors.find((s) => s.id === selectedSectorId || s.name === selectedSectorId) || availableSectors[0] || SECTORS_DATA[0];

  const handlePrioritySelect = (p) => {
    setPriority(p);
    // Auto-sugere texto inicial se a descrição estiver vazia
    if (!description.trim()) {
      if (p === 'Preventiva') {
        setDescription('Manutenção preventiva de rotina, conferência de estanqueidade / refrigeração.');
      } else if (p === 'Corretiva') {
        setDescription('Reparo em equipamento/instalação que apresentou defeito na operação.');
      } else if (p === 'Urgência') {
        setDescription('URGENTE: Falha que paralisa a operação ou apresenta risco à segurança.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, descreva o problema ou serviço solicitado.');
      return;
    }

    const ticketData = {
      unitId: currentUnit?.id,
      sectorId: selectedSectorId,
      priority,
      description: description.trim(),
      comments: comments.trim(),
      photos,
      authorName: user ? user.name : 'Colaborador Pazotti',
    };

    const result = submitMaintenanceTicket(ticketData, currentUnit?.name, currentSector.name);
    setSubmittedTicket(result);
  };

  const handleReset = () => {
    setDescription('');
    setComments('');
    setPhotos([]);
    setSubmittedTicket(null);
  };

  // Filtra histórico recente desta unidade
  const unitTickets = maintenanceTickets.filter((t) => t.unitId === currentUnit?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24 md:pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-unit-secondary bg-unit-light px-3 py-1 rounded-full border border-unit-secondary/20">
            {currentUnit?.name} • Gestão Operacional
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Chamados de <span className="text-unit-secondary">Manutenção</span>
          </h2>
        </div>

        {/* Seletor Rápido de Setor */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Setor do Chamado:</span>
          <select
            value={selectedSectorId}
            onChange={(e) => setSelectedSectorId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-unit-secondary"
          >
            {availableSectors.map((s) => (
              <option key={s.id} value={s.id}>
                📍 {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de envio bem-sucedido com visualização de E-mail */}
      {submittedTicket ? (
        <div className="bg-white border-2 border-unit-secondary rounded-3xl p-6 mb-8 shadow-xl animate-slide-up space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Chamado de Manutenção Aberto com Sucesso!
              </h3>
              <p className="text-xs text-slate-600">
                O time de manutenção e o gestor foram notificados automaticamente pelo e-mail do sistema.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-bold text-slate-800">
                Notificação Automática Disparada (Trigger Email):
              </p>
              <p className="text-slate-500">
                Assunto: {submittedTicket.email.subject}
              </p>
            </div>
            <button
              onClick={() => setActiveEmailPreview(submittedTicket.email)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Mail className="w-4 h-4 text-unit-secondary" />
              <span>Ver E-mail Disparado</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-unit-primary text-white font-extrabold text-xs hover:bg-unit-secondary transition-colors"
            >
              Abrir Outro Chamado
            </button>
          </div>
        </div>
      ) : null}

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 mb-12">
        {/* Sub-opções de Prioridade (Preventiva, Corretiva, Urgência) */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
            1. Selecione a Prioridade do Chamado
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Preventiva',
                label: 'Preventiva',
                desc: 'Revisão e rotina programada',
                color: 'blue',
                icon: Wrench,
              },
              {
                id: 'Corretiva',
                label: 'Corretiva',
                desc: 'Reparo em avaria ou defeito',
                color: 'amber',
                icon: AlertTriangle,
              },
              {
                id: 'Urgência',
                label: 'Urgência',
                desc: 'Alerta! Exige atendimento imediato',
                color: 'red',
                icon: Flame,
              },
            ].map((p) => {
              const isSelected = priority === p.id;
              const IconComponent = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePrioritySelect(p.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? p.color === 'red'
                        ? 'bg-red-900 text-white border-red-500 shadow-md scale-[1.02]'
                        : p.color === 'amber'
                        ? 'bg-amber-800 text-white border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-blue-900 text-white border-blue-500 shadow-md scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent
                      className={`w-5 h-5 ${
                        isSelected ? 'text-white' : p.color === 'red' ? 'text-red-600' : 'text-slate-600'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.id}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{p.label}</h4>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Alerta de Escalonamento de Urgência (Melhoria sugerida) */}
          {priority === 'Urgência' && (
            <div className="mt-3 bg-red-50 border border-red-300 rounded-2xl p-3.5 flex items-center gap-3 text-red-900 text-xs animate-slide-up">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong>Escalonamento Automático Ativo:</strong> Se este chamado não tiver status alterado nas primeiras 2 horas, um alerta com prioridade máxima será reenviado ao Gerente Operacional do Grupo Pazotti.
              </div>
            </div>
          )}
        </div>

        {/* Descrição e Comentários */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Descrição do Problema / Serviço Solicitado
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva claramente o problema, o local exato dentro do setor e qual equipamento precisa de manutenção..."
              className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-unit-secondary text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Comentários Adicionais ou Observações
            </label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Ex: Chave do disjuntor na sala técnica 2; solicitar compra de vedação..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-unit-secondary text-sm font-medium"
            />
          </div>
        </div>

        {/* Upload de Fotos com Compressão */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
            4. Anexo Fotográfico da Avaria / Serviço
          </label>
          <PhotoUploader
            label="Fotos da Manutenção"
            photos={photos}
            onAddPhoto={(p) => setPhotos((prev) => [...prev, p])}
            onRemovePhoto={(id) => setPhotos((prev) => prev.filter((i) => i.id !== id))}
          />
        </div>

        {/* Botão de Envio */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Limpar Campos
          </button>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-unit-primary text-white font-extrabold text-sm shadow-lg hover:bg-unit-secondary transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Abrir Chamado e Disparar E-mail</span>
          </button>
        </div>
      </form>

      {/* Histórico / Tickets em Aberto desta Unidade */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
          <span>Chamados em Andamento — {currentUnit?.name}</span>
          <span className="text-xs font-semibold text-slate-500">
            {unitTickets.length} chamado(s)
          </span>
        </h3>

        <div className="space-y-3">
          {unitTickets.map((t) => {
            const secName = SECTORS_DATA.find((s) => s.id === t.sectorId)?.name || t.sectorId;
            const isUrgent = t.priority === 'Urgência';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isUrgent && t.status !== 'Concluído'
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        t.priority === 'Urgência'
                          ? 'bg-red-600 text-white'
                          : t.priority === 'Corretiva'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      📍 {secName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-1">
                    {t.description}
                  </p>
                  {t.comments && (
                    <p className="text-xs text-slate-500 italic">
                      “{t.comments}” — {t.authorName}
                    </p>
                  )}
                </div>

                {/* Seletor de Status (Aberto -> Em andamento -> Concluído) */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => updateMaintenanceStatus(t.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer focus:outline-none ${
                      t.status === 'Concluído'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : t.status === 'Em andamento'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    <option value="Aberto">⚪ Aberto</option>
                    <option value="Em andamento">🟡 Em andamento</option>
                    <option value="Concluído">🟢 Concluído</option>
                  </select>
                </div>
              </div>
            );
          })}

          {unitTickets.length === 0 && (
            <div className="text-center py-8 bg-slate-100/50 rounded-2xl text-slate-500 text-sm">
              Nenhum chamado de manutenção registrado para {currentUnit?.name}.
            </div>
          )}
        </div>
      </div>

      {/* Modal de visualização de e-mail */}
      <EmailPreviewModal
        email={activeEmailPreview}
        isOpen={!!activeEmailPreview}
        onClose={() => setActiveEmailPreview(null)}
      />
    </div>
  );
}
