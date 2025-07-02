package ru.inklumin.inkluminapi.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.inklumin.inkluminapi.entity.UserNotesData;

@Repository
public interface UserNotesDataRepository extends JpaRepository<UserNotesData, Long> {
  @Query("SELECT und FROM UserNotesData und WHERE und.user.id = :userId ORDER BY und.updatedAt DESC")
  Optional<UserNotesData> findLatestByUserId(@Param("userId") Long userId);

  Optional<UserNotesData> findByUserId(Long userId);
}
