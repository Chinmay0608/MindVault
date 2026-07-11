package journalApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SentimentService {

    @Value("${api.gemini.key:${gemini.api.key:}}")
    private String apiKey;

    @Value("${api.gemini.model:${gemini.api.model:gemini-2.5-flash}}")
    private String modelName;

    private final RestTemplate restTemplate;

    public SentimentService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String analyze(String content) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API Key is not configured.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.set("content-type", "application/json");

        String prompt = "Analyze the sentiment of this journal entry and respond with exactly one word: POSITIVE, NEGATIVE, or NEUTRAL. Journal entry: " + content;
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partsContainer = new HashMap<>();
        partsContainer.put("parts", List.of(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(partsContainer));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                List candidates = (List) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map contentObj = (Map) firstCandidate.get("content");
                    if (contentObj != null) {
                        List partsList = (List) contentObj.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            Map firstPart = (Map) partsList.get(0);
                            String text = (String) firstPart.get("text");
                            if (text != null) {
                                String cleaned = text.trim().toUpperCase();
                                if (cleaned.contains("POSITIVE")) return "POSITIVE";
                                if (cleaned.contains("NEGATIVE")) return "NEGATIVE";
                                if (cleaned.contains("NEUTRAL")) return "NEUTRAL";
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze sentiment via Gemini API: " + e.getMessage(), e);
        }

        throw new RuntimeException("Invalid or empty response from Gemini API.");
    }
}
