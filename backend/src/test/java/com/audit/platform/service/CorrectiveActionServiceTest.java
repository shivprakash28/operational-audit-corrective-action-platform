package com.audit.platform.service;

import com.audit.platform.dto.CorrectiveActionRequest;
import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.entity.*;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.FindingRepository;
import com.audit.platform.repository.UserRepository;
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
class CorrectiveActionServiceTest {

    @Mock
    private CorrectiveActionRepository correctiveActionRepository;

    @Mock
    private FindingRepository findingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CorrectiveActionService correctiveActionService;

    private Finding testFinding;
    private User testOwner;
    private CorrectiveAction testCorrectiveAction;
    private LocalDateTime testDueDate;

    @BeforeEach
    void setUp() {
        Audit testAudit = new Audit();
        testAudit.setId(1L);

        testFinding = new Finding();
        testFinding.setId(10L);
        testFinding.setAudit(testAudit);
        testFinding.setDescription("Safety violation finding");

        testOwner = new User();
        testOwner.setId(5L);
        testOwner.setName("Jane ActionOwner");
        testOwner.setEmail("jane@example.com");

        testDueDate = LocalDateTime.now().plusDays(10);

        testCorrectiveAction = new CorrectiveAction();
        testCorrectiveAction.setId(100L);
        testCorrectiveAction.setFinding(testFinding);
        testCorrectiveAction.setTitle("Fix Safety Valve");
        testCorrectiveAction.setDescription("Replace safety valve within 10 days");
        testCorrectiveAction.setOwner(testOwner);
        testCorrectiveAction.setDueDate(testDueDate);
        testCorrectiveAction.setStatus(CorrectiveActionStatus.OPEN);
        testCorrectiveAction.setCreatedAt(LocalDateTime.now());
        testCorrectiveAction.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createCorrectiveAction_Success() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(10L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve within 10 days");
        request.setOwnerId(5L);
        request.setDueDate(testDueDate);
        request.setStatus(CorrectiveActionStatus.OPEN);

        when(findingRepository.findById(10L)).thenReturn(Optional.of(testFinding));
        when(userRepository.findById(5L)).thenReturn(Optional.of(testOwner));
        when(correctiveActionRepository.save(any(CorrectiveAction.class))).thenReturn(testCorrectiveAction);

        CorrectiveActionResponse response = correctiveActionService.createCorrectiveAction(10L, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(10L, response.getFindingId());
        assertEquals("Fix Safety Valve", response.getTitle());
        assertEquals(5L, response.getOwnerId());
        assertEquals(CorrectiveActionStatus.OPEN, response.getStatus());

        verify(findingRepository).findById(10L);
        verify(userRepository).findById(5L);
        verify(correctiveActionRepository).save(any(CorrectiveAction.class));
    }

    @Test
    void createCorrectiveAction_FindingNotFound_ThrowsException() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(999L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve");
        request.setOwnerId(5L);
        request.setDueDate(testDueDate);

        when(findingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                correctiveActionService.createCorrectiveAction(999L, request));

        verify(correctiveActionRepository, never()).save(any());
    }

    @Test
    void createCorrectiveAction_OwnerNotFound_ThrowsException() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(10L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve");
        request.setOwnerId(999L);
        request.setDueDate(testDueDate);

        when(findingRepository.findById(10L)).thenReturn(Optional.of(testFinding));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                correctiveActionService.createCorrectiveAction(10L, request));

        verify(correctiveActionRepository, never()).save(any());
    }

    @Test
    void createCorrectiveAction_MissingDeadline_ThrowsException() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(10L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve");
        request.setOwnerId(5L);
        request.setDueDate(null);

        when(findingRepository.findById(10L)).thenReturn(Optional.of(testFinding));
        when(userRepository.findById(5L)).thenReturn(Optional.of(testOwner));

        assertThrows(IllegalArgumentException.class, () ->
                correctiveActionService.createCorrectiveAction(10L, request));

        verify(correctiveActionRepository, never()).save(any());
    }

    @Test
    void createCorrectiveAction_FindingIdMismatch_ThrowsException() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(20L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve");
        request.setOwnerId(5L);
        request.setDueDate(testDueDate);

        assertThrows(IllegalArgumentException.class, () ->
                correctiveActionService.createCorrectiveAction(10L, request));
    }

    @Test
    void getCorrectiveActionsByFindingId_Success() {
        when(findingRepository.existsById(10L)).thenReturn(true);
        when(correctiveActionRepository.findByFindingIdWithDetails(10L)).thenReturn(List.of(testCorrectiveAction));

        List<CorrectiveActionResponse> result = correctiveActionService.getCorrectiveActionsByFindingId(10L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getCorrectiveActionsByFindingId_FindingNotFound_ThrowsException() {
        when(findingRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () ->
                correctiveActionService.getCorrectiveActionsByFindingId(999L));
    }

    @Test
    void getAllCorrectiveActions_Success() {
        when(correctiveActionRepository.findAllWithDetails()).thenReturn(List.of(testCorrectiveAction));

        List<CorrectiveActionResponse> result = correctiveActionService.getAllCorrectiveActions();

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getOverdueCorrectiveActions_Success() {
        when(correctiveActionRepository.findOverdueActions(any(LocalDateTime.class), any())).thenReturn(List.of(testCorrectiveAction));

        List<CorrectiveActionResponse> result = correctiveActionService.getOverdueCorrectiveActions();

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
    }

    @Test
    void getCorrectiveActionById_Success() {
        when(correctiveActionRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(testCorrectiveAction));

        CorrectiveActionResponse response = correctiveActionService.getCorrectiveActionById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
    }

    @Test
    void getCorrectiveActionById_NotFound_ThrowsException() {
        when(correctiveActionRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                correctiveActionService.getCorrectiveActionById(999L));
    }

    @Test
    void updateCorrectiveAction_Success() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setTitle("Updated Action Title");
        request.setDescription("Updated Action Description");
        request.setStatus(CorrectiveActionStatus.IN_PROGRESS);

        when(correctiveActionRepository.findById(100L)).thenReturn(Optional.of(testCorrectiveAction));
        when(correctiveActionRepository.save(any(CorrectiveAction.class))).thenReturn(testCorrectiveAction);

        CorrectiveActionResponse response = correctiveActionService.updateCorrectiveAction(100L, request);

        assertNotNull(response);
        verify(correctiveActionRepository).save(testCorrectiveAction);
    }

    @Test
    void updateCorrectiveAction_NotFound_ThrowsException() {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setTitle("Updated Title");

        when(correctiveActionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                correctiveActionService.updateCorrectiveAction(999L, request));
    }

    @Test
    void updateStatus_Success() {
        when(correctiveActionRepository.findById(100L)).thenReturn(Optional.of(testCorrectiveAction));
        when(correctiveActionRepository.save(any(CorrectiveAction.class))).thenReturn(testCorrectiveAction);

        CorrectiveActionResponse response = correctiveActionService.updateStatus(100L, CorrectiveActionStatus.COMPLETED);

        assertNotNull(response);
        verify(correctiveActionRepository).save(testCorrectiveAction);
    }

    @Test
    void updateStatus_NotFound_ThrowsException() {
        when(correctiveActionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                correctiveActionService.updateStatus(999L, CorrectiveActionStatus.CLOSED));
    }

    @Test
    void updateStatus_NullStatus_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () ->
                correctiveActionService.updateStatus(100L, null));
    }
}
