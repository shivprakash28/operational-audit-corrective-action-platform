package com.audit.platform.repository;

import com.audit.platform.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, Long> {

    @Query("SELECT o FROM Observation o JOIN FETCH o.audit a JOIN FETCH o.checklistItem ci JOIN FETCH o.createdBy u WHERE o.audit.id = :auditId")
    List<Observation> findByAuditId(@Param("auditId") Long auditId);

    @Query("SELECT o FROM Observation o JOIN FETCH o.audit a JOIN FETCH o.checklistItem ci JOIN FETCH o.createdBy u WHERE o.id = :id")
    Optional<Observation> findByIdWithDetails(@Param("id") Long id);
}
