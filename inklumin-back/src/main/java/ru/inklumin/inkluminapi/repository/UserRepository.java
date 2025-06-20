package ru.inklumin.inkluminapi.repository;

import java.util.Optional;
import ru.inklumin.inkluminapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface UserRepository extends JpaRepository<User, Long>{
  Optional<User> findByUsername(String username);
  boolean existsByUsername(String username);
}
