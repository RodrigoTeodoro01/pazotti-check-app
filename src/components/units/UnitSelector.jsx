import React from 'react';
import {
  Building2,
  Store,
  Snowflake,
  UtensilsCrossed,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';
import { UNITS_DATA } from '../../data/unitsData';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';

export default function UnitSelector({ onSelectAndNavigate }) {
  const { currentUnit, selectUnit, user } = useApp();
  const { getUnitStatistics } = useData();

  const renderIcon = (iconName, className) => {
    switch (iconName) {
      case 'Building2': return <Building2 className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Snowflake': return <Snowflake className={className} />;
      case 'UtensilsCrossed': return <UtensilsCrossed className={className} />;
      case 'Truck': return <Truck className={className} />;
      default: return <Building2 className={className} />;
    }
  };

  const getCardThemeClasses = (theme, isSelected) => {
    switch (theme) {
      case 'matriz':
        return isSelected
          ? 'bg-blue-900 text-white border-blue-600 shadow-xl shadow-blue-900/20 ring-4 ring-blue-400/30'
          : 'bg-white hover:bg-blue-50/70 border-slate-200/80 hover:border-blue-300 text-slate-800';
      case 'filial':
        return isSelected
          ? 'bg-red-900 text-white border-red-600 shadow-xl shadow-red-900/20 ring-4 ring-red-400/30'
          : 'bg-white hover:bg-red-50/70 border-slate-200/80 hover:border-red-300 text-slate-800';
      case 'frios':
        return isSelected
          ? 'bg-emerald-900 text-white border-emerald-600 shadow-xl shadow-emerald-900/20 ring-4 ring-emerald-400/30'
          : 'bg-white hover:bg-emerald-50/70 border-slate-200/80 hover:border-emerald-300 text-slate-800';
      case 'food':
        return isSelected
          ? 'bg-amber-800 text-white border-amber-500 shadow-xl shadow-amber-900/20 ring-4 ring-amber-400/30'
          : 'bg-white hover:bg-amber-50/70 border-slate-200/80 hover:border-amber-300 text-slate-800';
      case 'triangulo':
        return isSelected
          ? 'bg-violet-900 text-white border-violet-600 shadow-xl shadow-violet-900/20 ring-4 ring-violet-400/30'
          : 'bg-white hover:bg-violet-50/70 border-slate-200/80 hover:border-violet-300 text-slate-800';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getBadgeThemeClasses = (theme, isSelected) => {
    if (isSelected) return 'bg-white/20 text-white border-white/20';
    switch (theme) {
      case 'matriz': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'filial': return 'bg-red-100 text-red-900 border-red-200';
      case 'frios': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'food': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'triangulo': return 'bg-violet-100 text-violet-900 border-violet-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getAccentColor = (theme) => {
    switch (theme) {
      case 'matriz': return '#3B82F6';
      case 'filial': return '#EF4444';
      case 'frios': return '#10B981';
      case 'food': return '#F59E0B';
      case 'triangulo': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-24 md:pb-12">
      {/* Cabeçalho explicativo */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-unit-light text-unit-primary text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-unit-primary/10">
          <Sparkles className="w-4 h-4" />
          <span>Rede Multi-Unidades Pazotti</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Selecione a <span className="text-unit-secondary">Unidade</span> de Operação
        </h2>
        <p className="text-slate-600 text-sm md:text-base mt-2">
          Cada unidade opera com sua própria identidade cromática oficial e relatórios de auditoria e conformidade integrados.
        </p>
      </div>

      {/* Banner de Status de Acesso (Vínculo de Unidade vs Gestor Global) */}
      {user && (
        <div className="max-w-2xl mx-auto mb-8">
          {(!user.vinculo || ['TODAS', 'ALL', 'GESTOR'].includes(user.vinculo.toUpperCase())) ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
                👑
              </div>
              <div>
                <span className="font-extrabold text-amber-950 uppercase">Acesso Global • Gestor Geral</span>
                <p className="mt-0.5 opacity-90">
                  Seu perfil <strong>{user.name}</strong> tem permissão liberada em <strong>TODAS</strong> as 5 unidades do Grupo Pazotti.
                </p>
              </div>
            </div>
          ) : user.role === 'Gestor' ? (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 text-xs text-blue-900 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                🛡️
              </div>
              <div>
                <span className="font-extrabold text-blue-950 uppercase">Gestor de Unidade • {user.vinculo}</span>
                <p className="mt-0.5 opacity-90">
                  Seu perfil <strong>{user.name}</strong> é <strong>GESTOR</strong> com atuação exclusiva na unidade <strong>{user.vinculo}</strong>. Outras unidades são restritas.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 text-xs text-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 font-bold">
                🔒
              </div>
              <div>
                <span className="font-extrabold text-slate-900 uppercase">Colaborador Vinculado • {user.vinculo}</span>
                <p className="mt-0.5 opacity-90">
                  Seu perfil <strong>{user.name}</strong> está vinculado à <strong>{user.vinculo}</strong>. Acesso a outras unidades requer perfil de Gestor Geral.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grade de Cards de Unidade (5 Unidades) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UNITS_DATA.map((unit) => {
          const isSelected = currentUnit?.id === unit.id;
          const stats = getUnitStatistics(unit.id);
          const accentColor = getAccentColor(unit.theme);

          const isLinkedUnit =
            !user ||
            !user.vinculo ||
            ['TODAS', 'ALL', 'GESTOR'].includes(user.vinculo.toUpperCase()) ||
            unit.name.toLowerCase().includes(user.vinculo.toLowerCase()) ||
            user.vinculo.toLowerCase().includes(unit.name.toLowerCase());

          return (
            <div
              key={unit.id}
              onClick={() => {
                if (!isLinkedUnit) {
                  alert(
                    `🔒 ACESSO RESTRITO À UNIDADE\n\nSeu usuário (${user?.name}) está vinculado exclusivamente à unidade:\n"${user?.vinculo}".\n\nPara acessar "${unit.name}", entre com um usuário que tenha vínculo em "TODAS".`
                  );
                  return;
                }
                selectUnit(unit);
                if (onSelectAndNavigate) onSelectAndNavigate(unit);
              }}
              style={{
                borderColor: isSelected ? accentColor : undefined,
                opacity: !isLinkedUnit ? 0.75 : 1,
              }}
              className={`group relative rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${getCardThemeClasses(
                unit.theme,
                isSelected
              )}`}
            >
              {/* Círculo decorativo de fundo */}
              <div
                style={{ backgroundColor: accentColor }}
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 group-hover:scale-125 transition-transform pointer-events-none"
              />

              <div>
                {/* Ícone e Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${accentColor}1A`,
                      color: isSelected ? '#FFFFFF' : accentColor,
                    }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                  >
                    {renderIcon(unit.iconName, 'w-7 h-7')}
                  </div>

                  {!isLinkedUnit && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span>Restrito</span>
                    </span>
                  )}
                </div>

                {/* Nome e subtítulo */}
                <h3 className="text-xl font-extrabold tracking-tight mb-1">
                  {unit.name}
                </h3>
                <p
                  className={`text-xs leading-relaxed mb-6 ${isSelected ? 'text-white/90' : 'text-slate-500'
                    }`}
                >
                  {unit.subtitle}
                </p>

                {/* Mini indicadores gerenciais */}
                <div
                  className={`grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl text-center text-xs border ${isSelected
                      ? 'bg-black/20 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                >
                  <div>
                    <div className="font-extrabold text-sm">{stats.totalCleaning}</div>
                    <div className="text-[10px] opacity-80">Limpezas</div>
                  </div>
                  <div className="border-x border-current/10">
                    <div className="font-extrabold text-sm">{stats.complianceRate}%</div>
                    <div className="text-[10px] opacity-80">Conform.</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">{stats.openMaintenance}</div>
                    <div className="text-[10px] opacity-80">Manut.</div>
                  </div>
                </div>
              </div>

              {/* Botão Inferior do Card */}
              <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Unidade Ativa</span>
                    </>
                  ) : (
                    <span className="opacity-75">Clique para selecionar</span>
                  )}
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSelected
                      ? 'bg-white text-slate-900 translate-x-1 shadow-md'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Principal de Prosseguir para a Unidade Selecionada */}
      <div className="mt-12 text-center">
        <button
          onClick={() => {
            if (onSelectAndNavigate) onSelectAndNavigate(currentUnit);
          }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-unit-primary text-white font-extrabold text-base shadow-xl hover:bg-unit-secondary hover:shadow-2xl hover:-translate-y-0.5 transition-all"
        >
          <span>Acessar Setores e Tarefas de {currentUnit?.name}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
