package com.audit.platform.controller;

import com.audit.platform.dto.ObservationRequest;
import com.audit.platform.dto.ObservationResponse;
import com.audit.platform.service.ObservationService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ObservationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ObservationService observationService;

    @InjectMocks
    private ObservationController observationController;

    private ObjectMapper objectMapper;
    private ObservationResponse sampleResponse;
    private ObservationRequest validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(observationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleResponse = new ObservationResponse(
                1L, 10L, "Ops Audit", 100L, "Are SOPs followed?",
                "SOP v1 is outdated.", "http://evidence.link/sop.pdf",
                5L, "Jane Auditor", "jane@test.com", now, now
        );

        validRequest = new ObservationRequest(10L, 100L, "SOP v1 is outdated.", "http://evidence.link/sop.pdf", 5L);
    }

    @Test
    void createObservation_success_returns201() throws Exception {
        when(observationService.createObservation(eq(10L), any(ObservationRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/audits/10/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.auditId").value(10L))
                .andExpect(jsonPath("$.checklistItemId").value(100L))
                .andExpect(jsonPath("$.description").value("SOP v1 is outdated."))
                .andExpect(jsonPath("$.createdByName").value("Jane Auditor"));
    }

    @Test
    void createObservation_missingDescription_returns400() throws Exception {
        validRequest.setDescription("");

        mockMvc.perform(post("/api/audits/10/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.description").exists());
    }

    @Test
    void createObservation_invalidAudit_returns404() throws Exception {
        when(observationService.createObservation(eq(999L), any(ObservationRequest.class)))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(post("/api/audits/999/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void createObservation_invalidChecklistItem_returns400() throws Exception {
        when(observationService.createObservation(eq(10L), any(ObservationRequest.class)))
                .thenThrow(new IllegalArgumentException("Checklist item not found with id: 999"));

        validRequest.setChecklistItemId(999L);

        mockMvc.perform(post("/api/audits/10/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Checklist item not found with id: 999"));
    }

    @Test
    void createObservation_invalidCreator_returns400() throws Exception {
        when(observationService.createObservation(eq(10L), any(ObservationRequest.class)))
                .thenThrow(new IllegalArgumentException("User not found with id: 999"));

        validRequest.setCreatedById(999L);

        mockMvc.perform(post("/api/audits/10/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found with id: 999"));
    }

    @Test
    void createObservation_invalidRelationship_returns400() throws Exception {
        when(observationService.createObservation(eq(10L), any(ObservationRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid relationship: Checklist item is not associated with audit"));

        mockMvc.perform(post("/api/audits/10/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid relationship: Checklist item is not associated with audit"));
    }

    @Test
    void getObservationsByAuditId_returns200() throws Exception {
        when(observationService.getObservationsByAuditId(10L)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/audits/10/observations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].auditId").value(10L))
                .andExpect(jsonPath("$[0].description").value("SOP v1 is outdated."));
    }

    @Test
    void getObservationsByAuditId_invalidAudit_returns404() throws Exception {
        when(observationService.getObservationsByAuditId(999L))
                .thenThrow(new NoSuchElementException("Audit not found with id: 999"));

        mockMvc.perform(get("/api/audits/999/observations"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Audit not found with id: 999"));
    }

    @Test
    void getObservationById_returns200() throws Exception {
        when(observationService.getObservationById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/observations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.createdByName").value("Jane Auditor"));
    }

    @Test
    void getObservationById_nonExisting_returns404() throws Exception {
        when(observationService.getObservationById(999L))
                .thenThrow(new NoSuchElementException("Observation not found with id: 999"));

        mockMvc.perform(get("/api/observations/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Observation not found with id: 999"));
    }

    @Test
    void updateObservation_returns200() throws Exception {
        when(observationService.updateObservation(eq(1L), any(ObservationRequest.class)))
                .thenReturn(sampleResponse);

        ObservationRequest updateReq = new ObservationRequest();
        updateReq.setDescription("Updated description.");

        mockMvc.perform(put("/api/observations/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateObservation_nonExisting_returns404() throws Exception {
        when(observationService.updateObservation(eq(999L), any(ObservationRequest.class)))
                .thenThrow(new NoSuchElementException("Observation not found with id: 999"));

        ObservationRequest updateReq = new ObservationRequest();
        updateReq.setDescription("Updated description.");

        mockMvc.perform(put("/api/observations/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Observation not found with id: 999"));
    }
}
