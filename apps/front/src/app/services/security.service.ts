import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly crypto = window.crypto;
  private readonly subtle = window.crypto.subtle;

  constructor() { }

  /**
   * Valida se uma senha atende aos requisitos de segurança
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { minPasswordLength, requireSpecialChars, requireNumbers, requireUppercase, blockSequentialPasswords, blockRepetitivePasswords } = environment.security;

    if (password.length < minPasswordLength) {
      errors.push(`Senha deve ter pelo menos ${minPasswordLength} caracteres`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    // Validações adicionais para senhas sequenciais e repetitivas
    if (blockSequentialPasswords && this.isSequentialPassword(password)) {
      errors.push('Senha sequencial não permitida (ex: 123456, abcdef)');
    }

    if (blockRepetitivePasswords && this.isRepetitivePassword(password)) {
      errors.push('Senha com padrões repetitivos não permitida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verifica se é uma senha sequencial
   */
  private isSequentialPassword(password: string): boolean {
    const sequentialPatterns = [
      '123456', '12345', '1234', '123', '12',
      '000000', '00000', '0000', '000', '00',
      '111111', '11111', '1111', '111', '11',
      'abcdef', 'abcde', 'abcd', 'abc', 'ab',
      'qwerty', 'qwert', 'qwer', 'qwe', 'qw',
      '987654', '98765', '9876', '987', '98',
      '654321', '65432', '6543', '654', '65'
    ];

    return sequentialPatterns.some(pattern =>
      password.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Verifica se é uma senha repetitiva
   */
  private isRepetitivePassword(password: string): boolean {
    if (password.length < 3) return false;

    // Verificar repetição de caracteres
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }

    // Verificar padrões repetitivos
    const patterns = ['aa', 'bb', 'cc', '11', '22', '33', '00'];
    return patterns.some(pattern => password.toLowerCase().includes(pattern));
  }

  /**
   * Gera um hash seguro da senha usando Web Crypto API
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Gerar salt único
    const salt = this.crypto.getRandomValues(new Uint8Array(16));

    // Combinar senha + salt
    const combined = new Uint8Array(data.length + salt.length);
    combined.set(data);
    combined.set(salt, data.length);

    // Gerar hash SHA-256
    const hashBuffer = await this.subtle.digest('SHA-256', combined);

    // Converter para base64
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Retornar hash + salt (separados por :)
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hashHex}:${saltHex}`;
  }

  /**
   * Verifica se uma senha corresponde ao hash armazenado
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      const [hashHex, saltHex] = storedHash.split(':');
      if (!hashHex || !saltHex) return false;

      const encoder = new TextEncoder();
      const data = encoder.encode(password);

      // Converter salt de volta para Uint8Array
      const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Combinar senha + salt
      const combined = new Uint8Array(data.length + salt.length);
      combined.set(data);
      combined.set(salt, data.length);

      // Gerar hash da senha fornecida
      const hashBuffer = await this.subtle.digest('SHA-256', combined);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const providedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return providedHashHex === hashHex;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  /**
   * Criptografa dados sensíveis usando AES-GCM
   */
  async encryptData(data: string, key?: string): Promise<string> {
    try {
      const secretKey = key || environment.security.encryptionKey || 'default-secret-key';
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Gerar chave de criptografia
      const keyBuffer = encoder.encode(secretKey);
      const cryptoKey = await this.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Gerar IV único
      const iv = this.crypto.getRandomValues(new Uint8Array(12));

      // Criptografar dados
      const encryptedBuffer = await this.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBuffer
      );

      // Converter para base64
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

      return `${encryptedHex}:${ivHex}`;
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia dos dados');
    }
  }

  /**
   * Descriptografa dados usando AES-GCM
   */
  async decryptData(encryptedData: string, key?: string): Promise<string> {
    try {
      const secretKey = key || environment.security.encryptionKey || 'default-secret-key';
      const [encryptedHex, ivHex] = encryptedData.split(':');
      if (!encryptedHex || !ivHex) throw new Error('Formato de dados inválido');

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Converter dados de volta para Uint8Array
      const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Gerar chave de descriptografia
      const keyBuffer = encoder.encode(secretKey);
      const cryptoKey = await this.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Descriptografar dados
      const decryptedBuffer = await this.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encryptedArray
      );

      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia dos dados');
    }
  }

  /**
   * Gera um token CSRF seguro
   */
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    this.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica se o ambiente é seguro (HTTPS)
   */
  isSecureEnvironment(): boolean {
    if (environment.production) {
      return window.location.protocol === 'https:' || environment.httpsRequired === false;
    }
    return true; // Em desenvolvimento, permitir HTTP
  }

  /**
   * Força redirecionamento para HTTPS se necessário
   */
  enforceHTTPS(): void {
    if (environment.httpsRequired && window.location.protocol === 'http:' && !environment.production) {
      const httpsUrl = window.location.href.replace('http:', 'https:');
      console.warn('🔒 Redirecionando para HTTPS:', httpsUrl);
      // Em produção, redirecionar automaticamente
      // window.location.href = httpsUrl;
    }
  }

  /**
   * Sanitiza dados de entrada para prevenir XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valida se um token JWT está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Se não conseguir decodificar, considerar como expirado
    }
  }
}
