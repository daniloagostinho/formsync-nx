// Environment simplificado para desenvolvimento local
console.log('🔧 [ENVIRONMENT] Configuração para desenvolvimento local');
console.log('   - API URL: http://localhost:8080/api/v1');

export const environment = {
  production: false,
  // Sempre usar backend local para desenvolvimento
  apiUrl: 'http://localhost:8080/api/v1',
  httpsRequired: false,
  sslEnabled: false,
  // Feature flag para pular checkout do Stripe durante cadastro
  skipStripeCheckout: true,
  // Feature flag para pular verificação de email durante login
  skipEmailVerification: false,
  stripe: {
    publishableKey: 'pk_test_51Qglm7G46AbyttUygWiP15IAxR8SC9VreV01ZHKPvGrcBylQTyfUakC2LyFR5vpoh7lSlXe2ltFT5CTILF5KsCOK00SQyAJcMP'
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    encryptionKey: 'dev-secret-key-change-in-production',
    blockSequentialPasswords: true,
    blockRepetitivePasswords: true
  }
};



