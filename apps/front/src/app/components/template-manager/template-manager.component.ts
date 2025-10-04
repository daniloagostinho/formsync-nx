import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NotificationService } from '../../services/notification.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LimiteAlertService } from '../../services/limite-alert.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { TemplateCsvService, Template, CampoTemplate } from '../../services/template-csv.service';
import { SimpleTemplateService, SimpleTemplate } from '../../services/simple-template.service';
import { ConfirmDeleteDialogComponent, ConfirmDeleteData } from './confirm-delete-dialog.component';

@Component({
    selector: 'app-template-manager',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatChipsModule,
        MatDialogModule,
        MatPaginatorModule,
        MatTabsModule,
        MatExpansionModule,
        MatListModule,
        MatDividerModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        NgxMaskDirective,
        SidebarComponent,
        FooterComponent
    ],
    templateUrl: './template-manager.component.html',
    styleUrls: ['./template-manager.component.css']
})
export class TemplateManagerComponent implements OnInit {

    templates: Template[] = [];
    carregandoPagina = true;
    loading = false;
    templateForm: FormGroup;
    isEditing = false;
    editingTemplateId: number | null = null;
    activeTab: 0 | 1 | 2 = 0;

    // Sistema de tratamento de erros
    errorMessage: string = '';
    warningMessage: string = '';

    // Estado dos dropdowns de tipo
    tipoDropdownOpen: boolean[] = [];

    // Paginação para campos do formulário
    paginaCampos = 0;
    tamanhoPaginaCampos = 3;
    totalPaginasCampos = 0;
    totalElementosCampos = 0;

    // Tipos de campo disponíveis
    tiposCampo = [
        // Campos de texto básicos
        { value: 'text', label: 'Texto' },
        { value: 'email', label: 'E-mail' },
        { value: 'password', label: 'Senha' },
        { value: 'number', label: 'Número' },
        { value: 'tel', label: 'Telefone' },
        { value: 'url', label: 'URL' },

        // Campos de texto com validação específica
        { value: 'cpf', label: 'CPF' },
        { value: 'cnpj', label: 'CNPJ' },
        { value: 'cep', label: 'CEP' },
        { value: 'currency', label: 'Moeda' },

        // Campos de data e hora
        { value: 'date', label: 'Data' },
        { value: 'time', label: 'Horário' },
        { value: 'datetime-local', label: 'Data e Hora' },

        // Campos de área de texto
        { value: 'textarea', label: 'Área de Texto' },

        // Campos de seleção
        { value: 'select', label: 'Seleção' },
        { value: 'checkbox', label: 'Caixa de Seleção' },
        { value: 'radio', label: 'Botão de Opção' },

        // Campos especiais
        { value: 'hidden', label: 'Campo Oculto' },
        { value: 'file', label: 'Arquivo' },
        { value: 'color', label: 'Cor' },
        { value: 'range', label: 'Intervalo' },
        { value: 'search', label: 'Pesquisa' }
    ];

    // Máscaras dinâmicas baseadas no tipo
    mascaras: { [key: string]: string } = {
        'cpf': '000.000.000-00',
        'cnpj': '00.000.000/0000-00',
        'tel': '(00) 00000-0000',
        'cep': '00000-000',
        'currency': 'separator.2',
        'date': '00/00/0000',
        'time': '00:00'
    };

    // Patterns para validação das máscaras
    patterns = {
        '0': { pattern: new RegExp('\\d') },
        'A': { pattern: new RegExp('[a-zA-Z0-9]') }
    };

    constructor(
        private fb: FormBuilder,
        private templateCsvService: TemplateCsvService,
        private templateService: SimpleTemplateService,
        private notificationService: NotificationService,
        private errorHandler: ErrorHandlerService,
        private limiteAlertService: LimiteAlertService,
        private dialog: MatDialog
    ) {
        this.templateForm = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(2)]],
            descricao: [''],
            campos: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.carregarTemplates();
        this.adicionarCampo(); // Adiciona um campo inicial
        this.atualizarPaginacaoCampos();
    }

    /**
     * Carrega templates salvos do backend
     */
    carregarTemplates(): void {
        console.log('🚀 [DEBUG] carregarTemplates() chamado');
        this.carregandoPagina = true;

        // Buscar Formulários do usuário específico (usuarioId=6)
        console.log('📡 [DEBUG] Fazendo requisição para listarTemplates()...');

        this.templateCsvService.listarTemplates().subscribe({
            next: (templates) => {
                console.log('✅ [DEBUG] Templates recebidos com sucesso:', templates);
                this.templates = templates;
                this.carregandoPagina = false;
                console.log('Templates do usuário carregados:', templates);
            },
            error: (error) => {
                console.error('❌ [DEBUG] Erro ao carregar templates:', error);
                this.carregandoPagina = false;

                // Verificar se é erro de limite
                const limiteInfo = this.limiteAlertService.detectarErroLimite(error);
                if (limiteInfo.isLimite) {
                    this.setWarning(limiteInfo.mensagem);
                    return;
                }

                const mensagem = this.errorHandler.getErrorMessage(error);
                this.setError(mensagem);
            }
        });
    }

    /**
     * Retorna o FormArray de campos
     */
    get camposArray(): FormArray {
        return this.templateForm.get('campos') as FormArray;
    }

    /**
     * Retorna os campos paginados para exibição
     */
    get camposPaginados(): any[] {
        const startIndex = this.paginaCampos * this.tamanhoPaginaCampos;
        const endIndex = startIndex + this.tamanhoPaginaCampos;
        return this.camposArray.controls.slice(startIndex, endIndex);
    }

    /**
     * Atualiza a paginação dos campos
     */
    atualizarPaginacaoCampos(): void {
        this.totalElementosCampos = this.camposArray.length;
        this.totalPaginasCampos = Math.ceil(this.totalElementosCampos / this.tamanhoPaginaCampos);

        // Ajusta a página atual se necessário
        if (this.totalPaginasCampos === 0) {
            this.paginaCampos = 0;
        } else if (this.paginaCampos >= this.totalPaginasCampos) {
            this.paginaCampos = this.totalPaginasCampos - 1;
        } else if (this.paginaCampos < 0) {
            this.paginaCampos = 0;
        }
    }

    /**
     * Manipula mudanças de página dos campos
     */
    onPageChangeCampos(event: PageEvent): void {
        this.paginaCampos = event.pageIndex;
        this.tamanhoPaginaCampos = event.pageSize;
        this.atualizarPaginacaoCampos();
    }

    /**
     * Adiciona um novo campo ao template
     */
    adicionarCampo(): void {
        const campo = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(2)]],
            valor: ['', [Validators.required]],
            tipo: ['text', [Validators.required]],
            ordem: [this.camposArray.length + 1]
        });

        this.camposArray.push(campo);

        // Inicializa o estado do dropdown para o novo campo
        this.tipoDropdownOpen.push(false);

        // Atualiza a paginação
        this.atualizarPaginacaoCampos();

        // Vai para a última página se necessário
        if (this.paginaCampos < this.totalPaginasCampos - 1) {
            this.paginaCampos = this.totalPaginasCampos - 1;
        }
    }

    /**
     * Remove um campo do template
     */
    removerCampo(index: number): void {
        const indexReal = this.getCampoIndex(index);
        this.camposArray.removeAt(indexReal);

        // Remove o estado do dropdown correspondente
        this.tipoDropdownOpen.splice(indexReal, 1);

        // Reordena os campos restantes usando o método centralizado
        this.reordenarCampos();

        // Atualiza a paginação
        this.atualizarPaginacaoCampos();
    }

    /**
     * Move um campo para cima na ordem
     */
    moverCampoParaCima(index: number): void {
        const indexReal = this.getCampoIndex(index);
        if (indexReal > 0) {
            // Troca as posições no FormArray
            const campoAtual = this.camposArray.at(indexReal);
            const campoAnterior = this.camposArray.at(indexReal - 1);

            // Troca as posições
            this.camposArray.setControl(indexReal, campoAnterior);
            this.camposArray.setControl(indexReal - 1, campoAtual);

            // Reordena todos os campos para garantir sequência
            this.reordenarCampos();

            // Atualiza a paginação
            this.atualizarPaginacaoCampos();
        }
    }

    /**
     * Move um campo para baixo na ordem
     */
    moverCampoParaBaixo(index: number): void {
        const indexReal = this.getCampoIndex(index);
        if (indexReal < this.camposArray.length - 1) {
            // Troca as posições no FormArray
            const campoAtual = this.camposArray.at(indexReal);
            const campoProximo = this.camposArray.at(indexReal + 1);

            // Troca as posições
            this.camposArray.setControl(indexReal, campoProximo);
            this.camposArray.setControl(indexReal + 1, campoAtual);

            // Reordena todos os campos para garantir sequência
            this.reordenarCampos();

            // Atualiza a paginação
            this.atualizarPaginacaoCampos();
        }
    }

    /**
     * Reordena todos os campos para garantir sequência correta
     */
    private reordenarCampos(): void {
        this.camposArray.controls.forEach((control, index) => {
            control.patchValue({ ordem: index + 1 });
        });
    }

    /**
     * Retorna o índice real do campo no FormArray baseado na paginação
     */
    getCampoIndex(indexPaginado: number): number {
        const indexReal = this.paginaCampos * this.tamanhoPaginaCampos + indexPaginado;

        // Validar se o índice está dentro dos limites
        if (indexReal < 0 || indexReal >= this.camposArray.length) {
            console.warn('Índice de campo fora dos limites:', indexReal, 'Array length:', this.camposArray.length);
            return Math.max(0, Math.min(indexReal, this.camposArray.length - 1));
        }

        return indexReal;
    }

    /**
     * Salva o template (cria ou atualiza)
     */
    salvarTemplate(): void {
        if (this.templateForm.valid) {
            this.loading = true;

            const templateData: Template = this.templateForm.value;

            if (this.isEditing && this.editingTemplateId) {
                // Atualiza template existente
                this.templateService.atualizarTemplate(this.editingTemplateId, templateData).subscribe({
                    next: (templateAtualizado: any) => {
                        if (templateAtualizado) {
                            const mensagem = templateAtualizado?.message || 'Template atualizado com sucesso!';
                            this.notificationService.showSuccess(mensagem);
                            this.carregarTemplates();
                            this.resetForm();
                        }
                        this.loading = false;
                    },
                    error: (error: any) => {
                        console.error('Erro ao atualizar template:', error);

                        // Verificar se é erro de limite
                        const limiteInfo = this.limiteAlertService.detectarErroLimite(error);
                        if (limiteInfo.isLimite) {
                            this.setWarning(limiteInfo.mensagem);
                            this.loading = false;
                            return;
                        }

                        const mensagem = this.errorHandler.getErrorMessage(error);
                        this.setError(mensagem);
                        this.loading = false;
                    }
                });
            } else {
                // Cria novo template
                this.templateService.criarTemplate(templateData).subscribe({
                    next: (novoTemplate: SimpleTemplate | null) => {
                        if (novoTemplate) {
                            this.notificationService.showSuccess('Template criado com sucesso!');
                            this.resetForm();
                            this.carregarTemplates();
                        }
                        this.loading = false;
                    },
                    error: (error: any) => {
                        console.error('Erro ao criar template:', error);

                        // Verificar se é erro de limite
                        const limiteInfo = this.limiteAlertService.detectarErroLimite(error);
                        if (limiteInfo.isLimite) {
                            this.setWarning(limiteInfo.mensagem);
                            this.loading = false;
                            return;
                        }

                        const mensagem = this.errorHandler.getErrorMessage(error);
                        this.setError(mensagem);
                        this.loading = false;
                    }
                });
            }
        } else {
            this.marcarCamposInvalidos();
        }
    }

    /**
     * Edita um template existente
     */
    editarTemplate(template: Template): void {
        this.isEditing = true;
        this.editingTemplateId = template.id || null;

        // Limpa o form array
        while (this.camposArray.length !== 0) {
            this.camposArray.removeAt(0);
        }

        // Limpa o estado dos dropdowns
        this.tipoDropdownOpen = [];

        // Preenche o formulário com os dados do template
        this.templateForm.patchValue({
            nome: template.nome,
            descricao: template.descricao
        });

        // Adiciona os campos
        template.campos.forEach(campo => {
            const campoForm = this.fb.group({
                nome: [campo.nome, [Validators.required, Validators.minLength(2)]],
                valor: [campo.valor, [Validators.required]],
                tipo: [campo.tipo || 'text', [Validators.required]],
                ordem: [campo.ordem || 1]
            });

            this.camposArray.push(campoForm);

            // Inicializa o estado do dropdown para cada campo existente
            this.tipoDropdownOpen.push(false);
        });

        // Atualiza a paginação após carregar os campos
        this.atualizarPaginacaoCampos();

        // Reseta para a primeira página
        this.paginaCampos = 0;

        this.activeTab = 0; // Volta para a aba de edição
    }

    /**
     * Remove um template
     */
    removerTemplate(templateId: number): void {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
            data: {
                templateName: template.nome,
                templateId: templateId
            } as ConfirmDeleteData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.templateCsvService.deletarTemplate(templateId).subscribe({
                    next: () => {
                        // API não retorna mensagem para delete, usar mensagem padrão
                        this.notificationService.showSuccess('Template removido com sucesso!');
                        this.carregarTemplates();
                    },
                    error: (error: any) => {
                        console.error('Erro ao remover template:', error);
                        const mensagem = error.error?.message || 'Erro ao remover template';
                        this.setError(mensagem);
                    }
                });
            }
        });
    }

    /**
     * Duplica um template
     */
    duplicarTemplate(template: Template): void {
        this.loading = true;

        // Criar um novo objeto do tipo SimpleTemplate (sem ID obrigatório)
        const templateDuplicado: SimpleTemplate = {
            nome: `${template.nome} (Cópia)`,
            descricao: template.descricao,
            campos: template.campos.map(campo => ({
                nome: campo.nome,
                valor: campo.valor,
                tipo: campo.tipo,
                ordem: campo.ordem
            })),
            dataCriacao: new Date().toISOString()
        };

        this.templateService.criarTemplate(templateDuplicado).subscribe({
            next: (novoTemplate: SimpleTemplate | null) => {
                if (novoTemplate) {
                    this.notificationService.showSuccess('Template duplicado com sucesso!');
                    this.carregarTemplates(); // Recarrega do backend
                }
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Erro ao duplicar template:', error);

                // Verificar se é erro de limite
                const limiteInfo = this.limiteAlertService.detectarErroLimite(error);
                if (limiteInfo.isLimite) {
                    this.setWarning(limiteInfo.mensagem);
                    this.loading = false;
                    return;
                }

                const mensagem = this.errorHandler.getErrorMessage(error);
                this.setError(mensagem);
                this.loading = false;
            }
        });
    }

    /**
     * Reseta o formulário
     */
    resetForm(): void {
        this.templateForm.reset();
        this.isEditing = false;
        this.editingTemplateId = null;

        // Limpa o form array
        while (this.camposArray.length !== 0) {
            this.camposArray.removeAt(0);
        }

        // Limpa o estado dos dropdowns
        this.tipoDropdownOpen = [];

        this.adicionarCampo(); // Adiciona um campo inicial
    }

    /**
     * Marca todos os campos inválidos como touched
     */
    marcarCamposInvalidos(): void {
        Object.keys(this.templateForm.controls).forEach(key => {
            const control = this.templateForm.get(key);
            if (control?.invalid) {
                control.markAsTouched();
            }
        });

        // Marca campos do array também
        this.camposArray.controls.forEach(control => {
            if (control instanceof FormGroup) {
                Object.keys(control.controls).forEach(key => {
                    const campoControl = control.get(key);
                    if (campoControl?.invalid) {
                        campoControl.markAsTouched();
                    }
                });
            }
        });
    }

    /**
     * Formata a data para exibição
     */
    formatarData(data: string): string {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    /**
     * Formata o tempo desde o último uso
     */
    formatarTempoUso(data: string): string {
        const agora = new Date();
        const ultimoUso = new Date(data);
        const diffMs = agora.getTime() - ultimoUso.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hoje';
        } else if (diffDays === 1) {
            return 'Ontem';
        } else if (diffDays < 7) {
            return `${diffDays} dias atrás`;
        } else {
            return this.formatarData(data);
        }
    }

    /**
     * Obtém a máscara baseada no tipo do campo
     */
    obterMascara(tipo: string): string | null {
        return this.mascaras[tipo] || null;
    }

    /**
     * Obtém o placeholder baseado no tipo do campo
     */
    obterPlaceholder(tipo: string): string {
        const placeholders: { [key: string]: string } = {
            'text': 'Digite o texto',
            'email': 'exemplo@email.com',
            'password': '••••••••',
            'number': '123456',
            'tel': '(11) 99999-9999',
            'url': 'https://exemplo.com',
            'cpf': '000.000.000-00',
            'cnpj': '00.000.000/0000-00',
            'cep': '00000-000',
            'currency': 'R$ 1.000,00',
            'date': '01/01/2024',
            'time': '14:30',
            'datetime-local': '01/01/2024 14:30',
            'textarea': 'Digite o texto longo',
            'select': 'Selecione uma opção',
            'checkbox': 'true/false ou sim/não',
            'radio': 'Opção selecionada',
            'hidden': 'Valor oculto',
            'file': 'Selecione um arquivo',
            'color': '#000000',
            'range': '0-100',
            'search': 'Digite para pesquisar'
        };
        return placeholders[tipo] || 'Digite o valor';
    }

    /**
     * Verifica se a tab está ativa
     */
    isTabActive(tabIndex: number): boolean {
        return this.activeTab === tabIndex;
    }

    /**
 * Manipula mudança de aba
 */
    onTabChange(tabIndex: 0 | 1 | 2): void {
        console.log('🔄 [DEBUG] onTabChange chamado com tabIndex:', tabIndex);
        this.activeTab = tabIndex;

        // Se for a aba "Criar Formulário" (índice 0), reseta o formulário
        if (tabIndex === 0) {
            console.log('🔄 Mudando para aba Criar Formulário - resetando formulário...');
            this.resetForm();
        }

        // Se for a aba "Meus Formulários" (índice 1) e não estiver carregando, carrega os templates
        if (tabIndex === 1 && !this.carregandoPagina && this.templates.length === 0) {
            console.log('🔄 Mudando para aba Meus Formulários - carregando templates...');
            this.carregarTemplates();
        }
    }

    /**
     * Toggle do dropdown de tipo
     */
    toggleTipoDropdown(index: number): void {
        const indexReal = this.getCampoIndex(index);

        // Verificar se o índice é válido
        if (indexReal < 0 || indexReal >= this.tipoDropdownOpen.length) {
            console.warn('Índice de dropdown inválido:', indexReal);
            return;
        }

        this.tipoDropdownOpen[indexReal] = !this.tipoDropdownOpen[indexReal];
    }

    /**
     * Seleciona um tipo para o campo
     */
    selectTipo(index: number, tipoValue: string): void {
        // Validar se o tipo é válido
        const tipoValido = this.tiposCampo.find(t => t.value === tipoValue);
        if (!tipoValido) {
            this.setError('Tipo de campo inválido selecionado');
            return;
        }

        const indexReal = this.getCampoIndex(index);
        const campo = this.camposArray.at(indexReal);
        if (campo) {
            campo.patchValue({ tipo: tipoValue });
            this.tipoDropdownOpen[indexReal] = false;

            // Limpar valor se o tipo mudou para um que não precisa de valor
            if (tipoValue === 'hidden') {
                campo.patchValue({ valor: '' });
            }
        }
    }

    /**
     * Obtém o texto do tipo selecionado
     */
    getTipoText(tipoValue: string): string {
        const tipo = this.tiposCampo.find(t => t.value === tipoValue);
        return tipo ? tipo.label : 'Selecione o tipo';
    }

    /**
     * Verifica se o campo é de seleção (select, checkbox, radio)
     */
    isCampoSelecao(tipo: string): boolean {
        return tipo === 'select' || tipo === 'checkbox' || tipo === 'radio';
    }

    /**
     * Fecha todos os dropdowns quando clica fora
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.tipo-dropdown-container')) {
            this.tipoDropdownOpen = this.tipoDropdownOpen.map(() => false);
        }
    }

    /**
     * Limpa mensagem de erro
     */
    clearError(): void {
        this.errorMessage = '';
    }

    /**
     * Limpa mensagem de aviso
     */
    clearWarning(): void {
        this.warningMessage = '';
    }

    /**
     * Define mensagem de erro
     */
    setError(message: string): void {
        this.errorMessage = message;
        this.warningMessage = ''; // Limpa avisos quando há erro

        // Auto-limpeza após 10 segundos
        setTimeout(() => {
            if (this.errorMessage === message) {
                this.clearError();
            }
        }, 10000);
    }

    /**
     * Define mensagem de aviso
     */
    setWarning(message: string): void {
        this.warningMessage = message;
        this.errorMessage = ''; // Limpa erros quando há aviso

        // Auto-limpeza após 8 segundos
        setTimeout(() => {
            if (this.warningMessage === message) {
                this.clearWarning();
            }
        }, 8000);
    }
}
