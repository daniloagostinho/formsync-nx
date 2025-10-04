// Log da configuração do environment LOCAL
console.log('🔧 [ENVIRONMENT LOCAL] Carregando configuração para desenvolvimento local...');
console.log('   - Production:', false);
console.log('   - API URL:', 'http://localhost:8080/api/v1');
console.log('   - Backend Local:', true);
console.log('   - Stripe Key (primeiros 10):', 'pk_test_51Qglm7G46AbyttUyCQQv5EWBWrqfqS5xH6IXhX5JBQZN8uCXTdKTBhaaT2FXe14YgxxETCG9Mx0Qe43tDPc5od7s00WjvqTz3i'.substring(0, 10) + '...');
console.log('   - Stripe Key (últimos 10):', '...' + 'pk_test_51Qglm7G46AbyttUyCQQv5EWBWrqfqS5xH6IXhX5JBQZN8uCXTdKTBhaaT2FXe14YgxxETCG9Mx0Qe43tDPc5od7s00WjvqTz3i'.substring('pk_test_51Qglm7G46AbyttUyCQQv5EWBWrqfqS5xH6IXhX5JBQZN8uCXTdKTBhaaT2FXe14YgxxETCG9Mx0Qe43tDPc5od7s00WjvqTz3i'.length - 10));

export const environment = {
    production: false,
    // Usar backend local para desenvolvimento
    apiUrl: 'http://localhost:8080/api/v1',
    httpsRequired: false,
    sslEnabled: false,
    // Feature flag para pular checkout do Stripe durante cadastro
    skipStripeCheckout: true,
    // Feature flag para pular verificação de email durante login
    skipEmailVerification: true,
    stripe: {
        // Chave de teste para desenvolvimento local
        publishableKey: 'pk_test_51Qglm7G46AbyttUygWiP15IAxR8SC9VreV01ZHKPvGrcBylQTyfUakC2LyFR5vpoh7lSlXe2ltFT5CTILF5KsCOK00SQyAJcMP'
    },
    security: {
        minPasswordLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutos
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutos
        encryptionKey: 'dev-secret-key-change-in-production',
        // Validações adicionais para senhas sequenciais
        blockSequentialPasswords: true,
        blockRepetitivePasswords: true
    }
};
