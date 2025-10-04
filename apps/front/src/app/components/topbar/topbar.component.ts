import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { TemplateCsvService } from '../../services/template-csv.service';
import { MobileMenuService } from '../../services/mobile-menu.service';
import { Subscription, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { getPlanoNome } from '../../shared/planos-config';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <!-- Topbar Moderna para Área Logada -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
      <div class="flex items-center justify-between h-full px-3">
        
        <!-- Logo Compacto (esquerda) - Padrão dashboard/área logada -->
        <div class="flex items-center gap-2">
          <a routerLink="" class="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <img src="assets/images/formsync-logo.svg" alt="FormSync Logo" class="w-8 h-8">
            <span class="text-xl sm:text-1xl font-black text-blue-600">FormSync</span>
          </a>
        </div>

        <!-- Ações Centrais (centro) -->
        <div class="flex items-center gap-3" *ngIf="authService.estaAutenticado()">
          <!-- Pesquisa Global -->
          <div class="hidden md:flex relative">
            <div class="flex items-center bg-gray-50 rounded-lg px-2 py-1 min-w-48 border-2 transition-colors duration-200"
                 [ngClass]="searchFocused ? 'border-indigo-500 bg-white shadow-lg' : 'border-transparent'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                   class="mr-2 transition-colors duration-200"
                   [ngClass]="searchFocused ? 'text-indigo-500' : 'text-gray-400'">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                #searchInput
                type="text" 
                placeholder="Buscar Formulários..." 
                [(ngModel)]="searchTerm"
                (input)="onSearchInput($event)"
                (focus)="onSearchFocus()"
                (blur)="onSearchBlur()"
                (keydown)="onSearchKeydown($event)"
                class="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
                autocomplete="off"
              />
              <kbd class="hidden lg:inline-block px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded border border-gray-200 transition-opacity duration-200"
                   [ngClass]="searchTerm ? 'opacity-0' : 'opacity-100'">⌘K</kbd>
              
              <!-- Loading spinner -->
              <svg *ngIf="searchLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" class="animate-spin text-indigo-500 ml-2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.3"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              <!-- Clear button -->
              <button *ngIf="searchTerm && !searchLoading" 
                      (click)="clearSearch()"
                      class="ml-2 p-0.5 hover:bg-gray-200 rounded transition-colors duration-200">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Dropdown de Resultados -->
            <div *ngIf="showSearchResults" 
                 class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
              
              <!-- Loading State -->
              <div *ngIf="searchLoading" class="p-6 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p class="text-sm text-gray-500">Buscando templates...</p>
              </div>

              <!-- Resultados -->
              <div *ngIf="!searchLoading && searchResults.length > 0" class="py-2">
                <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  {{ searchResults.length }} template{{ searchResults.length > 1 ? 's' : '' }} encontrado{{ searchResults.length > 1 ? 's' : '' }}
                </div>
                
                <div *ngFor="let template of searchResults; let i = index" 
                     (click)="selectTemplate(template)"
                     (mouseenter)="selectedIndex = i"
                     class="px-3 py-2 cursor-pointer transition-colors duration-200 border-b border-gray-50 last:border-b-0"
                     [ngClass]="selectedIndex === i ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50'">
                  
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <!-- Nome do Formulário -->
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="text-sm font-medium text-gray-900 truncate" [innerHTML]="highlightMatch(template.nome, searchTerm)"></h4>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="template.totalUso > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                          {{ template.totalUso || 0 }} uso{{ (template.totalUso || 0) !== 1 ? 's' : '' }}
                        </span>
                      </div>

                      <!-- Descrição -->
                      <p *ngIf="template.descricao" class="text-xs text-gray-600 mb-2 line-clamp-1" [innerHTML]="highlightMatch(template.descricao, searchTerm)"></p>

                      <!-- Campos Preview -->
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let campo of template.campos?.slice(0, 3)" 
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                          {{ campo.nome }}
                        </span>
                        <span *ngIf="template.campos?.length > 3" 
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          +{{ template.campos.length - 3 }}
                        </span>
                      </div>
                    </div>

                    <!-- Ícone de Template -->
                    <div class="ml-3 flex-shrink-0">
                      <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="9" x2="15" y2="9"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nenhum Resultado -->
              <div *ngIf="!searchLoading && searchResults.length === 0 && searchTerm" class="p-4 text-center">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-900 mb-1">Nenhum formulário encontrado</h3>
                <p class="text-xs text-gray-500 mb-3">Tente buscar por um nome diferente ou crie um Novo Formulário.</p>
                <button (click)="criarNovoTemplate()" class="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                  Criar Formulário
                </button>
              </div>

              <!-- Footer com dicas -->
              <div *ngIf="!searchLoading && searchResults.length > 0" class="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>Use ↑↓ para navegar</span>
                  <span>Enter para selecionar</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Criar Novo (Ação Principal) -->
          <button 
            (click)="criarNovoTemplate()"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span>Novo Formulário</span>
          </button>
        </div>

        <!-- Área do Usuário (direita) -->
        <div class="flex items-center gap-2">
          <ng-container *ngIf="authService.estaAutenticado() && nomeUsuario; else guestActions">
            
            <!-- Notificações 
                  <button class="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200" matTooltip="Notificações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button> 
            -->
      

            <!-- Ajuda 
                    <button class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200" matTooltip="Ajuda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button> 
            -->
    



            <!-- Menu do Usuário -->
            <div class="flex items-center gap-2">
              <!-- Info do Usuário (desktop) -->
              <div class="hidden lg:flex flex-col items-end">
                <span class="text-sm font-medium text-gray-900"><span class="text-sm font-normal text-gray-900">Bem vindo,</span> {{ nomeUsuario }}!</span>
              </div>

              <!-- Avatar -->
              <div class="flex items-center gap-1.5">
                <!-- Botão de Sair -->
                <button (click)="logout()" 
                        class="px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm">
                  Sair
                </button>
              </div>
            </div>

          </ng-container>

          <!-- Ações para usuários não logados -->
          <ng-template #guestActions>
            <a routerLink="/login" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10,17 15,12 10,7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span class="hidden sm:block">Login</span>
            </a>
            <a routerLink="/registrar" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              <span class="hidden sm:block">Registrar</span>
            </a>
          </ng-template>

          <!-- Menu Mobile -->
          <button (click)="toggleMobileMenu()" class="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 bg-red-500" matTooltip="Menu" style="z-index: 9999; position: relative;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Spacer para compensar o header fixo -->
    <div class="h-14"></div>
  `,
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit, OnDestroy {
  nomeUsuario: string = ''
  mobileMenuOpen = false;
  plano: string = '';
  private usuarioSub?: Subscription;
  private planoSub?: Subscription;

  toggleMobileMenu() {
    this.mobileMenuService.toggleMobileMenu();
  }

  // Propriedades da busca
  searchTerm: string = '';
  searchResults: any[] = [];
  searchLoading: boolean = false;
  searchFocused: boolean = false;
  showSearchResults: boolean = false;
  selectedIndex: number = -1;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService,
    private templateService: TemplateCsvService,
    private mobileMenuService: MobileMenuService
  ) { }

  ngOnInit() {
    // Inscrever-se no observable de usuário
    this.usuarioSub = this.authService.usuario$.subscribe(nome => {
      this.nomeUsuario = this.formatarNome(nome || '');
    });

    // Inscrever-se no observable de plano (NOVO!)
    this.planoSub = this.authService.plano$.subscribe(plano => {
      this.plano = plano || 'PESSOAL';
      console.log(`🔄 TopBar: Plano atualizado para ${this.plano}`);
    });

    // Carregar dados iniciais
    const nomeSalvo = localStorage.getItem('nome');
    if (nomeSalvo) {
      this.nomeUsuario = this.formatarNome(nomeSalvo);
    }

    // Configurar busca com debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnDestroy() {
    this.usuarioSub?.unsubscribe();
    this.planoSub?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  criarNovoTemplate() {
    this.router.navigate(['/formularios']);
  }

  planoNome(plano: string): string {
    return getPlanoNome(plano);
  }

  getInitials(nome: string): string {
    if (!nome) return 'U';

    const partes = nome.trim().split(' ').filter(parte => parte.length > 0);

    if (partes.length === 0) return 'U';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();

    // Pega primeira letra do primeiro e último nome
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  // Métodos da busca
  onSearchInput(event: any) {
    const term = event.target.value;
    this.searchTerm = term;
    this.selectedIndex = -1;

    if (term.trim()) {
      this.showSearchResults = true;
      this.searchSubject.next(term.trim());
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  onSearchFocus() {
    this.searchFocused = true;
    if (this.searchTerm.trim()) {
      this.showSearchResults = true;
    }
  }

  onSearchBlur() {
    // Delay para permitir cliques nos resultados
    setTimeout(() => {
      this.searchFocused = false;
      this.showSearchResults = false;
    }, 200);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (!this.showSearchResults || this.searchResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
          this.selectTemplate(this.searchResults[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.clearSearch();
        break;
    }
  }

  performSearch(term: string) {
    if (!term.trim()) {
      this.searchResults = [];
      this.searchLoading = false;
      return;
    }

    this.searchLoading = true;

    this.templateService.listarTemplates().subscribe({
      next: (templates) => {
        // Filtrar templates que correspondem ao termo de busca
        this.searchResults = templates.filter(template =>
          this.matchesSearchTerm(template, term)
        ).slice(0, 10); // Limitar a 10 resultados

        this.searchLoading = false;
      },
      error: (error) => {
        console.error('Erro ao Buscar Formulários:', error);
        this.searchResults = [];
        this.searchLoading = false;
      }
    });
  }

  private matchesSearchTerm(template: any, term: string): boolean {
    const lowerTerm = term.toLowerCase();

    // Buscar no nome
    if (template.nome?.toLowerCase().includes(lowerTerm)) {
      return true;
    }

    // Buscar na descrição
    if (template.descricao?.toLowerCase().includes(lowerTerm)) {
      return true;
    }

    // Buscar nos campos
    if (template.campos?.some((campo: any) =>
      campo.nome?.toLowerCase().includes(lowerTerm) ||
      campo.valor?.toLowerCase().includes(lowerTerm)
    )) {
      return true;
    }

    return false;
  }

  highlightMatch(text: string, term: string): string {
    if (!text || !term) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }

  selectTemplate(template: any) {
    // Navegar para a página de templates com o template selecionado
    this.router.navigate(['/templates'], {
      queryParams: { selected: template.id }
    });
    this.clearSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.selectedIndex = -1;
    this.searchLoading = false;
  }

  // Listener para fechar busca ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.relative');

    if (!searchContainer || !searchContainer.contains(target)) {
      this.showSearchResults = false;
    }
  }

  private formatarNome(nome: string): string {
    if (!nome) return '';

    // Remove espaços extras e quebra em partes
    const partes = nome.trim().split(' ').filter(parte => parte.length > 0);

    if (partes.length === 0) return '';

    // Se tem apenas uma parte, retorna ela
    if (partes.length === 1) return partes[0];

    // Se tem duas ou mais partes, retorna apenas o primeiro nome
    return partes[0];
  }
} 