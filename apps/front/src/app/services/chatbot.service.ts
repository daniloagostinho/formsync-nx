import { Injectable } from '@angular/core';

export interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private faqItems: FAQItem[] = [
    {
      question: 'Como funciona o FormSync?',
      answer: 'O FormSync é uma plataforma que permite sincronizar dados de formulários de forma inteligente. Você pode fazer upload de arquivos CSV e o sistema irá processar e organizar os dados automaticamente.',
      keywords: ['como funciona', 'formulário', 'sincronizar', 'csv', 'processar'],
      category: 'geral'
    },
    {
      question: 'Quais formatos de arquivo são suportados?',
      answer: 'Atualmente suportamos arquivos CSV. Em breve teremos suporte para Excel (.xlsx) e outros formatos.',
      keywords: ['formato', 'arquivo', 'csv', 'excel', 'suportado', 'extensão'],
      category: 'arquivos'
    },
    {
      question: 'Como faço para fazer upload de um arquivo?',
      answer: 'Na página principal, clique no botão "Fazer Upload" e selecione seu arquivo CSV. O sistema irá processar automaticamente e mostrar os resultados.',
      keywords: ['upload', 'fazer upload', 'enviar arquivo', 'selecionar', 'carregar'],
      category: 'upload'
    },
    {
      question: 'Os meus dados estão seguros?',
      answer: 'Sim! Todos os dados são processados localmente no seu navegador. Nenhuma informação é enviada para nossos servidores, garantindo total privacidade.',
      keywords: ['seguro', 'privacidade', 'dados', 'proteção', 'confidencial'],
      category: 'segurança'
    },
    {
      question: 'Posso exportar os resultados?',
      answer: 'Sim! Após o processamento, você pode baixar os resultados em formato CSV ou visualizar os dados organizados na interface.',
      keywords: ['exportar', 'baixar', 'resultados', 'download', 'salvar'],
      category: 'exportação'
    },
    {
      question: 'O sistema é gratuito?',
      answer: 'Sim! O FormSync é completamente gratuito para uso pessoal e comercial.',
      keywords: ['gratuito', 'preço', 'custo', 'pago', 'valor'],
      category: 'preços'
    },
    {
      question: 'Como posso entrar em contato com o suporte?',
      answer: 'Você pode entrar em contato através do nosso formulário de contato na página principal ou enviar um email para suporte@formsync.com',
      keywords: ['contato', 'suporte', 'ajuda', 'email', 'telefone'],
      category: 'suporte'
    },
    {
      question: 'O sistema funciona offline?',
      answer: 'Sim! O FormSync funciona completamente offline. Todos os processamentos são feitos localmente no seu navegador.',
      keywords: ['offline', 'internet', 'conexão', 'sem wifi'],
      category: 'funcionalidades'
    }
  ];

  constructor() { }

  getFAQItems(): FAQItem[] {
    return this.faqItems;
  }

  getFAQByCategory(category: string): FAQItem[] {
    return this.faqItems.filter(item => item.category === category);
  }

  searchFAQ(query: string): FAQItem[] {
    const searchTerm = query.toLowerCase();
    return this.faqItems.filter(item =>
      item.question.toLowerCase().includes(searchTerm) ||
      item.answer.toLowerCase().includes(searchTerm) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  getSuggestedQuestions(count: number = 3): FAQItem[] {
    return this.faqItems.slice(0, count);
  }

  getResponseForMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Verificar se é uma saudação
    if (this.isGreeting(lowerMessage)) {
      return 'Olá! Como posso ajudá-lo com o FormSync hoje?';
    }

    // Verificar se é uma despedida
    if (this.isFarewell(lowerMessage)) {
      return 'Obrigado por usar o FormSync! Se precisar de mais ajuda, estarei aqui.';
    }

    // Procurar por perguntas frequentes
    const matchingFAQ = this.findMatchingFAQ(lowerMessage);
    if (matchingFAQ) {
      return matchingFAQ.answer;
    }

    // Verificar palavras-chave específicas
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return this.getHelpMessage();
    }

    if (lowerMessage.includes('problema') || lowerMessage.includes('erro')) {
      return this.getTroubleshootingMessage();
    }

    // Resposta padrão
    return this.getDefaultResponse();
  }

  private isGreeting(message: string): boolean {
    const greetings = ['oi', 'olá', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private isFarewell(message: string): boolean {
    const farewells = ['tchau', 'adeus', 'bye', 'obrigado', 'obrigada', 'valeu'];
    return farewells.some(farewell => message.includes(farewell));
  }

  private findMatchingFAQ(message: string): FAQItem | null {
    for (const faq of this.faqItems) {
      for (const keyword of faq.keywords) {
        if (message.includes(keyword)) {
          return faq;
        }
      }
    }
    return null;
  }

  private getHelpMessage(): string {
    return 'Posso ajudá-lo com:\n• Como usar o FormSync\n• Formatos de arquivo suportados\n• Segurança dos dados\n• Exportação de resultados\n• Funcionalidades offline\n\nDigite sua pergunta ou escolha um tópico acima.';
  }

  private getTroubleshootingMessage(): string {
    return 'Se você está enfrentando algum problema, por favor:\n1. Verifique se o arquivo está no formato CSV\n2. Certifique-se de que o arquivo não está corrompido\n3. Tente novamente com um arquivo menor\n4. Verifique se o navegador está atualizado\n\nSe o problema persistir, entre em contato conosco.';
  }

  private getDefaultResponse(): string {
    return 'Desculpe, não consegui entender sua pergunta. Você pode:\n• Tentar reformular sua pergunta\n• Usar palavras-chave como "upload", "csv", "segurança"\n• Ou clicar no botão "Falar com Suporte" abaixo para contato direto via WhatsApp.';
  }
} 