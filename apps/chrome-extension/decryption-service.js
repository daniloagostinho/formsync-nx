// FormSync - Serviço de Descriptografia para Extensão Chrome
class FormSyncDecryptionService {
  constructor() {
    // Chaves exatamente iguais ao backend
    this.encryptionKey = 'defaultSecretKey123'; // Mesma chave do backend
    this.encryptionIV = 'defaultIV123456789';   // Mesmo IV do backend
    this.algorithm = 'AES-CBC';
  }

  /**
   * Verifica se uma string está criptografada
   */
  isEncrypted(data) {
    if (!data || typeof data !== 'string') {
      return false;
    }
    
    // Verifica se contém o prefixo \x (dados hexadecimais escapados)
    if (data.startsWith('\\x') && data.length > 50) {
      console.log('FormSync: Detectado valor criptografado com prefixo \\x:', data.substring(0, 20) + '...');
      return true;
    }
    
    // Verifica se contém caracteres hexadecimais longos (padrão de criptografia)
    if (data.length > 50 && /^[a-f0-9]+$/i.test(data)) {
      console.log('FormSync: Detectado valor criptografado por padrão hexadecimal:', data.substring(0, 20) + '...');
      return true;
    }
    
    // Verifica se é uma string Base64 válida e tem o tamanho esperado de dados criptografados
    try {
      const decoded = atob(data);
      const isBase64Encrypted = decoded.length > 0 && decoded.length % 16 === 0; // AES-CBC produz blocos de 16 bytes
      if (isBase64Encrypted) {
        console.log('FormSync: Detectado valor criptografado por Base64:', data.substring(0, 20) + '...');
      }
      return isBase64Encrypted;
    } catch (e) {
      return false;
    }
  }

  /**
   * Descriptografa dados usando AES-CBC (compatível com o backend)
   */
  async decrypt(encryptedData) {
    try {
      if (!this.isEncrypted(encryptedData)) {
        console.log('FormSync: Dados não estão criptografados, retornando valor original');
        return encryptedData;
      }

      console.log('FormSync: Descriptografando dados...');
      
      // Converte a chave e IV para ArrayBuffer (igual ao backend Java)
      const keyBuffer = new TextEncoder().encode(this.encryptionKey);
      const ivBuffer = new TextEncoder().encode(this.encryptionIV);
      
      let encryptedBuffer;
      
      // Verifica se tem prefixo \x (dados hexadecimais escapados)
      if (encryptedData.startsWith('\\x')) {
        // Remove o prefixo \x e converte hexadecimal para ArrayBuffer
        console.log('FormSync: Convertendo dados hexadecimais com prefixo \\x...');
        const hexString = encryptedData.substring(2); // Remove \x
        encryptedBuffer = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          encryptedBuffer[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
      } else if (/^[a-f0-9]+$/i.test(encryptedData)) {
        // Converte hexadecimal para ArrayBuffer
        console.log('FormSync: Convertendo dados hexadecimais...');
        const hexString = encryptedData;
        encryptedBuffer = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          encryptedBuffer[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
      } else {
        // Decodifica Base64
        console.log('FormSync: Convertendo dados Base64...');
        encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      }
      
      // Importa a chave
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: this.algorithm },
        false,
        ['decrypt']
      );
      
      // Descriptografa
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivBuffer
        },
        cryptoKey,
        encryptedBuffer
      );
      
      // Converte para string
      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      console.log('FormSync: Dados descriptografados com sucesso:', decryptedText);
      
      return decryptedText;
      
    } catch (error) {
      console.error('FormSync: Erro ao descriptografar dados:', error);
      // Em caso de erro, retorna o valor original
      return encryptedData;
    }
  }

  /**
   * Descriptografa um objeto com campos que podem estar criptografados
   */
  async decryptObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const decryptedObj = { ...obj };

    // Descriptografa campos específicos que podem estar criptografados
    const fieldsToDecrypt = ['valor', 'value', 'descricao', 'description', 'placeholder'];
    
    for (const field of fieldsToDecrypt) {
      if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
        decryptedObj[field] = await this.decrypt(decryptedObj[field]);
      }
    }

    // Se for um array de campos, descriptografa cada campo
    if (Array.isArray(decryptedObj.campos)) {
      decryptedObj.campos = await Promise.all(
        decryptedObj.campos.map(async (campo) => {
          const decryptedCampo = { ...campo };
          
          // Descriptografa campos específicos do campo
          for (const field of fieldsToDecrypt) {
            if (decryptedCampo[field] && typeof decryptedCampo[field] === 'string') {
              decryptedCampo[field] = await this.decrypt(decryptedCampo[field]);
            }
          }
          
          return decryptedCampo;
        })
      );
    }

    return decryptedObj;
  }

  /**
   * Descriptografa uma lista de templates
   */
  async decryptTemplates(templates) {
    if (!Array.isArray(templates)) {
      return templates;
    }

    console.log(`FormSync: Descriptografando ${templates.length} templates...`);
    
    const decryptedTemplates = await Promise.all(
      templates.map(async (template) => {
        return await this.decryptObject(template);
      })
    );

    console.log('FormSync: Templates descriptografados com sucesso');
    return decryptedTemplates;
  }
}

// Instância global do serviço de descriptografia
window.formSyncDecryptionService = new FormSyncDecryptionService();
