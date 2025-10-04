# 🔔 Como Usar o NotificationService

## 📱 Notificação Customizada com Tailwind CSS

O `NotificationService` é um serviço simples e poderoso para exibir notificações personalizadas usando HTML e Tailwind CSS.

## 🚀 Como Importar e Usar

### 1. Importar o Serviço

```typescript
import { NotificationService } from '../../services/notification.service';
```

### 2. Injetar no Constructor

```typescript
constructor(
  private notificationService: NotificationService
) { }
```

## 🎨 Tipos de Notificação Disponíveis

### ✅ **Sucesso (Verde)**
```typescript
this.notificationService.showSuccess('Perfil atualizado com sucesso!');
this.notificationService.showSuccess('Operação realizada!', 4000); // 4 segundos
```

### ❌ **Erro (Vermelho)**
```typescript
this.notificationService.showError('Erro ao salvar dados!');
this.notificationService.showError('Falha na operação!', 6000); // 6 segundos
```

### ⚠️ **Aviso (Amarelo)**
```typescript
this.notificationService.showWarning('Atenção: verifique os dados!');
this.notificationService.showWarning('Cuidado com este campo!', 5000); // 5 segundos
```

### ℹ️ **Informação (Azul)**
```typescript
this.notificationService.showInfo('Informação importante!');
this.notificationService.showInfo('Dados carregados!', 3000); // 3 segundos
```

## 🔧 Métodos Adicionais

### Remover Notificação Específica
```typescript
// Você precisa do ID da notificação
this.notificationService.remove('notification-id');
```

### Limpar Todas as Notificações
```typescript
this.notificationService.clear();
```

## 🎯 Características

- **Posição**: Canto superior direito
- **Animação**: Slide-in/out suave
- **Auto-dismiss**: Remove automaticamente após o tempo especificado
- **Cores**: Seguem a paleta Tailwind CSS
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Acessível**: Inclui ícones e pode ser fechado manualmente

## 💡 Exemplos Práticos

### Em um Formulário
```typescript
salvar() {
  if (!this.isFormValid()) {
    this.notificationService.showError('Por favor, preencha todos os campos corretamente.');
    return;
  }

  this.service.salvar(this.data).subscribe({
    next: () => {
      this.notificationService.showSuccess('Dados salvos com sucesso!');
    },
    error: () => {
      this.notificationService.showError('Erro ao salvar dados. Tente novamente.');
    }
  });
}
```

### Carregamento de Dados
```typescript
ngOnInit() {
  this.service.carregarDados().subscribe({
    next: (dados) => {
      // Não mostrar notificação para carregamento normal
      console.log('Dados carregados');
    },
    error: () => {
      this.notificationService.showError('Erro ao carregar dados.');
    }
  });
}
```

### Operações de CRUD
```typescript
// Criar
criar() {
  this.service.criar(this.item).subscribe({
    next: () => this.notificationService.showSuccess('Item criado com sucesso!'),
    error: () => this.notificationService.showError('Erro ao criar item.')
  });
}

// Atualizar
atualizar() {
  this.service.atualizar(this.item).subscribe({
    next: () => this.notificationService.showSuccess('Item atualizado!'),
    error: () => this.notificationService.showError('Erro ao atualizar.')
  });
}

// Deletar
deletar() {
  this.service.deletar(this.id).subscribe({
    next: () => this.notificationService.showWarning('Item removido.'),
    error: () => this.notificationService.showError('Erro ao remover item.')
  });
}
```

## 🎨 Personalização das Cores

As cores seguem exatamente a paleta Tailwind CSS:

- **Verde (Success)**: `bg-green-500` - rgb(34 197 94)
- **Vermelho (Error)**: `bg-red-500` - rgb(239 68 68)
- **Amarelo (Warning)**: `bg-amber-500` - rgb(245 158 11)
- **Azul (Info)**: `bg-blue-500` - rgb(59 130 246)

## ⚡ Performance

- Componente standalone (não precisa de módulos)
- Animações CSS otimizadas
- Auto-limpeza de memória
- Zero dependências externas
