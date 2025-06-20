package ru.inklumin.inkluminapi.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.inklumin.inkluminapi.dto.BookShortInfo;
import ru.inklumin.inkluminapi.entity.UserBook;
import java.util.Optional;

public interface UserBookRepository extends JpaRepository<UserBook, String> {
  Optional<UserBook> findByUuidAndUser_Id(String uuid, Long userId);

  // Новый метод для получения списка книг
  @Query("SELECT NEW ru.inklumin.inkluminapi.dto.BookShortInfo(b.uuid, b.bookTitle, b.kind, b.updatedAt) FROM UserBook b WHERE b.user.id = :userId")
  List<BookShortInfo> findShortInfoByUserId(@Param("userId") Long userId);
}
