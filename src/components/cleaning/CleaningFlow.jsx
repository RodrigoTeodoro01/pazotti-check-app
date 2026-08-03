import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  Send, 
  Sparkles, 
  AlertCircle, 
  RotateCcw,
  Building2,
  FolderOpen
} from 'lucide-react';
import { SECTORS_DATA } from '../../data/sectorsData';
import { DEFAULT_CHECKLISTS } from '../../data/defaultChecklists';
import { getCachedSheetChecklists, fetchChecklistsFromGoogleSheets, getAvailableSectorsForUnit, isItemForCurrentUnit } from '../../utils/googleSheetsIntegration';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import ChecklistItem from './ChecklistItem';
import confetti from 'canvas-confetti';

export default function CleaningFlow() {
  const { currentUnit, user, selectedSectorId, setSelectedSectorId } = useApp();
  const { submitCleaningTask } = useData();

  const [frequency, setFrequency] = useState('diaria'); // 'diaria' | 'semanal' | 'mensal'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(null);

  const availableSectors = React.useMemo(() => getAvailableSectorsForUnit(currentUnit), [currentUnit]);
  const currentSector = availableSectors.find((s) => s.id === selectedSectorId || s.name === selectedSectorId) || availableSectors[0] || SECTORS_DATA[0];

  // Garante que se o setor selecionado não existir na lista desta Pazotti, seleciona o primeiro setor disponível
  useEffect(() => {
    if (availableSectors.length > 0 && !availableSectors.some((s) => s.id === selectedSectorId || s.name === selectedSectorId)) {
      setSelectedSectorId(availableSectors[0].id);
    }
  }, [availableSectors, selectedSectorId, setSelectedSectorId]);

  // Sincroniza checklists da planilha com o cache em background
  useEffect(() => {
    fetchChecklistsFromGoogleSheets().then((res) => {
      if (res.success && res.checklists && res.checklists.length > 0) {
        // Dispara atualização se o cache mudar
        window.dispatchEvent(new Event('pazotti_checklists_updated'));
      }
    });
  }, []);

  // Carrega itens do checklist (prioriza aba "Checklist Limpeza" da Planilha com filtro de PAZOTTI + SETOR + FREQUENCIA)
  useEffect(() => {
    const loadItems = () => {
      const sheetChecklists = getCachedSheetChecklists();
      const sectorNameClean = (currentSector?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const selIdClean = String(selectedSectorId || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

      const matchingSheetItems = sheetChecklists.filter((item) => {
        // 1. Filtra por PAZOTTI (Unidade vinculada)
        if (!isItemForCurrentUnit(item, currentUnit)) return false;

        // 2. Filtra por SETOR
        const sheetSetor = (item.setor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const sectorMatches =
          sheetSetor === sectorNameClean ||
          sheetSetor === selIdClean ||
          sheetSetor.includes(sectorNameClean) ||
          sectorNameClean.includes(sheetSetor) ||
          (selectedSectorId === 'escritorios' && (sheetSetor.includes('escritorio') || sheetSetor.includes('sala') || sheetSetor.includes('reuniao'))) ||
          (selectedSectorId === 'deposito-produtos' && sheetSetor.includes('produto')) ||
          (selectedSectorId === 'deposito-improprios' && sheetSetor.includes('improprio')) ||
          (selectedSectorId === 'deposito-merchan' && sheetSetor.includes('merchan')) ||
          (selectedSectorId === 'banheiros-escritorio' && sheetSetor.includes('banheiro') && sheetSetor.includes('escritorio')) ||
          (selectedSectorId === 'banheiros-deposito' && sheetSetor.includes('banheiro') && sheetSetor.includes('deposito'));

        // 3. Filtra por periodicidade/frequência
        const sheetFreq = (item.frequencia || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const freqMatches =
          (frequency === 'diaria' && (sheetFreq.includes('diar') || sheetFreq === 'diário' || sheetFreq === 'diario' || !sheetFreq)) ||
          (frequency === 'semanal' && sheetFreq.includes('seman')) ||
          (frequency === 'mensal' && sheetFreq.includes('mensa'));

        return sectorMatches && freqMatches;
      });

      let itemsToLoad = [];
      if (matchingSheetItems && matchingSheetItems.length > 0) {
        itemsToLoad = matchingSheetItems.map((sheetItem, idx) => ({
          id: `sheet-${selectedSectorId}-${frequency}-${idx}`,
          text: sheetItem.questao,
          completed: false,
        }));
      } else if (sheetChecklists && sheetChecklists.length > 0) {
        // Planilha conectada mas sem itens vinculados para esta unidade -> checklist zerado!
        itemsToLoad = [];
      } else {
        const sectorChecklist = DEFAULT_CHECKLISTS[selectedSectorId] || DEFAULT_CHECKLISTS.escritorios;
        const freqList = sectorChecklist[frequency] || [];
        itemsToLoad = freqList.map((it) => ({ ...it, completed: false }));
      }

      setItems(itemsToLoad);
    };

    loadItems();
    window.addEventListener('pazotti_checklists_updated', loadItems);
    return () => window.removeEventListener('pazotti_checklists_updated', loadItems);
  }, [selectedSectorId, frequency, currentUnit, currentSector]);

  const handleToggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            completed: !item.completed,
            completedBy: !item.completed ? (user?.name || 'Colaborador') : undefined,
            completedAtTime: !item.completed
              ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const customItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      completed: true,
      completedBy: user?.name || 'Colaborador',
      completedAtTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setItems((prev) => [...prev, customItem]);
    setNewItemText('');
  };

  const handleReset = () => {
    setItems((prev) => prev.map((item) => ({ ...item, completed: false })));
    setSubmittedMessage(null);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleSubmitTask = () => {
    if (completedCount === 0) {
      alert('Por favor, marque pelo menos um item do checklist antes de concluir a tarefa.');
      return;
    }

    const taskData = {
      unitId: currentUnit?.id,
      sectorId: selectedSectorId,
      frequency,
      completedItems: completedCount,
      totalItems: items.length,
      userName: user ? user.name : 'Colaborador Pazotti',
      date: selectedDate,
      beforePhotos: [],
      afterPhotos: [],
      itemsList: items.map((it) => ({
        id: it.id,
        text: it.text,
        completed: it.completed,
        completedBy: it.completedBy,
        completedAtTime: it.completedAtTime,
      })),
    };

    const result = submitCleaningTask(taskData);

    // Efeito de celebração visual
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });

    setSubmittedMessage({
      offline: result.offline,
      task: result.task,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24 md:pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-unit-secondary bg-unit-light px-3 py-1 rounded-full border border-unit-secondary/20">
            {currentUnit?.name} • Rotina de Limpeza
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Checklist e <span className="text-unit-secondary">Auditoria</span>
          </h2>
        </div>

        {/* Seletor Rápido de Setor e Data */}
        <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-unit-secondary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Alerta de confirmação enviada com sucesso */}
      {submittedMessage ? (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 text-center space-y-4 animate-slide-up mb-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-black text-emerald-900">
            Checklist Registrado com Sucesso!
          </h3>
          <p className="text-sm text-emerald-800 max-w-md mx-auto">
            A tarefa do setor <strong>{currentSector.name}</strong> foi marcada como{' '}
            <span className="font-bold underline">Aguardando Aprovação do Gestor</span>. A gerência foi notificada para validar a execução.
          </p>
          {submittedMessage.offline && (
            <div className="bg-amber-100 text-amber-900 text-xs font-bold py-2 px-4 rounded-xl inline-block">
              ⚡ Salvo localmente (Offline). Será sincronizado automaticamente assim que a conexão retornar.
            </div>
          )}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-colors"
            >
              Realizar Novo Checklist
            </button>
          </div>
        </div>
      ) : null}

      {/* Botões de Frequência (Diaria, Semanal, Mensal) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/80 rounded-2xl mb-6">
        {[
          { id: 'diaria', label: 'Diária', desc: 'Rotina de turno' },
          { id: 'semanal', label: 'Semanal', desc: 'Limpeza e vidros' },
          { id: 'mensal', label: 'Mensal', desc: 'Pesada / Exaustores' },
        ].map((tab) => {
          const isActive = frequency === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setFrequency(tab.id);
                setSubmittedMessage(null);
              }}
              className={`py-3 px-3 rounded-xl font-extrabold text-sm transition-all text-center ${
                isActive
                  ? 'bg-white text-unit-primary shadow-md scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[10px] font-normal opacity-75 hidden sm:block">{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Barra de Progresso do Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-700">Progresso do Checklist:</span>
          <span className="text-unit-primary">
            {completedCount} de {items.length} itens executados ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-unit-secondary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Lista de Itens do Checklist */}
      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggleItem}
            user={user}
          />
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 shadow-sm my-6">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base mb-1">
              Nenhuma Rotina de Limpeza Cadastrada
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              A unidade <strong>{currentUnit?.name}</strong> está zerada e não possui itens vinculados na planilha (aba <em>Checklist Limpeza</em>) para o setor <strong>{currentSector?.name}</strong> na periodicidade <strong>{frequency}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Adicionar Item Customizado */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item customizado para o setor (ex: higienizar carrinho de transporte)..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-unit-secondary text-sm font-medium"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>

      {/* Botões Finais de Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar Marcações</span>
        </button>

        <button
          type="button"
          onClick={handleSubmitTask}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-unit-primary text-white font-extrabold text-sm shadow-xl hover:bg-unit-secondary hover:shadow-2xl transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Concluir Tarefa e Enviar para Aprovação ({completedCount}/{items.length})</span>
        </button>
      </div>
    </div>
  );
}
