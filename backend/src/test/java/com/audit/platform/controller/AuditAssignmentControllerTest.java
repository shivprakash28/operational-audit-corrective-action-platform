package com.audit.platform.controller;

import com.audit.platform.dto.AssignAuditorRequest;
import com.audit.platform.dto.AuditAssignmentResponse;
import com.audit.platform.service.AuditAssignmentService;
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
class AuditAssignmentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuditAssignmentService auditAssignmentService;

    @InjectMocks
    private AuditAssignmentController auditAssignmentController;

    private ObjectMapper objectMapper;
    private AuditAssignmentResponse sampleResponse;
    private AssignAuditorRequest validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(auditAssignmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleResponse = new AuditAssignmentResponse(
                1L, 10L, 2L, "Jane Auditor", "jane@test.com", "AUDITOR", 2L, "Finance", now
        );

        validRequest = new AssignAuditorRequest(2L);
    }

    @Test
    void assignAuditor_success_returns201() throws Exception {
        when(auditAssignmentService.assignAuditor(eq(10L), any(AssignAuditorRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/audits/10/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.auditId").value(10L))
                .andExpect(jsonPath("$.auditorId").value(2L))
                .andExpect(jsonPath("$.auditorName").value("Jane Auditor"))
                .andExpect(jsonPath("$.auditorEmail").value("jane@test.com"))
                .andExpect(jsonPath("$.auditorRole").value("AUDITOR"))
                .andExpect(jsonPath("$.auditorDepartmentName").value("Finance"));
    }

    @Test
    void assignAuditor_missingAuditorId_returns400WithErrors() throws Exception {
        AssignAuditorRequest invalidRequest = new AssignAuditorRequest();

        mockMvc.perform(post("/api/audits/10/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.auditorId").exists());
    }

    @Test
    void assignAuditor_auditNotFound_returns404() throws Exception {
        when(auditAssignmentService.assignAuditor(eq(999L), any(AssignAuditorRequest.class)))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(post("/api/audits/999/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void assignAuditor_userNotFound_returns400() throws Exception {
        when(auditAssignmentService.assignAuditor(eq(10L), any(AssignAuditorRequest.class)))
                .thenThrow(new IllegalArgumentException("User not found with id: 999"));

        mockMvc.perform(post("/api/audits/10/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found with id: 999"));
    }

    @Test
    void assignAuditor_conflictOfInterest_returns400() throws Exception {
        when(auditAssignmentService.assignAuditor(eq(10L), any(AssignAuditorRequest.class)))
                .thenThrow(new IllegalArgumentException("Conflict of interest: Auditor belongs to the department being audited"));

        mockMvc.perform(post("/api/audits/10/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Conflict of interest: Auditor belongs to the department being audited"));
    }

    @Test
    void assignAuditor_duplicateAssignment_returns400() throws Exception {
        when(auditAssignmentService.assignAuditor(eq(10L), any(AssignAuditorRequest.class)))
                .thenThrow(new IllegalArgumentException("Auditor is already assigned to this audit"));

        mockMvc.perform(post("/api/audits/10/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Auditor is already assigned to this audit"));
    }

    @Test
    void getAssignments_existingAudit_returns200() throws Exception {
        when(auditAssignmentService.getAssignments(10L))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/audits/10/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].auditId").value(10L))
                .andExpect(jsonPath("$[0].auditorName").value("Jane Auditor"))
                .andExpect(jsonPath("$[0].auditorRole").value("AUDITOR"));
    }

    @Test
    void getAssignments_nonExistingAudit_returns404() throws Exception {
        when(auditAssignmentService.getAssignments(999L))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(get("/api/audits/999/assignments"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }
}
