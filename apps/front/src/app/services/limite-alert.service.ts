import { Injectable } from '@angular/core';
import { getPlanoConfig } from '../shared/planos-config';

@Injectable({
    providedIn: 'root'
})
export class LimiteAlertService {

    /**
     * Detecta se o erro é de limite e retorna mensagem apropriada
     */
    detectarErroLimite(error: any): { isLimite: boolean; mensagem: string; mostrarUpgrade: boolean } {
        const mensagem = error?.error?.message || error?.message || '';
        const lowerMessage = mensagem.toLowerCase();

        // Verificar se é erro de limite de templates
        if (lowerMessage.includes('limite de templates') ||
            lowerMessage.includes('template limit') ||
            lowerMessage.includes('faça upgrade para continuar')) {

            return {
                isLimite: true,
                mensagem: this.getMensagemUpgradeTemplate(),
                mostrarUpgrade: true
            };
        }

        // Verificar se é erro de limite de campos
        if (lowerMessage.includes('limite de campos') ||
            lowerMessage.includes('field limit') ||
            lowerMessage.includes('campo limit')) {

            return {
                isLimite: true,
                mensagem: this.getMensagemUpgradeCampo(),
                mostrarUpgrade: true
            };
        }

        return {
            isLimite: false,
            mensagem: '',
            mostrarUpgrade: false
        };
    }

    /**
     * Retorna mensagem de upgrade para templates
     */
    private getMensagemUpgradeTemplate(): string {
        return '🎯 Limite de templates atingido! Faça upgrade para o Plano Profissional e crie até 50 templates. Clique aqui para ver os planos!';
    }

    /**
     * Retorna mensagem de upgrade para campos
     */
    private getMensagemUpgradeCampo(): string {
        return '📝 Limite de campos atingido! Faça upgrade para o Plano Profissional e use até 1000 campos. Clique aqui para ver os planos!';
    }

    /**
     * Obtém dados do plano
     */
    getPlanoInfo(planoId: string) {
        return getPlanoConfig(planoId);
    }
}
