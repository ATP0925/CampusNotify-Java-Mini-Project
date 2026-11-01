package com.campusnotify.submission;

import com.campusnotify.entity.Practical;
import com.campusnotify.repository.PracticalRepository;
import com.campusnotify.submission.dto.CreatePracticalRequest;
import com.campusnotify.submission.dto.ParameterizedSpecDto;
import com.campusnotify.submission.dto.PracticalDto;
import com.campusnotify.submission.service.DynamicParameterizationService;
import com.campusnotify.submission.service.PracticalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PracticalServiceTest {

    @Mock
    private PracticalRepository practicalRepository;

    private PracticalService practicalService;

    @BeforeEach
    void setUp() {
        DynamicParameterizationService parameterizationService = new DynamicParameterizationService();
        practicalService = new PracticalService(practicalRepository, parameterizationService);
    }

    @Test
    @DisplayName("F23_T01: Creates a published practical with default 10 max marks")
    void testCreatePracticalDefault10Marks() {
        CreatePracticalRequest req = CreatePracticalRequest.builder()
                .title("Practical 1: B-Tree Balancing")
                .subjectCode("Data Structures")
                .maxMarks(BigDecimal.valueOf(10.00))
                .build();

        Practical saved = Practical.builder()
                .title("Practical 1: B-Tree Balancing")
                .subjectCode("Data Structures")
                .maxMarks(BigDecimal.valueOf(10.00))
                .build();
        saved.setId(UUID.randomUUID());

        when(practicalRepository.save(any(Practical.class))).thenReturn(saved);

        PracticalDto dto = practicalService.createPractical(req);

        assertNotNull(dto);
        assertEquals("Practical 1: B-Tree Balancing", dto.getTitle());
        assertEquals(BigDecimal.valueOf(10.00), dto.getMaxMarks());
        assertEquals("PUBLISHED", dto.getStatus());
    }

    @Test
    @DisplayName("Boundary 23_1: Practical maxMarks 0 handled safely")
    void testPracticalMaxMarks0() {
        CreatePracticalRequest req = CreatePracticalRequest.builder()
                .title("Zero Marks")
                .subjectCode("IT")
                .maxMarks(BigDecimal.ZERO)
                .build();

        Practical saved = Practical.builder()
                .title("Zero Marks")
                .subjectCode("IT")
                .maxMarks(BigDecimal.ZERO)
                .build();
        saved.setId(UUID.randomUUID());

        when(practicalRepository.save(any(Practical.class))).thenReturn(saved);

        PracticalDto dto = practicalService.createPractical(req);
        assertEquals(BigDecimal.ZERO, dto.getMaxMarks());
    }

    @Test
    @DisplayName("Boundary 23_2: Practical maxMarks 100 handled safely")
    void testPracticalMaxMarks100() {
        CreatePracticalRequest req = CreatePracticalRequest.builder()
                .title("Term Project")
                .subjectCode("IT")
                .maxMarks(BigDecimal.valueOf(100.00))
                .build();

        Practical saved = Practical.builder()
                .title("Term Project")
                .subjectCode("IT")
                .maxMarks(BigDecimal.valueOf(100.00))
                .build();
        saved.setId(UUID.randomUUID());

        when(practicalRepository.save(any(Practical.class))).thenReturn(saved);

        PracticalDto dto = practicalService.createPractical(req);
        assertEquals(BigDecimal.valueOf(100.00), dto.getMaxMarks());
    }

    @Test
    @DisplayName("Boundary 23_5: Practical title with 255 characters preserved")
    void testPracticalTitle255Chars() {
        String longTitle = "P".repeat(255);
        CreatePracticalRequest req = CreatePracticalRequest.builder()
                .title(longTitle)
                .subjectCode("IT")
                .build();

        Practical saved = Practical.builder()
                .title(longTitle)
                .subjectCode("IT")
                .maxMarks(BigDecimal.valueOf(10.00))
                .build();
        saved.setId(UUID.randomUUID());

        when(practicalRepository.save(any(Practical.class))).thenReturn(saved);

        PracticalDto dto = practicalService.createPractical(req);
        assertEquals(255, dto.getTitle().length());
    }

    @Test
    @DisplayName("Practical: Retrieves parameterized spec for student")
    void testGetParameterizedSpec() {
        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        ParameterizedSpecDto spec = practicalService.getParameterizedSpec(
                practicalId, studentId, 72, "PRN_MUMBAI");

        assertNotNull(spec);
        assertEquals(72, spec.getArraySizeN());
        assertTrue(spec.getSeedS() >= 0 && spec.getSeedS() < 10000);
        assertTrue(spec.isWatermarkEmbedded());
    }
}
