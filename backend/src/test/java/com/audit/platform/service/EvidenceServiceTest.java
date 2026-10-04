package com.audit.platform.service;

import com.audit.platform.dto.EvidenceResponse;
import com.audit.platform.entity.CorrectiveAction;
import com.audit.platform.entity.Evidence;
import com.audit.platform.entity.User;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.EvidenceRepository;
import com.audit.platform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvidenceServiceTest {

    @Mock
    private EvidenceRepository evidenceRepository;

    @Mock
    private CorrectiveActionRepository correctiveActionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EvidenceService evidenceService;

    private CorrectiveAction testCorrectiveAction;
    private User testUser;
    private Evidence testEvidence;

    @BeforeEach
    void setUp() {
        testCorrectiveAction = new CorrectiveAction();
        testCorrectiveAction.setId(10L);

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("user@test.com");

        testEvidence = new Evidence();
        testEvidence.setId(100L);
        testEvidence.setCorrectiveAction(testCorrectiveAction);
        testEvidence.setUploadedBy(testUser);
        testEvidence.setFileName("inspection_report.pdf");
        testEvidence.setFileUrl("/api/evidence/100/download");
        testEvidence.setUploadedAt(LocalDateTime.now());
    }

    @Test
    void uploadEvidence_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "inspection_report.pdf",
                "application/pdf",
                "Sample PDF content".getBytes()
        );

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(evidenceRepository.save(any(Evidence.class))).thenReturn(testEvidence);

        EvidenceResponse response = evidenceService.uploadEvidence(10L, 1L, file);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(10L, response.getCorrectiveActionId());
        assertEquals("inspection_report.pdf", response.getFileName());

        verify(correctiveActionRepository).findById(10L);
        verify(userRepository).findById(1L);
        verify(evidenceRepository, times(2)).save(any(Evidence.class));
    }

    @Test
    void uploadEvidence_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () ->
                evidenceService.uploadEvidence(10L, 1L, emptyFile));

        verify(evidenceRepository, never()).save(any());
    }

    @Test
    void uploadEvidence_InvalidCorrectiveActionId_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "content".getBytes()
        );

        when(correctiveActionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                evidenceService.uploadEvidence(999L, 1L, file));

        verify(evidenceRepository, never()).save(any());
    }

    @Test
    void uploadEvidence_InvalidUserId_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "content".getBytes()
        );

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                evidenceService.uploadEvidence(10L, 999L, file));

        verify(evidenceRepository, never()).save(any());
    }

    @Test
    void uploadEvidence_ForbiddenFileType_ThrowsException() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file",
                "malware.exe",
                "application/x-msdownload",
                "malicious binary".getBytes()
        );

        when(correctiveActionRepository.findById(10L)).thenReturn(Optional.of(testCorrectiveAction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () ->
                evidenceService.uploadEvidence(10L, 1L, exeFile));

        verify(evidenceRepository, never()).save(any());
    }

    @Test
    void getEvidenceByCorrectiveActionId_Success() {
        when(correctiveActionRepository.existsById(10L)).thenReturn(true);
        when(evidenceRepository.findByCorrectiveActionIdWithDetails(10L)).thenReturn(List.of(testEvidence));

        List<EvidenceResponse> result = evidenceService.getEvidenceByCorrectiveActionId(10L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getEvidenceByCorrectiveActionId_NotFound_ThrowsException() {
        when(correctiveActionRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () ->
                evidenceService.getEvidenceByCorrectiveActionId(999L));
    }

    @Test
    void getAllEvidence_Success() {
        when(evidenceRepository.findAllWithDetails()).thenReturn(List.of(testEvidence));

        List<EvidenceResponse> result = evidenceService.getAllEvidence();

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getEvidenceById_Success() {
        when(evidenceRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(testEvidence));

        EvidenceResponse response = evidenceService.getEvidenceById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
    }

    @Test
    void getEvidenceById_NotFound_ThrowsException() {
        when(evidenceRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                evidenceService.getEvidenceById(999L));
    }
}
