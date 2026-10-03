package com.audit.platform.repository;

import com.audit.platform.entity.AuditChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditChecklistRepository extends JpaRepository<AuditChecklist, Long> {

    @Query("SELECT ac FROM AuditChecklist ac JOIN FETCH ac.template t WHERE ac.audit.id = :auditId")
    List<AuditChecklist> findByAuditId(@Param("auditId") Long auditId);

    @Query("SELECT COUNT(ac) > 0 FROM AuditChecklist ac WHERE ac.audit.id = :auditId AND ac.template.id = :templateId")
    boolean existsByAuditIdAndTemplateId(@Param("auditId") Long auditId, @Param("templateId") Long templateId);

    @Query("SELECT ac FROM AuditChecklist ac WHERE ac.audit.id = :auditId AND ac.template.id = :templateId")
    Optional<AuditChecklist> findByAuditIdAndTemplateId(@Param("auditId") Long auditId, @Param("templateId") Long templateId);

    @Query("SELECT ac FROM AuditChecklist ac JOIN FETCH ac.template t JOIN FETCH ac.audit a WHERE ac.id = :id")
    Optional<AuditChecklist> findByIdWithDetails(@Param("id") Long id);
}
