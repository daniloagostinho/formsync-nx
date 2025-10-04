package br.com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldMatchRequestDTO {
    
    private String targetField;
    private List<String> availableFields;
    private Double threshold;
    private String site;
    
    public FieldMatchRequestDTO(String targetField, List<String> availableFields) {
        this.targetField = targetField;
        this.availableFields = availableFields;
        this.threshold = 0.7; // Threshold padrão
    }
    
    public FieldMatchRequestDTO(String targetField, List<String> availableFields, Double threshold) {
        this.targetField = targetField;
        this.availableFields = availableFields;
        this.threshold = threshold;
    }
} 