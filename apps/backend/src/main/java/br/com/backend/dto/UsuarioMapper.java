package br.com.backend.dto;

import br.com.backend.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {
    
    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getPlano(),
            null, // createdAt não existe na entidade
            null  // updatedAt não existe na entidade
        );
    }
} 