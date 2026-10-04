package com.audit.platform.service;

import com.audit.platform.dto.VerificationRequest;
import com.audit.platform.dto.VerificationResponse;
import com.audit.platform.entity.*;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.UserRepository;
import com.audit.platform.repository.VerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock
    private VerificationRepository verificationRepository;

    @Mock
    private CorrectiveActionRepository correctiveActionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VerificationService verificationService;

    private CorrectiveAction testCorrectiveAction;
    private User testVerifier;
    private Verification testVerification;

    @BeforeEach
    void setUp() {
        testCorrectiveAction = new CorrectiveAction();
        testCorrectiveAction.setId(10L);
        testCorrectiveAction.setTitle("Fix Safety Valve");
        testCorrectiveAction.setStatus(CorrectiveActionStatus.IN_PROGRESS);

        testVerifier = new User();
        testVerifier.setId(2L);
        testVerifier.setName("Verifier User");
        testVerifier.setEmail("verifier@test.com");

        testVerification = new Verification();
        testVerification.setId(100L);
        testVerification.setCorrectiveAction(testCorrectiveAction);
        testVerification.setVerifier(testVerifier);
        testVerification.setStatus(VerificationStatus.PENDING);
        testVerification.setComments("Awaiting inspector review");
    }

    @Test
    void createVerification_Success() {
        VerificationRequest request = new VerificationRequest();
        request.setCorrectiveActionId(10L);
        request.setVerifierId(2L);
        request.setComments("Awaiting inspector review");

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testVerifier));
        when(verificationRepository.save(any(Verification.class))).thenReturn(testVerification);

        VerificationResponse response = verificationService.createVerification(10L, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(10L, response.getCorrectiveActionId());
        assertEquals(2L, response.getVerifierId());
        assertEquals(VerificationStatus.PENDING, response.getStatus());

        verify(correctiveActionRepository).findById(10L);
        verify(userRepository).findById(2L);
        verify(verificationRepository).save(any(Verification.class));
    }

    @Test
    void createVerification_ActionNotFound_ThrowsException() {
        VerificationRequest request = new VerificationRequest();
        request.setCorrectiveActionId(999L);
        request.setVerifierId(2L);

        when(correctiveActionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                verificationService.createVerification(999L, request));

        verify(verificationRepository, never()).save(any());
    }

    @Test
    void createVerification_VerifierNotFound_ThrowsException() {
        VerificationRequest request = new VerificationRequest();
        request.setCorrectiveActionId(10L);
        request.setVerifierId(999L);

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                verificationService.createVerification(10L, request));

        verify(verificationRepository, never()).save(any());
    }

    @Test
    void approveVerification_Success() {
        when(verificationRepository.findById(100L)).thenReturn(Optional.of(testVerification));
        when(verificationRepository.save(any(Verification.class))).thenReturn(testVerification);

        VerificationResponse response = verificationService.approveVerification(100L, "Compliance verified");

        assertNotNull(response);
        assertEquals(CorrectiveActionStatus.VERIFIED, testCorrectiveAction.getStatus());

        verify(correctiveActionRepository).save(testCorrectiveAction);
        verify(verificationRepository).save(testVerification);
    }

    @Test
    void approveVerification_NotFound_ThrowsException() {
        when(verificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                verificationService.approveVerification(999L, "Approved"));
    }

    @Test
    void rejectVerification_Success() {
        when(verificationRepository.findById(100L)).thenReturn(Optional.of(testVerification));
        when(verificationRepository.save(any(Verification.class))).thenReturn(testVerification);

        VerificationResponse response = verificationService.rejectVerification(100L, "Insufficient evidence attached");

        assertNotNull(response);
        assertEquals(CorrectiveActionStatus.IN_PROGRESS, testCorrectiveAction.getStatus());

        verify(correctiveActionRepository).save(testCorrectiveAction);
        verify(verificationRepository).save(testVerification);
    }

    @Test
    void rejectVerification_NotFound_ThrowsException() {
        when(verificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                verificationService.rejectVerification(999L, "Rejected"));
    }

    @Test
    void getVerificationsByCorrectiveActionId_Success() {
        when(correctiveActionRepository.existsById(10L)).thenReturn(true);
        when(verificationRepository.findByCorrectiveActionIdWithDetails(10L)).thenReturn(List.of(testVerification));

        List<VerificationResponse> result = verificationService.getVerificationsByCorrectiveActionId(10L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getVerificationsByCorrectiveActionId_NotFound_ThrowsException() {
        when(correctiveActionRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () ->
                verificationService.getVerificationsByCorrectiveActionId(999L));
    }

    @Test
    void getAllVerifications_Success() {
        when(verificationRepository.findAllWithDetails()).thenReturn(List.of(testVerification));

        List<VerificationResponse> result = verificationService.getAllVerifications();

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getVerificationById_Success() {
        when(verificationRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(testVerification));

        VerificationResponse response = verificationService.getVerificationById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
    }

    @Test
    void getVerificationById_NotFound_ThrowsException() {
        when(verificationRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                verificationService.getVerificationById(999L));
    }
}
