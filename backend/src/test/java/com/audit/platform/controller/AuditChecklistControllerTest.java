package com.audit.platform.controller;

import com.audit.platform.dto.AssignChecklistRequest;
import com.audit.platform.dto.AuditChecklistResponse;
import com.audit.platform.dto.ChecklistResponseDto;
import com.audit.platform.dto.ChecklistResponseRequest;
import com.audit.platform.entity.ChecklistResponseStatus;
import com.audit.platform.service.AuditChecklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuditChecklistControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuditChecklistService auditChecklistService;

    @InjectMocks
    private AuditChecklistController auditChecklistController;

    private ObjectMapper objectMapper;
    private AuditChecklistResponse sampleAuditChecklistResponse;
    private ChecklistResponseDto sampleResponseDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(auditChecklistController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleAuditChecklistResponse = new AuditChecklistResponse(50L, 10L, 1L, "Operations Checklist", "Review Ops", now);
        sampleResponseDto = new ChecklistResponseDto(1000L, 50L, 100L, "Are procedures documented?", ChecklistResponseStatus.COMPLIANT, "Verified", now);
    }

    @Test
    void assignChecklist_success_returns201() throws Exception {
        when(auditChecklistService.assignChecklist(eq(10L), any(AssignChecklistRequest.class)))
                .thenReturn(sampleAuditChecklistResponse);

        AssignChecklistRequest req = new AssignChecklistRequest(1L);

        mockMvc.perform(post("/api/audits/10/checklists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(50L))
                .andExpect(jsonPath("$.auditId").value(10L))
                .andExpect(jsonPath("$.templateId").value(1L))
                .andExpect(jsonPath("$.templateName").value("Operations Checklist"));
    }

    @Test
    void assignChecklist_missingTemplateId_returns400() throws Exception {
        AssignChecklistRequest req = new AssignChecklistRequest();

        mockMvc.perform(post("/api/audits/10/checklists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.templateId").exists());
    }

    @Test
    void assignChecklist_auditNotFound_returns404() throws Exception {
        when(auditChecklistService.assignChecklist(eq(999L), any(AssignChecklistRequest.class)))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        AssignChecklistRequest req = new AssignChecklistRequest(1L);

        mockMvc.perform(post("/api/audits/999/checklists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void assignChecklist_templateNotFound_returns400() throws Exception {
        when(auditChecklistService.assignChecklist(eq(10L), any(AssignChecklistRequest.class)))
                .thenThrow(new IllegalArgumentException("Checklist template not found with id: 999"));

        AssignChecklistRequest req = new AssignChecklistRequest(999L);

        mockMvc.perform(post("/api/audits/10/checklists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Checklist template not found with id: 999"));
    }

    @Test
    void assignChecklist_duplicate_returns400() throws Exception {
        when(auditChecklistService.assignChecklist(eq(10L), any(AssignChecklistRequest.class)))
                .thenThrow(new IllegalArgumentException("Checklist template is already assigned to this audit"));

        AssignChecklistRequest req = new AssignChecklistRequest(1L);

        mockMvc.perform(post("/api/audits/10/checklists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Checklist template is already assigned to this audit"));
    }

    @Test
    void getAuditChecklists_returns200() throws Exception {
        when(auditChecklistService.getAuditChecklists(10L))
                .thenReturn(List.of(sampleAuditChecklistResponse));

        mockMvc.perform(get("/api/audits/10/checklists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(50L))
                .andExpect(jsonPath("$[0].templateName").value("Operations Checklist"));
    }

    @Test
    void submitResponse_compliant_returns201() throws Exception {
        when(auditChecklistService.submitResponse(eq(10L), eq(50L), any(ChecklistResponseRequest.class)))
                .thenReturn(sampleResponseDto);

        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.COMPLIANT, "Verified");

        mockMvc.perform(post("/api/audits/10/checklists/50/responses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1000L))
                .andExpect(jsonPath("$.status").value("COMPLIANT"))
                .andExpect(jsonPath("$.remarks").value("Verified"));
    }

    @Test
    void submitResponse_nonCompliant_returns201() throws Exception {
        ChecklistResponseDto nonCompliantDto = new ChecklistResponseDto(1001L, 50L, 100L, "Question?", ChecklistResponseStatus.NON_COMPLIANT, "Failed", LocalDateTime.now());
        when(auditChecklistService.submitResponse(eq(10L), eq(50L), any(ChecklistResponseRequest.class)))
                .thenReturn(nonCompliantDto);

        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.NON_COMPLIANT, "Failed");

        mockMvc.perform(post("/api/audits/10/checklists/50/responses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NON_COMPLIANT"));
    }

    @Test
    void submitResponse_na_returns201() throws Exception {
        ChecklistResponseDto naDto = new ChecklistResponseDto(1002L, 50L, 100L, "Question?", ChecklistResponseStatus.NA, "N/A", LocalDateTime.now());
        when(auditChecklistService.submitResponse(eq(10L), eq(50L), any(ChecklistResponseRequest.class)))
                .thenReturn(naDto);

        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.NA, "N/A");

        mockMvc.perform(post("/api/audits/10/checklists/50/responses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NA"));
    }

    @Test
    void submitResponse_invalidStatus_returns400() throws Exception {
        String invalidJson = "{\"checklistItemId\": 100, \"status\": \"INVALID_STATUS\", \"remarks\": \"bad\"}";

        mockMvc.perform(post("/api/audits/10/checklists/50/responses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request body or status value"));
    }

    @Test
    void submitResponse_invalidRelationship_returns400() throws Exception {
        when(auditChecklistService.submitResponse(eq(10L), eq(50L), any(ChecklistResponseRequest.class)))
                .thenThrow(new IllegalArgumentException("Checklist item does not belong to template"));

        ChecklistResponseRequest req = new ChecklistResponseRequest(200L, ChecklistResponseStatus.COMPLIANT, "bad");

        mockMvc.perform(post("/api/audits/10/checklists/50/responses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Checklist item does not belong to template"));
    }

    @Test
    void getResponses_returns200() throws Exception {
        when(auditChecklistService.getResponses(10L, 50L))
                .thenReturn(List.of(sampleResponseDto));

        mockMvc.perform(get("/api/audits/10/checklists/50/responses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1000L))
                .andExpect(jsonPath("$[0].status").value("COMPLIANT"));
    }
}
