package ru.inklumin.inkluminapi.dto;

import lombok.Data;



@Data
public class ConfigDataResponse {
  private Long id;
  private String configData;
  private String createdAt;
  private String updatedAt;

  public ConfigDataResponse(Long id, String configData, String createdAt, String updatedAt) {
    this.id = id;
    this.configData = configData;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
