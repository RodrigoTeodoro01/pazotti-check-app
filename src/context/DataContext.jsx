import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateMaintenanceEmail, generateApprovalEmail } from '../utils/emailSimulator';
import { UNITS_DATA } from '../data/unitsData';
import { SECTORS_DATA } from '../data/sectorsData';
import { 
  sendCleaningToGoogleSheets, 
  sendMaintenanceToGoogleSheets, 
  sendMaintenanceStatusUpdateToGoogleSheets,
  fetchHistoryFromGoogleSheets
} from '../utils/googleSheetsIntegration';

const DataContext = createContext();

// Dados iniciais (começam vazios para respeitar a planilha zerada)
const INITIAL_CLEANING_TASKS = [];
const INITIAL_MAINTENANCE_TICKETS = [];

export function DataProvider({ children }) {
  const [cleaningTasks, setCleaningTasks] = useState(() => {
    const saved = localStorage.getItem('pazotti_cleaning_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState(() => {
    const saved = localStorage.getItem('pazotti_maint_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('pazotti_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [emailLogs, setEmailLogs] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitorar rede
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Salvar no local storage ao mudar
  useEffect(() => {
    localStorage.setItem('pazotti_cleaning_tasks', JSON.stringify(cleaningTasks));
  }, [cleaningTasks]);

  useEffect(() => {
    localStorage.setItem('pazotti_maint_tickets', JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  useEffect(() => {
    localStorage.setItem('pazotti_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Sincronizar itens offline ao voltar para online
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;

    let newTasks = [...cleaningTasks];
    let newTickets = [...maintenanceTickets];

    offlineQueue.forEach((item) => {
      if (item.type === 'cleaning') {
        newTasks = [item.data, ...newTasks];
      } else if (item.type === 'maintenance') {
        newTickets = [item.data, ...newTickets];
      }
    });

    setCleaningTasks(newTasks);
    setMaintenanceTickets(newTickets);
    setOfflineQueue([]);
  };

  const resolveNames = (unitId, sectorId) => {
    const uName = UNITS_DATA.find((u) => u.id === unitId)?.name || unitId;
    const sName = SECTORS_DATA.find((s) => s.id === sectorId)?.name || sectorId;
    return { uName, sName };
  };

  const submitCleaningTask = (taskData) => {
    const newTask = {
      id: `clean-${Date.now()}`,
      ...taskData,
      completedAt: new Date().toISOString(),
      status: 'pending',
    };

    const { uName, sName } = resolveNames(taskData.unitId, taskData.sectorId);
    sendCleaningToGoogleSheets({
      unitName: uName,
      sectorName: sName,
      frequency: taskData.frequency,
      userName: taskData.userName,
      completedItems: taskData.completedItems,
      totalItems: taskData.totalItems,
      status: 'Aguardando aprovação',
      comment: 'Checklist executado',
    });

    if (!isOnline) {
      setOfflineQueue((prev) => [{ type: 'cleaning', data: newTask }, ...prev]);
      return { offline: true, task: newTask };
    }

    setCleaningTasks((prev) => [newTask, ...prev]);
    return { offline: false, task: newTask };
  };

  const approveCleaningTask = (taskId, unitName, sectorName) => {
    setCleaningTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: 'approved', rejectReason: '' };
          const email = generateApprovalEmail({
            task: updated,
            unitName,
            sectorName,
            status: 'approved',
          });
          setEmailLogs((logs) => [email, ...logs]);
          const { uName, sName } = resolveNames(t.unitId, t.sectorId);
          sendCleaningToGoogleSheets({
            unitName: unitName || uName,
            sectorName: sectorName || sName,
            frequency: t.frequency,
            userName: t.userName,
            completedItems: t.completedItems,
            totalItems: t.totalItems,
            status: 'Aprovado',
            comment: 'Auditado e Aprovado pelo Gestor',
          });
          return updated;
        }
        return t;
      })
    );
  };

  const rejectCleaningTask = (taskId, rejectReason, unitName, sectorName) => {
    setCleaningTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: 'rejected', rejectReason };
          const email = generateApprovalEmail({
            task: updated,
            unitName,
            sectorName,
            status: 'rejected',
            rejectReason,
          });
          setEmailLogs((logs) => [email, ...logs]);
          const { uName, sName } = resolveNames(t.unitId, t.sectorId);
          sendCleaningToGoogleSheets({
            unitName: unitName || uName,
            sectorName: sectorName || sName,
            frequency: t.frequency,
            userName: t.userName,
            completedItems: t.completedItems,
            totalItems: t.totalItems,
            status: 'Reprovado',
            comment: rejectReason,
          });
          return updated;
        }
        return t;
      })
    );
  };

  const submitMaintenanceTicket = (ticketData, unitName, sectorName) => {
    const newTicket = {
      id: `maint-${Date.now()}`,
      ...ticketData,
      status: 'Aberto',
      createdAt: new Date().toISOString(),
    };

    // Gera o log de e-mail automático
    const email = generateMaintenanceEmail({
      ticket: newTicket,
      unitName,
      sectorName,
    });
    setEmailLogs((logs) => [email, ...logs]);

    const { uName, sName } = resolveNames(ticketData.unitId, ticketData.sectorId);
    sendMaintenanceToGoogleSheets({
      unitName: unitName || uName,
      sectorName: sectorName || sName,
      priority: ticketData.priority,
      authorName: ticketData.authorName,
      description: ticketData.description,
      comments: ticketData.comments,
      status: 'Aberto',
    });

    if (!isOnline) {
      setOfflineQueue((prev) => [{ type: 'maintenance', data: newTicket }, ...prev]);
      return { offline: true, ticket: newTicket, email };
    }

    setMaintenanceTickets((prev) => [newTicket, ...prev]);
    return { offline: false, ticket: newTicket, email };
  };

  const updateMaintenanceStatus = (ticketId, newStatus) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = { ...t, status: newStatus };
          const { uName, sName } = resolveNames(t.unitId, t.sectorId);
          sendMaintenanceStatusUpdateToGoogleSheets({
            ticketId: t.id,
            newStatus,
            unitName: uName,
            sectorName: sName,
            description: t.description,
            priority: t.priority
          });
          return updated;
        }
        return t;
      })
    );
  };

  const getUnitStatistics = (unitId) => {
    const unitTasks = cleaningTasks.filter((t) => t.unitId === unitId);
    const unitTickets = maintenanceTickets.filter((t) => t.unitId === unitId);

    const totalCleaning = unitTasks.length;
    const approvedCleaning = unitTasks.filter((t) => t.status === 'approved').length;
    const pendingCleaning = unitTasks.filter((t) => t.status === 'pending').length;
    const rejectedCleaning = unitTasks.filter((t) => t.status === 'rejected').length;

    const openMaintenance = unitTickets.filter((t) => t.status === 'Aberto').length;
    const inProgressMaintenance = unitTickets.filter((t) => t.status === 'Em andamento').length;
    const urgentMaintenance = unitTickets.filter((t) => t.priority === 'Urgência' && t.status !== 'Concluído').length;

    const complianceRate = totalCleaning > 0 ? Math.round((approvedCleaning / totalCleaning) * 100) : 100;

    return {
      totalCleaning,
      approvedCleaning,
      pendingCleaning,
      rejectedCleaning,
      complianceRate,
      openMaintenance,
      inProgressMaintenance,
      urgentMaintenance,
    };
  };

  const clearAllLocalHistory = () => {
    setCleaningTasks([]);
    setMaintenanceTickets([]);
    setEmailLogs([]);
    setOfflineQueue([]);
    localStorage.removeItem('pazotti_cleaning_tasks');
    localStorage.removeItem('pazotti_maint_tickets');
    localStorage.removeItem('pazotti_offline_queue');
  };

  const syncHistoryFromGoogleSheets = async () => {
    const res = await fetchHistoryFromGoogleSheets();
    if (res.success) {
      setCleaningTasks(res.cleaningTasks);
      setMaintenanceTickets(res.maintenanceTickets);
      localStorage.setItem('pazotti_cleaning_tasks', JSON.stringify(res.cleaningTasks));
      localStorage.setItem('pazotti_maint_tickets', JSON.stringify(res.maintenanceTickets));
      return { 
        success: true, 
        countCleaning: res.cleaningTasks.length, 
        countMaintenance: res.maintenanceTickets.length 
      };
    }
    return { success: false };
  };

  return (
    <DataContext.Provider
      value={{
        cleaningTasks,
        maintenanceTickets,
        offlineQueue,
        isOnline,
        emailLogs,
        submitCleaningTask,
        approveCleaningTask,
        rejectCleaningTask,
        submitMaintenanceTicket,
        updateMaintenanceStatus,
        syncOfflineQueue,
        getUnitStatistics,
        clearAllLocalHistory,
        syncHistoryFromGoogleSheets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
