package ru.inklumin.inkluminapi.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "user_books")
public class UserBook {
  @Id
  private String uuid;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "book_title", nullable = false, length = 255) // Добавлено поле
  private String bookTitle;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String bookData;

  @Column(name = "kind")
  private String kind;

  @CreationTimestamp
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  private OffsetDateTime  updatedAt;
}
