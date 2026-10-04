package com.audit.platform.controller;

import com.audit.platform.dto.VerificationRequest;
import com.audit.platform.dto.VerificationResponse;
import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.entity.VerificationStatus;
import com.audit.platform.service.VerificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VerificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VerificationService verificationService;

    @InjectMocks
    private VerificationController verificationController;

    private ObjectMapper objectMapper;
    private VerificationResponse sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(verificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        sampleResponse = new VerificationResponse();
        sampleResponse.setId(100L);
        sampleResponse.setCorrectiveActionId(10L);
        sampleResponse.setCorrectiveActionTitle("Fix Safety Valve");
        sampleResponse.setCorrectiveActionStatus(CorrectiveActionStatus.IN_PROGRESS);
        sampleResponse.setVerifierId(2L);
        sampleResponse.setVerifierName("Verifier User");
        sampleResponse.setVerifierEmail("verifier@test.com");
        sampleResponse.setStatus(VerificationStatus.PENDING);
        sampleResponse.setComments("Awaiting inspection");
    }

    @Test
    void createVerificationForCorrectiveAction_Success() throws Exception {
        VerificationRequest request = new VerificationRequest();
        request.setCorrectiveActionId(10L);
        request.setVerifierId(2L);
        request.setComments("Awaiting inspection");

        when(verificationService.createVerification(eq(10L), any(VerificationRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/corrective-actions/10/verifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createVerificationDirect_Success() throws Exception {
        VerificationRequest request = new VerificationRequest();
        request.setCorrectiveActionId(10L);
        request.setVerifierId(2L);

        when(verificationService.createVerification(eq(10L), any(VerificationRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/verifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getVerificationsByCorrectiveActionId_Success() throws Exception {
        when(verificationService.getVerificationsByCorrectiveActionId(10L))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/corrective-actions/10/verifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getAllVerifications_Success() throws Exception {
        when(verificationService.getAllVerifications())
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/verifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getVerificationById_Success() throws Exception {
        when(verificationService.getVerificationById(100L))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/verifications/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getVerificationById_NotFound_ReturnsNotFound() throws Exception {
        when(verificationService.getVerificationById(999L))
                .thenThrow(new NoSuchElementException("Verification not found with id: 999"));

        mockMvc.perform(get("/api/verifications/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void approveVerification_Success() throws Exception {
        sampleResponse.setStatus(VerificationStatus.APPROVED);
        sampleResponse.setCorrectiveActionStatus(CorrectiveActionStatus.VERIFIED);
        sampleResponse.setVerifiedAt(LocalDateTime.now());

        when(verificationService.approveVerification(eq(100L), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/verifications/100/approve?comments=Verified+cleanly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.correctiveActionStatus").value("VERIFIED"));
    }

    @Test
    void rejectVerification_Success() throws Exception {
        sampleResponse.setStatus(VerificationStatus.REJECTED);
        sampleResponse.setCorrectiveActionStatus(CorrectiveActionStatus.IN_PROGRESS);
        sampleResponse.setVerifiedAt(LocalDateTime.now());

        when(verificationService.rejectVerification(eq(100L), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/verifications/100/reject?comments=Evidence+insufficient"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.correctiveActionStatus").value("IN_PROGRESS"));
    }

    @Test
    void updateStatus_InvalidStatus_ReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/verifications/100/status?status=INVALID_STATUS"))
                .andExpect(status().isBadRequest());
    }
}
