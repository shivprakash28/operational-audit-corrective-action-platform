package com.audit.platform.repository;

import com.audit.platform.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {

    List<Verification> findByCorrectiveActionId(Long correctiveActionId);

    @Query("SELECT v FROM Verification v JOIN FETCH v.correctiveAction ca JOIN FETCH v.verifier u WHERE v.id = :id")
    Optional<Verification> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT v FROM Verification v JOIN FETCH v.correctiveAction ca JOIN FETCH v.verifier u WHERE ca.id = :correctiveActionId")
    List<Verification> findByCorrectiveActionIdWithDetails(@Param("correctiveActionId") Long correctiveActionId);

    @Query("SELECT v FROM Verification v JOIN FETCH v.correctiveAction ca JOIN FETCH v.verifier u")
    List<Verification> findAllWithDetails();
}
