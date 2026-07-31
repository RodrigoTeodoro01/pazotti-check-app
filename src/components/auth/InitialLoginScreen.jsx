import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNITS_DATA } from '../../data/unitsData';
import { fetchUsersFromGoogleSheets, getCachedSheetUsers } from '../../utils/googleSheetsIntegration';

export default function InitialLoginScreen() {
  const { login, currentUnit, selectUnit } = useApp();
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [syncingUsers, setSyncingUsers] = useState(false);
  const [sheetUsersCount, setSheetUsersCount] = useState(0);
  const [showDemoButtons, setShowDemoButtons] = useState(false);

  useEffect(() => {
    const cached = getCachedSheetUsers();
    setSheetUsersCount(cached.length);
    setSyncingUsers(true);
    fetchUsersFromGoogleSheets().then((res) => {
      setSyncingUsers(false);
      if (res.users) {
        setSheetUsersCount(res.users.length);
      }
    });
  }, []);

  const handleRefreshUsers = async () => {
    setSyncingUsers(true);
    const res = await fetchUsersFromGoogleSheets();
    setSyncingUsers(false);
    if (res.users) {
      setSheetUsersCount(res.users.length);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginInput.trim()) {
      setError('Por favor, digite seu Usuário ou Login.');
      return;
    }

    if (!passwordInput.trim()) {
      setError('Por favor, digite sua Senha ou PIN de Acesso.');
      return;
    }

    // 1. Validar contra a aba "Usuarios" do Google Sheets
    const sheetUsers = getCachedSheetUsers();
    const matchedUser = sheetUsers.find(
      (u) =>
        (u.login.toLowerCase() === loginInput.trim().toLowerCase() ||
         u.login.toLowerCase().includes(loginInput.trim().toLowerCase())) &&
        String(u.senha).trim() === String(passwordInput).trim()
    );

    if (matchedUser) {
      // Ajusta a unidade se constar no perfil ou vínculo do usuário
      const vinculoStr = matchedUser.vinculo || matchedUser.unidade || '';
      const matchedUnit = UNITS_DATA.find(
        (unit) => 
          unit.name.toLowerCase().includes(vinculoStr.toLowerCase()) ||
          vinculoStr.toLowerCase().includes(unit.name.toLowerCase())
      );
      if (matchedUnit) {
        selectUnit(matchedUnit);
      }

      const isGestor =
        (matchedUser.perfil && matchedUser.perfil.toUpperCase().includes('GESTOR')) ||
        (matchedUser.vinculo && matchedUser.vinculo.toUpperCase().includes('GESTOR')) ||
        (matchedUser.login && matchedUser.login.toUpperCase().includes('GESTOR'));

      const roleStr = isGestor ? 'Gestor' : 'Funcionário';

      login(
        matchedUser.login, 
        roleStr, 
        passwordInput,
        vinculoStr
      );
      return;
    }

    // 2. Fallback para senha padrão de teste (8888 -> Gestor, 1234 -> Funcionário)
    if (passwordInput === '8888') {
      login(loginInput, 'Gestor', '8888');
      return;
    }

    if (passwordInput === '1234') {
      login(loginInput, 'Funcionário', '1234');
      return;
    }

    setError('Usuário ou Senha incorretos. Verifique os dados ou cadastre na aba "Usuarios" da planilha.');
  };

  const handleDemoLogin = (roleType) => {
    if (roleType === 'Gestor') {
      login('Ricardo Pazotti (Gestor)', 'Gestor', '8888');
    } else {
      login('Carlos Rodrigo (Funcionário)', 'Funcionário', '1234');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      {/* Marca d'água tecnológica de fundo */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 overflow-hidden">
        <img
          src="/logo-pazotti-analises.jpg"
          alt="Marca d'água Pazotti Análises de Vendas"
          className="w-full max-w-5xl object-contain filter"
        />
      </div>

      {/* Círculos decorativos de fundo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-unit-secondary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-unit-primary/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        {/* Cabeçalho Oficial com Logo Análises de Vendas */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden border-b border-cyan-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-12 -mt-12 pointer-events-none" />
          
          <div className="w-48 sm:w-64 h-32 mx-auto mb-4 overflow-hidden rounded-2xl border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-slate-950 flex items-center justify-center p-2">
            <img 
              src="/logo-pazotti-analises.jpg" 
              alt="Pazotti Time de Análises de Vendas" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Grupo <span className="text-cyan-400">Pazotti</span> • Portal Check
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 font-medium">
            Gestão Inteligente de Checklists, Manutenção e Auditoria
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status de Conexão com Google Sheets */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-800 font-bold shadow-sm">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${syncingUsers ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>
                {syncingUsers
                  ? 'Sincronizando usuários da planilha...'
                  : `${sheetUsersCount} usuário(s) da aba 'Usuarios' conectados.`}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshUsers}
                disabled={syncingUsers}
                title="Sincronizar usuários agora"
                className="p-1 hover:bg-emerald-200/60 rounded-lg text-emerald-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingUsers ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                Online
              </span>
            </div>
          </div>

          {/* Seleção de Unidade Inicial */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-unit-secondary" />
              <span>Unidade de Trabalho Atual:</span>
            </label>
            <select
              value={currentUnit?.id || UNITS_DATA[0].id}
              onChange={(e) => {
                const selected = UNITS_DATA.find((u) => u.id === e.target.value);
                if (selected) selectUnit(selected);
              }}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-unit-primary focus:bg-white transition-all"
            >
              {UNITS_DATA.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  🏢 {unit.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Campo Usuário / Login */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5 text-unit-primary" />
                <span>Usuário / Login</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: rodrigo, ricardo.gestor, carlos..."
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 pl-11 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-unit-primary focus:bg-white transition-all shadow-sm"
                  autoFocus
                />
                <UserCircle className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-unit-primary" />
                <span>Senha / PIN de Acesso</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha cadastrada na planilha"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-unit-primary focus:bg-white transition-all shadow-sm"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro se houver */}
            {error && (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 text-xs text-rose-800 font-bold flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão Principal de Submissão */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-unit-primary hover:bg-unit-secondary text-white font-black text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Atalhos para Teste / Demonstração (Sem Senha da Planilha) */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowDemoButtons(!showDemoButtons)}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-unit-secondary" />
              <span>
                {showDemoButtons
                  ? 'Ocultar acessos rápidos de demonstração ▲'
                  : 'Modo demonstração: Acesso rápido de teste ▼'}
              </span>
            </button>

            {showDemoButtons && (
              <div className="mt-3 grid grid-cols-2 gap-2.5 animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Funcionário')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all text-center flex flex-col items-center gap-1"
                >
                  <span>👷 Colaborador</span>
                  <span className="text-[10px] text-slate-500">PIN 1234</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('Gestor')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all text-center flex flex-col items-center gap-1"
                >
                  <span>👑 Gestor Auditor</span>
                  <span className="text-[10px] text-amber-800">PIN 8888</span>
                </button>
              </div>
            )}
          </div>

          {/* Rodapé Oficial PWA com Destaque Análises de Vendas */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-400/40 shadow-md mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-black tracking-wide bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent uppercase">
                  ⚡ Desenvolvido pelo Setor de Análises de Vendas
                </span>
              </div>
              <span className="hidden sm:inline text-cyan-500 font-bold">•</span>
              <span className="text-[11px] font-semibold text-cyan-200/90 italic">
                "Porque excelência também se compartilha."
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              © Grupo Pazotti • Distribuindo Qualidade & Food Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
