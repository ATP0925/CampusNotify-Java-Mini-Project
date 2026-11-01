package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftSyncRequestDto {
    private UUID practicalId;
    private UUID studentId;
    private long walVersion;
    private String bufferContent;
    private String cursorPosition;
    private String checksum;
}
