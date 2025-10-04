export interface PlanoConfig {
  id: string;
  nome: string;
  nomeCompleto: string;
  preco: number;
  precoFormatado: string;

  // NOVA ESTRUTURA: Limite duplo para proteção
  limiteTemplates: number;        // Máximo de formulários/templates
  limiteTotalCampos: number;      // Máximo de campos no total
  limiteCamposPorTemplate?: number; // Máximo de campos por template (opcional)

  // Limite legado (manter compatibilidade)
  limite: number;

  descricao: string;
  descricaoSimples: string;       // Descrição didática
  recursos: string[];
  recursosSimples: string[];      // Recursos em linguagem simples
  popular?: boolean;
  caracteristicas: string[];

  // Novos campos para comunicação
  exemploUso?: string;            // Exemplo prático de uso
  corCard?: string;               // Cor do card na interface

  // NOVO: Análise financeira
  custoMensal: number;            // Custo estimado mensal para você
  margemLucro: number;            // Margem de lucro em %
  tempoBreakEven?: number;        // Tempo para break-even (vitalício)

  // NOVO: Explicação didática dos limites
  explicacaoLimites: string;      // Explicação simples dos limites
  exemplosSites: string[];        // Exemplos de sites que cabem no plano
  casoUso: string;                // Para quem é ideal
}

export const PLANOS_CONFIG: Record<string, PlanoConfig> = {
  PESSOAL: {
    id: 'PESSOAL',
    nome: 'Pessoal',
    nomeCompleto: 'Plano Pessoal',
    preco: 14.90,
    precoFormatado: 'R$ 14,90/mês',

    // NOVA ESTRUTURA: Proteção contra exploração
    limiteTemplates: 5,            // Máximo 5 formulários
    limiteTotalCampos: 150,        // Máximo 150 campos no total (realista para 5-10 formulários)
    limiteCamposPorTemplate: 30,   // Máximo 30 campos por formulário

    // Compatibilidade (usar limiteTotalCampos)
    limite: 30,

    descricao: 'Ideal para uso pessoal e teste do sistema',
    descricaoSimples: 'Perfeito para quem está começando e quer testar o sistema',

    recursos: [
      'App desktop completo',
      'Até 30 campos salvos',
      'Suporte por email',
      'Preenchimento básico'
    ],
    recursosSimples: ['📁 5 formulários diferentes', '📄 150 campos no total', '📧 Suporte por email', '✨ Todos os recursos básicos'],

    caracteristicas: [
      'App desktop completo',
      'Até 30 campos salvos',
      'Suporte por email',
      'Preenchimento básico'
    ],

    exemploUso: 'Login Gmail (10 campos) + Cadastro Netflix (12 campos) + Dados do banco (8 campos)',
    corCard: 'gray',

    // ANÁLISE FINANCEIRA
    custoMensal: 2.50,
    margemLucro: 83.2,

    // NOVA: Explicação didática
    explicacaoLimites: '5 formulários diferentes com até 150 campos no total',
    exemplosSites: ['Candidatos de vagas', 'Usuários pessoais', 'Estudantes'],
    casoUso: 'Para quem preenche poucos formulários na internet e quer automatizar login e cadastros básicos'
  },
  PROFISSIONAL: {
    id: 'PROFISSIONAL',
    nome: 'Profissional',
    nomeCompleto: 'Plano Profissional',
    preco: 39.90,
    precoFormatado: 'R$ 39,90/mês',

    // NOVA ESTRUTURA: Valores realistas
    limiteTemplates: 50,           // Máximo 50 formulários
    limiteTotalCampos: 1000,       // Máximo 1000 campos no total (realista para 40-50 formulários)
    limiteCamposPorTemplate: 50,   // Máximo 50 campos por formulário

    // Compatibilidade
    limite: 1000,

    descricao: 'Para uso frequente, pagamento recorrente',
    descricaoSimples: 'Ideal para profissionais que usam muitos formulários no trabalho',

    recursos: [
      'App desktop completo',
      'Até 500 campos salvos',
      'Histórico de preenchimentos',
      'Suporte prioritário',
      'Atualizações automáticas',
      'Templates avançados',
      'Upload CSV'
    ],
    recursosSimples: ['📁 50 formulários diferentes', '📄 1000 campos no total', '📊 Relatórios de uso', '📤 Importar de planilhas', '🎧 Suporte prioritário', '⚡ Atualizações automáticas'],

    caracteristicas: [
      'App desktop completo',
      'Até 500 campos salvos',
      'Histórico de preenchimentos',
      'Suporte prioritário',
      'Atualizações automáticas',
      'Templates avançados',
      'Upload CSV'
    ],

    exemploUso: 'Formulários de trabalho + clientes + uso pessoal. Perfeito para freelancers e profissionais ativos.',
    corCard: 'blue',
    popular: true,

    // ANÁLISE FINANCEIRA
    custoMensal: 2.50,
    margemLucro: 93.7,

    // NOVA: Explicação didática
    explicacaoLimites: '50 formulários diferentes com até 1000 campos no total',
    exemplosSites: ['Freelancers', 'Profissionais ativos', 'Consultores'],
    casoUso: 'Para profissionais que preenchem muitos formulários no trabalho e precisam automatizar processos complexos'
  },
  EMPRESARIAL: {
    id: 'EMPRESARIAL',
    nome: 'Empresarial',
    nomeCompleto: 'Plano Empresarial',
    preco: 149.90,
    precoFormatado: 'R$ 149,90/mês',

    // NOVA ESTRUTURA: Para empresas
    limiteTemplates: 200,          // Máximo 200 formulários
    limiteTotalCampos: 5000,       // Máximo 5000 campos no total (realista para 200+ formulários)
    limiteCamposPorTemplate: 200,  // Máximo 200 campos por formulário

    // Compatibilidade
    limite: 5000,

    descricao: 'Para empresas e equipes',
    descricaoSimples: 'Solução completa para empresas com múltiplas equipes e necessidades avançadas',

    recursos: [
      'App desktop completo',
      'Até 2000 campos salvos',
      'Histórico de preenchimentos',
      'Suporte prioritário',
      'Atualizações automáticas',
      'Templates avançados',
      'Importação CSV',
      'Relatórios avançados',
      'Suporte empresarial'
    ],
    recursosSimples: ['📁 200 formulários diferentes', '📄 5000 campos no total', '🏢 Gestão para equipes', '📊 Relatórios empresariais', '📤 Importação em lote', '🎧 Suporte prioritário', '🔒 Recursos de segurança', '📞 Suporte por telefone'],

    caracteristicas: [
      'App desktop completo',
      'Até 2000 campos salvos',
      'Histórico de preenchimentos',
      'Suporte prioritário',
      'Atualizações automáticas',
      'Templates avançados',
      'Importação CSV',
      'Relatórios avançados',
      'Suporte empresarial'
    ],

    exemploUso: 'Para empresas com múltiplos departamentos. RH, vendas, atendimento, cada um com seus formulários específicos.',
    corCard: 'purple',

    // ANÁLISE FINANCEIRA
    custoMensal: 2.50,
    margemLucro: 98.3,

    // NOVA: Explicação didática
    explicacaoLimites: '200 formulários diferentes com até 5000 campos no total',
    exemplosSites: ['Equipes de RH', 'Departamento de vendas', 'Marketing digital'],
    casoUso: 'Para empresas com múltiplas equipes que precisam automatizar centenas de formulários'
  }
};

export function getPlanoConfig(planoId: string): PlanoConfig {
  return PLANOS_CONFIG[planoId] || PLANOS_CONFIG['PESSOAL'];
}

export function getPlanoNome(planoId: string): string {
  return getPlanoConfig(planoId).nome;
}

export function getPlanoLimite(planoId: string): number {
  return getPlanoConfig(planoId).limite;
}

export function getPlanoPreco(planoId: string): string {
  return getPlanoConfig(planoId).precoFormatado;
}

export function getPlanoCaracteristicas(planoId: string): string[] {
  return getPlanoConfig(planoId).caracteristicas;
}

// NOVAS FUNÇÕES PARA A ESTRUTURA ATUALIZADA
export function getLimiteTemplates(planoId: string): number {
  return getPlanoConfig(planoId).limiteTemplates;
}

export function getLimiteTotalCampos(planoId: string): number {
  return getPlanoConfig(planoId).limiteTotalCampos;
}

export function getLimiteCamposPorTemplate(planoId: string): number {
  return getPlanoConfig(planoId).limiteCamposPorTemplate || 999;
}

export function getRecursosSimples(planoId: string): string[] {
  return getPlanoConfig(planoId).recursosSimples;
}

export function getDescricaoSimples(planoId: string): string {
  return getPlanoConfig(planoId).descricaoSimples;
}

export function getExemploUso(planoId: string): string {
  return getPlanoConfig(planoId).exemploUso || '';
}

export function getCorCard(planoId: string): string {
  return getPlanoConfig(planoId).corCard || 'gray';
}

// FUNÇÃO PARA CALCULAR RECOMENDAÇÃO DE PLANO
export function calcularPlanoRecomendado(qtdTemplates: number, mediaCamposPorTemplate: number): string {
  const totalCamposEstimado = qtdTemplates * mediaCamposPorTemplate;

  // Verificar se cabe no plano PESSOAL
  if (qtdTemplates <= 5 && totalCamposEstimado <= 150) {
    return 'PESSOAL';
  }

  // Verificar se cabe no plano PROFISSIONAL
  if (qtdTemplates <= 50 && totalCamposEstimado <= 1000) {
    return 'PROFISSIONAL';
  }

  // Caso contrário, recomendar EMPRESARIAL
  return 'EMPRESARIAL';
}

// FUNÇÃO PARA VALIDAR SE PODE Criar Formulário
export function podeCrearTemplate(planoId: string, templatesAtuais: number): boolean {
  const limite = getLimiteTemplates(planoId);
  return templatesAtuais < limite;
}

// FUNÇÃO PARA VALIDAR SE PODE ADICIONAR CAMPO
export function podeAdicionarCampo(planoId: string, camposNoTemplate: number, totalCamposUsuario: number): boolean {
  const limitePorTemplate = getLimiteCamposPorTemplate(planoId);
  const limiteTotal = getLimiteTotalCampos(planoId);

  return camposNoTemplate < limitePorTemplate && totalCamposUsuario < limiteTotal;
} 