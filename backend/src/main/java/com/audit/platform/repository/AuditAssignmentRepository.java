package com.audit.platform.repository;

import com.audit.platform.entity.AuditAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditAssignmentRepository extends JpaRepository<AuditAssignment, Long> {

    @Query("SELECT a FROM AuditAssignment a JOIN FETCH a.auditor u LEFT JOIN FETCH u.department WHERE a.audit.id = :auditId")
    List<AuditAssignment> findByAuditId(@Param("auditId") Long auditId);

    @Query("SELECT COUNT(a) > 0 FROM AuditAssignment a WHERE a.audit.id = :auditId AND a.auditor.id = :auditorId")
    boolean existsByAuditIdAndAuditorId(@Param("auditId") Long auditId, @Param("auditorId") Long auditorId);

    @Query("SELECT a FROM AuditAssignment a WHERE a.audit.id = :auditId AND a.auditor.id = :auditorId")
    Optional<AuditAssignment> findByAuditIdAndAuditorId(@Param("auditId") Long auditId, @Param("auditorId") Long auditorId);
}
