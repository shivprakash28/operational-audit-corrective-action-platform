package com.audit.platform.controller;

import com.audit.platform.dto.AuditRequest;
import com.audit.platform.dto.AuditResponse;
import com.audit.platform.entity.AuditStatus;
import com.audit.platform.service.AuditService;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuditController auditController;

    private ObjectMapper objectMapper;
    private AuditResponse sampleResponse;
    private AuditRequest validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(auditController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleResponse = new AuditResponse();
        sampleResponse.setId(1L);
        sampleResponse.setTitle("Financial Audit");
        sampleResponse.setScope("Annual finance review");
        sampleResponse.setObjectives("Verify statements");
        sampleResponse.setCriteria("IFRS");
        sampleResponse.setPlannedStartDate(now);
        sampleResponse.setPlannedEndDate(now.plusDays(5));
        sampleResponse.setStatus(AuditStatus.PLANNED);
        sampleResponse.setDepartmentId(1L);
        sampleResponse.setDepartmentName("Finance");
        sampleResponse.setCreatedById(1L);
        sampleResponse.setCreatedByName("Auditor User");
        sampleResponse.setCreatedAt(now);
        sampleResponse.setUpdatedAt(now);

        validRequest = new AuditRequest();
        validRequest.setTitle("Financial Audit");
        validRequest.setScope("Annual finance review");
        validRequest.setObjectives("Verify statements");
        validRequest.setCriteria("IFRS");
        validRequest.setPlannedStartDate(now);
        validRequest.setPlannedEndDate(now.plusDays(5));
        validRequest.setDepartmentId(1L);
        validRequest.setCreatedById(1L);
    }

    @Test
    void getAllAudits_returns200() throws Exception {
        when(auditService.getAllAudits()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/audits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Financial Audit"))
                .andExpect(jsonPath("$[0].departmentName").value("Finance"));
    }

    @Test
    void getAuditById_existing_returns200() throws Exception {
        when(auditService.getAuditById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/audits/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Financial Audit"));
    }

    @Test
    void getAuditById_nonExisting_returns404() throws Exception {
        when(auditService.getAuditById(99L)).thenThrow(new NoSuchElementException("Not found"));

        mockMvc.perform(get("/api/audits/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createAudit_validRequest_returns201() throws Exception {
        when(auditService.createAudit(any(AuditRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Financial Audit"));
    }

    @Test
    void createAudit_missingTitle_returns400WithErrors() throws Exception {
        validRequest.setTitle("");

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void createAudit_invalidDepartmentId_returns400WithMessage() throws Exception {
        when(auditService.createAudit(any(AuditRequest.class)))
                .thenThrow(new IllegalArgumentException("Department not found with id: 99"));

        validRequest.setDepartmentId(99L);

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Department not found with id: 99"));
    }

    @Test
    void createAudit_invalidCreatedById_returns400WithMessage() throws Exception {
        when(auditService.createAudit(any(AuditRequest.class)))
                .thenThrow(new IllegalArgumentException("User not found with id: 99"));

        validRequest.setCreatedById(99L);

        mockMvc.perform(post("/api/audits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found with id: 99"));
    }

    @Test
    void updateAudit_validRequest_returns200() throws Exception {
        when(auditService.updateAudit(eq(1L), any(AuditRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(put("/api/audits/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateAudit_nonExisting_returns404() throws Exception {
        when(auditService.updateAudit(eq(99L), any(AuditRequest.class)))
                .thenThrow(new NoSuchElementException("Not found"));

        mockMvc.perform(put("/api/audits/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteAudit_existing_returns204() throws Exception {
        doNothing().when(auditService).deleteAudit(1L);

        mockMvc.perform(delete("/api/audits/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteAudit_nonExisting_returns404() throws Exception {
        doThrow(new NoSuchElementException("Not found")).when(auditService).deleteAudit(99L);

        mockMvc.perform(delete("/api/audits/99"))
                .andExpect(status().isNotFound());
    }
}
