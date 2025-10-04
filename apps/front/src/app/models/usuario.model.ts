export interface LgpdConsentimento {
  politicaPrivacidade: boolean;
  marketing: boolean;
  cookies: boolean;
  dataConsentimento: string;
  ipConsentimento: string;
  versaoPolitica: string;
}

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  foto?: string; // base64
  plano?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  lgpdConsentimento?: LgpdConsentimento;
  // Campos individuais de consentimento LGPD
  consentimentoLGPD?: boolean;
  consentimentoMarketing?: boolean;
  consentimentoAnalytics?: boolean;
  dataConsentimento?: string;
  ipConsentimento?: string;
  userAgentConsentimento?: string;
} 