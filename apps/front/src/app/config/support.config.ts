export interface SupportConfig {
  whatsapp: {
    phoneNumber: string;
    defaultMessage: string;
  };
  email: {
    address: string;
    subject: string;
  };
}

export const SUPPORT_CONFIG: SupportConfig = {
  whatsapp: {
    phoneNumber: '551195585858', // Substitua pelo seu número real
    defaultMessage: 'Olá! Gostaria de obter mais informações sobre o FormSync.'
  },
  email: {
    address: 'suporte@formsync.com',
    subject: 'Suporte FormSync - Formulários Universais para Qualquer Site'
  }
}; 