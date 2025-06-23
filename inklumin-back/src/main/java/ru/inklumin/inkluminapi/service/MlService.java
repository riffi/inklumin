package ru.inklumin.inkluminapi.service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlService {

  @Value("${ml.service.url:http://localhost:5123}")
  private String mlUrl;

  private final RestTemplate restTemplate = new RestTemplate();

  public Map<?, ?> getTitleForms(String phrase) {
    Map<String, String> request = Map.of("phrase", phrase);
    return restTemplate.postForObject(mlUrl + "/get_cases", request, Map.class);
  }

  public Map<?, ?> findRepeats(String text, Integer windowSize, Integer windowSizeTech) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("text", text);
    if (windowSize != null) {
      payload.put("window_size", windowSize);
    }
    if (windowSizeTech != null) {
      payload.put("window_size_tech_words", windowSizeTech);
    }
    return restTemplate.postForObject(mlUrl + "/find_repeats", payload, Map.class);
  }

  public Map<?, ?> analyzeCliches(String text) {
    Map<String, String> request = Map.of("text", text);
    return restTemplate.postForObject(mlUrl + "/analyze_cliches", request, Map.class);
  }
}
