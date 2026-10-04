package com.audit.platform.service;

import com.audit.platform.dto.FindingRequest;
import com.audit.platform.dto.FindingResponse;
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
class FindingServiceTest {

    @Mock
    private FindingRepository findingRepository;

    @Mock
    private AuditRepository auditRepository;

    @Mock
    private ObservationRepository observationRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FindingService findingService;

    private Audit audit;
    private Audit unrelatedAudit;
    private Observation observation;
    private Department department;
    private User owner;
    private Finding finding;
    private FindingRequest validRequest;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        audit = new Audit();
        audit.setId(10L);
        audit.setTitle("Operations Audit");

        unrelatedAudit = new Audit();
        unrelatedAudit.setId(20L);
        unrelatedAudit.setTitle("Finance Audit");

        observation = new Observation();
        observation.setId(100L);
        observation.setAudit(audit);
        observation.setDescription("SOP outdated");
        observation.setCreatedAt(now);
        observation.setUpdatedAt(now);

        department = new Department();
        department.setId(5L);
        department.setName("Operations Dept");

        owner = new User();
        owner.setId(3L);
        owner.setName("John Manager");
        owner.setEmail("john@test.com");
        owner.setRole(Role.AUDITOR);

        finding = new Finding();
        finding.setId(1L);
        finding.setAudit(audit);
        finding.setObservation(observation);
        finding.setSeverity(FindingSeverity.MAJOR);
        finding.setResponsibleDepartment(department);
        finding.setOwner(owner);
        finding.setStatus(FindingStatus.OPEN);
        finding.setDescription("Major finding: SOP outdated for 2 years");
        finding.setCreatedAt(now);
        finding.setUpdatedAt(now);

        validRequest = new FindingRequest(10L, 100L, FindingSeverity.MAJOR, 5L, 3L, FindingStatus.OPEN, "Major finding: SOP outdated for 2 years");
    }

    @Test
    void createFinding_success() {
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));
        when(findingRepository.existsByObservationId(100L)).thenReturn(false);
        when(departmentRepository.findById(5L)).thenReturn(Optional.of(department));
        when(userRepository.findById(3L)).thenReturn(Optional.of(owner));
        when(findingRepository.save(any(Finding.class))).thenAnswer(inv -> {
            Finding f = inv.getArgument(0);
            f.setId(1L);
            return f;
        });

        FindingResponse res = findingService.createFinding(10L, validRequest);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals(10L, res.getAuditId());
        assertEquals("Operations Audit", res.getAuditTitle());
        assertEquals(100L, res.getObservationId());
        assertEquals("SOP outdated", res.getObservationDescription());
        assertEquals(FindingSeverity.MAJOR, res.getSeverity());
        assertEquals(5L, res.getResponsibleDepartmentId());
        assertEquals("Operations Dept", res.getResponsibleDepartmentName());
        assertEquals(3L, res.getOwnerId());
        assertEquals("John Manager", res.getOwnerName());
        assertEquals("john@test.com", res.getOwnerEmail());
        assertEquals(FindingStatus.OPEN, res.getStatus());
        assertEquals("Major finding: SOP outdated for 2 years", res.getDescription());
        assertNotNull(res.getCreatedAt());

        verify(findingRepository).save(any(Finding.class));
    }

    @Test
    void createFinding_withoutOwner_success() {
        validRequest.setOwnerId(null);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));
        when(findingRepository.existsByObservationId(100L)).thenReturn(false);
        when(departmentRepository.findById(5L)).thenReturn(Optional.of(department));
        when(findingRepository.save(any(Finding.class))).thenAnswer(inv -> {
            Finding f = inv.getArgument(0);
            f.setId(1L);
            return f;
        });

        FindingResponse res = findingService.createFinding(10L, validRequest);

        assertNotNull(res);
        assertNull(res.getOwnerId());
        assertEquals(FindingStatus.OPEN, res.getStatus());
    }

    @Test
    void createFinding_invalidAuditId_throwsNoSuchElementException() {
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> findingService.createFinding(999L, validRequest));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void createFinding_invalidObservationId_throwsIllegalArgumentException() {
        validRequest.setObservationId(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> findingService.createFinding(10L, validRequest));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void createFinding_observationAuditMismatch_throwsIllegalArgumentException() {
        // observation belongs to audit (id 10), but we pass auditId 20
        when(auditRepository.findById(20L)).thenReturn(Optional.of(unrelatedAudit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> findingService.createFinding(20L, validRequest)
        );
        assertTrue(ex.getMessage().contains("Invalid relationship"));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void createFinding_duplicateObservation_throwsIllegalArgumentException() {
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));
        when(findingRepository.existsByObservationId(100L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> findingService.createFinding(10L, validRequest)
        );
        assertTrue(ex.getMessage().contains("Finding already exists"));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void createFinding_invalidDepartment_throwsIllegalArgumentException() {
        validRequest.setResponsibleDepartmentId(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));
        when(findingRepository.existsByObservationId(100L)).thenReturn(false);
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> findingService.createFinding(10L, validRequest));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void createFinding_invalidOwner_throwsIllegalArgumentException() {
        validRequest.setOwnerId(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(observationRepository.findById(100L)).thenReturn(Optional.of(observation));
        when(findingRepository.existsByObservationId(100L)).thenReturn(false);
        when(departmentRepository.findById(5L)).thenReturn(Optional.of(department));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> findingService.createFinding(10L, validRequest));
        verify(findingRepository, never()).save(any());
    }

    @Test
    void getFindingsByAuditId_success() {
        when(auditRepository.existsById(10L)).thenReturn(true);
        when(findingRepository.findByAuditId(10L)).thenReturn(List.of(finding));

        List<FindingResponse> list = findingService.getFindingsByAuditId(10L);

        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
        assertEquals(FindingSeverity.MAJOR, list.get(0).getSeverity());
    }

    @Test
    void getFindingsByAuditId_notFound_throwsNoSuchElementException() {
        when(auditRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> findingService.getFindingsByAuditId(999L));
    }

    @Test
    void getFindingById_success() {
        when(findingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(finding));

        FindingResponse res = findingService.getFindingById(1L);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals("Major finding: SOP outdated for 2 years", res.getDescription());
    }

    @Test
    void getFindingById_notFound_throwsNoSuchElementException() {
        when(findingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> findingService.getFindingById(999L));
    }

    @Test
    void updateFinding_success() {
        when(findingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(finding));
        when(findingRepository.save(any(Finding.class))).thenAnswer(inv -> inv.getArgument(0));

        FindingRequest updateReq = new FindingRequest();
        updateReq.setSeverity(FindingSeverity.CRITICAL);
        updateReq.setStatus(FindingStatus.IN_PROGRESS);
        updateReq.setDescription("Critical finding updated details");

        FindingResponse res = findingService.updateFinding(1L, updateReq);

        assertEquals(FindingSeverity.CRITICAL, res.getSeverity());
        assertEquals(FindingStatus.IN_PROGRESS, res.getStatus());
        assertEquals("Critical finding updated details", res.getDescription());
    }

    @Test
    void updateStatus_success() {
        when(findingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(finding));
        when(findingRepository.save(any(Finding.class))).thenAnswer(inv -> inv.getArgument(0));

        FindingResponse res = findingService.updateStatus(1L, FindingStatus.RESOLVED);

        assertEquals(FindingStatus.RESOLVED, res.getStatus());
    }

    @Test
    void updateStatus_nullStatus_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> findingService.updateStatus(1L, null));
    }

    @Test
    void updateSeverity_success() {
        when(findingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(finding));
        when(findingRepository.save(any(Finding.class))).thenAnswer(inv -> inv.getArgument(0));

        FindingResponse res = findingService.updateSeverity(1L, FindingSeverity.CRITICAL);

        assertEquals(FindingSeverity.CRITICAL, res.getSeverity());
    }

    @Test
    void updateSeverity_nullSeverity_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> findingService.updateSeverity(1L, null));
    }
}
