package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlotDto {
    private String id;
    private String dept;
    private String subject;
    private String time;
    private String roomNumber;
    private String dayOfWeek;
}
