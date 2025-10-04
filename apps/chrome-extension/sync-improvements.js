// ✅ MELHORIAS DE SINCRONIZAÇÃO PARA FORMSYNC

// 1. Adicionar no constructor:
// this.autoSyncInterval = null;

// 2. Adicionar no init():
// this.startAutoSync();

// 3. Adicionar no setupEventListeners():
/*
// ✅ MELHORIAS DE SINCRONIZAÇÃO
// 1. Recarrega quando popup abre
window.addEventListener('focus', () => {
  this.loadTemplates();
});

// 2. Recarrega quando popup é exibido
window.addEventListener('show', () => {
  this.loadTemplates();
});

// 3. Recarrega quando DOM é carregado
window.addEventListener('DOMContentLoaded', () => {
  this.loadTemplates();
});
*/

// 4. Adicionar métodos:
/*
// ✅ NOVO: Método para auto-refresh
startAutoSync() {
  this.autoSyncInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      this.loadTemplates();
      console.log('FormSync: Auto-sync executado');
    }
  }, 30000); // 30 segundos
}

// ✅ NOVO: Método para parar auto-refresh
stopAutoSync() {
  if (this.autoSyncInterval) {
    clearInterval(this.autoSyncInterval);
    this.autoSyncInterval = null;
  }
}

// ✅ NOVO: Método para verificar atualizações
checkForUpdates() {
  // Verifica se há templates com data de atualização recente
  const agora = new Date();
  const templatesAtualizados = this.templates.filter(template => {
    if (template.dataAtualizacao) {
      const dataAtualizacao = new Date(template.dataAtualizacao);
      const diffMs = agora.getTime() - dataAtualizacao.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      return diffMin < 5; // Templates atualizados nos últimos 5 minutos
    }
    return false;
  });

  if (templatesAtualizados.length > 0) {
    console.log('FormSync: Templates atualizados recentemente:', templatesAtualizados);
    this.showStatus(`${templatesAtualizados.length} template(s) atualizado(s) recentemente`, 'info');
  }
}
*/

// 5. Melhorar loadTemplates():
/*
// ✅ MELHORIA: Mostra se houve mudanças
if (templatesAnteriores !== this.templates.length) {
  this.showStatus(`${this.templates.length} templates carregados (${templatesAnteriores < this.templates.length ? 'novos' : 'removidos'})`, 'success');
} else {
  this.showStatus(`${this.templates.length} templates carregados`, 'success');
}

// ✅ MELHORIA: Atualiza a UI imediatamente
this.updateUI();

// ✅ MELHORIA: Notifica se há templates atualizados
this.checkForUpdates();
*/
