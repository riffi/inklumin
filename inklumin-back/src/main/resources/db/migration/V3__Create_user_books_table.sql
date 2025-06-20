-- V3__Create_user_books_table.sql
CREATE TABLE user_books (
                            uuid VARCHAR(36) PRIMARY KEY,
                            user_id BIGINT NOT NULL,
                            book_title VARCHAR(255) NOT NULL, -- Добавлено название книги
                            book_data TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_user_books_user_id
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_books_user_id ON user_books(user_id);
