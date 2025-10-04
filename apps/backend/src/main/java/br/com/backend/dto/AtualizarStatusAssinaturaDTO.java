package br.com.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AtualizarStatusAssinaturaDTO {
    
    @NotNull(message = "Status é obrigatório")
    @Pattern(regexp = "^(ATIVA|CANCELADA|SUSPENSA|EXPIRADA)$", 
             message = "Status deve ser ATIVA, CANCELADA, SUSPENSA ou EXPIRADA")
    private String status;
} 