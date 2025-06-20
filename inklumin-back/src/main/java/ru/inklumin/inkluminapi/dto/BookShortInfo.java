package ru.inklumin.inkluminapi.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class BookShortInfo {
  private String uuid;
  private String bookTitle;
  private String kind;

  @JsonFormat(
          shape = JsonFormat.Shape.STRING,
          pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
          timezone = "Europe/Moscow"
  )
  private OffsetDateTime updatedAt;
}
