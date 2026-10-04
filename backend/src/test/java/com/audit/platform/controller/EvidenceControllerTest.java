package com.audit.platform.controller;

import com.audit.platform.dto.EvidenceResponse;
import com.audit.platform.service.EvidenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EvidenceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EvidenceService evidenceService;

    @InjectMocks
    private EvidenceController evidenceController;

    private EvidenceResponse sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(evidenceController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleResponse = new EvidenceResponse();
        sampleResponse.setId(100L);
        sampleResponse.setCorrectiveActionId(10L);
        sampleResponse.setUploadedById(1L);
        sampleResponse.setUploadedByName("Test User");
        sampleResponse.setUploadedByEmail("user@test.com");
        sampleResponse.setFileName("report.pdf");
        sampleResponse.setFileUrl("/api/evidence/100/download");
        sampleResponse.setUploadedAt(LocalDateTime.now());
    }

    @Test
    void uploadEvidenceForCorrectiveAction_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "report.pdf",
                "application/pdf",
                "sample content".getBytes()
        );

        when(evidenceService.uploadEvidence(eq(10L), eq(1L), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(multipart("/api/corrective-actions/10/evidence")
                        .file(file)
                        .param("uploadedById", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.fileName").value("report.pdf"));
    }

    @Test
    void uploadEvidenceDirect_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "report.pdf",
                "application/pdf",
                "sample content".getBytes()
        );

        when(evidenceService.uploadEvidence(eq(10L), eq(1L), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(multipart("/api/evidence")
                        .file(file)
                        .param("correctiveActionId", "10")
                        .param("uploadedById", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getEvidenceByCorrectiveActionId_Success() throws Exception {
        when(evidenceService.getEvidenceByCorrectiveActionId(10L))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/corrective-actions/10/evidence"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getAllEvidence_Success() throws Exception {
        when(evidenceService.getAllEvidence())
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/evidence"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getEvidenceById_Success() throws Exception {
        when(evidenceService.getEvidenceById(100L))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/evidence/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getEvidenceById_NotFound_ReturnsNotFound() throws Exception {
        when(evidenceService.getEvidenceById(999L))
                .thenThrow(new NoSuchElementException("Evidence not found with id: 999"));

        mockMvc.perform(get("/api/evidence/999"))
                .andExpect(status().isNotFound());
    }
}
