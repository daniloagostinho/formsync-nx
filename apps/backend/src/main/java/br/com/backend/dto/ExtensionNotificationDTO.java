package br.com.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtensionNotificationDTO {
    private String action;
    private Long templateId;
    private String templateName;
    private String timestamp;
}

