package com.audit.platform.repository;

import com.audit.platform.entity.Finding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FindingRepository extends JpaRepository<Finding, Long> {

    @Query("SELECT f FROM Finding f JOIN FETCH f.audit a JOIN FETCH f.observation o JOIN FETCH f.responsibleDepartment d LEFT JOIN FETCH f.owner u WHERE f.audit.id = :auditId")
    List<Finding> findByAuditId(@Param("auditId") Long auditId);

    @Query("SELECT f FROM Finding f JOIN FETCH f.audit a JOIN FETCH f.observation o JOIN FETCH f.responsibleDepartment d LEFT JOIN FETCH f.owner u WHERE f.id = :id")
    Optional<Finding> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT f FROM Finding f JOIN FETCH f.audit a JOIN FETCH f.observation o JOIN FETCH f.responsibleDepartment d LEFT JOIN FETCH f.owner u")
    List<Finding> findAllWithDetails();

    boolean existsByObservationId(Long observationId);

    Optional<Finding> findByObservationId(Long observationId);
}
