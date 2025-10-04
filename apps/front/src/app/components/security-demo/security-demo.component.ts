import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SecurityService } from '../../services/security.service';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-security-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    FooterComponent
  ],
  templateUrl: './security-demo.component.html',
  styleUrls: ['./security-demo.component.css']
})
export class SecurityDemoComponent implements OnInit {
  password = '';
  passwordValidation: { isValid: boolean; errors: string[] } = { isValid: false, errors: [] };

  dataToEncrypt = '';
  encryptedData = '';
  dataToDecrypt = '';
  decryptedData = '';

  csrfToken = '';
  isSecureEnvironment = false;

  securityFeatures = [
    {
      name: 'Validação de Senha',
      description: 'Verifica se a senha atende aos requisitos de segurança',
      status: '✅ Implementado',
      details: [
        'Mínimo de 8 caracteres',
        'Pelo menos uma letra maiúscula',
        'Pelo menos um número',
        'Pelo menos um caractere especial'
      ]
    },
    {
      name: 'Hash de Senha',
      description: 'Gera hash seguro usando Web Crypto API com salt único',
      status: '✅ Implementado',
      details: [
        'Algoritmo SHA-256',
        'Salt único de 16 bytes',
        'Proteção contra ataques de rainbow table'
      ]
    },
    {
      name: 'Criptografia AES-GCM',
      description: 'Criptografa dados sensíveis usando AES-GCM',
      status: '✅ Implementado',
      details: [
        'Algoritmo AES-GCM',
        'IV único de 12 bytes',
        'Chave derivada de senha secreta'
      ]
    },
    {
      name: 'Headers de Segurança',
      description: 'Adiciona headers de segurança HTTP',
      status: '✅ Implementado',
      details: [
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: DENY',
        'X-XSS-Protection: 1; mode=block',
        'Strict-Transport-Security (em produção)',
        'Content-Security-Policy (em produção)'
      ]
    },
    {
      name: 'HTTPS Obrigatório',
      description: 'Força uso de HTTPS em produção',
      status: '✅ Implementado',
      details: [
        'Redirecionamento automático HTTP → HTTPS',
        'Validação de protocolo seguro',
        'Configurável por ambiente'
      ]
    },
    {
      name: 'Token CSRF',
      description: 'Gera tokens CSRF para proteção',
      status: '✅ Implementado',
      details: [
        'Token único de 32 bytes',
        'Gerado a cada requisição',
        'Proteção contra ataques CSRF'
      ]
    }
  ];

  constructor(
    private securityService: SecurityService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.checkSecurityEnvironment();
    this.generateCSRFToken();
  }

  checkSecurityEnvironment() {
    this.isSecureEnvironment = this.securityService.isSecureEnvironment();
    console.log('🔒 Ambiente seguro:', this.isSecureEnvironment);
  }

  generateCSRFToken() {
    this.csrfToken = this.securityService.generateCSRFToken();
  }

  validatePassword() {
    this.passwordValidation = this.securityService.validatePassword(this.password);

    if (this.passwordValidation.isValid) {
      this.showMessage('✅ Senha válida!', 'success');
    } else {
      this.showMessage('❌ Senha inválida. Verifique os requisitos.', 'error');
    }
  }

  async hashPassword() {
    if (!this.password) {
      this.showMessage('❌ Digite uma senha primeiro', 'error');
      return;
    }

    try {
      const hashedPassword = await this.securityService.hashPassword(this.password);
      this.showMessage('🔐 Senha hasheada com sucesso!', 'success');
      console.log('Hash da senha:', hashedPassword);

      // Demonstrar verificação
      const isValid = await this.securityService.verifyPassword(this.password, hashedPassword);
      if (isValid) {
        this.showMessage('✅ Verificação de senha bem-sucedida!', 'success');
      }
    } catch (error) {
      this.showMessage('❌ Erro ao hashear senha', 'error');
      console.error('Erro:', error);
    }
  }

  async encryptData() {
    if (!this.dataToEncrypt) {
      this.showMessage('❌ Digite dados para criptografar', 'error');
      return;
    }

    try {
      this.encryptedData = await this.securityService.encryptData(this.dataToEncrypt);
      this.showMessage('🔒 Dados criptografados com sucesso!', 'success');
    } catch (error) {
      this.showMessage('❌ Erro ao criptografar dados', 'error');
      console.error('Erro:', error);
    }
  }

  async decryptData() {
    if (!this.dataToDecrypt) {
      this.showMessage('❌ Digite dados para descriptografar', 'error');
      return;
    }

    try {
      this.decryptedData = await this.securityService.decryptData(this.dataToDecrypt);
      this.showMessage('🔓 Dados descriptografados com sucesso!', 'success');
    } catch (error) {
      this.showMessage('❌ Erro ao descriptografar dados', 'error');
      console.error('Erro:', error);
    }
  }

  sanitizeInput() {
    if (!this.dataToEncrypt) {
      this.showMessage('❌ Digite dados para sanitizar', 'error');
      return;
    }

    const sanitized = this.securityService.sanitizeInput(this.dataToEncrypt);
    this.showMessage('🧹 Dados sanitizados!', 'success');
    console.log('Dados originais:', this.dataToEncrypt);
    console.log('Dados sanitizados:', sanitized);
  }

  testHTTPSRedirect() {
    this.securityService.enforceHTTPS();
    this.showMessage('🔒 Verificação de HTTPS executada. Verifique o console.', 'info');
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? 'success-snackbar' :
        type === 'error' ? 'error-snackbar' : 'info-snackbar'
    });
  }

  getEnvironmentInfo() {
    return {
      production: environment.production,
      httpsRequired: environment.httpsRequired,
      sslEnabled: environment.sslEnabled,
      apiUrl: environment.apiUrl,
      security: environment.security
    };
  }
}
