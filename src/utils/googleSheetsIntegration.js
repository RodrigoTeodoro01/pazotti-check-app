import { SECTORS_DATA } from '../data/sectorsData';
import { DEFAULT_CHECKLISTS } from '../data/defaultChecklists';

const STORAGE_KEY_WEBHOOK = 'pazotti_google_sheets_webhook_url';
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzbOqEuFpX9rIfhjzQdIAuGaSakfJR2hZ4dRShCcHlIKlWnvHFPS6eilTo297tMw77tLA/exec';

/**
 * Obtém a URL do Webhook configurada no localStorage ou usa a URL padrão do Grupo Pazotti
 */
export function getGoogleSheetsWebhookUrl() {
  const saved = localStorage.getItem(STORAGE_KEY_WEBHOOK);
  // Se a URL salva no localStorage for a versão anterior, migra automaticamente para a nova URL
  if (!saved || saved.includes('AKfycbyqM8qhQDTjyVAahv6geowV3FKuxdiglm8lJ4lBZ1I7_EGoGiD6ivBirL_nNBsst0tG7g')) {
    return DEFAULT_WEBHOOK_URL;
  }
  return saved;
}

/**
 * Salva a URL do Webhook no localStorage
 */
export function setGoogleSheetsWebhookUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_WEBHOOK);
  } else {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
  }
}

/**
 * Envia um registro de Checklist de Limpeza para a planilha do Google Sheets
 */
export async function sendCleaningToGoogleSheets({
  unitName,
  sectorName,
  frequency,
  userName,
  completedItems,
  totalItems,
  status,
  comment = '',
}) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) {
    console.info('[Google Sheets] Webhook URL não configurada. Envio ignorado.');
    return { success: false, reason: 'URL não configurada' };
  }

  const payload = {
    action: 'ADD_CLEANING_ROW',
    data: {
      dataHora: new Date().toLocaleString('pt-BR'),
      unidade: unitName || 'Não informado',
      setor: sectorName || 'Não informado',
      periodicidade: frequency || 'Diária',
      colaborador: userName || 'Colaborador',
      itensConcluidos: `${completedItems}/${totalItems}`,
      conformidade: totalItems > 0 ? `${Math.round((completedItems / totalItems) * 100)}%` : '100%',
      status: status || 'Aguardando aprovação',
      comentarioGestor: comment || '—',
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Evita requisições pre-flight OPTIONS CORS em Apps Script
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ status: 'success' }));
    console.log('[Google Sheets] Registro de Limpeza enviado com sucesso:', result);
    return { success: true, result };
  } catch (error) {
    console.error('[Google Sheets] Erro ao enviar para planilha:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envia um registro de Chamado de Manutenção para a planilha do Google Sheets
 */
export async function sendMaintenanceToGoogleSheets({
  unitName,
  sectorName,
  priority,
  authorName,
  description,
  comments,
  status,
}) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) {
    console.info('[Google Sheets] Webhook URL não configurada. Envio ignorado.');
    return { success: false, reason: 'URL não configurada' };
  }

  const payload = {
    action: 'ADD_MAINTENANCE_ROW',
    data: {
      dataHora: new Date().toLocaleString('pt-BR'),
      unidade: unitName || 'Não informado',
      setor: sectorName || 'Não informado',
      prioridade: priority || 'Corretiva',
      solicitante: authorName || 'Colaborador',
      descricao: description || '—',
      observacoes: comments || '—',
      status: status || 'Aberto',
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ status: 'success' }));
    console.log('[Google Sheets] Registro de Manutenção enviado com sucesso:', result);
    return { success: true, result };
  } catch (error) {
    console.error('[Google Sheets] Erro ao enviar manutenção para planilha:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envia um registro de teste para validar a conexão
 */
export async function testGoogleSheetsConnection(testUrl) {
  const url = testUrl || getGoogleSheetsWebhookUrl();
  if (!url) {
    return { success: false, error: 'Por favor, insira uma URL do Apps Script.' };
  }

  const payload = {
    action: 'TEST_CONNECTION',
    data: {
      dataHora: new Date().toLocaleString('pt-BR'),
      mensagem: 'Teste de Integração - Pazotti Check conectado com sucesso!',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ status: 'success' }));
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: `Erro de conexão: ${error.message}. Verifique se a implantação do Apps Script foi marcada como 'Qualquer pessoa'.`,
    };
  }
}

/**
 * Envia atualização de status de manutenção e dispara envio de e-mail pela planilha (aba E-mails)
 */
export async function sendMaintenanceStatusUpdateToGoogleSheets({
  ticketId,
  newStatus,
  unitName,
  sectorName,
  description = '',
  priority = 'Corretiva'
}) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return { success: false };

  const payload = {
    action: 'UPDATE_MAINTENANCE_STATUS',
    data: {
      id: ticketId,
      dataHora: new Date().toLocaleString('pt-BR'),
      unidade: unitName || 'Não informado',
      setor: sectorName || 'Não informado',
      status: newStatus,
      descricao: description,
      prioridade: priority
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ status: 'success' }));
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Busca a lista de usuários (Login, Senha, Perfil, Unidade) da aba 'Usuarios' na planilha
 */
export async function fetchUsersFromGoogleSheets() {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return { success: false, users: [] };

  try {
    // 1. Tenta via GET
    const urlWithParam = `${webhookUrl}?action=GET_USERS`;
    const response = await fetch(urlWithParam);
    const result = await response.json();
    if (result && result.users && Array.isArray(result.users) && result.users.length > 0) {
      localStorage.setItem('pazotti_cached_sheet_users', JSON.stringify(result.users));
      return { success: true, users: result.users };
    }
  } catch (err) {
    console.warn('[Google Sheets] GET_USERS via GET falhou ou vazio, tentando POST...', err);
  }

  // 2. Tenta via POST se GET retornar vazio ou falhar (evita problemas de redirecionamento no Apps Script)
  try {
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'GET_USERS' }),
    });
    const postResult = await postResponse.json();
    if (postResult && postResult.users && Array.isArray(postResult.users)) {
      localStorage.setItem('pazotti_cached_sheet_users', JSON.stringify(postResult.users));
      return { success: true, users: postResult.users };
    }
  } catch (postErr) {
    console.error('[Google Sheets] GET_USERS via POST também falhou:', postErr);
  }

  const cached = localStorage.getItem('pazotti_cached_sheet_users');
  const users = cached ? JSON.parse(cached) : [];
  return { success: false, users, offline: true };
}

/**
 * Obtém usuários em cache no localStorage
 */
export function getCachedSheetUsers() {
  const cached = localStorage.getItem('pazotti_cached_sheet_users');
  return cached ? JSON.parse(cached) : [];
}

/**
 * Busca a lista de checklists (Tipo, Setor, Frequencia, Questao) da aba 'Checklist Limpeza' na planilha
 */
export async function fetchChecklistsFromGoogleSheets() {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return { success: false, checklists: [] };

  try {
    const urlWithParam = `${webhookUrl}?action=GET_CHECKLISTS`;
    const response = await fetch(urlWithParam);
    const result = await response.json();
    if (result && result.checklists && Array.isArray(result.checklists) && result.checklists.length > 0) {
      localStorage.setItem('pazotti_cached_sheet_checklists', JSON.stringify(result.checklists));
      return { success: true, checklists: result.checklists };
    }
  } catch (err) {
    console.warn('[Google Sheets] GET_CHECKLISTS via GET falhou ou vazio, tentando POST...', err);
  }

  try {
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'GET_CHECKLISTS' }),
    });
    const postResult = await postResponse.json();
    if (postResult && postResult.checklists && Array.isArray(postResult.checklists)) {
      localStorage.setItem('pazotti_cached_sheet_checklists', JSON.stringify(postResult.checklists));
      return { success: true, checklists: postResult.checklists };
    }
  } catch (postErr) {
    console.error('[Google Sheets] GET_CHECKLISTS via POST também falhou:', postErr);
  }

  const cached = localStorage.getItem('pazotti_cached_sheet_checklists');
  const checklists = cached ? JSON.parse(cached) : [];
  return { success: false, checklists, offline: true };
}

/**
 * Obtém checklists em cache no localStorage
 */
export function getCachedSheetChecklists() {
  const cached = localStorage.getItem('pazotti_cached_sheet_checklists');
  return cached ? JSON.parse(cached) : [];
}

/**
 * Verifica se um item do checklist pertence à unidade/Pazotti atual
 */
export function isItemForCurrentUnit(item, currentUnit) {
  if (!item || !currentUnit) return true;
  const pazoRaw = String(item.pazotti || item.unidade || '').trim();
  if (!pazoRaw || ['TODAS', 'ALL', 'GERAL', 'QUALQUER', 'TODOS'].includes(pazoRaw.toUpperCase())) {
    return true;
  }
  const itemPazo = pazoRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const unitName = (currentUnit?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const unitId = (currentUnit?.id || '').toLowerCase().trim();

  // Correspondência explícita por unidade
  if (itemPazo.includes('matriz') && unitId === 'matriz') return true;
  if (itemPazo.includes('filial') && unitId === 'filial') return true;
  if ((itemPazo.includes('frios') || itemPazo.includes('congelados')) && unitId === 'frios') return true;
  if ((itemPazo.includes('food') || itemPazo.includes('lanch')) && unitId === 'food') return true;
  if ((itemPazo.includes('triangulo') || itemPazo.includes('uberl')) && unitId === 'triangulo') return true;

  // Se o item mencionou explicitamente uma unidade e não foi a atual, rejeitar
  if (
    itemPazo.includes('matriz') ||
    itemPazo.includes('filial') ||
    itemPazo.includes('frios') ||
    itemPazo.includes('congelados') ||
    itemPazo.includes('food') ||
    itemPazo.includes('triangulo') ||
    itemPazo.includes('uberl')
  ) {
    return false;
  }

  return unitName.includes(itemPazo) || itemPazo.includes(unitId);
}

/**
 * Retorna os setores (Departamentos) disponíveis de acordo com a coluna Setor na aba Checklist Limpeza
 * vinculados à Pazotti (Unidade) atual selecionada.
 */
export function getAvailableSectorsForUnit(currentUnit) {
  const sheetChecklists = getCachedSheetChecklists();
  if (!sheetChecklists || !Array.isArray(sheetChecklists) || sheetChecklists.length === 0) {
    return SECTORS_DATA;
  }

  const unitItems = sheetChecklists.filter((item) => isItemForCurrentUnit(item, currentUnit));
  if (unitItems.length === 0) {
    return []; // Retorna lista vazia (zerado) para esta unidade caso não constem setores na planilha!
  }

  const uniqueSectorNames = [];
  const seen = new Set();

  unitItems.forEach((item) => {
    const nameClean = String(item.setor || '').trim();
    if (nameClean && !seen.has(nameClean.toLowerCase())) {
      seen.add(nameClean.toLowerCase());
      const matchedDefault = SECTORS_DATA.find(
        (s) => s.name.toLowerCase() === nameClean.toLowerCase() || s.id.toLowerCase() === nameClean.toLowerCase()
      );
      uniqueSectorNames.push({
        id: matchedDefault ? matchedDefault.id : nameClean,
        name: nameClean,
        description: matchedDefault ? matchedDefault.description : `Setor ${nameClean} (${currentUnit?.name || 'Pazotti'})`,
        iconName: matchedDefault ? matchedDefault.iconName : 'Briefcase',
        qrCodeValue: matchedDefault ? matchedDefault.qrCodeValue : `PAZOTTI-QR-${nameClean.toUpperCase().replace(/\s+/g, '-')}`,
      });
    }
  });

  return uniqueSectorNames;
}


/**
 * Retorna a lista de itens concluídos da tarefa para exibição na Fila de Aprovação.
 */
export function getTaskChecklistItems(task) {
  if (task && task.itemsList && Array.isArray(task.itemsList) && task.itemsList.length > 0) {
    return task.itemsList;
  }
  if (!task) return [];

  const freq = String(task.frequency || 'diaria').toLowerCase();
  const sectorId = task.sectorId || 'escritorios';

  const sheetChecklists = getCachedSheetChecklists();
  if (sheetChecklists && Array.isArray(sheetChecklists) && sheetChecklists.length > 0) {
    const matching = sheetChecklists.filter((it) => {
      const s = String(it.setor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sId = String(sectorId).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sMatch = s.includes(sId) || sId.includes(s);

      const f = String(it.frequencia || '').toLowerCase();
      const fMatch =
        (freq === 'diaria' && (f.includes('diar') || f === 'diario' || !f)) ||
        (freq === 'semanal' && f.includes('seman')) ||
        (freq === 'mensal' && f.includes('mensa'));
      return sMatch && fMatch;
    });

    if (matching.length > 0) {
      return matching.map((m, i) => ({
        id: `m-${i}`,
        text: m.questao,
        completed: i < (task.completedItems || matching.length),
      }));
    }
  }

  const defaultList = (DEFAULT_CHECKLISTS[sectorId] && DEFAULT_CHECKLISTS[sectorId][freq]) 
    || DEFAULT_CHECKLISTS.escritorios.diaria;
  return defaultList.map((it, idx) => ({
    ...it,
    completed: idx < (task.completedItems || defaultList.length),
  }));
}

/**
 * Normaliza tarefas de limpeza recebidas do Google Sheets (corrige formato de data DD/MM/YYYY, preserva ID de setores personalizados e traduz status)
 */
function normalizeSheetCleaningTask(task, idx) {
  if (!task) return null;

  // 1. Corrige data DD/MM/YYYY do completedAt / date para YYYY-MM-DD
  let validDate = task.date || '';
  const rawDateStr = String(task.completedAt || task.date || '').trim();
  const mBr = rawDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mBr) {
    const d = ('0' + mBr[1]).slice(-2);
    const mo = ('0' + mBr[2]).slice(-2);
    const yr = mBr[3];
    validDate = `${yr}-${mo}-${d}`;
  } else if (!validDate) {
    validDate = new Date().toISOString().split('T')[0];
  }

  // Corrige inversão de dia e mês (ex: 2026-03-08 vindo de Apps Script em inglês para o dia 03/08/2026)
  const mIso = validDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (mIso) {
    const yr = mIso[1];
    const p1 = parseInt(mIso[2], 10);
    const p2 = parseInt(mIso[3], 10);
    const nowMonth = new Date().getMonth() + 1;
    if (p1 !== nowMonth && p2 === nowMonth) {
      const fixedMo = ('0' + p2).slice(-2);
      const fixedDay = ('0' + p1).slice(-2);
      validDate = `${yr}-${fixedMo}-${fixedDay}`;
    }
  }

  // 2. Garante ID do setor correto para setores personalizados ou padrão da planilha
  let finalSectorId = task.sectorId || 'escritorios';
  const rawSectorName = String(task.sectorName || task.setor || task.sectorId || '').trim();
  if (rawSectorName) {
    const sLow = rawSectorName.toLowerCase();
    const defaultsMap = {
      'escritorios': 'escritorios',
      'escritórios': 'escritorios',
      'escritorio': 'escritorios',
      'escritório': 'escritorios',
      'deposito de produtos': 'deposito-produtos',
      'depósito de produtos': 'deposito-produtos',
      'deposito de improprios': 'deposito-improprios',
      'depósito de impróprios': 'deposito-improprios',
      'deposito merchan': 'deposito-merchan',
      'depósito merchan': 'deposito-merchan',
      'banheiros escritorio': 'banheiros-escritorio',
      'banheiros escritório': 'banheiros-escritorio',
      'banheiros deposito': 'banheiros-deposito',
      'banheiros depósito': 'banheiros-deposito',
      'cozinha': 'cozinha',
      'refeitorio': 'refeitorio',
      'refeitório': 'refeitorio',
    };
    finalSectorId = defaultsMap[sLow] || rawSectorName;
  }

  // 3. Normaliza status ('Aprovado' / 'Reprovado' / 'Aguardando aprovação')
  let st = String(task.status || '').toLowerCase();
  if (st.includes('aprov')) st = 'approved';
  else if (st.includes('reprov')) st = 'rejected';
  else if (st.includes('aguard') || st === 'pending') st = 'pending';

  return {
    ...task,
    id: task.id || `sheet-clean-${idx}`,
    date: validDate,
    sectorId: finalSectorId,
    sectorName: rawSectorName || finalSectorId,
    status: st,
  };
}

/**
 * Deduplica tarefas de limpeza mantendo a versão com o status mais recente (ex: Aprovado sobressai Aguardando aprovação)
 */
function deduplicateCleaningTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  const normalized = tasks
    .map((t, idx) => normalizeSheetCleaningTask(t, idx))
    .filter(Boolean);

  const map = new Map();
  normalized.forEach((t) => {
    const key = `${t.unitId}_${t.sectorId}_${t.frequency}_${t.date}_${t.userName}`;
    const existing = map.get(key);
    if (!existing || t.status === 'approved' || t.status === 'rejected') {
      map.set(key, t);
    }
  });
  return Array.from(map.values());
}

/**
 * Busca o histórico de limpezas e manutenções gravados na planilha do Google Sheets (abas Limpeza_Checklists e Manutencao_Chamados)
 */
export async function fetchHistoryFromGoogleSheets() {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return { success: false, cleaningTasks: [], maintenanceTickets: [] };

  try {
    const response = await fetch(`${webhookUrl}?action=GET_HISTORY`);
    const result = await response.json();
    if (result && result.success) {
      const cleanTasks = deduplicateCleaningTasks(result.cleaningTasks || []);
      return {
        success: true,
        cleaningTasks: cleanTasks,
        maintenanceTickets: result.maintenanceTickets || [],
      };
    }
  } catch (err) {
    console.warn('[Google Sheets] GET_HISTORY via GET falhou, tentando POST...', err);
  }

  try {
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'GET_HISTORY' }),
    });
    const postResult = await postResponse.json();
    if (postResult && postResult.success) {
      const cleanTasks = deduplicateCleaningTasks(postResult.cleaningTasks || []);
      return {
        success: true,
        cleaningTasks: cleanTasks,
        maintenanceTickets: postResult.maintenanceTickets || [],
      };
    }
  } catch (postErr) {
    console.error('[Google Sheets] GET_HISTORY via POST falhou:', postErr);
  }

  return { success: false, cleaningTasks: [], maintenanceTickets: [] };
}


