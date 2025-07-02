-- V6__Create_user_notes_data_table.sql
-- Создание таблицы для хранения заметок и групп пользователя

CREATE TABLE user_notes_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notes_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_notes_data_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_notes_data_user_id ON user_notes_data(user_id);
CREATE UNIQUE INDEX idx_user_notes_data_unique_user ON user_notes_data(user_id);
