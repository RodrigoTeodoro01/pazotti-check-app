import React, { useState, useEffect } from 'react';
import { UserCircle, ShieldCheck, KeyRound, X, Check, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchUsersFromGoogleSheets, getCachedSheetUsers } from '../../utils/googleSheetsIntegration';

export default function LoginModal({ isOpen, onClose }) {
  const { user, login, logout, currentUnit } = useApp();
  const [name, setName] = useState(user?.name || 'Carlos Rodrigo');
  const [role, setRole] = useState(user?.role || 'Funcionário');
  const [pin, setPin] = useState(user?.pin || '1234');
  const [error, setError] = useState('');
  const [syncingUsers, setSyncingUsers] = useState(false);
  const [sheetUsersCount, setSheetUsersCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const cached = getCachedSheetUsers();
      setSheetUsersCount(cached.length);
      setSyncingUsers(true);
      fetchUsersFromGoogleSheets().then((res) => {
        setSyncingUsers(false);
        if (res.users) setSheetUsersCount(res.users.length);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, digite seu nome ou login.');
      return;
    }

    if (!pin) {
      setError('Por favor, digite sua senha ou PIN.');
      return;
    }

    // Verifica primeiro se coincide com um usuário da aba "Usuarios" no Google Sheets
    const sheetUsers = getCachedSheetUsers();
    const matchedUser = sheetUsers.find(
      (u) => 
        (u.login.toLowerCase() === name.trim().toLowerCase() || u.login.toLowerCase().includes(name.trim().toLowerCase())) &&
        String(u.senha).trim() === String(pin).trim()
    );

    if (matchedUser) {
      const vinculoStr = matchedUser.vinculo || matchedUser.unidade || '';
      login(matchedUser.login, matchedUser.perfil || 'Funcionário', pin, vinculoStr);
      onClose();
      return;
    }

    // Fallback para PIN padrão de teste (8888 Gestor / 1234 Funcionário)
    login(name, role, pin);
    onClose();
  };

  const setDemoUser = (demoRole) => {
    if (demoRole === 'Gestor') {
      setName('Ricardo Pazotti (Gestor)');
      setRole('Gestor');
      setPin('8888');
      login('Ricardo Pazotti (Gestor)', 'Gestor', '8888');
    } else {
      setName('Carlos Rodrigo (Funcionário)');
      setRole('Funcionário');
      setPin('1234');
      login('Carlos Rodrigo (Funcionário)', 'Funcionário', '1234');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="bg-unit-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-unit-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Identificação de Perfil</h3>
              <p className="text-xs opacity-90">{currentUnit?.name || 'Grupo Pazotti'}</p>
            </div>
          </div>
        </div>

        {/* Corpo do formulário */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Badge de Integração com Google Sheets (Usuários) */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span>📊</span>
              <span>
                {syncingUsers
                  ? 'Sincronizando usuários da planilha...'
                  : `${sheetUsersCount} usuário(s) da aba 'Usuarios' vinculados.`}
              </span>
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
              Google Drive
            </span>
          </div>

          {/* Alerta de Modo de Teste Rápido */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
            <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-unit-secondary" />
              <span>Troca Rápida de Perfil (Modo Demonstração):</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('Funcionário')}
                className={`py-2 px-3 rounded-xl text-center font-bold border transition-all ${
                  role === 'Funcionário'
                    ? 'bg-unit-light text-unit-primary border-unit-secondary'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                👷 Funcionário (PIN 1234)
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('Gestor')}
                className={`py-2 px-3 rounded-xl text-center font-bold border transition-all ${
                  role === 'Gestor'
                    ? 'bg-amber-100 text-amber-900 border-amber-500'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                👑 Gestor (PIN 8888)
              </button>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome do Colaborador / Gestor
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Rodrigo"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-unit-secondary text-sm font-medium"
            />
          </div>

          {/* Seletor Funcionário vs Gestor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Acesso (Perfil)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('Funcionário');
                  setPin('1234');
                }}
                className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  role === 'Funcionário'
                    ? 'bg-unit-primary text-white border-unit-primary shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>👷 Funcionário</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('Gestor');
                  setPin('8888');
                }}
                className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  role === 'Gestor'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>👑 Gestor</span>
              </button>
            </div>
          </div>

          {/* PIN numérico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              PIN de Segurança (4 dígitos)
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-unit-secondary text-lg font-bold tracking-widest"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dica: Use <strong>1234</strong> para Funcionário ou <strong>8888</strong> para Gestor.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            {user && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                🚪 Sair do Sistema
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-extrabold text-sm bg-unit-primary text-white hover:bg-unit-secondary shadow-lg transition-all flex items-center gap-2"
              >
                <span>Confirmar Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
