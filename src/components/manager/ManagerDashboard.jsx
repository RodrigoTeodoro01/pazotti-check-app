import React, { useState } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Mail, 
  FileText, 
  UserCheck, 
  ArrowRight,
  Flame,
  Table,
  UserCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { SECTORS_DATA } from '../../data/sectorsData';
import { UNITS_DATA } from '../../data/unitsData';
import ApprovalModal from './ApprovalModal';
import MonthlyReportModal from './MonthlyReportModal';
import EmailPreviewModal from '../maintenance/EmailPreviewModal';
import GoogleSheetsModal from './GoogleSheetsModal';
import { getTaskChecklistItems } from '../../utils/googleSheetsIntegration';

export default function ManagerDashboard({ onOpenLogin }) {
  const { currentUnit, user } = useApp();
  const { 
    cleaningTasks, 
    maintenanceTickets, 
    emailLogs, 
    approveCleaningTask, 
    rejectCleaningTask, 
    updateMaintenanceStatus,
    getUnitStatistics 
  } = useData();

  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'maintenances' | 'emails'
  const [selectedTaskForApproval, setSelectedTaskForApproval] = useState(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showGoogleSheets, setShowGoogleSheets] = useState(false);
  const [activeEmailPreview, setActiveEmailPreview] = useState(null);
  const [filterAllUnits, setFilterAllUnits] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const stats = getUnitStatistics(currentUnit?.id);
  const isManager = user?.role === 'Gestor';

  const pendingTasks = cleaningTasks.filter(
    (t) => (filterAllUnits || t.unitId === currentUnit?.id) && t.status === 'pending'
  );

  const unitMaintenances = maintenanceTickets.filter(
    (t) => filterAllUnits || t.unitId === currentUnit?.id
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-24 md:pb-12">
      {/* Alerta se não estiver logado como Gestor */}
      {!isManager && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">
                Você está conectado com o perfil "Funcionário"
              </h4>
              <p className="text-xs text-amber-800">
                Para auditar limpezas e aprovar checklists, alterne para o perfil Gestor (PIN: <strong>8888</strong>).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-extrabold text-xs transition-colors shrink-0"
          >
            Mudar para Perfil Gestor
          </button>
        </div>
      )}

      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-unit-secondary bg-unit-light px-3 py-1 rounded-full border border-unit-secondary/20">
            {currentUnit?.name} • Painel de Controle
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Dashboard e <span className="text-unit-secondary">Aprovações do Gestor</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenLogin}
            className="px-5 py-3 rounded-2xl bg-unit-primary hover:bg-unit-secondary text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 border border-white/20"
          >
            <UserCircle className="w-4 h-4 text-white" />
            <span>Entrar / Mudar Usuário</span>
          </button>

          <button
            onClick={() => setShowGoogleSheets(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Table className="w-4 h-4 text-emerald-300" />
            <span>Planilha Google Drive</span>
          </button>

          <button
            onClick={() => setShowMonthlyReport(true)}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <FileText className="w-4 h-4 text-unit-secondary" />
            <span>Relatório Mensal Consolidado</span>
          </button>
        </div>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Limpezas Aprovadas</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.approvedCleaning}</div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Conformidade: {stats.complianceRate}%
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Fila de Aprovação</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.pendingCleaning}</div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            Requer auditoria do gestor
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Manutenções Abertas</span>
            <Wrench className="w-5 h-5 text-unit-secondary" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.openMaintenance}</div>
          <div className="text-[11px] text-slate-600 font-bold mt-1">
            {stats.inProgressMaintenance} em andamento
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Chamados de Urgência</span>
            <Flame className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-600">{stats.urgentMaintenance}</div>
          <div className="text-[11px] text-red-700 font-bold mt-1">
            Escalonamento automático 2h
          </div>
        </div>
      </div>

      {/* Tabs de Controle e Toggle de Unidades */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-6 gap-4">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'approvals', label: 'Fila de Aprovação', count: pendingTasks.length },
            { id: 'maintenances', label: 'Manutenções Operacionais', count: unitMaintenances.length },
            { id: 'emails', label: 'Log de Auditoria / E-mails', count: emailLogs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-extrabold text-sm relative transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-unit-primary border-b-2 border-unit-primary'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterAllUnits(!filterAllUnits)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            filterAllUnits
              ? 'bg-unit-primary text-white border-unit-primary shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {filterAllUnits ? '🌐 Exibindo: Todas as 5 Unidades' : `📍 Exibindo apenas: ${currentUnit?.name}`}
        </button>
      </div>

      {/* Tab 1: Fila de Aprovação de Limpeza */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingTasks.map((t) => {
            const secName = SECTORS_DATA.find((s) => s.id === t.sectorId)?.name || t.sectorId;
            const unitObj = UNITS_DATA.find((u) => u.id === t.unitId);
            const unitLabel = unitObj ? unitObj.name : t.unitId;
            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-unit-secondary transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        Aguardando Aprovação
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                        🏢 {unitLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-800">📍 {secName}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 uppercase">{t.frequency}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      Executado por {t.userName} — ({t.completedItems}/{t.totalItems} itens)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Concluído em: {new Date(t.completedAt).toLocaleString('pt-BR')}
                    </p>

                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                      className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors flex items-center gap-1.5 border border-slate-300"
                    >
                      <span>{expandedTaskId === t.id ? '👁️ Ocultar Itens Executados' : `👁️ Ver Itens Concluídos (${t.completedItems} itens)`}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedTaskForApproval({ task: t, secName })}
                      className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-unit-primary text-white font-extrabold text-xs hover:bg-unit-secondary shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Auditar e Aprovar</span>
                    </button>
                  </div>
                </div>

                {expandedTaskId === t.id && (
                  <div className="w-full mt-4 pt-3 border-t border-slate-200 bg-slate-50/80 p-3.5 rounded-2xl animate-fade-in">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>📋 O Que Foi Executado Em: {secName}</span>
                      <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        {t.completedItems}/{t.totalItems} Itens Verificados
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {getTaskChecklistItems(t).map((it, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 p-2 rounded-xl text-xs ${
                            it.completed
                              ? 'bg-emerald-50/90 border border-emerald-300/70 text-slate-900 font-bold'
                              : 'bg-white border border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {it.completed ? '✅' : '⚪'}
                          </span>
                          <span className="leading-snug">{it.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {pendingTasks.length === 0 && (
            <div className="text-center py-12 bg-slate-100/50 rounded-3xl text-slate-500 text-sm">
              {filterAllUnits
                ? 'Nenhuma tarefa de limpeza pendente de aprovação no Grupo Pazotti.'
                : `Nenhuma tarefa de limpeza pendente de aprovação em ${currentUnit?.name}.`}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manutenções Operacionais */}
      {activeTab === 'maintenances' && (
        <div className="space-y-3">
          {unitMaintenances.map((t) => {
            const secName = SECTORS_DATA.find((s) => s.id === t.sectorId)?.name || t.sectorId;
            const isUrgent = t.priority === 'Urgência';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUrgent && t.status !== 'Concluído'
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200'
                }`}
              >
                <div>
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
                    <span className="text-xs font-bold text-slate-800">📍 {secName}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Criado em: {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-1">{t.description}</p>
                  {t.comments && (
                    <p className="text-xs text-slate-500 italic">“{t.comments}” — {t.authorName}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => updateMaintenanceStatus(t.id, e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border cursor-pointer focus:outline-none ${
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

          {unitMaintenances.length === 0 && (
            <div className="text-center py-12 bg-slate-100/50 rounded-3xl text-slate-500 text-sm">
              Nenhum chamado de manutenção registrado em {currentUnit?.name}.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Log de Auditoria / E-mails */}
      {activeTab === 'emails' && (
        <div className="space-y-3">
          {emailLogs.map((e, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-unit-light text-unit-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{e.subject}</h4>
                  <p className="text-xs text-slate-500">Para: {e.to} • {new Date(e.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveEmailPreview(e)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shrink-0"
              >
                Ver Conteúdo
              </button>
            </div>
          ))}

          {emailLogs.length === 0 && (
            <div className="text-center py-12 bg-slate-100/50 rounded-3xl text-slate-500 text-sm">
              Nenhuma notificação por e-mail disparada até o momento.
            </div>
          )}
        </div>
      )}

      {/* Modal de Aprovação de Checklist */}
      <ApprovalModal
        task={selectedTaskForApproval?.task}
        isOpen={!!selectedTaskForApproval}
        onClose={() => setSelectedTaskForApproval(null)}
        onApprove={(id, u, s) => approveCleaningTask(id, u, s)}
        onReject={(id, r, u, s) => rejectCleaningTask(id, r, u, s)}
        unitName={currentUnit?.name}
        sectorName={selectedTaskForApproval?.secName}
      />

      {/* Modal de Relatório Mensal Consolidado */}
      <MonthlyReportModal
        isOpen={showMonthlyReport}
        onClose={() => setShowMonthlyReport(false)}
        onSendEmail={(e) => setActiveEmailPreview(e)}
        getUnitStatistics={getUnitStatistics}
      />

      {/* Modal de Integração Google Sheets */}
      <GoogleSheetsModal
        isOpen={showGoogleSheets}
        onClose={() => setShowGoogleSheets(false)}
      />

      {/* Modal de preview de E-mail */}
      <EmailPreviewModal
        email={activeEmailPreview}
        isOpen={!!activeEmailPreview}
        onClose={() => setActiveEmailPreview(null)}
      />
    </div>
  );
}
