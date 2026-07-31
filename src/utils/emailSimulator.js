/**
 * Simulador e formatador de e-mails / notificações via Firebase Trigger Email ou API de E-mail.
 * Registra auditoria e gera conteúdo estilizado para visualização e verificação pelo Gestor.
 */

export function generateMaintenanceEmail({ ticket, unitName, sectorName }) {
  const isUrgent = ticket.priority === 'Urgência';
  const priorityColor = isUrgent ? '#DC2626' : ticket.priority === 'Corretiva' ? '#D97706' : '#2563EB';

  return {
    to: `manutencao.${ticket.unitId}@grupopazotti.com.br`,
    cc: `gestao.${ticket.unitId}@grupopazotti.com.br`,
    subject: `[PAZOTTI MANUTENÇÃO - ${ticket.priority.toUpperCase()}] ${unitName} — Setor: ${sectorName}`,
    timestamp: new Date().toISOString(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: ${priorityColor}; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">NOVO CHAMADO DE MANUTENÇÃO</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Prioridade: <strong>${ticket.priority}</strong></p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Unidade:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${unitName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Setor:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${sectorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Solicitante:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${ticket.authorName || 'Colaborador Pazotti'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Data/Hora:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${new Date(ticket.createdAt).toLocaleString('pt-BR')}</td>
            </tr>
          </table>
          <h4 style="margin: 0 0 8px; color: #0f172a;">Descrição do Problema / Serviço:</h4>
          <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid ${priorityColor}; margin-bottom: 16px;">
            <p style="margin: 0; white-space: pre-line;">${ticket.description}</p>
          </div>
          ${ticket.comments ? `
          <h4 style="margin: 0 0 8px; color: #0f172a;">Comentários Adicionais:</h4>
          <p style="margin: 0 0 16px; color: #475569;">${ticket.comments}</p>
          ` : ''}
          ${ticket.photos && ticket.photos.length > 0 ? `
          <h4 style="margin: 0 0 10px; color: #0f172a;">Anexos (${ticket.photos.length} foto(s)):</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${ticket.photos.map((p, idx) => `<span style="background: #e2e8f0; padding: 4px 10px; border-radius: 4px; font-size: 12px; color: #334155;">📷 Foto_Anexo_${idx + 1}.jpg</span>`).join('')}
          </div>
          ` : ''}
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          Pazotti Check — Sistema de Notificação Automática via Firebase Trigger Email.<br/>
          <em>Grupo Pazotti • Limpeza, Qualidade e Manutenção</em>
        </div>
      </div>
    `,
  };
}

export function generateApprovalEmail({ task, unitName, sectorName, status, rejectReason }) {
  const isApproved = status === 'approved';
  const headerColor = isApproved ? '#10B981' : '#EF4444';
  const statusText = isApproved ? 'TAREFA APROVADA' : 'TAREFA REPROVADA PARA CORREÇÃO';

  return {
    to: `${task.userName.toLowerCase().replace(/\s+/g, '.')}@grupopazotti.com.br`,
    subject: `[PAZOTTI CHECK] ${statusText} — ${unitName} (${sectorName})`,
    timestamp: new Date().toISOString(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: ${headerColor}; color: white; padding: 18px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">${statusText}</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.95;">Checklist de Limpeza (${task.frequency.toUpperCase()})</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="margin: 0 0 14px;">Olá, <strong>${task.userName}</strong>. O status da sua tarefa foi atualizado pelo gestor.</p>
          <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 6px;"><strong>Unidade:</strong> ${unitName}</p>
            <p style="margin: 0 0 6px;"><strong>Setor:</strong> ${sectorName}</p>
            <p style="margin: 0 0 6px;"><strong>Itens Executados:</strong> ${task.completedItems}/${task.totalItems}</p>
            <p style="margin: 0;"><strong>Data Execução:</strong> ${new Date(task.completedAt).toLocaleString('pt-BR')}</p>
          </div>
          ${!isApproved ? `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px; color: #991b1b;">Motivo da Reprovação (Ação Necessária):</h4>
            <p style="margin: 0; color: #7f1d1d; font-weight: 600;">${rejectReason || 'Ajuste necessário no checklist.'}</p>
          </div>
          ` : `
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; color: #065f46;">✔ A qualidade da limpeza foi validada pelo gestor da unidade. Parabéns!</p>
          </div>
          `}
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          Pazotti Check — Gestão Integrada de Auditoria e Conformidade.
        </div>
      </div>
    `,
  };
}

export function generateMonthlyReportEmail({ reportData }) {
  return {
    to: `diretoria@grupopazotti.com.br`,
    subject: `[PAZOTTI GESTÃO] Relatório Mensal Consolidado — 5 Unidades`,
    timestamp: new Date().toISOString(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #1e3a8a; color: white; padding: 22px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">RELATÓRIO GERENCIAL MENSAL</h2>
          <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Consolidado de Tarefas de Limpeza e Manutenção — Grupo Pazotti</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <h3 style="margin: 0 0 14px; color: #0f172a;">Resumo Geral</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <div style="background: #eff6ff; padding: 12px; border-radius: 8px; flex: 1; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1e3a8a;">${reportData.totalCleaningTasks}</div>
              <div style="font-size: 12px; color: #64748b;">Limpezas Concluídas</div>
            </div>
            <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; flex: 1; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #065f46;">${reportData.approvedRate}%</div>
              <div style="font-size: 12px; color: #64748b;">Taxa de Conformidade</div>
            </div>
            <div style="background: #fffbeb; padding: 12px; border-radius: 8px; flex: 1; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #b45309;">${reportData.openMaintenances}</div>
              <div style="font-size: 12px; color: #64748b;">Manutenções Abertas</div>
            </div>
          </div>
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
            Gerado automaticamente pelo <strong>Pazotti Check</strong> para apresentação de auditoria gerencial.
          </p>
        </div>
      </div>
    `,
  };
}
