package com.audit.platform.service;

import com.audit.platform.dto.EvidenceResponse;
import com.audit.platform.entity.CorrectiveAction;
import com.audit.platform.entity.Evidence;
import com.audit.platform.entity.User;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.EvidenceRepository;
import com.audit.platform.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final CorrectiveActionRepository correctiveActionRepository;
    private final UserRepository userRepository;

    private final Path uploadStoragePath;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "png", "jpg", "jpeg", "gif", "webp", "doc", "docx", "xls", "xlsx", "txt"
    );

    private static final Set<String> FORBIDDEN_EXTENSIONS = Set.of(
            "exe", "bat", "sh", "cmd", "dll", "so", "msi", "ps1", "vbs"
    );

    public EvidenceService(EvidenceRepository evidenceRepository,
                           CorrectiveActionRepository correctiveActionRepository,
                           UserRepository userRepository) {
        this.evidenceRepository = evidenceRepository;
        this.correctiveActionRepository = correctiveActionRepository;
        this.userRepository = userRepository;

        this.uploadStoragePath = Paths.get("uploads", "evidence").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadStoragePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload storage directory", e);
        }
    }

    public EvidenceResponse uploadEvidence(Long correctiveActionId, Long uploadedById, MultipartFile file) {
        if (correctiveActionId == null) {
            throw new IllegalArgumentException("Corrective Action ID is required");
        }
        CorrectiveAction correctiveAction = correctiveActionRepository.findById(correctiveActionId)
                .orElseThrow(() -> new NoSuchElementException("Corrective action not found with id: " + correctiveActionId));

        Long userId = uploadedById != null ? uploadedById : 1L; // Fallback default user if not specified
        User uploadedBy = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String cleanFilename = StringUtils.cleanPath(originalFilename);
        if (cleanFilename.contains("..") || cleanFilename.contains("/") || cleanFilename.contains("\\")) {
            throw new IllegalArgumentException("Invalid path sequence in file name: " + originalFilename);
        }

        String extension = getFileExtension(cleanFilename).toLowerCase();
        if (FORBIDDEN_EXTENSIONS.contains(extension) || (!extension.isEmpty() && !ALLOWED_EXTENSIONS.contains(extension))) {
            throw new IllegalArgumentException("Invalid or disallow file type/extension: " + extension);
        }

        String storedFileName = UUID.randomUUID() + "_" + cleanFilename;
        Path targetLocation = this.uploadStoragePath.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + cleanFilename, e);
        }

        Evidence evidence = new Evidence();
        evidence.setCorrectiveAction(correctiveAction);
        evidence.setUploadedBy(uploadedBy);
        evidence.setFileName(cleanFilename);
        evidence.setFileUrl(""); // Temporary placeholder before ID generation
        evidence.setUploadedAt(LocalDateTime.now());

        Evidence saved = evidenceRepository.save(evidence);

        // Update fileUrl with resource endpoint
        String fileUrl = "/api/evidence/" + saved.getId() + "/download";
        saved.setFileUrl(fileUrl);
        saved = evidenceRepository.save(saved);

        return EvidenceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getEvidenceByCorrectiveActionId(Long correctiveActionId) {
        if (!correctiveActionRepository.existsById(correctiveActionId)) {
            throw new NoSuchElementException("Corrective action not found with id: " + correctiveActionId);
        }
        return evidenceRepository.findByCorrectiveActionIdWithDetails(correctiveActionId)
                .stream()
                .map(EvidenceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getAllEvidence() {
        return evidenceRepository.findAllWithDetails()
                .stream()
                .map(EvidenceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvidenceResponse getEvidenceById(Long id) {
        Evidence evidence = evidenceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Evidence not found with id: " + id));
        return EvidenceResponse.fromEntity(evidence);
    }

    @Transactional(readOnly = true)
    public Evidence getEvidenceEntityById(Long id) {
        return evidenceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Evidence not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Resource loadEvidenceFileAsResource(Long id) {
        Evidence evidence = getEvidenceEntityById(id);
        
        // Find stored file matching ID prefix in upload storage directory
        try (var stream = Files.list(this.uploadStoragePath)) {
            Optional<Path> matchingFile = stream
                    .filter(path -> path.getFileName().toString().endsWith("_" + evidence.getFileName()))
                    .findFirst();

            if (matchingFile.isPresent()) {
                Resource resource = new UrlResource(matchingFile.get().toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error reading evidence file storage", e);
        }

        throw new NoSuchElementException("Stored evidence file content not found for evidence id: " + id);
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
