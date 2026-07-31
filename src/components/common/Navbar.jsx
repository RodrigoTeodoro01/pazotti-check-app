import React from 'react';
import { 
  ShieldCheck, 
  Building2, 
  UserCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Home, 
  Grid, 
  ClipboardCheck, 
  Wrench, 
  BarChart3 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';

export default function Navbar({ onOpenLogin, onOpenUnitSelector }) {
  const { currentUnit, user, activeTab, setActiveTab } = useApp();
  const { isOnline, offlineQueue, syncOfflineQueue, cleaningTasks, maintenanceTickets } = useData();

  const pendingCount = cleaningTasks.filter((t) => t.status === 'pending').length;
  const urgentCount = maintenanceTickets.filter((t) => t.priority === 'Urgência' && t.status !== 'Concluído').length;

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-slate-200/80 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Marca Oficial - Pazotti Check */}
        <div 
          onClick={onOpenUnitSelector}
          className="flex items-center gap-3 cursor-pointer group"
          title="Trocar de Unidade Pazotti"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-950 text-white shadow-md group-hover:scale-105 transition-transform overflow-hidden border border-cyan-500/40 shrink-0">
            <img 
              src="/logo-pazotti-analises.jpg" 
              alt="Logotipo Time de Análises de Vendas" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                Pazotti <span className="text-unit-secondary">Check</span>
              </h1>
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-cyan-300 border border-cyan-400/40 shadow-sm hidden sm:inline-block">
                ⚡ Análises de Vendas
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-unit-secondary" />
              <span className="truncate max-w-[150px] sm:max-w-none">{currentUnit?.name || 'Selecione a Unidade'}</span>
            </div>
          </div>
        </div>

        {/* Menu de Navegação Desktop (Visível em Telas Médias e Grandes) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          {[
            { id: 'home', label: 'Unidades', icon: Home },
            { id: 'sectors', label: 'Setores', icon: Grid },
            { id: 'cleaning', label: 'Limpeza', icon: ClipboardCheck },
            { id: 'maintenance', label: 'Manutenção', icon: Wrench, badge: urgentCount, badgeColor: 'bg-red-600' },
            ...(user?.role === 'Gestor'
              ? [{ id: 'manager', label: 'Gestão', icon: BarChart3, badge: pendingCount, badgeColor: 'bg-amber-500' }]
              : []),
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-unit-primary shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status de Rede e Perfil de Usuário */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador Offline / Online PWA */}
          <div 
            onClick={() => {
              if (offlineQueue.length > 0) syncOfflineQueue();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
              isOnline 
                ? offlineQueue.length > 0 
                  ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
            }`}
            title={isOnline ? 'Conexão normal via Wi-Fi/4G' : 'Modo Offline Ativo. Suas tarefas estão sendo salvas localmente.'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
                {offlineQueue.length > 0 && (
                  <span className="ml-1 bg-amber-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {offlineQueue.length} fila
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline ({offlineQueue.length})</span>
              </>
            )}
          </div>

          {/* Trocar de Unidade (Botão Rápido) */}
          <button
            onClick={onOpenUnitSelector}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-unit-primary bg-unit-light hover:bg-unit-secondary hover:text-white transition-colors border border-unit-primary/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Unidade</span>
          </button>

          {/* Botão de Perfil (Funcionário vs Gestor) */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-unit-primary text-white hover:bg-unit-secondary shadow-sm transition-all"
            title="Clique para Entrar com Login e Senha da Planilha ou Trocar de Perfil"
          >
            <UserCircle className="w-5 h-5 text-white shrink-0" />
            <div className="text-left">
              <div className="text-xs font-black leading-tight flex items-center gap-1">
                <span>Entrar / Login</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-normal hidden sm:inline">
                  {user ? `(${user.role})` : ''}
                </span>
              </div>
              <div className="text-[10px] font-medium opacity-90 truncate max-w-[120px] hidden sm:block">
                {user ? user.name : 'Clique para logar'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
