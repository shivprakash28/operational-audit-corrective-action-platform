package com.audit.platform.repository;

import com.audit.platform.entity.ChecklistTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChecklistTemplateRepository extends JpaRepository<ChecklistTemplate, Long> {
    Optional<ChecklistTemplate> findByName(String name);
    boolean existsByName(String name);
}
