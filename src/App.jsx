import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import OfflineBadge from './components/common/OfflineBadge';
import LoginModal from './components/auth/LoginModal';
import UnitSelector from './components/units/UnitSelector';
import SectorGrid from './components/sectors/SectorGrid';
import CleaningFlow from './components/cleaning/CleaningFlow';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import ManagerDashboard from './components/manager/ManagerDashboard';
import InitialLoginScreen from './components/auth/InitialLoginScreen';

function MainApp() {
  const { user, activeTab, setActiveTab } = useApp();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Se não houver nenhum usuário logado, exibe a Tela Inicial de Login em tela cheia
  if (!user) {
    return <InitialLoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <UnitSelector
            onSelectAndNavigate={() => {
              setActiveTab('sectors');
            }}
          />
        );
      case 'sectors':
        return <SectorGrid />;
      case 'cleaning':
        return <CleaningFlow />;
      case 'maintenance':
        return <MaintenanceForm />;
      case 'manager':
        if (user?.role !== 'Gestor') {
          return (
            <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border-2 border-slate-200 text-center shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                🔒
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Acesso Exclusivo à Gestão</h3>
              <p className="text-sm text-slate-600 mt-2">
                Seu usuário <strong>({user?.name})</strong> possui o cargo <strong>Colaborador Comum</strong>. A área de gestão (auditorias, cadastros e aprovações) é restrita ao cargo <strong>GESTOR</strong>.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="mt-6 px-6 py-2.5 rounded-xl bg-unit-primary text-white font-bold text-sm shadow-md hover:bg-unit-secondary transition-all"
              >
                Entrar com Perfil Gestor
              </button>
            </div>
          );
        }
        return <ManagerDashboard onOpenLogin={() => setLoginModalOpen(true)} />;
      default:
        return (
          <UnitSelector
            onSelectAndNavigate={() => {
              setActiveTab('sectors');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 transition-colors duration-300 relative overflow-hidden">
      {/* Marca d'água de background do portal */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.07] overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}logo-pazotti-analises.jpg`}
          alt="Marca d'água Pazotti Análises de Vendas"
          className="w-full max-w-4xl object-contain filter"
        />
      </div>

      {/* Cabeçalho de Navegação e Status */}
      <div className="relative z-10">
        <Navbar
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenUnitSelector={() => setActiveTab('home')}
        />
      </div>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 relative z-10 pb-20 sm:pb-8">
        {renderContent()}
      </main>

      {/* Rodapé Oficial com Destaque: Desenvolvido pelo Setor de Análises de Vendas */}
      <footer className="relative z-10 py-5 px-4 border-t border-slate-200/80 bg-white/90 backdrop-blur-md text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-400/40 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black tracking-wide bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent uppercase">
              ⚡ Desenvolvido pelo Setor de Análises de Vendas
            </span>
          </div>
          <span className="hidden sm:inline text-cyan-500 font-bold">•</span>
          <span className="text-xs font-semibold text-cyan-200/90 italic">
            "Porque excelência também se compartilha."
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-medium mt-1.5">
          © Grupo Pazotti • Distribuindo Qualidade & Food Service
        </div>
      </footer>

      {/* Barra de Navegação Inferior (Mobile-first) */}
      <BottomNav />

      {/* Banner Offline / Sincronização */}
      <OfflineBadge />

      {/* Modal de Autenticação / Troca de PIN e Perfil */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AppProvider>
  );
}
