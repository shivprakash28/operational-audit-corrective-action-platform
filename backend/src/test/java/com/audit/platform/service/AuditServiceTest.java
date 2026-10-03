package com.audit.platform.service;

import com.audit.platform.dto.AuditRequest;
import com.audit.platform.dto.AuditResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.entity.AuditStatus;
import com.audit.platform.entity.Department;
import com.audit.platform.entity.Role;
import com.audit.platform.entity.User;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.DepartmentRepository;
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
class AuditServiceTest {

    @Mock
    private AuditRepository auditRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditService auditService;

    private Department department;
    private User user;
    private Audit audit;
    private AuditRequest request;

    @BeforeEach
    void setUp() {
        department = new Department("Operations");
        department.setId(1L);

        user = new User("Auditor", "auditor@test.com", "hash", Role.AUDITOR, department);
        user.setId(1L);

        LocalDateTime now = LocalDateTime.now();
        audit = new Audit();
        audit.setId(10L);
        audit.setTitle("Security Review");
        audit.setScope("Quarterly security audit");
        audit.setObjectives("Check compliance");
        audit.setCriteria("ISO 27001");
        audit.setPlannedStartDate(now);
        audit.setPlannedEndDate(now.plusDays(7));
        audit.setExpectedCompletionDate(now.plusDays(10));
        audit.setStatus(AuditStatus.PLANNED);
        audit.setDepartment(department);
        audit.setCreatedBy(user);
        audit.setCreatedAt(now);
        audit.setUpdatedAt(now);

        request = new AuditRequest();
        request.setTitle("Security Review");
        request.setScope("Quarterly security audit");
        request.setObjectives("Check compliance");
        request.setCriteria("ISO 27001");
        request.setPlannedStartDate(now);
        request.setPlannedEndDate(now.plusDays(7));
        request.setExpectedCompletionDate(now.plusDays(10));
        request.setDepartmentId(1L);
        request.setCreatedById(1L);
    }

    @Test
    void getAllAudits_returnsMappedResponses() {
        when(auditRepository.findAll()).thenReturn(List.of(audit));

        List<AuditResponse> result = auditService.getAllAudits();

        assertEquals(1, result.size());
        assertEquals("Security Review", result.get(0).getTitle());
        assertEquals(1L, result.get(0).getDepartmentId());
        assertEquals("Operations", result.get(0).getDepartmentName());
        assertEquals(1L, result.get(0).getCreatedById());
        assertEquals("Auditor", result.get(0).getCreatedByName());
    }

    @Test
    void getAuditById_existingId_returnsResponse() {
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));

        AuditResponse result = auditService.getAuditById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Security Review", result.getTitle());
    }

    @Test
    void getAuditById_nonExistingId_throwsNoSuchElementException() {
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> auditService.getAuditById(999L));
    }

    @Test
    void createAudit_validRequest_createsAndReturnsAudit() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(auditRepository.save(any(Audit.class))).thenAnswer(invocation -> {
            Audit a = invocation.getArgument(0);
            a.setId(10L);
            return a;
        });

        AuditResponse response = auditService.createAudit(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(AuditStatus.PLANNED, response.getStatus());
        assertEquals("Operations", response.getDepartmentName());
        assertEquals("Auditor", response.getCreatedByName());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getUpdatedAt());
    }

    @Test
    void createAudit_invalidDepartmentId_throwsIllegalArgumentException() {
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());
        request.setDepartmentId(999L);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditService.createAudit(request)
        );

        assertTrue(ex.getMessage().contains("Department not found with id: 999"));
        verify(auditRepository, never()).save(any());
    }

    @Test
    void createAudit_invalidCreatedById_throwsIllegalArgumentException() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        request.setCreatedById(999L);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditService.createAudit(request)
        );

        assertTrue(ex.getMessage().contains("User not found with id: 999"));
        verify(auditRepository, never()).save(any());
    }

    @Test
    void updateAudit_existingAudit_updatesFields() {
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(auditRepository.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        request.setTitle("Updated Title");
        request.setStatus(AuditStatus.IN_PROGRESS);

        AuditResponse updated = auditService.updateAudit(10L, request);

        assertEquals("Updated Title", updated.getTitle());
        assertEquals(AuditStatus.IN_PROGRESS, updated.getStatus());
        verify(auditRepository).save(any(Audit.class));
    }

    @Test
    void updateAudit_nonExistingAudit_throwsNoSuchElementException() {
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> auditService.updateAudit(999L, request));
    }

    @Test
    void deleteAudit_existingAudit_deletesSuccessfully() {
        when(auditRepository.existsById(10L)).thenReturn(true);

        auditService.deleteAudit(10L);

        verify(auditRepository).deleteById(10L);
    }

    @Test
    void deleteAudit_nonExistingAudit_throwsNoSuchElementException() {
        when(auditRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> auditService.deleteAudit(999L));
        verify(auditRepository, never()).deleteById(any());
    }
}
