package com.campusnotify.submission.service;

import com.campusnotify.entity.Practical;
import com.campusnotify.repository.PracticalRepository;
import com.campusnotify.submission.dto.CreatePracticalRequest;
import com.campusnotify.submission.dto.ParameterizedSpecDto;
import com.campusnotify.submission.dto.PracticalDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticalService {

    private final PracticalRepository practicalRepository;
    private final DynamicParameterizationService parameterizationService;

    @Transactional
    public PracticalDto createPractical(CreatePracticalRequest request) {
        BigDecimal maxMarks = request.getMaxMarks() != null ?
                request.getMaxMarks() : BigDecimal.valueOf(10.00);

        boolean parameterized = request.getRollSeedParameterized() != null ?
                request.getRollSeedParameterized() : true;

        Practical practical = Practical.builder()
                .title(request.getTitle() != null ? request.getTitle() : "Untitled Practical")
                .description(request.getDescription())
                .subjectCode(request.getSubjectCode() != null ? request.getSubjectCode() : "CS_DEFAULT")
                .practicalNo(request.getPracticalNo())
                .dueDate(request.getDueDate())
                .maxMarks(maxMarks)
                .rollSeedParameterized(parameterized)
                .department(request.getDepartment())
                .build();

        Practical saved = practicalRepository.save(practical);
        log.info("Created practical [{}] with title [{}], maxMarks [{}]",
                saved.getId(), saved.getTitle(), saved.getMaxMarks());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public PracticalDto getPractical(UUID id) {
        return practicalRepository.findById(id)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PracticalDto> listPracticals(String subjectCode) {
        List<Practical> list = (subjectCode != null && !subjectCode.isBlank()) ?
                practicalRepository.findBySubjectCode(subjectCode) :
                practicalRepository.findAll();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParameterizedSpecDto getParameterizedSpec(UUID practicalId, UUID studentId, Object rollNo, String prn) {
        return parameterizationService.generateParameterizedVector(practicalId, studentId, rollNo, prn);
    }

    private PracticalDto mapToDto(Practical entity) {
        return PracticalDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .subjectCode(entity.getSubjectCode())
                .practicalNo(entity.getPracticalNo())
                .maxMarks(entity.getMaxMarks())
                .dueDate(entity.getDueDate())
                .status("PUBLISHED")
                .rollSeedParameterized(entity.isRollSeedParameterized())
                .department(entity.getDepartment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
