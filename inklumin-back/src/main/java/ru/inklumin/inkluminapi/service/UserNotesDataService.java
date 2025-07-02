package ru.inklumin.inkluminapi.service;

import jakarta.transaction.Transactional;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;
import ru.inklumin.inkluminapi.dto.NotesDataResponse;
import ru.inklumin.inkluminapi.entity.User;
import ru.inklumin.inkluminapi.entity.UserNotesData;
import ru.inklumin.inkluminapi.repository.UserNotesDataRepository;
import ru.inklumin.inkluminapi.repository.UserRepository;

@Service
public class UserNotesDataService {
  private final UserNotesDataRepository userNotesDataRepository;
  private final UserRepository userRepository;

  public UserNotesDataService(UserNotesDataRepository userNotesDataRepository, UserRepository userRepository) {
    this.userNotesDataRepository = userNotesDataRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public NotesDataResponse saveNotesData(Long userId, String notesData) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    UserNotesData existing = userNotesDataRepository.findByUserId(userId).orElse(null);

    UserNotesData entity;
    if (existing != null) {
      existing.setNotesData(notesData);
      entity = userNotesDataRepository.save(existing);
    } else {
      entity = new UserNotesData(user, notesData);
      entity = userNotesDataRepository.save(entity);
    }

    return convertToResponse(entity);
  }

  public NotesDataResponse getNotesData(Long userId) {
    UserNotesData data = userNotesDataRepository.findByUserId(userId)
        .orElseThrow(() -> new RuntimeException("Notes data not found for user"));
    return convertToResponse(data);
  }

  public String getNotesUpdatedAt(Long userId) {
    UserNotesData data = userNotesDataRepository.findLatestByUserId(userId)
        .orElseThrow(() -> new RuntimeException("Notes data not found for user"));
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    return data.getUpdatedAt().format(formatter);
  }

  private NotesDataResponse convertToResponse(UserNotesData data) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    return new NotesDataResponse(
        data.getId(),
        data.getNotesData(),
        data.getCreatedAt().format(formatter),
        data.getUpdatedAt().format(formatter)
    );
  }
}
