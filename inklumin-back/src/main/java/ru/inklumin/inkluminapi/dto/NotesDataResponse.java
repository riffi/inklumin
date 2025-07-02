package ru.inklumin.inkluminapi.dto;

import lombok.Data;

@Data
public class NotesDataResponse {
  private Long id;
  private String notesData;
  private String createdAt;
  private String updatedAt;

  public NotesDataResponse(Long id, String notesData, String createdAt, String updatedAt) {
    this.id = id;
    this.notesData = notesData;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
