package ru.inklumin.inkluminapi.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.inklumin.inkluminapi.entity.UserConfigData;

@Repository
public interface UserConfigDataRepository extends JpaRepository<UserConfigData, Long> {

  @Query("SELECT ucd FROM UserConfigData ucd WHERE ucd.user.id = :userId ORDER BY ucd.updatedAt DESC")
  Optional<UserConfigData> findLatestByUserId(@Param("userId") Long userId);

  Optional<UserConfigData> findByUserId(Long userId);
}
