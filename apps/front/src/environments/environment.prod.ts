// Log da configuração do environment de produção
console.log('🔧 [ENVIRONMENT PROD] Carregando configuração de produção...');
console.log('   - Production:', true);
console.log('   - API URL:', 'http://formsync-backend-simple-prod-1466511997.us-east-1.elb.amazonaws.com/api/v1');
console.log('   - HTTPS obrigatório:', false);
console.log('   - Stripe publishable key (primeiros 10 chars):', 'pk_live_51'.substring(0, 10) + '...');

export const environment = {
  production: true,
  apiUrl: 'http://formsync-backend-simple-prod-1466511997.us-east-1.elb.amazonaws.com/api/v1',
  httpsRequired: false,
  sslEnabled: false,
  // Feature flag para pular checkout do Stripe durante cadastro
  skipStripeCheckout: true,
  // Feature flag para pular verificação de email durante login
  skipEmailVerification: true,
  stripe: {
    publishableKey: 'pk_live_51Qglm7G46AbyttUyaFpqZhcn1JeyedkSB63FaJ2n40wXipKHXTsW2FZPQsLH6QCevWNZVm0nJcnuN6yyYTsO7hoO0019M3nulZ'
  },


  security: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    encryptionKey: 'prod-encryption-key-change-in-production',
    blockSequentialPasswords: true,
    blockRepetitivePasswords: true
  }
};



