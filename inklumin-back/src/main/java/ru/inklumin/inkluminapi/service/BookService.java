package ru.inklumin.inkluminapi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.inklumin.inkluminapi.dto.BookResponse;
import ru.inklumin.inkluminapi.dto.BookShortInfo;
import ru.inklumin.inkluminapi.dto.SaveBookRequest;
import ru.inklumin.inkluminapi.entity.User;
import ru.inklumin.inkluminapi.entity.UserBook;
import ru.inklumin.inkluminapi.repository.UserBookRepository;
import ru.inklumin.inkluminapi.repository.UserRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
  private final UserBookRepository userBookRepository;
  private final UserRepository userRepository;

  public BookResponse saveBookData(Long userId, SaveBookRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    UserBook book = new UserBook();
    book.setUuid(request.getUuid());
    book.setBookTitle(request.getBookTitle()); // Учтено название
    book.setUser(user);
    book.setBookData(request.getBookData());
    book.setKind(request.getKind());
    book.setCreatedAt(java.time.OffsetDateTime.now());
    book.setUpdatedAt(java.time.OffsetDateTime.now());

    userBookRepository.save(book);

    return new BookResponse(
        book.getUuid(),
        book.getBookTitle(),
        book.getBookData(),
        book.getCreatedAt().toString(),
        book.getUpdatedAt().toString()
    );
  }

  public BookResponse getBookData(Long userId, String uuid) {
    UserBook book = userBookRepository.findByUuidAndUser_Id(uuid, userId)
        .orElseThrow(() -> new RuntimeException("Book not found"));
    return new BookResponse(
        book.getUuid(),
        book.getBookTitle(),
        book.getBookData(),
        book.getCreatedAt().toString(),
        book.getUpdatedAt().toString()
    );
  }

  public List<BookShortInfo> getUserBooks(Long userId) {
    return userBookRepository.findShortInfoByUserId(userId);
  }
}
