import React from 'react';
import { BarChart3, Mail, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UNITS_DATA } from '../../data/unitsData';
import { generateMonthlyReportEmail } from '../../utils/emailSimulator';

export default function MonthlyReportModal({ isOpen, onClose, onSendEmail, getUnitStatistics }) {
  if (!isOpen) return null;

  let totalCleaningAll = 0;
  let approvedAll = 0;
  let openMaintAll = 0;

  const unitReports = UNITS_DATA.map((u) => {
    const stats = getUnitStatistics(u.id);
    totalCleaningAll += stats.totalCleaning;
    approvedAll += stats.approvedCleaning;
    openMaintAll += stats.openMaintenance;
    return {
      ...u,
      ...stats,
    };
  });

  const overallCompliance = totalCleaningAll > 0 ? Math.round((approvedAll / totalCleaningAll) * 100) : 100;

  const handleSendEmail = () => {
    const email = generateMonthlyReportEmail({
      reportData: {
        totalCleaningTasks: totalCleaningAll,
        approvedRate: overallCompliance,
        openMaintenances: openMaintAll,
      },
    });
    onSendEmail(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-unit-primary text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-unit-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Relatório Mensal Consolidado</h3>
              <p className="text-xs opacity-90">Rede Grupo Pazotti • 5 Unidades</p>
            </div>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Cards de Resumo Geral */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
              <div className="text-2xl font-black text-blue-900">{totalCleaningAll}</div>
              <div className="text-xs text-blue-700 font-bold">Limpezas no Mês</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
              <div className="text-2xl font-black text-emerald-900">{overallCompliance}%</div>
              <div className="text-xs text-emerald-700 font-bold">Conformidade Geral</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <div className="text-2xl font-black text-amber-900">{openMaintAll}</div>
              <div className="text-xs text-amber-700 font-bold">Manut. Abertas</div>
            </div>
          </div>

          {/* Tabela Comparativa das 5 Unidades */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
              Auditoria por Unidade Pazotti
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Unidade</th>
                    <th className="p-3 text-center">Limpezas</th>
                    <th className="p-3 text-center">Aprovadas</th>
                    <th className="p-3 text-center">Conformidade</th>
                    <th className="p-3 text-center">Manut. Pendentes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {unitReports.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3 text-center">{u.totalCleaning}</td>
                      <td className="p-3 text-center text-emerald-700 font-bold">{u.approvedCleaning}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${
                          u.complianceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.complianceRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-700">{u.openMaintenance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-50 border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="px-6 py-2.5 rounded-xl bg-unit-primary text-white font-extrabold hover:bg-unit-secondary shadow-lg transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Disparar E-mail p/ Diretoria</span>
          </button>
        </div>
      </div>
    </div>
  );
}
