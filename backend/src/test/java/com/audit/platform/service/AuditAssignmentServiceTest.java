package com.audit.platform.service;

import com.audit.platform.dto.AssignAuditorRequest;
import com.audit.platform.dto.AuditAssignmentResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.entity.AuditAssignment;
import com.audit.platform.entity.AuditStatus;
import com.audit.platform.entity.Department;
import com.audit.platform.entity.Role;
import com.audit.platform.entity.User;
import com.audit.platform.repository.AuditAssignmentRepository;
import com.audit.platform.repository.AuditRepository;
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
class AuditAssignmentServiceTest {

    @Mock
    private AuditRepository auditRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditAssignmentRepository auditAssignmentRepository;

    @InjectMocks
    private AuditAssignmentService auditAssignmentService;

    private Department dept1;
    private Department dept2;
    private User auditorDept1;
    private User auditorDept2;
    private User auditorNoDept;
    private User adminUser;
    private Audit audit;
    private AssignAuditorRequest request;

    @BeforeEach
    void setUp() {
        dept1 = new Department("Operations");
        dept1.setId(1L);

        dept2 = new Department("Finance");
        dept2.setId(2L);

        auditorDept1 = new User("Auditor 1", "auditor1@test.com", "hash", Role.AUDITOR, dept1);
        auditorDept1.setId(10L);

        auditorDept2 = new User("Auditor 2", "auditor2@test.com", "hash", Role.AUDITOR, dept2);
        auditorDept2.setId(20L);

        auditorNoDept = new User("Auditor Independent", "auditor_ind@test.com", "hash", Role.AUDITOR, null);
        auditorNoDept.setId(30L);

        adminUser = new User("Admin", "admin@test.com", "hash", Role.ADMIN, dept1);
        adminUser.setId(40L);

        LocalDateTime now = LocalDateTime.now();
        audit = new Audit();
        audit.setId(100L);
        audit.setTitle("Operations Audit");
        audit.setScope("Operations Review");
        audit.setObjectives("Check adherence");
        audit.setCriteria("Standard SOP");
        audit.setPlannedStartDate(now);
        audit.setPlannedEndDate(now.plusDays(5));
        audit.setStatus(AuditStatus.PLANNED);
        audit.setDepartment(dept1);
        audit.setCreatedBy(adminUser);
        audit.setCreatedAt(now);
        audit.setUpdatedAt(now);

        request = new AssignAuditorRequest(20L);
    }

    @Test
    void assignAuditor_success_differentDepartment() {
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(auditorDept2));
        when(auditAssignmentRepository.existsByAuditIdAndAuditorId(100L, 20L)).thenReturn(false);
        when(auditAssignmentRepository.save(any(AuditAssignment.class))).thenAnswer(invocation -> {
            AuditAssignment a = invocation.getArgument(0);
            a.setId(1L);
            return a;
        });

        AuditAssignmentResponse response = auditAssignmentService.assignAuditor(100L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(100L, response.getAuditId());
        assertEquals(20L, response.getAuditorId());
        assertEquals("Auditor 2", response.getAuditorName());
        assertEquals("auditor2@test.com", response.getAuditorEmail());
        assertEquals("AUDITOR", response.getAuditorRole());
        assertEquals(2L, response.getAuditorDepartmentId());
        assertEquals("Finance", response.getAuditorDepartmentName());
        assertNotNull(response.getAssignedAt());
        verify(auditAssignmentRepository).save(any(AuditAssignment.class));
    }

    @Test
    void assignAuditor_success_auditorWithoutDepartment() {
        request.setAuditorId(30L);
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(30L)).thenReturn(Optional.of(auditorNoDept));
        when(auditAssignmentRepository.existsByAuditIdAndAuditorId(100L, 30L)).thenReturn(false);
        when(auditAssignmentRepository.save(any(AuditAssignment.class))).thenAnswer(invocation -> {
            AuditAssignment a = invocation.getArgument(0);
            a.setId(2L);
            return a;
        });

        AuditAssignmentResponse response = auditAssignmentService.assignAuditor(100L, request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals(30L, response.getAuditorId());
        assertNull(response.getAuditorDepartmentId());
        assertNull(response.getAuditorDepartmentName());
    }

    @Test
    void assignAuditor_auditNotFound_throwsNoSuchElementException() {
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(
                NoSuchElementException.class,
                () -> auditAssignmentService.assignAuditor(999L, request)
        );

        assertTrue(ex.getMessage().contains("Audit not found with id: 999"));
        verify(auditAssignmentRepository, never()).save(any());
    }

    @Test
    void assignAuditor_userNotFound_throwsIllegalArgumentException() {
        request.setAuditorId(999L);
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditAssignmentService.assignAuditor(100L, request)
        );

        assertTrue(ex.getMessage().contains("User not found with id: 999"));
        verify(auditAssignmentRepository, never()).save(any());
    }

    @Test
    void assignAuditor_userNotAuditor_throwsIllegalArgumentException() {
        request.setAuditorId(40L);
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(40L)).thenReturn(Optional.of(adminUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditAssignmentService.assignAuditor(100L, request)
        );

        assertTrue(ex.getMessage().contains("is not an auditor"));
        verify(auditAssignmentRepository, never()).save(any());
    }

    @Test
    void assignAuditor_sameDepartmentConflict_throwsIllegalArgumentException() {
        request.setAuditorId(10L);
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(10L)).thenReturn(Optional.of(auditorDept1));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditAssignmentService.assignAuditor(100L, request)
        );

        assertTrue(ex.getMessage().contains("Conflict of interest"));
        verify(auditAssignmentRepository, never()).save(any());
    }

    @Test
    void assignAuditor_duplicateAssignment_throwsIllegalArgumentException() {
        when(auditRepository.findById(100L)).thenReturn(Optional.of(audit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(auditorDept2));
        when(auditAssignmentRepository.existsByAuditIdAndAuditorId(100L, 20L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditAssignmentService.assignAuditor(100L, request)
        );

        assertTrue(ex.getMessage().contains("already assigned to this audit"));
        verify(auditAssignmentRepository, never()).save(any());
    }

    @Test
    void getAssignments_success() {
        when(auditRepository.existsById(100L)).thenReturn(true);

        AuditAssignment assignment = new AuditAssignment();
        assignment.setId(1L);
        assignment.setAudit(audit);
        assignment.setAuditor(auditorDept2);
        assignment.setAssignedAt(LocalDateTime.now());

        when(auditAssignmentRepository.findByAuditId(100L)).thenReturn(List.of(assignment));

        List<AuditAssignmentResponse> result = auditAssignmentService.getAssignments(100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(100L, result.get(0).getAuditId());
        assertEquals(20L, result.get(0).getAuditorId());
        assertEquals("Auditor 2", result.get(0).getAuditorName());
        assertEquals("auditor2@test.com", result.get(0).getAuditorEmail());
    }

    @Test
    void getAssignments_auditNotFound_throwsNoSuchElementException() {
        when(auditRepository.existsById(999L)).thenReturn(false);

        NoSuchElementException ex = assertThrows(
                NoSuchElementException.class,
                () -> auditAssignmentService.getAssignments(999L)
        );

        assertTrue(ex.getMessage().contains("Audit not found with id: 999"));
        verify(auditAssignmentRepository, never()).findByAuditId(any());
    }
}
