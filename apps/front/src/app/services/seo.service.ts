import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private baseUrl = 'https://formsync.com.br';

  constructor(
    private title: Title,
    private meta: Meta
  ) { }

  /**
   * Atualiza as meta tags SEO da página
   */
  updateSEO(data: SEOData): void {
    // Título da página
    this.title.setTitle(data.title);

    // Meta description
    this.meta.updateTag({ name: 'description', content: data.description });

    // Keywords
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Canonical URL
    if (data.canonicalUrl) {
      this.updateCanonicalUrl(data.canonicalUrl);
    }

    // Open Graph
    this.updateOpenGraph({
      title: data.title,
      description: data.description,
      image: data.ogImage || `${this.baseUrl}/assets/images/formsync-og-image.png`,
      type: data.ogType || 'website',
      url: data.canonicalUrl || this.baseUrl
    });

    // Twitter Cards
    this.updateTwitterCards({
      title: data.title,
      description: data.description,
      image: data.ogImage || `${this.baseUrl}/assets/images/formsync-twitter-image.png`
    });

    // Meta tags adicionais para SEO
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' });
    this.meta.updateTag({ name: 'googlebot', content: 'index, follow' });
    this.meta.updateTag({ name: 'author', content: 'FormSync' });
    this.meta.updateTag({ property: 'og:site_name', content: 'FormSync' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
  }

  /**
   * Atualiza as meta tags Open Graph
   */
  private updateOpenGraph(data: {
    title: string;
    description: string;
    image: string;
    type: string;
    url: string;
  }): void {
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: data.image });
    this.meta.updateTag({ property: 'og:type', content: data.type });
    this.meta.updateTag({ property: 'og:url', content: data.url });
  }

  /**
   * Atualiza as meta tags Twitter Cards
   */
  private updateTwitterCards(data: {
    title: string;
    description: string;
    image: string;
  }): void {
    this.meta.updateTag({ property: 'twitter:title', content: data.title });
    this.meta.updateTag({ property: 'twitter:description', content: data.description });
    this.meta.updateTag({ property: 'twitter:image', content: data.image });
  }

  /**
   * Atualiza a URL canônica
   */
  private updateCanonicalUrl(url: string): void {
    // Remove canonical existente
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Adiciona nova canonical
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Configurações SEO pré-definidas para páginas específicas
   */
  getPageSEO(page: string): SEOData {
    const seoConfigs: { [key: string]: SEOData } = {
      home: {
        title: 'FormSync - Automatize Preenchimento de Formulários | Economize 2 Horas por Dia',
        description: 'Automatize o preenchimento de formulários em qualquer site.',
        keywords: 'automatizar formulários, preenchimento automático, extensão navegador, produtividade, economia de tempo, formulários web, autofill, preenchimento rápido',
        canonicalUrl: this.baseUrl
      },
      registrar: {
        title: 'Cadastre-se Grátis | FormSync - Automatize Formulários',
        description: 'Cadastre-se gratuitamente no FormSync e comece a automatizar seus formulários hoje mesmo. Sem cartão de crédito, sem compromisso. Economize tempo instantaneamente.',
        keywords: 'cadastro gratuito, registrar, conta formsync, teste grátis, automatizar formulários',
        canonicalUrl: `${this.baseUrl}/registrar`
      },
      login: {
        title: 'Login | FormSync - Acesse sua Conta',
        description: 'Faça login na sua conta FormSync e continue automatizando seus formulários. Acesso rápido e seguro ao seu painel de controle.',
        keywords: 'login, acessar conta, formsync login, entrar, painel de controle',
        canonicalUrl: `${this.baseUrl}/login`
      },
      demo: {
        title: 'Demonstração | FormSync - Veja Como Funciona',
        description: 'Veja o FormSync em ação! Demonstração gratuita de como automatizar preenchimento de formulários. Teste você mesmo em 30 segundos.',
        keywords: 'demonstração, demo, como funciona, teste formsync, exemplo',
        canonicalUrl: `${this.baseUrl}/demo`
      },
      planos: {
        title: 'Planos e Preços | FormSync - Escolha o Melhor para Você',
        description: 'Compare nossos planos e escolha o ideal para suas necessidades. Desde gratuito até empresarial. Todos com teste grátis incluído.',
        keywords: 'planos, preços, assinatura, comparativo, gratuito, premium',
        canonicalUrl: `${this.baseUrl}/planos`
      },
      faq: {
        title: 'Perguntas Frequentes | FormSync - Tire suas Dúvidas',
        description: 'Encontre respostas para as principais dúvidas sobre o FormSync. Como funciona, segurança, compatibilidade e muito mais.',
        keywords: 'faq, perguntas frequentes, dúvidas, ajuda, suporte',
        canonicalUrl: `${this.baseUrl}/faq`
      },
      sobre: {
        title: 'Sobre Nós | FormSync - Nossa História e Missão',
        description: 'Conheça a história do FormSync e nossa missão de tornar o preenchimento de formulários mais eficiente para todos.',
        keywords: 'sobre, história, missão, empresa, equipe',
        canonicalUrl: `${this.baseUrl}/sobre`
      },
      contato: {
        title: 'Contato | FormSync - Fale Conosco',
        description: 'Entre em contato com a equipe FormSync. Suporte técnico, vendas, parcerias e outras dúvidas. Resposta rápida garantida.',
        keywords: 'contato, suporte, atendimento, fale conosco, ajuda',
        canonicalUrl: `${this.baseUrl}/contato`
      },
          privacidade: {
      title: 'Política de Privacidade | FormSync',
      description: 'Conheça nossa política de privacidade e como protegemos seus dados pessoais. Transparência e segurança em primeiro lugar.',
      keywords: 'privacidade, política, dados pessoais, segurança, lgpd',
      canonicalUrl: `${this.baseUrl}/privacidade`
    },
    termos: {
      title: 'Termos de Uso | FormSync',
      description: 'Leia nossos termos de uso e condições para utilização do FormSync. Direitos e responsabilidades claramente definidos.',
      keywords: 'termos de uso, condições, contrato, direitos, responsabilidades',
      canonicalUrl: `${this.baseUrl}/termos`
    },
    cookies: {
      title: 'Política de Cookies | FormSync',
      description: 'Entenda como utilizamos cookies para melhorar sua experiência. Transparência sobre coleta e uso de dados de navegação.',
      keywords: 'cookies, política de cookies, rastreamento, analytics, lgpd',
      canonicalUrl: `${this.baseUrl}/cookies`
    },
    'gerenciar-cookies': {
      title: 'Gerenciar Cookies | FormSync',
      description: 'Configure suas preferências de cookies. Controle quais tipos de cookies aceita em nosso site.',
      keywords: 'gerenciar cookies, preferências cookies, configuração cookies, lgpd',
      canonicalUrl: `${this.baseUrl}/gerenciar-cookies`
    }
    };

    return seoConfigs[page] || seoConfigs['home'];
  }

  /**
   * Adiciona schema markup estruturado
   */
  addStructuredData(data: any): void {
    // Remove schema existente
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Adiciona novo schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Schema markup para página de produto
   */
  addProductSchema(): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FormSync",
      "description": "Extensão de navegador para automatizar preenchimento de formulários web",
      "url": this.baseUrl,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL",
        "description": "Plano gratuito disponível"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247"
      }
    };

    this.addStructuredData(schema);
  }

  /**
   * Schema markup para FAQ
   */
  addFAQSchema(faqs: Array<{question: string, answer: string}>): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    this.addStructuredData(schema);
  }
} 