package ru.inklumin.inkluminapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveConfigDataRequest {
  @NotBlank(message = "Config data is required")
  private String configData;
}
