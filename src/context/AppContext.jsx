import React, { createContext, useContext, useState, useEffect } from 'react';
import { UNITS_DATA } from '../data/unitsData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Unidade inicial: padrão Matriz se não houver no localStorage
  const [currentUnit, setCurrentUnitState] = useState(() => {
    const saved = localStorage.getItem('pazotti_unit_id');
    return UNITS_DATA.find((u) => u.id === saved) || UNITS_DATA[0];
  });

  // Usuário atual (Funcionário ou Gestor)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pazotti_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Sem usuário logado por padrão para exibir a Tela Inicial de Login
    return null;
  });

  // Estado de navegação e setores selecionados
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sectors' | 'cleaning' | 'maintenance' | 'manager'
  const [selectedSectorId, setSelectedSectorId] = useState('escritorios');
  const [selectedTaskType, setSelectedTaskType] = useState('limpeza'); // 'limpeza' | 'manutencao'

  // Ao mudar de unidade, aplicar data-unit no HTML/CSS raiz
  useEffect(() => {
    if (currentUnit) {
      document.documentElement.setAttribute('data-unit', currentUnit.theme);
      localStorage.setItem('pazotti_unit_id', currentUnit.id);
    }
  }, [currentUnit]);

  // Salvar usuário
  useEffect(() => {
    if (user) {
      localStorage.setItem('pazotti_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pazotti_user');
    }
  }, [user]);

  const selectUnit = (unit) => {
    setCurrentUnitState(unit);
    // Se o usuário estiver vinculado a outra unidade, atualiza a dele também
    if (user && user.unitId !== unit.id) {
      setUser((prev) => ({ ...prev, unitId: unit.id }));
    }
  };

  const login = (name, role, pin, vinculo = '') => {
    const newUser = {
      name,
      role,
      unitId: currentUnit.id,
      pin,
      vinculo: vinculo || ''
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const navigateToSector = (sectorId, taskType = 'limpeza') => {
    setSelectedSectorId(sectorId);
    setSelectedTaskType(taskType);
    setActiveTab(taskType === 'limpeza' ? 'cleaning' : 'maintenance');
  };

  return (
    <AppContext.Provider
      value={{
        currentUnit,
        selectUnit,
        user,
        login,
        logout,
        activeTab,
        setActiveTab,
        selectedSectorId,
        setSelectedSectorId,
        selectedTaskType,
        setSelectedTaskType,
        navigateToSector,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
