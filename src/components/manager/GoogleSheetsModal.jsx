import React, { useState, useEffect } from 'react';
import { Table, Link2, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, Sparkles, Code2 } from 'lucide-react';
import { 
  getGoogleSheetsWebhookUrl, 
  setGoogleSheetsWebhookUrl, 
  testGoogleSheetsConnection 
} from '../../utils/googleSheetsIntegration';

const APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var d = payload.data;
    
    if (action === 'ADD_CLEANING_ROW') {
      var sheet = doc.getSheetByName('Limpeza_Checklists') || doc.insertSheet('Limpeza_Checklists');
      sheet.appendRow([
        d.dataHora, d.unidade, d.setor, d.periodicidade, 
        d.colaborador, d.itensConcluidos, d.conformidade, 
        d.status, d.comentarioGestor, d.unidade
      ]);
    } else if (action === 'ADD_MAINTENANCE_ROW') {
      var sheet = doc.getSheetByName('Manutencao_Chamados') || doc.insertSheet('Manutencao_Chamados');
      sheet.appendRow([
        d.dataHora, d.unidade, d.setor, d.prioridade, 
        d.solicitante, d.descricao, d.observacoes, d.status
      ]);
      sendEmailNotification(doc, "Novo Chamado: " + d.prioridade + " em " + d.unidade, "Chamado em " + d.setor + " (" + d.unidade + ") por " + d.solicitante + ". Descrição: " + d.descricao);
    } else if (action === 'UPDATE_MAINTENANCE_STATUS') {
      var sheet = doc.getSheetByName('Manutencao_Chamados');
      if (sheet) {
        sheet.appendRow([
          d.dataHora, d.unidade, d.setor, d.prioridade, 
          "Atualização de Status", d.descricao, "Status mudou para: " + d.status, d.status
        ]);
      }
      sendEmailNotification(doc, "Status Atualizado: " + d.status + " (" + d.unidade + ")", "O chamado do setor " + d.setor + " mudou para: " + d.status);
    } else if (action === 'GET_USERS') {
      var users = getSheetUsersList(doc);
      return ContentService.createTextOutput(JSON.stringify({ success: true, users: users }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'GET_CHECKLISTS') {
      var checklists = getSheetChecklistsList(doc);
      return ContentService.createTextOutput(JSON.stringify({ success: true, checklists: checklists }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'GET_HISTORY') {
      var history = getSheetHistory(doc);
      return ContentService.createTextOutput(JSON.stringify({ success: true, cleaningTasks: history.cleaningTasks, maintenanceTickets: history.maintenanceTickets }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'TEST_CONNECTION') {
      var sheet = doc.getSheetByName('Log_Testes') || doc.insertSheet('Log_Testes');
      sheet.appendRow([d.dataHora, d.mensagem]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function sendEmailNotification(doc, subject, body) {
  try {
    var sheet = doc.getSheetByName('E-mails') || doc.getSheetByName('Emails');
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var email = String(data[i][1] || '').trim();
      if (email && email.indexOf('@') > 0) {
        MailApp.sendEmail(email, "[Pazotti Check] " + subject, body);
      }
    }
  } catch (e) {
    Logger.log("Erro ao enviar email: " + e);
  }
}

function getSheetUsersList(doc) {
  var sheet = doc.getSheetByName('Usuarios') || 
              doc.getSheetByName('Usuários') || 
              doc.getSheetByName('usuarios') || 
              doc.getSheetByName('usuários') ||
              doc.getSheetByName('USUARIOS');
  var users = [];
  if (!sheet) return users;
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return users;
  
  var headers = data[0] || [];
  var loginIdx = 0, senhaIdx = 1, perfilIdx = 2, vinculoIdx = 3;
  
  for (var h = 0; h < headers.length; h++) {
    var hText = String(headers[h]).toLowerCase().trim();
    if (hText.indexOf('login') >= 0 || hText.indexOf('usu') >= 0 || hText.indexOf('name') >= 0) loginIdx = h;
    if (hText.indexOf('senha') >= 0 || hText.indexOf('pin') >= 0 || hText.indexOf('pass') >= 0) senhaIdx = h;
    if (hText.indexOf('perfil') >= 0 || hText.indexOf('cargo') >= 0 || hText.indexOf('role') >= 0) perfilIdx = h;
    if (hText.indexOf('vinculo') >= 0 || hText.indexOf('unidade') >= 0 || hText.indexOf('pazotti') >= 0) vinculoIdx = h;
  }
  
  for (var i = 1; i < data.length; i++) {
    var loginVal = String(data[i][loginIdx] || '').trim();
    if (loginVal) {
      users.push({
        login: loginVal,
        senha: String(data[i][senhaIdx] || '').trim(),
        perfil: String(data[i][perfilIdx] || 'Funcionário').trim(),
        vinculo: String(data[i][vinculoIdx] || '').trim(),
        unidade: String(data[i][vinculoIdx] || '').trim()
      });
    }
  }
  return users;
}

function getSheetChecklistsList(doc) {
  var sheet = doc.getSheetByName('Checklist Limpeza') || 
              doc.getSheetByName('Checklist_Limpeza') || 
              doc.getSheetByName('checklist limpeza') || 
              doc.getSheetByName('CHECKLIST LIMPEZA') ||
              doc.getSheetByName('Checklist');
  var items = [];
  if (!sheet) return items;
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return items;
  
  var headers = data[0] || [];
  var tipoIdx = 0, setorIdx = 1, freqIdx = 2, questaoIdx = 3, pazottiIdx = -1;
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase().trim();
    if (h.indexOf('pazotti') > -1 || h.indexOf('unidade') > -1 || h.indexOf('filial') > -1 || h.indexOf('loja') > -1 || h.indexOf('vinculo') > -1) pazottiIdx = c;
    if (h.indexOf('tipo') > -1) tipoIdx = c;
    if (h.indexOf('setor') > -1 || h.indexOf('departamento') > -1 || h.indexOf('dep') > -1) setorIdx = c;
    if (h.indexOf('frequ') > -1 || h.indexOf('perio') > -1) freqIdx = c;
    if (h.indexOf('quest') > -1 || h.indexOf('item') > -1 || h.indexOf('tarefa') > -1 || h.indexOf('perg') > -1) questaoIdx = c;
  }
  
  for (var i = 1; i < data.length; i++) {
    var questao = String(data[i][questaoIdx] || '').trim();
    if (!questao) continue;
    var pazo = (pazottiIdx >= 0) ? String(data[i][pazottiIdx] || '').trim() : '';
    items.push({
      pazotti: pazo,
      unidade: pazo,
      tipo: String(data[i][tipoIdx] || 'LIMPEZA').trim(),
      setor: String(data[i][setorIdx] || 'Escritórios').trim(),
      frequencia: String(data[i][freqIdx] || 'DIARIO').trim(),
      questao: questao
    });
  }
  return items;
}

function getSheetHistory(doc) {
  var cleaningTasks = [];
  var maintenanceTickets = [];
  
  var sheets = doc.getSheets();
  var sheetClean = null;
  for (var s = 0; s < sheets.length; s++) {
    var sName = String(sheets[s].getName()).trim().toLowerCase();
    if (sName === 'limpeza_checklists' || sName.indexOf('limpeza_check') >= 0) {
      sheetClean = sheets[s];
      break;
    }
  }
  
  if (sheetClean) {
    var dataClean = sheetClean.getDataRange().getValues();
    if (dataClean.length >= 2) {
      for (var i = 1; i < dataClean.length; i++) {
        var r = dataClean[i];
        var dh = r[0];
        var un = String(r[1] || r[9] || '').trim();
        var st = String(r[2] || '').trim();
        var pr = String(r[3] || '').trim();
        var cb = String(r[4] || '').trim();
        var it = String(r[5] || '0/0').trim();
        var stt = String(r[7] || '').trim().toLowerCase();
        
        if (!un && !st) continue;
        
        var status = 'pending';
        if (stt.indexOf('aprovad') >= 0) status = 'approved';
        if (stt.indexOf('reprovad') >= 0) status = 'rejected';
        
        var parts = it.split('/');
        var comp = parseInt(parts[0]) || 0;
        var tot = parseInt(parts[1]) || comp || 1;
        
        var freq = 'diaria';
        var prLow = pr.toLowerCase();
        if (prLow.indexOf('sem') >= 0) freq = 'semanal';
        if (prLow.indexOf('men') >= 0) freq = 'mensal';
        
        var dateStr = '';
        var dhStr = String(dh || '').trim();
        var mBr = dhStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (mBr) {
          var d = ('0' + mBr[1]).slice(-2);
          var mo = ('0' + mBr[2]).slice(-2);
          var yr = mBr[3];
          dateStr = yr + '-' + mo + '-' + d;
        } else {
          try {
            dateStr = dh ? new Date(dh).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          } catch(e) {
            dateStr = new Date().toISOString().split('T')[0];
          }
        }
        
        cleaningTasks.push({
          id: 'sheet-clean-' + i,
          unitId: resolveUnitId(un),
          sectorId: resolveSectorId(st),
          sectorName: st || resolveSectorId(st),
          frequency: freq,
          completedItems: comp,
          totalItems: tot,
          userName: cb || 'Colaborador',
          completedAt: dh ? String(dh) : new Date().toISOString(),
          date: dateStr,
          status: status,
          rejectReason: String(r[8] || ''),
          beforePhotos: [],
          afterPhotos: []
        });
      }
    }
  }
  
  var sheetMaint = doc.getSheetByName('Manutencao_Chamados');
  if (sheetMaint) {
    var dataMaint = sheetMaint.getDataRange().getValues();
    if (dataMaint.length >= 2) {
      for (var j = 1; j < dataMaint.length; j++) {
        var m = dataMaint[j];
        var dhM = m[0];
        var unM = String(m[1] || '').trim();
        var stM = String(m[2] || '').trim();
        var prio = String(m[3] || 'Corretiva').trim();
        var sol = String(m[4] || '').trim();
        var desc = String(m[5] || '').trim();
        var obs = String(m[6] || '').trim();
        var sttM = String(m[7] || 'Aberto').trim();
        
        if (!unM && !stM && !desc) continue;
        if (sol === 'Atualização de Status') continue;
        
        maintenanceTickets.push({
          id: 'sheet-maint-' + j,
          unitId: resolveUnitId(unM),
          sectorId: resolveSectorId(stM),
          priority: prio,
          description: desc,
          comments: obs,
          photos: [],
          status: sttM,
          authorName: sol || 'Colaborador',
          createdAt: dhM ? String(dhM) : new Date().toISOString()
        });
      }
    }
  }
  
  // Deduplica tarefas mantendo o status definitivo mais recente (Aprovado/Reprovado sobrepõe Aguardando)
  var cleanMap = {};
  for (var k = 0; k < cleaningTasks.length; k++) {
    var taskObj = cleaningTasks[k];
    var key = taskObj.unitId + '_' + taskObj.sectorId + '_' + taskObj.frequency + '_' + taskObj.date + '_' + taskObj.userName;
    if (!cleanMap[key] || taskObj.status === 'approved' || taskObj.status === 'rejected') {
      cleanMap[key] = taskObj;
    }
  }
  var deduplicatedClean = [];
  for (var keyInMap in cleanMap) {
    deduplicatedClean.push(cleanMap[keyInMap]);
  }
  
  return { cleaningTasks: deduplicatedClean, maintenanceTickets: maintenanceTickets };
}

function resolveUnitId(name) {
  var n = String(name || '').toLowerCase();
  if (n.indexOf('matriz') >= 0) return 'matriz';
  if (n.indexOf('filial') >= 0 || n.indexOf('depósito') >= 0 || n.indexOf('deposito') >= 0) return 'filial';
  if (n.indexOf('frios') >= 0 || n.indexOf('congelados') >= 0) return 'frios';
  if (n.indexOf('triangulo') >= 0 || n.indexOf('triângulo') >= 0 || n.indexOf('uberlândia') >= 0 || n.indexOf('uberlandia') >= 0) return 'triangulo';
  return 'geral';
}

function resolveSectorId(name) {
  if (!name) return 'escritorios';
  var sClean = String(name).trim();
  var s = sClean.toLowerCase();
  if (s === 'escritorios' || s === 'escritórios' || s === 'escritorio' || s === 'escritório') return 'escritorios';
  if (s === 'deposito de produtos' || s === 'depósito de produtos') return 'deposito-produtos';
  if (s === 'deposito de improprios' || s === 'depósito de impróprios') return 'deposito-improprios';
  if (s === 'deposito merchan' || s === 'depósito merchan') return 'deposito-merchan';
  if (s === 'banheiros escritorio' || s === 'banheiros escritório') return 'banheiros-escritorio';
  if (s === 'banheiros deposito' || s === 'banheiros depósito') return 'banheiros-deposito';
  if (s === 'cozinha') return 'cozinha';
  if (s === 'refeitorio' || s === 'refeitório') return 'refeitorio';
  return sClean;
}

function doGet(e) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter) ? e.parameter.action : '';
  
  if (action === 'GET_USERS') {
    var users = getSheetUsersList(doc);
    return ContentService.createTextOutput(JSON.stringify({ success: true, users: users }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'GET_CHECKLISTS') {
    var checklists = getSheetChecklistsList(doc);
    return ContentService.createTextOutput(JSON.stringify({ success: true, checklists: checklists }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'GET_HISTORY') {
    var history = getSheetHistory(doc);
    return ContentService.createTextOutput(JSON.stringify({ success: true, cleaningTasks: history.cleaningTasks, maintenanceTickets: history.maintenanceTickets }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Pazotti Check API Webhook OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function GoogleSheetsModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCleaningCols, setCopiedCleaningCols] = useState(false);
  const [copiedMaintCols, setCopiedMaintCols] = useState(false);
  const [copiedEmailsCols, setCopiedEmailsCols] = useState(false);
  const [copiedUsersCols, setCopiedUsersCols] = useState(false);
  const [copiedChecklistCols, setCopiedChecklistCols] = useState(false);
  const [copiedChecklistRows, setCopiedChecklistRows] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getGoogleSheetsWebhookUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCleaningCols = () => {
    const cols = 'Data_Hora\tUnidade\tSetor\tPeriodicidade\tColaborador\tItens_Concluidos\tConformidade\tStatus\tComentario_Gestor';
    navigator.clipboard.writeText(cols);
    setCopiedCleaningCols(true);
    setTimeout(() => setCopiedCleaningCols(false), 2000);
  };

  const handleCopyMaintCols = () => {
    const cols = 'Data_Hora\tUnidade\tSetor\tPrioridade\tSolicitante\tDescricao\tObservacoes\tStatus';
    navigator.clipboard.writeText(cols);
    setCopiedMaintCols(true);
    setTimeout(() => setCopiedMaintCols(false), 2000);
  };

  const handleCopyEmailsCols = () => {
    const cols = 'Cargo_Nome\tEmail';
    navigator.clipboard.writeText(cols);
    setCopiedEmailsCols(true);
    setTimeout(() => setCopiedEmailsCols(false), 2000);
  };

  const handleCopyUsersCols = () => {
    const cols = 'Login\tSenha\tPerfil\tUnidade';
    navigator.clipboard.writeText(cols);
    setCopiedUsersCols(true);
    setTimeout(() => setCopiedUsersCols(false), 2000);
  };

  const handleCopyChecklistCols = () => {
    const cols = 'PAZOTTI\tTIPO\tSETOR\tFREQUENCIA\tQUESTAO';
    navigator.clipboard.writeText(cols);
    setCopiedChecklistCols(true);
    setTimeout(() => setCopiedChecklistCols(false), 2000);
  };

  const handleCopyChecklistRows = () => {
    const rows = `PAZOTTI\tTIPO\tSETOR\tFREQUENCIA\tQUESTAO
TODAS\tLIMPEZA\tEscritórios\tDIARIO\tVarrer e passar pano no piso geral com desinfetante neutro
TODAS\tLIMPEZA\tEscritórios\tDIARIO\tEsvaziar lixeiras e substituir sacos plásticos
TODAS\tLIMPEZA\tEscritórios\tDIARIO\tLimpar e higienizar superfícies de bancadas e mesas
TODAS\tLIMPEZA\tEscritórios\tDIARIO\tOrganizar itens fora do lugar nas áreas comuns
TODAS\tLIMPEZA\tEscritórios\tDIARIO\tHigienizar maçanetas, corrimãos e interruptores
TODAS\tLIMPEZA\tEscritórios\tSEMANAL\tLimpeza de vidros, divisórias e espelhos
TODAS\tLIMPEZA\tEscritórios\tSEMANAL\tLimpeza de rodapés, cantos e remoção de teias
TODAS\tLIMPEZA\tEscritórios\tSEMANAL\tHigienização interna e externa das lixeiras
TODAS\tLIMPEZA\tEscritórios\tSEMANAL\tLimpeza de aparelhos de telefone e periféricos (teclados/mouses)
TODAS\tLIMPEZA\tEscritórios\tMENSAL\tLimpeza profunda de estofados e cadeiras de escritório
TODAS\tLIMPEZA\tEscritórios\tMENSAL\tDesinfecção geral com aplicação de produto bactericida
TODAS\tLIMPEZA\tEscritórios\tMENSAL\tLimpeza de persianas, cortinas e grelhas de ar-condicionado
TODAS\tLIMPEZA\tEscritórios\tMENSAL\tLimpeza do teto, calhas e luminárias
TODAS\tLIMPEZA\tDepósito de Produtos\tDIARIO\tVarrer corredores e áreas de movimentação de paletes
TODAS\tLIMPEZA\tDepósito de Produtos\tDIARIO\tRecolher plásticos, papéis e resíduos de embalagens do chão
TODAS\tLIMPEZA\tDepósito de Produtos\tDIARIO\tEsvaziar caixas coletoras e contentores de lixo
TODAS\tLIMPEZA\tDepósito de Produtos\tDIARIO\tLimpar área de recebimento e expedição
TODAS\tLIMPEZA\tDepósito de Produtos\tSEMANAL\tOrganização de prateleiras, racks e porta-paletes
TODAS\tLIMPEZA\tDepósito de Produtos\tSEMANAL\tLimpeza mecânica ou lavagem de corredores principais
TODAS\tLIMPEZA\tDepósito de Produtos\tSEMANAL\tHigienização de carrinhos hidráulicos e empilhadeiras
TODAS\tLIMPEZA\tDepósito de Produtos\tMENSAL\tVarredura alta (vigas, estruturas metálicas e tubulações)
TODAS\tLIMPEZA\tDepósito de Produtos\tMENSAL\tRevisão geral de sinalização de segurança no piso e paredes
TODAS\tLIMPEZA\tDepósito de Produtos\tMENSAL\tLimpeza de portas industriais e cortinas de PVC
TODAS\tLIMPEZA\tDepósito de Impróprios\tDIARIO\tVarrer e aplicar desinfetante bactericida no piso da área restrita
TODAS\tLIMPEZA\tDepósito de Impróprios\tDIARIO\tVerificar vedação de recipientes com produtos avariados ou vazando
TODAS\tLIMPEZA\tDepósito de Impróprios\tDIARIO\tSinalizar visivelmente caixas de descarte e devolução
TODAS\tLIMPEZA\tDepósito de Impróprios\tDIARIO\tRetirar resíduos orgânicos ou materiais em decomposição com luvas reforçadas
TODAS\tLIMPEZA\tDepósito de Impróprios\tSEMANAL\tLavagem com lavadora de alta pressão da área de segregação
TODAS\tLIMPEZA\tDepósito de Impróprios\tSEMANAL\tHigienização profunda de paletes plásticos e estrados de avaria
TODAS\tLIMPEZA\tDepósito de Impróprios\tSEMANAL\tConferência do estoque de sacos reforçados e EPIs de descarte
TODAS\tLIMPEZA\tDepósito de Impróprios\tMENSAL\tSanitização completa das paredes e teto contra proliferação de odores
TODAS\tLIMPEZA\tDepósito de Impróprios\tMENSAL\tVerificação da integridade de ralos sifonados e grelhas de contenção
TODAS\tLIMPEZA\tDepósito Merchan\tDIARIO\tVarrer área de estocagem de materiais publicitários e displays
TODAS\tLIMPEZA\tDepósito Merchan\tDIARIO\tRecolher embalagens vazias, plásticos bolha e caixas de papelão
TODAS\tLIMPEZA\tDepósito Merchan\tDIARIO\tOrganizar corredores para livre acesso a materiais promocionais
TODAS\tLIMPEZA\tDepósito Merchan\tSEMANAL\tLimpeza com pano seco ou antiestático nos displays e cartazes
TODAS\tLIMPEZA\tDepósito Merchan\tSEMANAL\tVerificação de umidade ou goteiras na área de estocagem de papelão
TODAS\tLIMPEZA\tDepósito Merchan\tMENSAL\tInventário visual e limpeza profunda dos racks de brindes
TODAS\tLIMPEZA\tBanheiros Escritório\tDIARIO\tLavagem completa do piso com bactericida e desinfetante
TODAS\tLIMPEZA\tBanheiros Escritório\tDIARIO\tHigienização de vasos sanitários, mictórios, pias e bancadas
TODAS\tLIMPEZA\tBanheiros Escritório\tDIARIO\tReposição de papel higiênico, papel toalha e sabonete líquido
TODAS\tLIMPEZA\tBanheiros Escritório\tDIARIO\tEsvaziar lixeiras e substituir sacos plásticos
TODAS\tLIMPEZA\tBanheiros Escritório\tSEMANAL\tLavagem das paredes, azulejos e divisórias dos sanitários
TODAS\tLIMPEZA\tBanheiros Escritório\tSEMANAL\tLimpeza detalhada de espelhos e torneiras com desincrustante
TODAS\tLIMPEZA\tBanheiros Escritório\tMENSAL\tLimpeza e desinfecção de ralos sifonados e tubulações aparentes
TODAS\tLIMPEZA\tBanheiros Depósito\tDIARIO\tLavagem pesada do piso dos sanitários e vestiários com desinfetante
TODAS\tLIMPEZA\tBanheiros Depósito\tDIARIO\tHigienização de vasos sanitários, mictórios, pias e chuveiros
TODAS\tLIMPEZA\tBanheiros Depósito\tDIARIO\tReposição de suprimentos (papel higiênico, toalha, sabonete)
TODAS\tLIMPEZA\tBanheiros Depósito\tDIARIO\tEsvaziamento de lixeiras de descarte de resíduos e toalhas
TODAS\tLIMPEZA\tBanheiros Depósito\tSEMANAL\tLavagem dos bancos de vestiário, portas de armários e divisórias
TODAS\tLIMPEZA\tBanheiros Depósito\tSEMANAL\tDesinfecção de grades de ralo e remoção de resíduos retidos
TODAS\tLIMPEZA\tBanheiros Depósito\tMENSAL\tLimpeza profunda de chuveiros, revestimentos altos e luminárias
TODAS\tLIMPEZA\tCozinha\tDIARIO\tHigienização de bancadas de manipulação antes e após o uso
TODAS\tLIMPEZA\tCozinha\tDIARIO\tLavagem e desinfecção com água quente de utensílios e equipamentos
TODAS\tLIMPEZA\tCozinha\tDIARIO\tLimpeza externa de fogões, fornos, geladeiras e bancadas térmicas
TODAS\tLIMPEZA\tCozinha\tDIARIO\tVarredura e lavagem do piso com desengordurante e sanitizante
TODAS\tLIMPEZA\tCozinha\tDIARIO\tEsvaziar lixeiras com tampa acionada por pedal e higienizar
TODAS\tLIMPEZA\tCozinha\tSEMANAL\tLimpeza profunda interna de geladeiras, freezers e armários
TODAS\tLIMPEZA\tCozinha\tSEMANAL\tLimpeza de coifas, exaustores e filtros de gordura
TODAS\tLIMPEZA\tCozinha\tSEMANAL\tDesincrustação de pisos e rejuntes
TODAS\tLIMPEZA\tCozinha\tMENSAL\tHigienização profunda de ralos, caixas de gordura e tubulações
TODAS\tLIMPEZA\tCozinha\tMENSAL\tLimpeza de paredes altas, teto e luminárias seladas
TODAS\tLIMPEZA\tRefeitório\tDIARIO\tLimpeza e desinfecção das mesas e cadeiras após cada turno de refeição
TODAS\tLIMPEZA\tRefeitório\tDIARIO\tVarrer e passar pano no piso com desinfetante neutro
TODAS\tLIMPEZA\tRefeitório\tDIARIO\tLimpeza externa de micro-ondas, refresqueiras e balcões de servir
TODAS\tLIMPEZA\tRefeitório\tDIARIO\tEsvaziar lixeiras orgânicas e recicláveis e substituir sacos
TODAS\tLIMPEZA\tRefeitório\tSEMANAL\tLimpeza interna e desodorização dos micro-ondas e geladeiras de apoio
TODAS\tLIMPEZA\tRefeitório\tSEMANAL\tLimpeza de vidros, portas e rodapés do salão
TODAS\tLIMPEZA\tRefeitório\tMENSAL\tLavagem profunda das cadeiras e estrados das mesas
TODAS\tLIMPEZA\tRefeitório\tMENSAL\tLimpeza de ventiladores, ar-condicionado e luminárias`;
    navigator.clipboard.writeText(rows);
    setCopiedChecklistRows(true);
    setTimeout(() => setCopiedChecklistRows(false), 2000);
  };

  const handleSaveAndTest = async () => {
    setGoogleSheetsWebhookUrl(url);
    if (!url.trim()) {
      setTestResult({ success: false, message: 'URL removida com sucesso. Integração desativada.' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const res = await testGoogleSheetsConnection(url);
    setTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Conexão validada com sucesso! As marcações serão enviadas para a sua planilha.',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Erro ao comunicar com o Google Apps Script. Verifique a URL e se a implantação está como Qualquer pessoa.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-emerald-800 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Table className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Vincular Planilha do Google Drive</h3>
              <p className="text-xs opacity-90">Preenchimento Automático via Google Apps Script</p>
            </div>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          {/* Passo 1: Quais colunas colocar na planilha */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">1</span>
              <span>Estrutura de Abas e Colunas na Sua Planilha</span>
            </h4>
            <p>
              Crie quatro abas (ou páginas) na sua planilha do Google Drive para gerenciar Checklists, Manutenção, E-mails e Usuários (cole na Linha 1):
            </p>

            <div className="space-y-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Aba 1: Limpeza_Checklists</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    A: Data_Hora | B: Unidade | C: Setor | D: Periodicidade | E: Colaborador | F: Itens_Concluidos | G: Conformidade | H: Status | I: Comentario_Gestor
                  </span>
                </div>
                <button
                  onClick={handleCopyCleaningCols}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold shrink-0 flex items-center gap-1"
                >
                  {copiedCleaningCols ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCleaningCols ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Aba 2: Manutencao_Chamados</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    A: Data_Hora | B: Unidade | C: Setor | D: Prioridade | E: Solicitante | F: Descricao | G: Observacoes | H: Status
                  </span>
                </div>
                <button
                  onClick={handleCopyMaintCols}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold shrink-0 flex items-center gap-1"
                >
                  {copiedMaintCols ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMaintCols ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Aba 3: E-mails (Notificações Automáticas)</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    A: Cargo_Nome | B: Email
                  </span>
                </div>
                <button
                  onClick={handleCopyEmailsCols}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold shrink-0 flex items-center gap-1"
                >
                  {copiedEmailsCols ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmailsCols ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Aba 4: Usuarios (Permissões do App)</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    A: Login | B: Senha | C: Perfil (Gestor ou Funcionário) | D: Unidade
                  </span>
                </div>
                <button
                  onClick={handleCopyUsersCols}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold shrink-0 flex items-center gap-1"
                >
                  {copiedUsersCols ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUsersCols ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Aba 5: Checklist Limpeza (Questões Personalizadas)</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    A: PAZOTTI | B: TIPO | C: SETOR | D: FREQUENCIA | E: QUESTAO
                  </span>
                </div>
                <button
                  onClick={handleCopyChecklistCols}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold shrink-0 flex items-center gap-1"
                >
                  {copiedChecklistCols ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedChecklistCols ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Destaque para exportar todos os itens padrão para a planilha */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="font-extrabold text-emerald-950 text-xs block uppercase tracking-wide">
                    ✨ Exportar Checklists Padrão do App
                  </span>
                  <p className="text-[11px] text-emerald-900 mt-0.5">
                    Copie todas as <strong>69 questões prontas</strong> de todos os setores para colar direto na aba <strong>Checklist Limpeza</strong> do seu Excel / Sheets (Ctrl + V na célula A1).
                  </p>
                </div>
                <button
                  onClick={handleCopyChecklistRows}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-md transition-all"
                >
                  {copiedChecklistRows ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedChecklistRows ? '69 Questões Copiadas!' : 'Copiar Todas (Excel / Sheets)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Passo 2: Script de Integração */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">2</span>
                <span>Código Apps Script (Extensões &gt; Apps Script)</span>
              </h4>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              No menu do Google Sheets, clique em <strong>Extensões &gt; Apps Script</strong>, apague o conteúdo do editor, cole o código abaixo e clique em <strong>Implantar &gt; Nova implantação</strong> (Selecione tipo: <em>App da Web</em> | Quem tem acesso: <em>Qualquer pessoa</em>):
            </p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-44">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>

          {/* Passo 3: Colar a URL do Webhook gerada */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">3</span>
              <span>Cole a URL da Implantação Aqui</span>
            </h4>
            <p className="text-emerald-900">
              Após implantar no Apps Script, copie a URL gerada (começa com <code>https://script.google.com/macros/s/...</code>) e cole abaixo para ativar a integração no app:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs text-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={handleSaveAndTest}
                disabled={testing}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>{testing ? 'Testando...' : 'Salvar & Testar'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl font-bold text-xs ${
                  testResult.success
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            ✓ Os dados serão inseridos em tempo real na planilha.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
