import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  template: `
    <div class="p-6 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-bold mb-4">🔍 Debug da API</h2>
      
      <div class="mb-4">
        <h3 class="font-semibold">Configuração Atual:</h3>
        <p><strong>Environment:</strong> {{ environment.production ? 'Produção' : 'Desenvolvimento' }}</p>
        <p><strong>API URL:</strong> {{ environment.apiUrl }}</p>
        <p><strong>HTTPS:</strong> {{ environment.httpsRequired ? 'Obrigatório' : 'Não' }}</p>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold">Testes de API:</h3>
        <button 
          (click)="testBackendConnection()" 
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          [disabled]="testing">
          {{ testing ? 'Testando...' : 'Testar Backend' }}
        </button>
        
        <button 
          (click)="testUsuariosEndpoint()" 
          class="bg-green-500 text-white px-4 py-2 rounded mr-2"
          [disabled]="testing">
          {{ testing ? 'Testando...' : 'Testar /usuarios' }}
        </button>
      </div>

      <div *ngIf="testResults.length > 0" class="mt-4">
        <h3 class="font-semibold">Resultados dos Testes:</h3>
        <div *ngFor="let result of testResults" class="mb-2 p-2 rounded" 
             [ngClass]="result.success ? 'bg-green-100' : 'bg-red-100'">
          <p><strong>{{ result.endpoint }}:</strong> {{ result.success ? '✅ Sucesso' : '❌ Erro' }}</p>
          <p *ngIf="result.message" class="text-sm">{{ result.message }}</p>
          <p *ngIf="result.status" class="text-sm">Status: {{ result.status }}</p>
        </div>
      </div>

      <div *ngIf="error" class="mt-4 p-3 bg-red-100 rounded">
        <p class="text-red-700"><strong>Erro:</strong> {{ error }}</p>
      </div>
    </div>
  `
})
export class DebugComponent implements OnInit {
  environment = environment;
  testing = false;
  testResults: any[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    console.log('🔍 [DEBUG] Componente de debug inicializado');
    console.log('🔍 [DEBUG] Environment:', environment);
    console.log('🔍 [DEBUG] API URL:', environment.apiUrl);
  }

  async testBackendConnection() {
    this.testing = true;
    this.error = null;

    try {
      console.log('🔍 [DEBUG] Testando conexão com backend...');

      const response = await this.http.get(`${environment.apiUrl}/health`).toPromise();
      console.log('✅ [DEBUG] Health check funcionando:', response);

      this.testResults.push({
        endpoint: 'Health Check',
        success: true,
        message: 'Backend respondendo',
        status: '200'
      });

    } catch (error: any) {
      console.error('❌ [DEBUG] Erro no health check:', error);

      this.testResults.push({
        endpoint: 'Health Check',
        success: false,
        message: error.message || 'Erro desconhecido',
        status: error.status || 'N/A'
      });

      this.error = `Erro ao conectar com backend: ${error.message}`;
    } finally {
      this.testing = false;
    }
  }

  async testUsuariosEndpoint() {
    this.testing = true;
    this.error = null;

    try {
      console.log('🔍 [DEBUG] Testando endpoint /usuarios...');

      const response = await this.http.post(`${environment.apiUrl}/usuarios`, {
        nome: 'Teste Debug',
        email: 'debug@test.com',
        senha: 'teste123'
      }).toPromise();

      console.log('✅ [DEBUG] Endpoint /usuarios funcionando:', response);

      this.testResults.push({
        endpoint: 'POST /usuarios',
        success: true,
        message: 'Endpoint funcionando',
        status: '200'
      });

    } catch (error: any) {
      console.error('❌ [DEBUG] Erro no endpoint /usuarios:', error);

      this.testResults.push({
        endpoint: 'POST /usuarios',
        success: false,
        message: error.message || 'Erro desconhecido',
        status: error.status || 'N/A'
      });

      this.error = `Erro no endpoint /usuarios: ${error.message}`;
    } finally {
      this.testing = false;
    }
  }
}
