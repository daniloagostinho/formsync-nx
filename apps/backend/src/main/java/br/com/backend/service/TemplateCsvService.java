package br.com.backend.service;

import br.com.backend.entity.Template;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.service.PlanoLimiteService;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Imports para Excel
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateCsvService {

    private final TemplateRepository templateRepository;
    private final CampoTemplateRepository campoTemplateRepository;
    private final PlanoLimiteService planoLimiteService;
    
    public PlanoLimiteService getPlanoLimiteService() {
        return planoLimiteService;
    }

    /**
     * Processa arquivo (CSV ou Excel) e cria templates com campos
     * Formato esperado: NomeTemplate,DescricaoTemplate,Campo1,Valor1,Tipo1,Campo2,Valor2,Tipo2,...
     */
    public List<Template> parseAndSaveTemplates(MultipartFile file, Usuario usuario) {
        List<Template> templatesCriados = new ArrayList<>();
        
        String fileName = file.getOriginalFilename().toLowerCase();
        boolean isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
        
        if (isExcel) {
            templatesCriados = parseExcelFile(file, usuario);
        } else {
            templatesCriados = parseCsvFile(file, usuario);
        }
        
        // ✅ VALIDAÇÃO DE LIMITES: Verificar se pode criar todos os templates e campos
        if (!templatesCriados.isEmpty()) {
            int quantidadeTemplates = templatesCriados.size();
            int totalCamposNovos = templatesCriados.stream()
                    .mapToInt(template -> template.getCampos().size())
                    .sum();
            
            planoLimiteService.validarCriacaoTemplatesCsv(usuario, quantidadeTemplates, totalCamposNovos);
        }
        
        return templatesCriados;
    }

    /**
     * Processa arquivo CSV
     */
    private List<Template> parseCsvFile(MultipartFile file, Usuario usuario) {
        List<Template> templatesCriados = new ArrayList<>();
        
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] header = reader.readNext();
            if (header == null) {
                log.warn("CSV vazio ou sem cabeçalho");
                return Collections.emptyList();
            }
            
            // Verificar formato mínimo: NomeTemplate,DescricaoTemplate
            if (header.length < 2) {
                throw new RuntimeException("CSV deve ter pelo menos 2 colunas: NomeTemplate,DescricaoTemplate");
            }
            
            String[] row;
            int linhaAtual = 1; // Começa em 1 pois já leu o cabeçalho
            
            while ((row = reader.readNext()) != null) {
                linhaAtual++;
                
                try {
                    if (row.length >= 2) {
                        Template template = criarTemplateFromRow(row, usuario);
                        Template templateSalvo = templateRepository.save(template);
                        
                        // Criar Campos do Formulário
                        if (row.length > 2) {
                            criarCamposFromRow(row, templateSalvo);
                        }
                        
                        templatesCriados.add(templateSalvo);
                        log.info("Template criado: {} (ID: {}) com {} campos", 
                                templateSalvo.getNome(), templateSalvo.getId(), 
                                templateSalvo.getCampos().size());
                    } else {
                        log.warn("Linha {} ignorada - formato inválido: {}", linhaAtual, String.join(",", row));
                    }
                } catch (Exception e) {
                    log.error("Erro ao processar linha {}: {}", linhaAtual, e.getMessage());
                    throw new RuntimeException("Erro na linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Falha ao processar CSV de templates", e);
            throw new RuntimeException("Falha ao processar CSV de templates: " + e.getMessage());
        }
        
        return templatesCriados;
    }

    /**
     * Processa arquivo Excel
     */
    private List<Template> parseExcelFile(MultipartFile file, Usuario usuario) {
        List<Template> templatesCriados = new ArrayList<>();
        
        try (Workbook workbook = createWorkbook(file)) {
            Sheet sheet = workbook.getSheetAt(0); // Primeira planilha
            
            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel deve ter pelo menos 2 linhas (cabeçalho + dados)");
            }
            
            // Ler cabeçalho
            Row headerRow = sheet.getRow(0);
            if (headerRow == null || headerRow.getPhysicalNumberOfCells() < 2) {
                throw new RuntimeException("Excel deve ter pelo menos 2 colunas: NomeTemplate,DescricaoTemplate");
            }
            
            // Verificar formato mínimo: NomeTemplate,DescricaoTemplate
            String primeiraColuna = getCellValueAsString(headerRow.getCell(0));
            String segundaColuna = getCellValueAsString(headerRow.getCell(1));
            
            if (!primeiraColuna.toLowerCase().contains("nome") && !primeiraColuna.toLowerCase().contains("template")) {
                throw new RuntimeException("Primeira coluna deve conter 'nome' ou 'template' (ex: NomeTemplate)");
            }
            
            if (!segundaColuna.toLowerCase().contains("descricao") && !segundaColuna.toLowerCase().contains("desc")) {
                throw new RuntimeException("Segunda coluna deve conter 'descricao' ou 'desc' (ex: DescricaoTemplate)");
            }
            
            // Processar linhas de dados
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    if (row.getPhysicalNumberOfCells() >= 2) {
                        String[] rowData = new String[row.getPhysicalNumberOfCells()];
                        for (int j = 0; j < row.getPhysicalNumberOfCells(); j++) {
                            rowData[j] = getCellValueAsString(row.getCell(j));
                        }
                        
                        Template template = criarTemplateFromRow(rowData, usuario);
                        Template templateSalvo = templateRepository.save(template);
                        
                        // Criar Campos do Formulário
                        if (rowData.length > 2) {
                            criarCamposFromRow(rowData, templateSalvo);
                        }
                        
                        templatesCriados.add(templateSalvo);
                        log.info("Template criado: {} (ID: {}) com {} campos", 
                                templateSalvo.getNome(), templateSalvo.getId(), 
                                templateSalvo.getCampos().size());
                    } else {
                        log.warn("Linha {} ignorada - formato inválido", i + 1);
                    }
                } catch (Exception e) {
                    log.error("Erro ao processar linha {}: {}", i + 1, e.getMessage());
                    throw new RuntimeException("Erro na linha " + (i + 1) + ": " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Falha ao processar Excel de templates", e);
            throw new RuntimeException("Falha ao processar Excel de templates: " + e.getMessage());
        }
        
        return templatesCriados;
    }

    /**
     * Cria Workbook baseado no tipo de arquivo Excel
     */
    private Workbook createWorkbook(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename().toLowerCase();
        
        if (fileName.endsWith(".xlsx")) {
            return new XSSFWorkbook(file.getInputStream());
        } else if (fileName.endsWith(".xls")) {
            return new HSSFWorkbook(file.getInputStream());
        } else {
            throw new IllegalArgumentException("Formato Excel não suportado");
        }
    }

    /**
     * Obtém valor da célula como String
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    return cell.getStringCellValue();
                }
            default:
                return "";
        }
    }

    /**
     * Cria um template a partir de uma linha do CSV
     */
    private Template criarTemplateFromRow(String[] row, Usuario usuario) {
        Template template = new Template();
        template.setNome(row[0].trim());
        template.setDescricao(row.length > 1 ? row[1].trim() : "");
        template.setUsuario(usuario);
        template.setAtivo(true);
        template.setDataCriacao(LocalDateTime.now());
        template.setDataAtualizacao(LocalDateTime.now());
        template.setTotalUso(0);
        template.setCampos(new ArrayList<>());
        
        return template;
    }

    /**
     * Cria Campos do Formulário a partir de uma linha do CSV
     * Formato: Campo1,Valor1,Tipo1,Campo2,Valor2,Tipo2,...
     */
    private void criarCamposFromRow(String[] row, Template template) {
        // Começa do índice 2 (após NomeTemplate e DescricaoTemplate)
        for (int i = 2; i < row.length; i += 3) {
            if (i + 2 < row.length) {
                String nomeCampo = row[i].trim();
                String valorCampo = row[i + 1].trim();
                String tipoCampo = row[i + 2].trim();
                
                if (!nomeCampo.isEmpty() && !valorCampo.isEmpty()) {
                    CampoTemplate campo = new CampoTemplate();
                    campo.setNome(nomeCampo);
                    campo.setValor(valorCampo);
                    campo.setTipo(tipoCampo.isEmpty() ? "text" : tipoCampo);
                    campo.setOrdem((i - 2) / 3); // Ordem baseada na posição no CSV
                    campo.setAtivo(true);
                    campo.setDataCriacao(LocalDateTime.now());
                    campo.setDataAtualizacao(LocalDateTime.now());
                    campo.setTotalUso(0);
                    campo.setTemplate(template);
                    
                    CampoTemplate campoSalvo = campoTemplateRepository.save(campo);
                    template.getCampos().add(campoSalvo);
                    
                    log.debug("Campo criado: {} = {} (tipo: {})", nomeCampo, valorCampo, tipoCampo);
                }
            }
        }
    }

    /**
     * Valida formato do CSV antes de processar
     */
    public void validarFormatoCsv(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] header = reader.readNext();
            if (header == null) {
                throw new RuntimeException("CSV vazio");
            }
            
            if (header.length < 2) {
                throw new RuntimeException("CSV deve ter pelo menos 2 colunas: NomeTemplate,DescricaoTemplate");
            }
            
            // Verificar se as primeiras colunas são as esperadas (mais flexível)
            String primeiraColuna = header[0].trim().toLowerCase();
            String segundaColuna = header[1].trim().toLowerCase();
            
            if (!primeiraColuna.contains("nome") && !primeiraColuna.contains("template")) {
                throw new RuntimeException("Primeira coluna deve conter 'nome' ou 'template' (ex: NomeTemplate)");
            }
            
            if (!segundaColuna.contains("descricao") && !segundaColuna.contains("desc")) {
                throw new RuntimeException("Segunda coluna deve conter 'descricao' ou 'desc' (ex: DescricaoTemplate)");
            }
            
            log.info("Formato CSV validado com sucesso. Colunas: {}", String.join(", ", header));
            
        } catch (Exception e) {
            log.error("Erro na validação do formato CSV", e);
            throw new RuntimeException("Formato CSV inválido: " + e.getMessage());
        }
    }

    /**
     * Valida formato do Excel antes de processar
     */
    public void validarFormatoExcel(MultipartFile file) {
        try (Workbook workbook = createWorkbook(file)) {
            Sheet sheet = workbook.getSheetAt(0); // Primeira planilha
            
            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel deve ter pelo menos 2 linhas (cabeçalho + dados)");
            }
            
            // Ler cabeçalho
            Row headerRow = sheet.getRow(0);
            if (headerRow == null || headerRow.getPhysicalNumberOfCells() < 2) {
                throw new RuntimeException("Excel deve ter pelo menos 2 colunas: NomeTemplate,DescricaoTemplate");
            }
            
            // Verificar se as primeiras colunas são as esperadas
            String primeiraColuna = getCellValueAsString(headerRow.getCell(0));
            String segundaColuna = getCellValueAsString(headerRow.getCell(1));
            
            if (!primeiraColuna.toLowerCase().contains("nome") && !primeiraColuna.toLowerCase().contains("template")) {
                throw new RuntimeException("Primeira coluna deve conter 'nome' ou 'template' (ex: NomeTemplate)");
            }
            
            if (!segundaColuna.toLowerCase().contains("descricao") && !segundaColuna.toLowerCase().contains("desc")) {
                throw new RuntimeException("Segunda coluna deve conter 'descricao' ou 'desc' (ex: DescricaoTemplate)");
            }
            
            log.info("Formato Excel validado com sucesso. Colunas: {} e {}", primeiraColuna, segundaColuna);
            
        } catch (Exception e) {
            log.error("Erro na validação do formato Excel", e);
            throw new RuntimeException("Formato Excel inválido: " + e.getMessage());
        }
    }
}
