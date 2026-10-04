package com.audit.platform.service;

import com.audit.platform.dto.ObservationRequest;
import com.audit.platform.dto.ObservationResponse;
import com.audit.platform.entity.*;
import com.audit.platform.repository.*;
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
class ObservationServiceTest {

    @Mock
    private ObservationRepository observationRepository;

    @Mock
    private AuditRepository auditRepository;

    @Mock
    private ChecklistItemRepository checklistItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditChecklistRepository auditChecklistRepository;

    @InjectMocks
    private ObservationService observationService;

    private Audit audit;
    private ChecklistTemplate template1;
    private ChecklistTemplate template2;
    private ChecklistItem itemTemplate1;
    private ChecklistItem itemTemplate2;
    private User creator;
    private Observation observation;
    private ObservationRequest validRequest;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        audit = new Audit();
        audit.setId(10L);
        audit.setTitle("Operations Process Audit");

        template1 = new ChecklistTemplate();
        template1.setId(1L);
        template1.setName("Operations Template");

        template2 = new ChecklistTemplate();
        template2.setId(2L);
        template2.setName("Unrelated Template");

        itemTemplate1 = new ChecklistItem();
        itemTemplate1.setId(100L);
        itemTemplate1.setTemplate(template1);
        itemTemplate1.setQuestion("Are procedures documented?");
        itemTemplate1.setOrder(1);

        itemTemplate2 = new ChecklistItem();
        itemTemplate2.setId(200L);
        itemTemplate2.setTemplate(template2);
        itemTemplate2.setQuestion("Is MFA enabled?");
        itemTemplate2.setOrder(1);

        creator = new User();
        creator.setId(5L);
        creator.setName("Jane Lead Auditor");
        creator.setEmail("jane@test.com");
        creator.setRole(Role.AUDITOR);

        observation = new Observation();
        observation.setId(1L);
        observation.setAudit(audit);
        observation.setChecklistItem(itemTemplate1);
        observation.setDescription("Procedure SOP v1 is outdated.");
        observation.setEvidenceUrl("http://evidence.link/sop.pdf");
        observation.setCreatedBy(creator);
        observation.setCreatedAt(now);
        observation.setUpdatedAt(now);

        validRequest = new ObservationRequest(10L, 100L, "Procedure SOP v1 is outdated.", "http://evidence.link/sop.pdf", 5L);
    }

    @Test
    void createObservation_success() {
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(userRepository.findById(5L)).thenReturn(Optional.of(creator));
        when(auditChecklistRepository.existsByAuditIdAndTemplateId(10L, 1L)).thenReturn(true);
        when(observationRepository.save(any(Observation.class))).thenAnswer(inv -> {
            Observation obs = inv.getArgument(0);
            obs.setId(1L);
            return obs;
        });

        ObservationResponse res = observationService.createObservation(10L, validRequest);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals(10L, res.getAuditId());
        assertEquals("Operations Process Audit", res.getAuditTitle());
        assertEquals(100L, res.getChecklistItemId());
        assertEquals("Are procedures documented?", res.getChecklistItemQuestion());
        assertEquals("Procedure SOP v1 is outdated.", res.getDescription());
        assertEquals("http://evidence.link/sop.pdf", res.getEvidenceUrl());
        assertEquals(5L, res.getCreatedById());
        assertEquals("Jane Lead Auditor", res.getCreatedByName());
        assertEquals("jane@test.com", res.getCreatedByEmail());
        assertNotNull(res.getCreatedAt());
        assertNotNull(res.getUpdatedAt());

        verify(observationRepository).save(any(Observation.class));
    }

    @Test
    void createObservation_invalidAuditId_throwsNoSuchElementException() {
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> observationService.createObservation(999L, validRequest));
        verify(observationRepository, never()).save(any());
    }

    @Test
    void createObservation_invalidChecklistItemId_throwsIllegalArgumentException() {
        validRequest.setChecklistItemId(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> observationService.createObservation(10L, validRequest));
        verify(observationRepository, never()).save(any());
    }

    @Test
    void createObservation_invalidCreatedById_throwsIllegalArgumentException() {
        validRequest.setCreatedById(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> observationService.createObservation(10L, validRequest));
        verify(observationRepository, never()).save(any());
    }

    @Test
    void createObservation_missingDescription_throwsIllegalArgumentException() {
        validRequest.setDescription("");

        assertThrows(IllegalArgumentException.class, () -> observationService.createObservation(10L, validRequest));
        verify(observationRepository, never()).save(any());
    }

    @Test
    void createObservation_invalidRelationship_itemNotAssociatedWithAudit_throwsIllegalArgumentException() {
        // itemTemplate2 belongs to template2, which is NOT assigned to audit (id 10)
        validRequest.setChecklistItemId(200L);

        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistItemRepository.findById(200L)).thenReturn(Optional.of(itemTemplate2));
        when(userRepository.findById(5L)).thenReturn(Optional.of(creator));
        when(auditChecklistRepository.existsByAuditIdAndTemplateId(10L, 2L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> observationService.createObservation(10L, validRequest)
        );

        assertTrue(ex.getMessage().contains("Invalid relationship"));
        verify(observationRepository, never()).save(any());
    }

    @Test
    void getObservationsByAuditId_success() {
        when(auditRepository.existsById(10L)).thenReturn(true);
        when(observationRepository.findByAuditId(10L)).thenReturn(List.of(observation));

        List<ObservationResponse> list = observationService.getObservationsByAuditId(10L);

        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
        assertEquals("Procedure SOP v1 is outdated.", list.get(0).getDescription());
    }

    @Test
    void getObservationsByAuditId_invalidAudit_throwsNoSuchElementException() {
        when(auditRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> observationService.getObservationsByAuditId(999L));
    }

    @Test
    void getObservationById_success() {
        when(observationRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(observation));

        ObservationResponse res = observationService.getObservationById(1L);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals("Jane Lead Auditor", res.getCreatedByName());
    }

    @Test
    void getObservationById_nonExisting_throwsNoSuchElementException() {
        when(observationRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> observationService.getObservationById(999L));
    }

    @Test
    void updateObservation_success() {
        when(observationRepository.findById(1L)).thenReturn(Optional.of(observation));
        when(observationRepository.save(any(Observation.class))).thenAnswer(inv -> inv.getArgument(0));

        ObservationRequest updateReq = new ObservationRequest();
        updateReq.setDescription("Updated description.");
        updateReq.setEvidenceUrl("http://evidence.link/new.pdf");

        ObservationResponse res = observationService.updateObservation(1L, updateReq);

        assertEquals("Updated description.", res.getDescription());
        assertEquals("http://evidence.link/new.pdf", res.getEvidenceUrl());
    }

    @Test
    void updateObservation_nonExisting_throwsNoSuchElementException() {
        when(observationRepository.findById(999L)).thenReturn(Optional.empty());

        ObservationRequest updateReq = new ObservationRequest();
        updateReq.setDescription("Updated description.");

        assertThrows(NoSuchElementException.class, () -> observationService.updateObservation(999L, updateReq));
    }
}
