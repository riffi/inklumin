package ru.inklumin.inkluminapi.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.inklumin.inkluminapi.dto.ApiResponse;
import ru.inklumin.inkluminapi.service.MlService;

@RestController
@RequestMapping("/api/ml")
public class MlController {

  private final MlService mlService;

  public MlController(MlService mlService) {
    this.mlService = mlService;
  }

  @PostMapping("/title-forms")
  public ResponseEntity<?> titleForms(@RequestBody Map<String, String> request) {
    try {
      Map<?, ?> data = mlService.getTitleForms(request.get("phrase"));
      return ResponseEntity.ok(new ApiResponse(true, "Forms generated", data));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "ML service error"));
    }
  }

  @PostMapping("/repeats")
  public ResponseEntity<?> repeats(@RequestBody Map<String, Object> request) {
    try {
      String text = (String) request.get("text");
      Integer windowSize = request.get("window_size") == null ? null : ((Number) request.get("window_size")).intValue();
      Integer windowSizeTech = request.get("window_size_tech_words") == null ? null : ((Number) request.get("window_size_tech_words")).intValue();
      Map<?, ?> data = mlService.findRepeats(text, windowSize, windowSizeTech);
      return ResponseEntity.ok(new ApiResponse(true, "Repeats analyzed", data));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "ML service error"));
    }
  }

  @PostMapping("/cliches")
  public ResponseEntity<?> cliches(@RequestBody Map<String, String> request) {
    try {
      Map<?, ?> data = mlService.analyzeCliches(request.get("text"));
      return ResponseEntity.ok(new ApiResponse(true, "Cliches analyzed", data));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "ML service error"));
    }
  }
}
