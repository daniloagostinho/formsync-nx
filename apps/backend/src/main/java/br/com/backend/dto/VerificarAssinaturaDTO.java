package br.com.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerificarAssinaturaDTO {
    
    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;
} 