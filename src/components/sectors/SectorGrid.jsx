import React, { useState } from 'react';
import { 
  Briefcase, 
  Package, 
  AlertTriangle, 
  Tags, 
  Droplets, 
  ShowerHead, 
  Utensils, 
  Coffee, 
  QrCode, 
  ClipboardCheck, 
  Wrench,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { SECTORS_DATA } from '../../data/sectorsData';
import { getAvailableSectorsForUnit } from '../../utils/googleSheetsIntegration';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import QrCodeModal from './QrCodeModal';

export default function SectorGrid() {
  const { currentUnit, navigateToSector } = useApp();
  const { cleaningTasks } = useData();
  const [qrModalSector, setQrModalSector] = useState(null);
  const availableSectors = React.useMemo(() => getAvailableSectorsForUnit(currentUnit), [currentUnit]);

  const renderIcon = (iconName, className) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Package': return <Package className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Tags': return <Tags className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      case 'ShowerHead': return <ShowerHead className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      default: return <Briefcase className={className} />;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-24 md:pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-unit-secondary bg-unit-light px-3 py-1 rounded-full border border-unit-secondary/20">
            {currentUnit?.name}
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Setores e <span className="text-unit-secondary">Áreas de Operação</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Selecione uma área abaixo para iniciar um checklist de limpeza ou registrar um chamado de manutenção.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-700 px-3">
            Dica: Escaneie o QR Code na porta do setor
          </span>
        </div>
      </div>

      {/* Grid de Setores Dinâmicos por Pazotti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {availableSectors.map((sector) => {
          // Checa se há alguma tarefa feita hoje neste setor para a unidade selecionada
          const completedToday = cleaningTasks.some(
            (t) => t.unitId === currentUnit?.id && t.sectorId === sector.id && t.date === todayStr
          );

          return (
            <div
              key={sector.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-unit-secondary/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Ícone, Nome e QR Code trigger */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-unit-light text-unit-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    {renderIcon(sector.iconName, 'w-6 h-6')}
                  </div>

                  <button
                    onClick={() => setQrModalSector(sector)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={`Ver QR Code de ${sector.name}`}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {sector.name}
                  </h3>
                  {completedToday && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold" title="Checklist executado hoje">
                      <CheckCircle2 className="w-3 h-3" />
                      Hoje
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-5">
                  {sector.description}
                </p>
              </div>

              {/* Botões de Ação: Limpeza e Manutenção */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigateToSector(sector.id, 'limpeza')}
                  className="py-2.5 px-3 rounded-xl bg-unit-light text-unit-primary hover:bg-unit-primary hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Limpeza</span>
                </button>

                <button
                  onClick={() => navigateToSector(sector.id, 'manutencao')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Manutenção</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal do QR Code Studio */}
      <QrCodeModal
        sector={qrModalSector}
        isOpen={!!qrModalSector}
        onClose={() => setQrModalSector(null)}
        onScanSuccess={(sectorId) => {
          navigateToSector(sectorId, 'limpeza');
        }}
      />
    </div>
  );
}
