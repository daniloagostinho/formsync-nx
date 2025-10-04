export interface ConfiguracaoNotificacao {
  id?: number;
  usuarioId: number;
  ativo: boolean;
  diasAntesVencimento: number;
  emailAtivo: boolean;
  pushAtivo: boolean;
  smsAtivo: boolean;
  horarioNotificacao: string; // formato HH:mm
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface NotificacaoVencimento {
  id?: number;
  usuarioId: number;
  titulo: string;
  mensagem: string;
  dataVencimento: Date;
  dataEnvio: Date;
  tipo: 'email' | 'push' | 'sms';
  status: 'pendente' | 'enviada' | 'falha';
  lida: boolean;
} 