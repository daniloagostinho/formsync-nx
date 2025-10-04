import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../services/notification.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { TemplateCsvService, Template } from '../../services/template-csv.service';
import { ExtensionSyncService } from '../../services/extension-sync.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { ConfirmDeleteDialogComponent, ConfirmDeleteData } from '../template-manager/confirm-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'app-upload-csv',
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    FormsModule,
    LoadingButtonComponent,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './upload-csv.component.html',
  styleUrl: './upload-csv.component.css',
})
export class UploadCsvComponent implements OnInit {
  activeTab: 'upload' | 'list' = 'upload';
  selectedFile: File | null = null;
  isDragOver = false;
  templates: Template[] = [];
  carregando: boolean = false;
  carregandoPagina: boolean = true;

  // Paginação
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 50];

  // Colunas da tabela
  displayedColumns: string[] = ['nome', 'descricao', 'quantidadeCampos', 'acoes'];

  // Busca
  searchTerm: string = '';
  filteredTemplates: Template[] = [];

  constructor(
    private csvService: TemplateCsvService,
    private extensionSyncService: ExtensionSyncService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.carregarDadosCompleto();
  }

  carregarDadosCompleto() {
    this.carregandoPagina = true;

    // Verificar permissão primeiro
    this.verificarPermissao();

    // Simular carregamento inicial
    setTimeout(() => {
      this.carregar();
      this.carregandoPagina = false;
    }, 1500);
  }

  verificarPermissao() {
    const planoUsuario = localStorage.getItem('plano') || 'PESSOAL';
    const planoUpper = planoUsuario.toUpperCase();

    const podeAcessar = planoUpper === 'EMPRESARIAL' ||
      planoUpper.includes('EMPRESARIAL') ||
      planoUpper === 'PROFISSIONAL_VITALICIO' ||
      planoUpper.includes('VITALICIO') ||
      planoUpper === 'PROFISSIONAL_MENSAL' ||
      planoUpper.includes('MENSAL');

    if (!podeAcessar) {
      this.notificationService.showError('Upload CSV disponível apenas nos planos Profissional e Empresarial. Faça upgrade para continuar.');
      this.router.navigate(['/upgrade']);
      return;
    }
  }

  carregar() {
    this.carregando = true;

    // Obter ID do usuário autenticado
    const userId = this.getUserId();

    if (userId) {
      // Buscar Formulários do usuário específico
      this.csvService.listarTemplates().subscribe({
        next: (templates: Template[]) => {
          this.templates = templates;
          this.filtrarTemplates();
          this.carregando = false;
          console.log('✅ Templates carregados para usuário', userId, ':', templates.length);
        },
        error: (error: any) => {
          console.error('❌ Erro ao carregar templates:', error);
          this.notificationService.showError('Erro ao carregar templates. Tente novamente.');
          this.carregando = false;
        }
      });
    } else {
      // Fallback: Buscar Formulários gerais (sem usuário específico)
      this.csvService.listarTemplates().subscribe({
        next: (templates) => {
          this.templates = templates;
          this.filtrarTemplates();
          this.carregando = false;
          console.log('✅ Templates carregados (geral):', templates.length);
        },
        error: (error: any) => {
          console.error('❌ Erro ao carregar templates:', error);
          this.notificationService.showError('Erro ao carregar templates. Tente novamente.');
          this.carregando = false;
        }
      });
    }
  }

  /**
   * Obtém o ID do usuário autenticado
   */
  getUserId(): number | null {
    try {
      // 1. Tenta pegar do localStorage (userId)
      const userId = localStorage.getItem('userId');
      if (userId && !isNaN(Number(userId))) {
        return Number(userId);
      }

      // 2. Tenta pegar do token JWT
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.id && !isNaN(Number(payload.id))) {
          return Number(payload.id);
        }
      }

      // 3. Fallback para userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id && !isNaN(Number(user.id))) {
          return Number(user.id);
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Notifica a extensão sobre novos templates criados
   */
  private notificarExtensaoNovosTemplates(response: any): void {
    if (response.templates && Array.isArray(response.templates)) {
      console.log('🔔 Notificando extensão sobre novos templates...');

      // Notificar cada template individualmente
      response.templates.forEach((template: any) => {
        this.extensionSyncService.notificarNovoTemplate(
          template.id,
          template.nome
        ).subscribe({
          next: (success) => {
            if (success) {
              console.log(`✅ Extensão notificada sobre template: ${template.nome}`);
            } else {
              console.log(`⚠️ Falha ao notificar extensão sobre template: ${template.nome}`);
            }
          },
          error: (error) => {
            console.error(`❌ Erro ao notificar extensão sobre template ${template.nome}:`, error);
          }
        });
      });

      // Forçar sincronização geral
      this.extensionSyncService.forcarSincronizacao().subscribe({
        next: (success) => {
          if (success) {
            console.log('🔄 Sincronização forçada com extensão realizada');
          } else {
            console.log('⚠️ Falha na sincronização forçada com extensão');
          }
        },
        error: (error) => {
          console.error('❌ Erro na sincronização forçada:', error);
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.validarArquivo(file)) {
      this.selectedFile = file;
      console.log('📁 Arquivo selecionado:', file.name);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.validarArquivo(file)) {
        this.selectedFile = file;
        console.log('📁 Arquivo recebido via drag & drop:', file.name);
      }
    }
  }

  validarArquivo(file: File): boolean {
    // Verificar se arquivo está vazio
    if (file.size === 0) {
      this.notificationService.showError('Arquivo está vazio. Selecione um arquivo com conteúdo.');
      return false;
    }

    // Verificar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.notificationService.showError('Arquivo muito grande. Tamanho máximo: 5MB');
      return false;
    }

    // Verificar tipo de arquivo (CSV e Excel)
    const fileName = file.name.toLowerCase();
    const isCSV = file.type.includes('csv') || fileName.endsWith('.csv');
    const isExcel = file.type.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      this.notificationService.showError('Apenas arquivos CSV (.csv) e Excel (.xlsx, .xls) são aceitos.');
      return false;
    }

    // Verificar se arquivo pode estar corrompido (extensão não bate com tipo MIME)
    if (fileName.endsWith('.csv') && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      this.notificationService.showWarning('Arquivo pode estar corrompido ou ter extensão incorreta.');
    }

    if ((fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) && file.type && !file.type.includes('sheet') && !file.type.includes('excel')) {
      this.notificationService.showWarning('Arquivo Excel pode estar corrompido ou ter extensão incorreta.');
    }

    return true;
  }

  uploadArquivo() {
    if (!this.selectedFile) {
      this.notificationService.showWarning('Selecione um arquivo CSV ou Excel para fazer upload.');
      return;
    }

    // Validar tipo de arquivo
    const fileName = this.selectedFile.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      this.notificationService.showError('Por favor, selecione um arquivo CSV (.csv) ou Excel (.xlsx, .xls) válido.');
      return;
    }

    // Para arquivos Excel, processar normalmente (backend já suporta)
    if (isExcel) {
      this.validarEstruturaExcel();
      return;
    }

    // Validar formato básico do CSV
    if (isCSV) {
      this.validarEstruturaCsv();
    }
  }

  private validarEstruturaCsv() {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Verificar se arquivo está vazio
      if (!content || content.trim().length === 0) {
        this.notificationService.showError('Arquivo CSV está vazio.');
        return;
      }

      const lines = content.split('\n').filter(line => line.trim().length > 0);

      if (lines.length < 2) {
        this.notificationService.showError('Arquivo CSV deve ter pelo menos 2 linhas (cabeçalho + dados).');
        return;
      }

      const firstLine = lines[0];
      const columns = firstLine.split(',').map(col => col.trim());

      // Validar estrutura básica
      if (columns.length < 2) {
        this.notificationService.showError('Formato CSV inválido: deve ter pelo menos 2 colunas (NomeTemplate, DescricaoTemplate)');
        return;
      }

      // Verificar colunas obrigatórias
      const firstCol = (columns[0] || '').toLowerCase().replace(/"/g, '');
      const secondCol = (columns[1] || '').toLowerCase().replace(/"/g, '');

      if (!firstCol.includes('nome') && !firstCol.includes('template')) {
        this.notificationService.showError('Formato CSV inválido: primeira coluna deve conter "nome" ou "template" (ex: NomeTemplate)');
        return;
      }

      if (!secondCol.includes('descricao') && !secondCol.includes('desc')) {
        this.notificationService.showError('Formato CSV inválido: segunda coluna deve conter "descricao" ou "desc" (ex: DescricaoTemplate)');
        return;
      }

      // Validar dados nas linhas
      const dataLines = lines.slice(1);
      const templateNames = new Set<string>();
      let hasErrors = false;

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));

        // Verificar se linha tem dados suficientes
        if (row.length < 2) {
          this.notificationService.showError(`Linha ${i + 2}: dados insuficientes. Deve ter pelo menos nome e descrição.`);
          hasErrors = true;
          break;
        }

        // Verificar se nome do template está vazio
        if (!row[0] || row[0].trim().length === 0) {
          this.notificationService.showError(`Linha ${i + 2}: nome do template não pode estar vazio.`);
          hasErrors = true;
          break;
        }

        // Verificar se descrição está vazia
        if (!row[1] || row[1].trim().length === 0) {
          this.notificationService.showError(`Linha ${i + 2}: descrição do template não pode estar vazia.`);
          hasErrors = true;
          break;
        }

        // Verificar dados duplicados
        const templateName = row[0].toLowerCase();
        if (templateNames.has(templateName)) {
          this.notificationService.showError(`Linha ${i + 2}: template "${row[0]}" duplicado. Nomes de templates devem ser únicos.`);
          hasErrors = true;
          break;
        }
        templateNames.add(templateName);

        // Validar tipos de dados nos campos (se houver campos extras)
        if (row.length > 2) {
          const fieldPairs = Math.floor((row.length - 2) / 3); // Nome, Valor, Tipo
          for (let j = 0; j < fieldPairs; j++) {
            const fieldIndex = 2 + (j * 3);
            const fieldName = row[fieldIndex];
            const fieldValue = row[fieldIndex + 1];
            const fieldType = row[fieldIndex + 2];

            if (fieldName && fieldName.trim().length > 0) {
              // Validar se tipo é válido
              const validTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'date'];
              if (fieldType && !validTypes.includes(fieldType.toLowerCase())) {
                this.notificationService.showWarning(`Linha ${i + 2}: tipo "${fieldType}" pode não ser suportado. Tipos válidos: ${validTypes.join(', ')}`);
              }

              // Validar formato de email se tipo for email
              if (fieldType && fieldType.toLowerCase() === 'email' && fieldValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(fieldValue)) {
                  this.notificationService.showWarning(`Linha ${i + 2}: valor "${fieldValue}" não parece ser um email válido.`);
                }
              }
            }
          }
        }
      }

      if (!hasErrors) {
        // Se chegou até aqui, o formato está correto, continuar com o upload
        this.fazerUpload();
      }
    };

    reader.onerror = () => {
      this.notificationService.showError('Erro ao ler arquivo. O arquivo pode estar corrompido.');
    };

    reader.readAsText(this.selectedFile, 'UTF-8');
  }

  private validarEstruturaExcel() {
    if (!this.selectedFile) return;

    // Para Excel, apenas fazer upload direto - o backend fará a validação
    // O backend já suporta Excel completamente
    this.fazerUpload();
  }

  private fazerUpload() {
    if (!this.selectedFile) {
      this.notificationService.showError('Nenhum arquivo selecionado.');
      return;
    }

    // Log para debug
    console.log('📁 Arquivo selecionado:', {
      nome: this.selectedFile.name,
      tamanho: this.selectedFile.size,
      tipo: this.selectedFile.type
    });

    this.carregando = true;

    this.csvService.uploadCsv(this.selectedFile).subscribe({
      next: (response: any) => {
        console.log('✅ Upload realizado com sucesso:', response);

        // Usar mensagem da API ou construir mensagem com dados
        const mensagem = response?.message || `CSV processado com sucesso! ${response.templatesCriados} templates criados.`;
        this.notificationService.showSuccess(mensagem);

        // Limpar arquivo selecionado
        this.selectedFile = null;

        // Notificar extensão sobre novos templates
        this.notificarExtensaoNovosTemplates(response);

        // Recarregar dados
        this.carregar();

        // Mudar para aba de listagem
        this.activeTab = 'list';
      },
      error: (error) => {
        console.error('❌ Erro no upload:', error);

        let mensagem = 'Erro ao processar CSV. Tente novamente.';
        if (error.error?.message) {
          mensagem = error.error.message;
        }

        this.notificationService.showError(mensagem);

        this.carregando = false;
      }
    });
  }

  filtrarTemplates() {
    if (!this.searchTerm.trim()) {
      this.filteredTemplates = this.templates;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTemplates = this.templates.filter(template =>
        template.nome?.toLowerCase().includes(term) ||
        template.descricao?.toLowerCase().includes(term)
      );
    }
  }

  onSearchChange() {
    this.filtrarTemplates();
    this.currentPage = 1;
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTemplates.length / this.pageSize);
  }

  get paginatedTemplates() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTemplates.slice(startIndex, endIndex);
  }

  deletarTemplate(template: Template) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        templateName: template.nome,
        templateId: template.id
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregando = true;

        this.csvService.deletarTemplate(template.id).subscribe({
          next: () => {
            console.log('✅ Template deletado:', template.nome);

            this.notificationService.showSuccess('Template deletado com sucesso!');

            // Recarregar dados
            this.carregar();
          },
          error: (error) => {
            console.error('❌ Erro ao deletar template:', error);

            this.notificationService.showError('Erro ao deletar template. Tente novamente.');

            this.carregando = false;
          }
        });
      }
    });
  }

  limparArquivo() {
    this.selectedFile = null;
  }

  downloadExemplo() {
    // Criar conteúdo do CSV de exemplo com formato EXATO esperado pelo backend
    // O backend espera: primeira coluna deve conter 'nome' ou 'template'
    //                   segunda coluna deve conter 'descricao' ou 'desc'
    const csvContent = `NomeTemplate,DescricaoTemplate,Campo1,Valor1,Tipo1,Campo2,Valor2,Tipo2
Login Google,Template para login no Google,email,usuario@email.com,email,senha,123456,password
Login Facebook,Template para login no Facebook,email,usuario@email.com,email,senha,123456,password
Cadastro Site,Template para cadastro em site,usuario,usuario123,text,email,usuario@email.com,email
Formulário Contato,Template para formulário de contato,nome,João Silva,text,email,joao@email.com,email`;

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo-templates.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    // Mostrar mensagem de sucesso com informações sobre o formato
    this.notificationService.showSuccess('Arquivo de exemplo baixado! Formato: NomeTemplate,DescricaoTemplate,Campo1,Valor1,Tipo1...');
  }
} 