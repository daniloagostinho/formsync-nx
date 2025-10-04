import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  @Input() appLazyImage: string = '';
  @Input() placeholder: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupLazyLoading();
  }

  private setupLazyLoading() {
    const img = this.el.nativeElement;
    
    // Definir placeholder inicial
    this.renderer.setAttribute(img, 'src', this.placeholder);
    
    // Verificar se o Intersection Observer é suportado
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(img);
          }
        });
      });
      
      observer.observe(img);
    } else {
      // Fallback para navegadores antigos
      this.loadImage();
    }
  }

  private loadImage() {
    const img = this.el.nativeElement;
    
    // Adicionar classe de loading
    this.renderer.addClass(img, 'loading');
    
    // Carregar imagem
    const image = new Image();
    image.onload = () => {
      this.renderer.setAttribute(img, 'src', this.appLazyImage);
      this.renderer.removeClass(img, 'loading');
      this.renderer.addClass(img, 'loaded');
    };
    
    image.onerror = () => {
      console.warn('Erro ao carregar imagem:', this.appLazyImage);
      this.renderer.removeClass(img, 'loading');
      this.renderer.removeClass(img, 'error');
    };
    
    image.src = this.appLazyImage;
  }
}
