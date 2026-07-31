import React from 'react';
import { Home, Grid, ClipboardCheck, Wrench, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, user } = useApp();
  const { cleaningTasks, maintenanceTickets } = useData();

  // Tarefas pendentes de aprovação pelo gestor
  const pendingCount = cleaningTasks.filter((t) => t.status === 'pending').length;
  const urgentCount = maintenanceTickets.filter((t) => t.priority === 'Urgência' && t.status !== 'Concluído').length;

  const navItems = [
    {
      id: 'home',
      label: 'Unidades',
      icon: Home,
    },
    {
      id: 'sectors',
      label: 'Setores',
      icon: Grid,
    },
    {
      id: 'cleaning',
      label: 'Limpeza',
      icon: ClipboardCheck,
    },
    {
      id: 'maintenance',
      label: 'Manutenção',
      icon: Wrench,
      badge: urgentCount > 0 ? urgentCount : 0,
      badgeColor: 'bg-red-600',
    },
    ...(user?.role === 'Gestor'
      ? [
          {
            id: 'manager',
            label: 'Gestão',
            icon: BarChart3,
            badge: pendingCount > 0 ? pendingCount : 0,
            badgeColor: 'bg-amber-500',
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
                isActive
                  ? 'text-unit-primary font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <IconComponent className={`w-6 h-6 ${isActive ? 'text-unit-secondary' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>

              {item.badge > 0 && (
                <span
                  className={`absolute top-0.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white rounded-full flex items-center justify-center shadow-sm ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
