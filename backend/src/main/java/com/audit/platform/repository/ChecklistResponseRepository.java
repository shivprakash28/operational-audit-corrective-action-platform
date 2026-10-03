package com.audit.platform.repository;

import com.audit.platform.entity.ChecklistResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistResponseRepository extends JpaRepository<ChecklistResponse, Long> {

    @Query("SELECT r FROM ChecklistResponse r JOIN FETCH r.checklistItem ci WHERE r.auditChecklist.id = :auditChecklistId")
    List<ChecklistResponse> findByAuditChecklistId(@Param("auditChecklistId") Long auditChecklistId);

    @Query("SELECT COUNT(r) > 0 FROM ChecklistResponse r WHERE r.auditChecklist.id = :auditChecklistId AND r.checklistItem.id = :checklistItemId")
    boolean existsByAuditChecklistIdAndChecklistItemId(@Param("auditChecklistId") Long auditChecklistId, @Param("checklistItemId") Long checklistItemId);

    @Query("SELECT r FROM ChecklistResponse r WHERE r.auditChecklist.id = :auditChecklistId AND r.checklistItem.id = :checklistItemId")
    Optional<ChecklistResponse> findByAuditChecklistIdAndChecklistItemId(@Param("auditChecklistId") Long auditChecklistId, @Param("checklistItemId") Long checklistItemId);
}
