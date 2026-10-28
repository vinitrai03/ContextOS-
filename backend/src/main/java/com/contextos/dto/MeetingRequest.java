package com.contextos.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
public class MeetingRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Future
    private ZonedDateTime startTime;

    @NotNull
    @Min(5)
    private Integer durationMinutes;

    private String timezone;
    private String recurrenceRule;
    private List<String> participantEmails;
}
