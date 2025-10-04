package br.com.backend.dto;

import br.com.backend.entity.Assinatura;
import org.springframework.stereotype.Component;

@Component
public class AssinaturaMapper {
    
    public AssinaturaResponseDTO toResponseDTO(Assinatura assinatura) {
        if (assinatura == null) {
            return null;
        }
        
        return new AssinaturaResponseDTO(
            assinatura.getId(),
            assinatura.getUsuarioId(),
            assinatura.getPlano(),
            assinatura.getStatus(),
            assinatura.getDataInicio(),
            assinatura.getDataProximaCobranca(),
            assinatura.getCreatedAt(),
            assinatura.getUpdatedAt()
        );
    }
} 