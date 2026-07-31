export const DEFAULT_CHECKLISTS = {
  escritorios: {
    diaria: [
      { id: 'esc-d1', text: 'Varrer e passar pano no piso geral com desinfetante neutro', completed: false },
      { id: 'esc-d2', text: 'Esvaziar lixeiras e substituir sacos plásticos', completed: false },
      { id: 'esc-d3', text: 'Limpar e higienizar superfícies de bancadas e mesas', completed: false },
      { id: 'esc-d4', text: 'Organizar itens fora do lugar nas áreas comuns', completed: false },
      { id: 'esc-d5', text: 'Higienizar maçanetas, corrimãos e interruptores', completed: false }
    ],
    semanal: [
      { id: 'esc-s1', text: 'Limpeza de vidros, divisórias e espelhos', completed: false },
      { id: 'esc-s2', text: 'Limpeza de rodapés, cantos e remoção de teias', completed: false },
      { id: 'esc-s3', text: 'Higienização interna e externa das lixeiras', completed: false },
      { id: 'esc-s4', text: 'Limpeza de aparelhos de telefone e periféricos (teclados/mouses)', completed: false }
    ],
    mensal: [
      { id: 'esc-m1', text: 'Limpeza profunda de estofados e cadeiras de escritório', completed: false },
      { id: 'esc-m2', text: 'Desinfecção geral com aplicação de produto bactericida', completed: false },
      { id: 'esc-m3', text: 'Limpeza de persianas, cortinas e grelhas de ar-condicionado', completed: false },
      { id: 'esc-m4', text: 'Limpeza do teto, calhas e luminárias', completed: false }
    ]
  },
  'deposito-produtos': {
    diaria: [
      { id: 'dep-d1', text: 'Varrer corredores e áreas de movimentação de paletes', completed: false },
      { id: 'dep-d2', text: 'Recolher plásticos, papéis e resíduos de embalagens do chão', completed: false },
      { id: 'dep-d3', text: 'Esvaziar caixas coletoras e contentores de lixo', completed: false },
      { id: 'dep-d4', text: 'Limpar área de recebimento e expedição', completed: false }
    ],
    semanal: [
      { id: 'dep-s1', text: 'Organização de prateleiras, racks e porta-paletes', completed: false },
      { id: 'dep-s2', text: 'Limpeza mecânica ou lavagem de corredores principais', completed: false },
      { id: 'dep-s3', text: 'Higienização de carrinhos hidráulicos e empilhadeiras', completed: false }
    ],
    mensal: [
      { id: 'dep-m1', text: 'Varredura alta (vigas, estruturas metálicas e tubulações)', completed: false },
      { id: 'dep-m2', text: 'Revisão geral de sinalização de segurança no piso e paredes', completed: false },
      { id: 'dep-m3', text: 'Limpeza de portas industriais e cortinas de PVC', completed: false }
    ]
  },
  'deposito-improprios': {
    diaria: [
      { id: 'dimp-d1', text: 'Varrer e aplicar desinfetante bactericida no piso da área restrita', completed: false },
      { id: 'dimp-d2', text: 'Verificar vedação de recipientes com produtos avariados ou vazando', completed: false },
      { id: 'dimp-d3', text: 'Sinalizar visivelmente caixas de descarte e devolução', completed: false },
      { id: 'dimp-d4', text: 'Retirar resíduos orgânicos ou materiais em decomposição com luvas reforçadas', completed: false }
    ],
    semanal: [
      { id: 'dimp-s1', text: 'Lavagem com lavadora de alta pressão da área de segregação', completed: false },
      { id: 'dimp-s2', text: 'Higienização profunda de paletes plásticos e estrados de avaria', completed: false },
      { id: 'dimp-s3', text: 'Conferência do estoque de sacos reforçados e EPIs de descarte', completed: false }
    ],
    mensal: [
      { id: 'dimp-m1', text: 'Sanitização completa das paredes e teto contra proliferação de odores', completed: false },
      { id: 'dimp-m2', text: 'Verificação da integridade de ralos sifonados e grelhas de contenção', completed: false }
    ]
  },
  'deposito-merchan': {
    diaria: [
      { id: 'dmer-d1', text: 'Varrer área de estocagem de materiais publicitários e displays', completed: false },
      { id: 'dmer-d2', text: 'Organizar caixas de material PDV por campanha e marca', completed: false },
      { id: 'dmer-d3', text: 'Esvaziar lixeira e recolher sobras de papelão e fitas adesivas', completed: false }
    ],
    semanal: [
      { id: 'dmer-s1', text: 'Remover poeira das caixas e prateleiras de materiais promocionais', completed: false },
      { id: 'dmer-s2', text: 'Limpeza dos rodapés e cantos dos módulos de merchan', completed: false }
    ],
    mensal: [
      { id: 'dmer-m1', text: 'Auditoria visual e limpeza geral de estantes metálicas', completed: false },
      { id: 'dmer-m2', text: 'Limpeza de luminárias e revisão de extintores do setor', completed: false }
    ]
  },
  'banheiros-escritorio': {
    diaria: [
      { id: 'besc-d1', text: 'Lavagem completa de vasos sanitários, mictórios e pias com bactericida', completed: false },
      { id: 'besc-d2', text: 'Reabastecer papel toalha, papel higiênico e sabonete líquido', completed: false },
      { id: 'besc-d3', text: 'Esvaziar lixeiras e trocar sacos plásticos em todas as cabines', completed: false },
      { id: 'besc-d4', text: 'Secar e polir espelhos, bancadas e torneiras', completed: false },
      { id: 'besc-d5', text: 'Verificar odorizador de ambiente e ventilação', completed: false }
    ],
    semanal: [
      { id: 'besc-s1', text: 'Lavagem de paredes, azulejos e portas das cabines sanitárias', completed: false },
      { id: 'besc-s2', text: 'Desincrustação de rejuntes e ralos', completed: false },
      { id: 'besc-s3', text: 'Higienização interna e externa dos cestos de lixo', completed: false }
    ],
    mensal: [
      { id: 'besc-m1', text: 'Limpeza profunda de exaustores de teto e grelhas de ventilação', completed: false },
      { id: 'besc-m2', text: 'Desinfecção geral e revisão das vedações de pias e descargas', completed: false }
    ]
  },
  'banheiros-deposito': {
    diaria: [
      { id: 'bdep-d1', text: 'Lavagem pesada do piso, chuveiros e sanitários com desinfetante industrial', completed: false },
      { id: 'bdep-d2', text: 'Reabastecimento completo de sabonete líquido, papel toalha e higiênico', completed: false },
      { id: 'bdep-d3', text: 'Higienização de bancos de vestiário e armários externos', completed: false },
      { id: 'bdep-d4', text: 'Esvaziamento de lixeiras e troca de refis', completed: false }
    ],
    semanal: [
      { id: 'bdep-s1', text: 'Lavagem com escovão mecânico de azulejos e estrados de chuveiro', completed: false },
      { id: 'bdep-s2', text: 'Aplicação de produto anti-mofo em cantos de vestiário e tetos', completed: false }
    ],
    mensal: [
      { id: 'bdep-m1', text: 'Sanitização de ralos e desobstrução preventiva de sifões', completed: false },
      { id: 'bdep-m2', text: 'Limpeza geral de luminárias e janelas basculantes', completed: false }
    ]
  },
  cozinha: {
    diaria: [
      { id: 'coz-d1', text: 'Higienização com álcool 70% em todas as bancadas e mesas de preparo', completed: false },
      { id: 'coz-d2', text: 'Lavagem e desengorduramento de utensílios, talheres, panelas e cubas', completed: false },
      { id: 'coz-d3', text: 'Varrer, desengordurar e secar o piso ao término das atividades', completed: false },
      { id: 'coz-d4', text: 'Reabastecer sabonete antibacteriano, detergente e papel toalha na pia', completed: false },
      { id: 'coz-d5', text: 'Esvaziar lixeiras com acionamento por pedal e higienizar bordas', completed: false }
    ],
    semanal: [
      { id: 'coz-s1', text: 'Limpeza e sanitização interna/externa de geladeiras, freezers e refrigeradores', completed: false },
      { id: 'coz-s2', text: 'Desengorduramento de paredes azulejadas, bancadas de inox e fogões', completed: false },
      { id: 'coz-s3', text: 'Limpeza de vidros, portas e maçanetas da cozinha', completed: false }
    ],
    mensal: [
      { id: 'coz-m1', text: 'Limpeza pesada e desengorduramento de coifas, exaustores e dutos', completed: false },
      { id: 'coz-m2', text: 'Limpeza e desinfecção atrás de equipamentos pesados e refrigeradores', completed: false },
      { id: 'coz-m3', text: 'Auditoria no estoque de produtos químicos sanitizantes específicos', completed: false },
      { id: 'coz-m4', text: 'Limpeza profunda do teto e verificação de telas mosquiteiras', completed: false }
    ]
  },
  refeitorio: {
    diaria: [
      { id: 'ref-d1', text: 'Limpeza e desinfecção de todas as mesas e cadeiras antes e após os turnos', completed: false },
      { id: 'ref-d2', text: 'Varrer e passar pano com desinfetante de aroma neutro em todo o salão', completed: false },
      { id: 'ref-d3', text: 'Limpeza externa de micro-ondas, bebedouros e cafeteiras', completed: false },
      { id: 'ref-d4', text: 'Esvaziar lixeiras de resíduos orgânicos e recicláveis', completed: false },
      { id: 'ref-d5', text: 'Reabastecer copos descartáveis e guardanapos nos pontos de apoio', completed: false }
    ],
    semanal: [
      { id: 'ref-s1', text: 'Higienização interna completa de micro-ondas, estufas e refrigeradores do refeitório', completed: false },
      { id: 'ref-s2', text: 'Limpeza de vidros, janelas e esquadrias do refeitório', completed: false },
      { id: 'ref-s3', text: 'Lavagem completa das lixeiras de separação de resíduos', completed: false }
    ],
    mensal: [
      { id: 'ref-m1', text: 'Limpeza de luminárias, ventiladores ou aparelhos de ar-condicionado', completed: false },
      { id: 'ref-m2', text: 'Desinfecção geral do salão, cadeiras e pés de mesas', completed: false },
      { id: 'ref-m3', text: 'Revisão de estoque de descartáveis e produtos de limpeza do salão', completed: false }
    ]
  }
};
