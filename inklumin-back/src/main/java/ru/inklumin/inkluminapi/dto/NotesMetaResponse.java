package ru.inklumin.inkluminapi.dto;

import lombok.Data;

@Data
public class NotesMetaResponse {
  private String updatedAt;

  public NotesMetaResponse(String updatedAt) {
    this.updatedAt = updatedAt;
  }
}
