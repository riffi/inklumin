
-- V2__Create_user_config_data_table.sql
-- Создание таблицы для хранения конфигурационных данных пользователей

CREATE TABLE user_config_data (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL,
                                  config_data TEXT,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT fk_user_config_data_user_id
                                      FOREIGN KEY (user_id) REFERENCES users(id)
                                          ON DELETE CASCADE
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX idx_user_config_data_user_id ON user_config_data(user_id);

-- Создание уникального индекса, чтобы у каждого пользователя была только одна запись конфигурации
CREATE UNIQUE INDEX idx_user_config_data_unique_user ON user_config_data(user_id);
