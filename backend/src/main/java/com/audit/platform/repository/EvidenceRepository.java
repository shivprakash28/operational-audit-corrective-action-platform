package com.audit.platform.repository;

import com.audit.platform.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    List<Evidence> findByCorrectiveActionId(Long correctiveActionId);

    @Query("SELECT e FROM Evidence e JOIN FETCH e.correctiveAction ca JOIN FETCH e.uploadedBy u WHERE e.id = :id")
    Optional<Evidence> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT e FROM Evidence e JOIN FETCH e.correctiveAction ca JOIN FETCH e.uploadedBy u WHERE ca.id = :correctiveActionId")
    List<Evidence> findByCorrectiveActionIdWithDetails(@Param("correctiveActionId") Long correctiveActionId);

    @Query("SELECT e FROM Evidence e JOIN FETCH e.correctiveAction ca JOIN FETCH e.uploadedBy u")
    List<Evidence> findAllWithDetails();
}
