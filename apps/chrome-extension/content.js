// FormSync - Content Script para Preenchimento Automático
class FormSyncContent {
  constructor() {
    this.templates = [];
    this.currentTemplate = null;
    this.detectedFields = [];
    this.init();
  }

  init() {
    try {
      console.log('FormSync: Iniciando content script...');
      
      this.setupMessageListener();
      
      // Verifica se está em uma página com formulários
      setTimeout(() => {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, select, textarea');
        
        console.log(`FormSync: Página analisada - ${forms.length} formulários, ${inputs.length} campos de entrada`);
        
        if (forms.length > 0 || inputs.length > 0) {
          console.log('FormSync: Página contém formulários - FormSync está ativo');
        } else {
          console.log('FormSync: Página não contém formulários');
        }
      }, 1000);
      
      console.log('FormSync: Content script inicializado com sucesso');
    } catch (error) {
      console.error('FormSync: Erro na inicialização:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('FormSync: Mensagem recebida:', request);
      
      try {
        switch (request.action) {
          case 'fillForm':
            console.log('FormSync: Iniciando preenchimento de formulário...');
            this.fillFormWithTemplate(request.template, sendResponse);
            return true; // Indica que a resposta será assíncrona
            
          case 'detectFields':
            console.log('FormSync: Iniciando detecção de campos...');
            this.detectFormFields(sendResponse);
            return true;
            
          default:
            console.log('FormSync: Ação não reconhecida:', request.action);
            sendResponse({ success: false, error: 'Ação não reconhecida' });
        }
      } catch (error) {
        console.error('FormSync: Erro ao processar mensagem:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
    
    console.log('FormSync: Message listener configurado com sucesso');
  }

  async detectFormFields(sendResponse) {
    try {
      console.log('FormSync: Iniciando detecção de campos...');
      
      const fields = this.findFormFields();
      this.detectedFields = fields;
      
      console.log('FormSync: Campos detectados:', fields);
      
      // Agrupa campos por tipo para melhor visualização
      const fieldsByType = {};
      fields.forEach(field => {
        const type = field.type || 'unknown';
        if (!fieldsByType[type]) fieldsByType[type] = [];
        fieldsByType[type].push(field);
      });
      
      console.log('FormSync: Campos agrupados por tipo:', fieldsByType);
      
      sendResponse({
        success: true,
        detectedFields: fields.length,
        fields: fields,
        fieldsByType: fieldsByType
      });
    } catch (error) {
      console.error('FormSync: Erro ao detectar campos:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  findFormFields() {
    const fields = [];
    
    // Busca por inputs, textareas e selects
    const inputSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="number"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'input[type="date"]',
      'input[type="time"]',
      'input[type="datetime-local"]',
      'input[type="file"]',
      'input[type="color"]',
      'input[type="range"]',
      'input[type="search"]',
      'input:not([type])', // inputs sem tipo específico
      'textarea',
      'select'
    ];
    
    console.log('FormSync: Iniciando busca por campos...');
    
    inputSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`FormSync: Seletor "${selector}": ${elements.length} elementos encontrados`);
      
      elements.forEach(element => {
        if (this.isVisibleField(element)) {
          const fieldInfo = this.analyzeField(element);
          if (fieldInfo) {
            fields.push(fieldInfo);
            console.log(`FormSync: Campo adicionado: ${fieldInfo.name || fieldInfo.id} (${fieldInfo.type})`);
          }
        }
      });
    });
    
    // Busca adicional por campos que podem ter sido perdidos
    const allInputs = document.querySelectorAll('input, select, textarea');
    console.log(`FormSync: Total de elementos input/select/textarea encontrados: ${allInputs.length}`);
    
    allInputs.forEach(element => {
      // Verifica se o campo já foi adicionado
      const alreadyAdded = fields.some(field => field.element === element);
      if (!alreadyAdded && this.isVisibleField(element)) {
        const fieldInfo = this.analyzeField(element);
        if (fieldInfo) {
          fields.push(fieldInfo);
          console.log(`FormSync: Campo adicional encontrado: ${fieldInfo.name || fieldInfo.id} (${fieldInfo.type})`);
        }
      }
    });
    
    console.log('FormSync: Total de campos encontrados:', fields.length);
    console.log('FormSync: Campos encontrados:', fields.map(f => ({ name: f.name, id: f.id, type: f.type })));
    
    return fields;
  }

  isVisibleField(element) {
    try {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0' &&
                       rect.width > 0 && 
                       rect.height > 0 &&
                       rect.top >= 0 &&
                       rect.left >= 0;
      
      if (!isVisible) {
        console.log(`FormSync: Campo ${element.name || element.id} não está visível:`, {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
      }
      
      return isVisible;
    } catch (error) {
      console.error('FormSync: Erro ao verificar visibilidade do campo:', error);
      return false;
    }
  }

  analyzeField(element) {
    try {
      const fieldInfo = {
        element: element,
        tagName: element.tagName.toLowerCase(),
        type: element.type || 'text',
        name: element.name || '',
        id: element.id || '',
        placeholder: element.placeholder || '',
        label: this.findFieldLabel(element),
        value: element.value || '',
        selector: this.generateSelector(element),
        confidence: 0
      };
      
      // Calcula confiança baseada em atributos
      fieldInfo.confidence = this.calculateFieldConfidence(fieldInfo);
      
      console.log(`FormSync: Campo analisado: ${fieldInfo.name || fieldInfo.id} (${fieldInfo.type}) - Label: "${fieldInfo.label}" - Placeholder: "${fieldInfo.placeholder}"`);
      
      return fieldInfo;
    } catch (error) {
      console.error('FormSync: Erro ao analisar campo:', error);
      return null;
    }
  }

  findFieldLabel(element) {
    let label = '';
    
    // Busca por label associado
    if (element.id) {
      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) {
        label = labelElement.textContent.trim();
        console.log(`FormSync: Label encontrado por for: "${label}"`);
        return label;
      }
    }
    
    // Busca por label pai
    let parent = element.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.tagName === 'LABEL') {
        label = parent.textContent.trim();
        console.log(`FormSync: Label encontrado por parent: "${label}"`);
        return label;
      }
      parent = parent.parentElement;
    }
    
    // Busca por texto próximo
    const nearbyText = this.findNearbyText(element);
    if (nearbyText) {
      console.log(`FormSync: Label encontrado por texto próximo: "${nearbyText}"`);
      return nearbyText;
    }
    
    // Busca por texto em elementos próximos (h1, h2, h3, p, span, div)
    const nearbyElements = element.parentElement?.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
    if (nearbyElements) {
      for (const el of nearbyElements) {
        if (el !== element && el.textContent.trim()) {
          const text = el.textContent.trim();
          if (text.length < 100) { // Evita textos muito longos
            console.log(`FormSync: Label encontrado por elemento próximo: "${text}"`);
            return text;
          }
        }
      }
    }
    
    console.log(`FormSync: Nenhum label encontrado para o campo`);
    return '';
  }

  findNearbyText(element) {
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      let closestText = '';
      let closestDistance = Infinity;
      
      while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
          try {
            const rect1 = element.getBoundingClientRect();
            const rect2 = node.parentElement.getBoundingClientRect();
            
            const distance = Math.sqrt(
              Math.pow(rect1.left - rect2.left, 2) + 
              Math.pow(rect1.top - rect2.top, 2)
            );
            
            if (distance < closestDistance && distance < 100) {
              closestDistance = distance;
              closestText = node.textContent.trim();
            }
          } catch (error) {
            // Ignora erros de elementos sem bounding rect
          }
        }
      }
      
      if (closestText) {
        console.log(`FormSync: Texto próximo encontrado: "${closestText}" a ${closestDistance}px`);
      }
      
      return closestText;
    } catch (error) {
      console.error('FormSync: Erro ao buscar texto próximo:', error);
      return '';
    }
  }

  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.name) {
      return `[name="${element.name}"]`;
    }
    
    // Gera seletor baseado na estrutura
    let selector = element.tagName.toLowerCase();
    if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`;
    }
    
    // Adiciona posição se não houver identificadores únicos
    if (!element.id && !element.name) {
      const siblings = Array.from(element.parentElement?.children || []);
      const index = siblings.indexOf(element);
      if (index > 0) {
        selector += `:nth-child(${index + 1})`;
      }
    }
    
    return selector;
  }

  calculateFieldConfidence(fieldInfo) {
    let confidence = 0;
    
    // Nome do campo
    if (fieldInfo.name) confidence += 0.3;
    if (fieldInfo.id) confidence += 0.2;
    if (fieldInfo.placeholder) confidence += 0.2;
    if (fieldInfo.label) confidence += 0.3;
    
    // Bonus para campos com tipos específicos
    if (fieldInfo.type && fieldInfo.type !== 'text') confidence += 0.1;
    
    // Bonus para campos com seletores únicos
    if (fieldInfo.selector && fieldInfo.selector.includes('#')) confidence += 0.1;
    
    const finalConfidence = Math.min(confidence, 1.0);
    console.log(`FormSync: Confiança do campo ${fieldInfo.name || fieldInfo.id}: ${finalConfidence}`);
    
    return finalConfidence;
  }

  async fillFormWithTemplate(template, sendResponse) {
    try {
      console.log('FormSync: Preenchendo formulário com template:', template);
      
      // Descriptografa o template antes de usar
      this.currentTemplate = await window.formSyncDecryptionService.decryptObject(template);
      const fields = this.findFormFields();
      let filledFields = 0;
      let errors = [];
      
      console.log('FormSync: Campos do Formulário (descriptografados):', this.currentTemplate.campos);
      console.log('FormSync: Campos detectados na página:', fields.length);
      
      // Para cada campo do template, tenta encontrar um campo correspondente
      for (const templateField of this.currentTemplate.campos) {
        console.log(`FormSync: Procurando campo para: ${templateField.nome} (${templateField.tipo}) com valor: ${templateField.valor}`);
        
        const matchingField = this.findMatchingField(templateField, fields);
        
        if (matchingField) {
          try {
            console.log(`FormSync: Campo encontrado: ${matchingField.name || matchingField.id} (${matchingField.type})`);
            console.log(`FormSync: Preenchendo campo: ${templateField.nome} com valor: ${templateField.valor}`);
            
            await this.fillField(matchingField.element, templateField.valor);
            filledFields++;
            
            // Marca o campo como preenchido
            this.markFieldAsFilled(matchingField.element);
            
            console.log(`FormSync: Campo ${templateField.nome} preenchido com sucesso`);
            
            // Pequena pausa entre campos para melhor visualização
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`FormSync: Erro ao preencher ${templateField.nome}:`, error);
            errors.push(`Erro ao preencher ${templateField.nome}: ${error.message}`);
          }
        } else {
          console.log(`FormSync: Campo não encontrado para: ${templateField.nome}`);
          errors.push(`Campo não encontrado: ${templateField.nome}`);
        }
      }
      
      // Registra o sucesso
      if (filledFields > 0) {
        this.recordSuccessfulFill(this.currentTemplate, filledFields);
      }
      
      console.log(`FormSync: Preenchimento concluído. ${filledFields} campos preenchidos de ${this.currentTemplate.campos.length}.`);
      if (errors.length > 0) {
        console.log(`FormSync: Erros encontrados:`, errors);
      }
      
      sendResponse({
        success: true,
        filledFields: filledFields,
        totalFields: this.currentTemplate.campos.length,
        errors: errors
      });
      
    } catch (error) {
      console.error('FormSync: Erro ao preencher formulário:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  findMatchingField(templateField, fields) {
    let bestMatch = null;
    let bestScore = 0;
    
    console.log(`FormSync: Procurando campo para template: ${templateField.nome} (${templateField.tipo}) com valor: ${templateField.valor}`);
    console.log(`FormSync: Total de campos disponíveis na página: ${fields.length}`);
    
    // Filtra campos por tipo compatível primeiro
    const compatibleFields = fields.filter(field => this.isCompatibleType(templateField.tipo, field.type));
    console.log(`FormSync: Campos compatíveis com tipo "${templateField.tipo}":`, compatibleFields.length);
    
    // Se não há campos compatíveis, aceita qualquer tipo
    if (compatibleFields.length === 0) {
      console.log(`FormSync: Nenhum campo compatível encontrado, aceitando qualquer tipo`);
      compatibleFields.push(...fields);
    }
    
    for (const field of fields) {
      const score = this.calculateMatchingScore(templateField, field);
      
      console.log(`FormSync: Campo da página: ${field.name || field.id || 'sem nome'} (${field.type}) - Score: ${score}`);
      
      if (score > bestScore && score > 0.3) { // Threshold mais baixo para melhor matching
        bestScore = score;
        bestMatch = field;
        console.log(`FormSync: Novo melhor match encontrado: ${field.name || field.id} com score: ${score}`);
      }
    }
    
    console.log(`FormSync: Melhor match para "${templateField.nome}":`, bestMatch ? `${bestMatch.name || bestMatch.id} (${bestMatch.type})` : 'NENHUM', 'score:', bestScore);
    
    // Se não encontrou match, tenta encontrar por tipo compatível mesmo com score baixo
    if (!bestMatch && compatibleFields.length > 0) {
      bestMatch = compatibleFields[0];
      console.log(`FormSync: Usando primeiro campo compatível como fallback: ${bestMatch.name || bestMatch.id} (${bestMatch.type})`);
    }
    
    // Se ainda não encontrou, tenta encontrar por nome similar
    if (!bestMatch) {
      for (const field of fields) {
        if (field.name && templateField.nome) {
          const nameSimilarity = this.calculateNameSimilarity(templateField.nome, field.name);
          if (nameSimilarity > 0.5) {
            bestMatch = field;
            console.log(`FormSync: Usando campo por similaridade de nome: ${field.name} (similaridade: ${nameSimilarity})`);
            break;
          }
        }
      }
    }
    
    return bestMatch;
  }

  calculateMatchingScore(templateField, field) {
    let score = 0;
    
    // Compara nomes (mais importante)
    if (this.similarText(templateField.nome, field.name)) score += 0.4;
    if (this.similarText(templateField.nome, field.id)) score += 0.3;
    if (this.similarText(templateField.nome, field.placeholder)) score += 0.2;
    if (this.similarText(templateField.nome, field.label)) score += 0.4;
    
    // Compara tipos
    if (this.isCompatibleType(templateField.tipo, field.type)) score += 0.2;
    
    // Confiança do campo
    score += field.confidence * 0.1;
    
    // Bonus para campos com nomes similares
    if (field.name && templateField.nome) {
      const nameSimilarity = this.calculateNameSimilarity(templateField.nome, field.name);
      score += nameSimilarity * 0.3;
    }
    
    // Bonus para campos com IDs únicos
    if (field.id && field.id.length > 0) score += 0.1;
    
    // Bonus para campos com nomes únicos
    if (field.name && field.name.length > 0) score += 0.1;
    
    // Bonus para campos com labels descritivos
    if (field.label && field.label.length > 3) score += 0.1;
    
    // Penalidade para campos sem identificadores
    if (!field.name && !field.id) score -= 0.2;
    
    console.log(`FormSync: Score para ${templateField.nome} -> ${field.name || field.id}: ${score}`);
    
    return Math.min(score, 1.0);
  }

  calculateNameSimilarity(name1, name2) {
    if (!name1 || !name2) return 0;
    
    const normalize = (text) => text.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    const norm1 = normalize(name1);
    const norm2 = normalize(name2);
    
    // Comparação exata
    if (norm1 === norm2) return 1.0;
    
    // Comparação parcial
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;
    
    // Comparação por palavras-chave
    const keywords1 = norm1.split(/\s+/);
    const keywords2 = norm2.split(/\s+/);
    
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    if (commonKeywords.length > 0) {
      const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
      console.log(`FormSync: Similaridade de nome: "${name1}" vs "${name2}" = ${similarity}`);
      return similarity;
    }
    
    // Comparação por caracteres comuns
    const chars1 = norm1.split('');
    const chars2 = norm2.split('');
    const commonChars = chars1.filter(c => chars2.includes(c));
    if (commonChars.length > 0) {
      const charSimilarity = commonChars.length / Math.max(chars1.length, chars2.length);
      if (charSimilarity > 0.6) {
        console.log(`FormSync: Similaridade por caracteres: "${name1}" vs "${name2}" = ${charSimilarity}`);
        return charSimilarity * 0.5; // Reduz o score para comparação por caracteres
      }
    }
    
    console.log(`FormSync: Nenhuma similaridade encontrada: "${name1}" vs "${name2}"`);
    return 0;
  }

  similarText(text1, text2) {
    if (!text1 || !text2) return false;
    
    const normalize = (text) => text.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);
    
    // Comparação exata
    if (norm1 === norm2) return true;
    
    // Comparação parcial
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    
    // Comparação por palavras-chave
    const keywords1 = norm1.split(/\s+/);
    const keywords2 = norm2.split(/\s+/);
    
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    if (commonKeywords.length > 0) {
      const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
      const isSimilar = similarity > 0.3; // Threshold mais baixo
      console.log(`FormSync: Similaridade entre "${text1}" e "${text2}": ${similarity} (${isSimilar ? 'similar' : 'não similar'})`);
      return isSimilar;
    }
    
    // Comparação por caracteres comuns
    const chars1 = norm1.split('');
    const chars2 = norm2.split('');
    const commonChars = chars1.filter(c => chars2.includes(c));
    if (commonChars.length > 0) {
      const charSimilarity = commonChars.length / Math.max(chars1.length, chars2.length);
      if (charSimilarity > 0.7) {
        console.log(`FormSync: Similaridade por caracteres entre "${text1}" e "${text2}": ${charSimilarity}`);
        return true;
      }
    }
    
    console.log(`FormSync: Textos não similares: "${text1}" vs "${text2}"`);
    return false;
  }

  isCompatibleType(templateType, fieldType) {
    const typeMap = {
      'text': ['text', 'email', 'url', 'tel', 'search'],
      'email': ['email', 'text'],
      'password': ['password'],
      'number': ['number', 'text'],
      'tel': ['tel', 'text'],
      'url': ['url', 'text'],
      'textarea': ['textarea'],
      'select': ['select'],
      'checkbox': ['checkbox'],
      'radio': ['radio'],
      'date': ['date'],
      'time': ['time'],
      'datetime-local': ['datetime-local'],
      'file': ['file'],
      'color': ['color'],
      'range': ['range']
    };
    
    // Se o tipo do template não está mapeado, aceita qualquer tipo
    if (!typeMap[templateType]) {
      console.log(`FormSync: Tipo de template não mapeado: ${templateType}, aceitando qualquer tipo`);
      return true;
    }
    
    // Se o tipo do campo não está mapeado, aceita qualquer tipo
    if (!fieldType) {
      console.log(`FormSync: Tipo de campo não definido, aceitando qualquer tipo`);
      return true;
    }
    
    const isCompatible = typeMap[templateType].includes(fieldType);
    console.log(`FormSync: Compatibilidade: ${templateType} -> ${fieldType} = ${isCompatible}`);
    
    // Fallback: se não for compatível, aceita campos de texto para tipos básicos
    if (!isCompatible && ['text', 'email', 'url', 'tel', 'search'].includes(templateType)) {
      const fallbackCompatible = ['text', 'email', 'url', 'tel', 'search'].includes(fieldType);
      if (fallbackCompatible) {
        console.log(`FormSync: Usando fallback de compatibilidade: ${templateType} -> ${fieldType} = true`);
        return true;
      }
    }
    
    return isCompatible;
  }

  async fillField(element, value) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`FormSync: Preenchendo campo ${element.tagName} (${element.type}) com valor: ${value}`);
        
        // Simula foco
        element.focus();
        
        // Trata diferentes tipos de campo
        if (element.tagName.toLowerCase() === 'select') {
          this.fillSelectField(element, value);
        } else if (element.type === 'checkbox') {
          this.fillCheckboxField(element, value);
        } else if (element.type === 'radio') {
          this.fillRadioField(element, value);
        } else {
          this.fillInputField(element, value);
        }
        
        // Dispara eventos para ativar validações
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // Aguarda um pouco para garantir que foi processado
        setTimeout(() => {
          console.log(`FormSync: Campo preenchido com sucesso: ${value}`);
          
          // Verifica se o campo foi realmente preenchido
          if (element.tagName.toLowerCase() === 'select') {
            console.log(`FormSync: Select value após preenchimento: ${element.value}`);
          } else if (element.type === 'checkbox') {
            console.log(`FormSync: Checkbox checked após preenchimento: ${element.checked}`);
          } else if (element.type === 'radio') {
            console.log(`FormSync: Radio checked após preenchimento: ${element.checked}`);
          } else {
            console.log(`FormSync: Input value após preenchimento: ${element.value}`);
          }
          
          resolve();
        }, 100);
        
      } catch (error) {
        console.error('FormSync: Erro ao preencher campo:', error);
        reject(error);
      }
    });
  }

  fillSelectField(selectElement, value) {
    try {
      console.log(`FormSync: Preenchendo select com valor: ${value}`);
      console.log(`FormSync: Opções disponíveis no select:`, Array.from(selectElement.options).map(opt => ({ value: opt.value, text: opt.textContent })));
      
      // Para campos select, tenta encontrar a opção que contém o valor
      const options = Array.from(selectElement.options);
      let foundOption = null;
      
      // Se o valor contém vírgulas, pode ser uma lista de opções
      if (value.includes(',')) {
        const optionList = value.split(',').map(opt => opt.trim());
        console.log(`FormSync: Valor contém lista de opções:`, optionList);
        
        // Tenta encontrar a primeira opção que corresponda
        for (const option of optionList) {
          foundOption = options.find(opt => 
            opt.value.toLowerCase() === option.toLowerCase() || 
            opt.textContent.toLowerCase().trim() === option.toLowerCase() ||
            opt.value.toLowerCase().includes(option.toLowerCase()) ||
            opt.textContent.toLowerCase().includes(option.toLowerCase())
          );
          
          if (foundOption) {
            console.log(`FormSync: Opção encontrada para "${option}": ${foundOption.textContent}`);
            break;
          }
        }
      } else {
        // Busca por valor único
        // Primeiro tenta match exato
        foundOption = options.find(option => 
          option.value === value || 
          option.textContent.trim() === value
        );
        
        // Se não encontrar, tenta match parcial
        if (!foundOption) {
          foundOption = options.find(option => 
            option.value.toLowerCase().includes(value.toLowerCase()) ||
            option.textContent.toLowerCase().includes(value.toLowerCase())
          );
        }
      }
      
      if (foundOption) {
        selectElement.value = foundOption.value;
        console.log(`FormSync: Select preenchido com opção: ${foundOption.textContent} (valor: ${foundOption.value})`);
        
        // Dispara evento change para garantir que o select seja atualizado
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Verifica se o valor foi realmente definido
        setTimeout(() => {
          console.log(`FormSync: Select value após preenchimento: ${selectElement.value}`);
          console.log(`FormSync: Select selectedIndex após preenchimento: ${selectElement.selectedIndex}`);
        }, 50);
        
      } else {
        console.log(`FormSync: Opção não encontrada para select: ${value}`);
        console.log(`FormSync: Tentando definir valor diretamente...`);
        
        // Tenta definir o valor diretamente se for uma opção válida
        if (options.some(option => option.value === value)) {
          selectElement.value = value;
          console.log(`FormSync: Valor definido diretamente: ${value}`);
        } else {
          // Última tentativa: procura por qualquer opção que contenha parte do valor
          const partialMatch = options.find(option => 
            option.value.toLowerCase().includes(value.toLowerCase()) ||
            option.textContent.toLowerCase().includes(value.toLowerCase())
          );
          
          if (partialMatch) {
            selectElement.value = partialMatch.value;
            console.log(`FormSync: Match parcial encontrado: ${partialMatch.textContent}`);
          } else {
            console.log(`FormSync: Nenhuma opção encontrada para o valor: ${value}`);
            
            // Tenta criar uma nova opção se não existir
            try {
              const newOption = new Option(value, value);
              selectElement.add(newOption);
              selectElement.value = value;
              console.log(`FormSync: Nova opção criada e selecionada: ${value}`);
            } catch (createError) {
              console.log(`FormSync: Não foi possível criar nova opção:`, createError);
            }
          }
        }
      }
    } catch (error) {
      console.error('FormSync: Erro ao preencher select:', error);
    }
  }

  fillCheckboxField(checkboxElement, value) {
    try {
      console.log(`FormSync: Preenchendo checkbox com valor: ${value}`);
      
      // Para checkbox, converte o valor para boolean
      const shouldCheck = this.parseBooleanValue(value);
      checkboxElement.checked = shouldCheck;
      console.log(`FormSync: Checkbox ${shouldCheck ? 'marcado' : 'desmarcado'} com valor: ${value}`);
      
      // Dispara evento change para garantir que o checkbox seja atualizado
      checkboxElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Verifica se o checkbox foi realmente marcado/desmarcado
      setTimeout(() => {
        console.log(`FormSync: Checkbox checked após preenchimento: ${checkboxElement.checked}`);
        console.log(`FormSync: Checkbox value após preenchimento: ${checkboxElement.value}`);
      }, 50);
      
    } catch (error) {
      console.error('FormSync: Erro ao preencher checkbox:', error);
    }
  }

  fillRadioField(radioElement, value) {
    try {
      console.log(`FormSync: Preenchendo radio com valor: ${value}`);
      
      // Para radio, precisa encontrar o radio correto no grupo
      const name = radioElement.name;
      if (!name) {
        console.log(`FormSync: Radio sem nome, não é possível preencher`);
        return;
      }
      
      // Encontra todos os radios do mesmo grupo
      const radioGroup = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
      console.log(`FormSync: Encontrados ${radioGroup.length} radios no grupo "${name}"`);
      
      // Se o valor contém vírgulas, pode ser uma lista de opções
      let valuesToTry = [value];
      if (value.includes(',')) {
        valuesToTry = value.split(',').map(opt => opt.trim());
        console.log(`FormSync: Valor contém lista de opções:`, valuesToTry);
      }
      
      // Procura pelo radio que tem o valor ou texto correspondente
      for (const radio of radioGroup) {
        const radioValue = radio.value;
        const radioText = this.findRadioText(radio);
        
        console.log(`FormSync: Verificando radio: valor="${radioValue}", texto="${radioText}"`);
        
        // Tenta cada valor da lista
        for (const tryValue of valuesToTry) {
          if (radioValue === tryValue || 
              radioText.toLowerCase().includes(tryValue.toLowerCase()) ||
              tryValue.toLowerCase().includes(radioValue.toLowerCase())) {
            radio.checked = true;
            console.log(`FormSync: Radio selecionado: ${radioText || radioValue} para valor "${tryValue}"`);
            
            // Dispara evento change para garantir que o radio seja atualizado
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Verifica se o radio foi realmente selecionado
            setTimeout(() => {
              console.log(`FormSync: Radio checked após preenchimento: ${radio.checked}`);
            }, 50);
            
            return;
          }
        }
      }
      
      console.log(`FormSync: Nenhum radio encontrado para o valor: ${value}`);
      
      // Tenta selecionar o primeiro radio se nenhum for encontrado
      if (radioGroup.length > 0) {
        console.log(`FormSync: Selecionando primeiro radio como fallback`);
        radioGroup[0].checked = true;
        radioGroup[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      
    } catch (error) {
      console.error('FormSync: Erro ao preencher radio:', error);
    }
  }

  fillInputField(element, value) {
    try {
      console.log(`FormSync: Preenchendo input ${element.type || 'text'} com valor: ${value}`);
      
      // Limpa o campo
      element.value = '';
      
      // Simula digitação
      element.value = value;
      
      // Para campos específicos, aplica formatação
      if (element.type === 'date' && value) {
        // Garante que a data está no formato correto
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          element.value = date.toISOString().split('T')[0];
          console.log(`FormSync: Data formatada: ${element.value}`);
        }
      } else if (element.type === 'time' && value) {
        // Garante que o horário está no formato correto
        if (value.includes(':')) {
          element.value = value;
          console.log(`FormSync: Horário definido: ${element.value}`);
        }
      } else if (element.type === 'number' && value) {
        // Garante que o número está no formato correto
        const num = parseFloat(value);
        if (!isNaN(num)) {
          element.value = num;
          console.log(`FormSync: Número definido: ${element.value}`);
        }
      }
      
      console.log(`FormSync: Input preenchido com sucesso: ${element.value}`);
    } catch (error) {
      console.error('FormSync: Erro ao preencher input:', error);
    }
  }

  parseBooleanValue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      const trueValues = ['true', '1', 'sim', 'yes', 'on', 'verdadeiro', 'check', 'checked'];
      const falseValues = ['false', '0', 'não', 'no', 'off', 'falso', 'uncheck', 'unchecked'];
      
      if (trueValues.includes(lowerValue)) {
        console.log(`FormSync: Valor "${value}" convertido para true`);
        return true;
      }
      if (falseValues.includes(lowerValue)) {
        console.log(`FormSync: Valor "${value}" convertido para false`);
        return false;
      }
      
      console.log(`FormSync: Valor "${value}" não reconhecido como boolean, usando false`);
      return false;
    }
    if (typeof value === 'number') {
      const result = value > 0;
      console.log(`FormSync: Valor numérico "${value}" convertido para ${result}`);
      return result;
    }
    
    console.log(`FormSync: Valor "${value}" não é um tipo suportado, usando false`);
    return false;
  }

  findRadioText(radioElement) {
    try {
      let radioText = '';
      
      // Procura por label associado
      if (radioElement.id) {
        const label = document.querySelector(`label[for="${radioElement.id}"]`);
        if (label) {
          radioText = label.textContent.trim();
          console.log(`FormSync: Radio text encontrado por for: "${radioText}"`);
          return radioText;
        }
      }
      
      // Procura por label pai
      let parent = radioElement.parentElement;
      while (parent && parent.tagName !== 'BODY') {
        if (parent.tagName === 'LABEL') {
          radioText = parent.textContent.trim();
          console.log(`FormSync: Radio text encontrado por parent: "${radioText}"`);
          return radioText;
        }
        parent = parent.parentElement;
      }
      
      // Procura por texto próximo
      const nearbyText = this.findNearbyText(radioElement);
      if (nearbyText) {
        console.log(`FormSync: Radio text encontrado por texto próximo: "${nearbyText}"`);
        return nearbyText;
      }
      
      // Procura por texto em elementos próximos (span, div, p)
      const nearbyElements = radioElement.parentElement?.querySelectorAll('span, div, p');
      if (nearbyElements) {
        for (const el of nearbyElements) {
          if (el !== radioElement && el.textContent.trim()) {
            const text = el.textContent.trim();
            if (text.length < 50) { // Evita textos muito longos
              console.log(`FormSync: Radio text encontrado por elemento próximo: "${text}"`);
              return text;
            }
          }
        }
      }
      
      console.log(`FormSync: Nenhum texto encontrado para o radio`);
      return '';
    } catch (error) {
      console.error('FormSync: Erro ao buscar texto do radio:', error);
      return '';
    }
  }

  markFieldAsFilled(element) {
    try {
      // Adiciona visual feedback
      element.style.borderColor = '#4CAF50';
      element.style.backgroundColor = '#f0f9ff';
      element.style.borderWidth = '2px';
      
      // Adiciona tooltip temporário
      const tooltip = document.createElement('div');
      tooltip.textContent = '✅ Preenchido pelo FormSync';
      tooltip.style.cssText = `
        position: absolute;
        background: #4CAF50;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
      `;
      
      const rect = element.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.top - 30) + 'px';
      
      document.body.appendChild(tooltip);
      
      // Remove o feedback após alguns segundos
      setTimeout(() => {
        try {
          element.style.borderColor = '';
          element.style.backgroundColor = '';
          element.style.borderWidth = '';
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        } catch (error) {
          // Ignora erros ao limpar estilos
        }
      }, 3000);
    } catch (error) {
      console.error('FormSync: Erro ao marcar campo como preenchido:', error);
    }
  }

  recordSuccessfulFill(template, filledFields) {
    // Registra o sucesso para futuras melhorias
    console.log(`FormSync: Template "${template.nome}" usado com sucesso. ${filledFields} campos preenchidos.`);
    
    // Mostra notificação de sucesso
    this.showSuccessNotification(filledFields, template.campos.length);
    
    // Futuramente será integrado com a API do backend
    // para melhorar o mapeamento de campos
  }

  showSuccessNotification(filledFields, totalFields) {
    try {
      const notification = document.createElement('div');
      notification.textContent = `✅ FormSync preencheu ${filledFields} de ${totalFields} campos com sucesso!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      
      // Adiciona CSS para animação
      if (!document.getElementById('formSyncStyles')) {
        const style = document.createElement('style');
        style.id = 'formSyncStyles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove a notificação após alguns segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } catch (error) {
      console.error('FormSync: Erro ao mostrar notificação:', error);
    }
  }
}

// Inicializa o content script
const formSync = new FormSyncContent();

// Notifica que o content script está carregado
console.log('FormSync: Content script carregado e funcionando!');
