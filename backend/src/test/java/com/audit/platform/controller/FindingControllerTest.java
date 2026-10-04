package com.audit.platform.controller;

import com.audit.platform.dto.FindingRequest;
import com.audit.platform.dto.FindingResponse;
import com.audit.platform.entity.FindingSeverity;
import com.audit.platform.entity.FindingStatus;
import com.audit.platform.service.FindingService;
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
import java.util.Map;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FindingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FindingService findingService;

    @InjectMocks
    private FindingController findingController;

    private ObjectMapper objectMapper;
    private FindingResponse sampleResponse;
    private FindingRequest validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(findingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleResponse = new FindingResponse(
                1L, 10L, "Ops Audit", 100L, "SOP outdated",
                FindingSeverity.MAJOR, 5L, "Ops Dept",
                3L, "John Manager", "john@test.com",
                FindingStatus.OPEN, "Major finding: SOP outdated for 2 years",
                now, now
        );

        validRequest = new FindingRequest(10L, 100L, FindingSeverity.MAJOR, 5L, 3L, FindingStatus.OPEN, "Major finding: SOP outdated for 2 years");
    }

    @Test
    void createFindingForAudit_success_returns201() throws Exception {
        when(findingService.createFinding(eq(10L), any(FindingRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/audits/10/findings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.auditId").value(10L))
                .andExpect(jsonPath("$.observationId").value(100L))
                .andExpect(jsonPath("$.severity").value("MAJOR"))
                .andExpect(jsonPath("$.responsibleDepartmentName").value("Ops Dept"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void createFindingDirect_success_returns201() throws Exception {
        when(findingService.createFinding(eq(10L), any(FindingRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/findings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.auditId").value(10L));
    }

    @Test
    void createFinding_missingRequiredFields_returns400() throws Exception {
        FindingRequest invalidReq = new FindingRequest();

        mockMvc.perform(post("/api/audits/10/findings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.observationId").exists())
                .andExpect(jsonPath("$.errors.severity").exists())
                .andExpect(jsonPath("$.errors.responsibleDepartmentId").exists())
                .andExpect(jsonPath("$.errors.description").exists());
    }

    @Test
    void createFinding_invalidAudit_returns404() throws Exception {
        when(findingService.createFinding(eq(999L), any(FindingRequest.class)))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(post("/api/audits/999/findings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void createFinding_observationAuditMismatch_returns400() throws Exception {
        when(findingService.createFinding(eq(10L), any(FindingRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid relationship: Observation does not belong to audit"));

        mockMvc.perform(post("/api/audits/10/findings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid relationship: Observation does not belong to audit"));
    }

    @Test
    void getFindingsByAuditId_returns200() throws Exception {
        when(findingService.getFindingsByAuditId(10L)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/audits/10/findings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].auditId").value(10L))
                .andExpect(jsonPath("$[0].severity").value("MAJOR"));
    }

    @Test
    void getFindingsByAuditId_invalidAudit_returns404() throws Exception {
        when(findingService.getFindingsByAuditId(999L))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(get("/api/audits/999/findings"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void getFindingById_returns200() throws Exception {
        when(findingService.getFindingById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/findings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.ownerName").value("John Manager"));
    }

    @Test
    void getFindingById_nonExisting_returns404() throws Exception {
        when(findingService.getFindingById(999L))
                .thenThrow(new NoSuchElementException("Finding not found with id: 999"));

        mockMvc.perform(get("/api/findings/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Finding not found with id: 999"));
    }

    @Test
    void updateFinding_returns200() throws Exception {
        when(findingService.updateFinding(eq(1L), any(FindingRequest.class)))
                .thenReturn(sampleResponse);

        FindingRequest updateReq = new FindingRequest();
        updateReq.setSeverity(FindingSeverity.CRITICAL);

        mockMvc.perform(put("/api/findings/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateStatus_success_returns200() throws Exception {
        sampleResponse.setStatus(FindingStatus.IN_PROGRESS);
        when(findingService.updateStatus(1L, FindingStatus.IN_PROGRESS)).thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/findings/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "IN_PROGRESS"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void updateStatus_invalidEnum_returns400() throws Exception {
        mockMvc.perform(patch("/api/findings/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "INVALID_STATUS"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid status value: INVALID_STATUS"));
    }

    @Test
    void updateSeverity_success_returns200() throws Exception {
        sampleResponse.setSeverity(FindingSeverity.CRITICAL);
        when(findingService.updateSeverity(1L, FindingSeverity.CRITICAL)).thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/findings/1/severity")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("severity", "CRITICAL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.severity").value("CRITICAL"));
    }

    @Test
    void updateSeverity_invalidEnum_returns400() throws Exception {
        mockMvc.perform(patch("/api/findings/1/severity")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("severity", "EXTREME"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid severity value: EXTREME"));
    }
}
