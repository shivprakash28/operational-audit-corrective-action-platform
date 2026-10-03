package com.audit.platform.repository;

import com.audit.platform.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    @Query("SELECT i FROM ChecklistItem i WHERE i.template.id = :templateId ORDER BY i.order ASC")
    List<ChecklistItem> findByTemplateIdOrderByOrderAsc(@Param("templateId") Long templateId);

    @Query("SELECT i FROM ChecklistItem i WHERE i.template.id = :templateId ORDER BY i.order DESC LIMIT 1")
    Optional<ChecklistItem> findTopByTemplateIdOrderByOrderDesc(@Param("templateId") Long templateId);
}
