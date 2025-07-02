package ru.inklumin.inkluminapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveNotesDataRequest {
  @NotBlank(message = "Notes data is required")
  private String notesData;
}
