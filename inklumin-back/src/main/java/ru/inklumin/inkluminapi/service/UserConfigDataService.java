package ru.inklumin.inkluminapi.service;

import jakarta.transaction.Transactional;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;
import ru.inklumin.inkluminapi.dto.ConfigDataResponse;
import ru.inklumin.inkluminapi.entity.User;
import ru.inklumin.inkluminapi.entity.UserConfigData;
import ru.inklumin.inkluminapi.repository.UserConfigDataRepository;
import ru.inklumin.inkluminapi.repository.UserRepository;

@Service
public class UserConfigDataService {

  private final UserConfigDataRepository userConfigDataRepository;
  private final UserRepository userRepository;

  public UserConfigDataService(UserConfigDataRepository userConfigDataRepository,
      UserRepository userRepository) {
    this.userConfigDataRepository = userConfigDataRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public ConfigDataResponse saveConfigData(Long userId, String configData) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Проверяем, есть ли уже конфигурация для пользователя
    UserConfigData existingConfig = userConfigDataRepository.findByUserId(userId)
        .orElse(null);

    UserConfigData configDataEntity;
    if (existingConfig != null) {
      // Обновляем существующую конфигурацию
      existingConfig.setConfigData(configData);
      configDataEntity = userConfigDataRepository.save(existingConfig);
    } else {
      // Создаем новую конфигурацию
      configDataEntity = new UserConfigData(user, configData);
      configDataEntity = userConfigDataRepository.save(configDataEntity);
    }

    return convertToResponse(configDataEntity);
  }

  public ConfigDataResponse getConfigData(Long userId) {
    UserConfigData configData = userConfigDataRepository.findByUserId(userId)
        .orElseThrow(() -> new RuntimeException("Config data not found for user"));

    return convertToResponse(configData);
  }

  private ConfigDataResponse convertToResponse(UserConfigData configData) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    return new ConfigDataResponse(
        configData.getId(),
        configData.getConfigData(),
        configData.getCreatedAt().format(formatter),
        configData.getUpdatedAt().format(formatter)
    );
  }
}
