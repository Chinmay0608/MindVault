package journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import journalApp.entity.JournalEntry;
import journalApp.entity.User;
import journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics APIs")
public class AnalyticsController {

    @Autowired
    private UserService userService;

    @GetMapping("/mood-trend")
    @Operation(summary = "Get mood trend analytics for the authenticated user")
    public ResponseEntity<?> getMoodTrend(@RequestParam(defaultValue = "7") int days) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<JournalEntry> entries = user.getJournalEntries();
        if (entries == null || entries.isEmpty()) {
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("totalEntries", 0);
            emptyResponse.put("days", days);
            emptyResponse.put("sentimentCounts", new HashMap<>());
            emptyResponse.put("trend", new ArrayList<>());
            emptyResponse.put("currentStreak", user.getCurrentStreak() == null ? 0 : user.getCurrentStreak());
            emptyResponse.put("longestStreak", user.getLongestStreak() == null ? 0 : user.getLongestStreak());
            return new ResponseEntity<>(emptyResponse, HttpStatus.OK);
        }

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        List<JournalEntry> filteredEntries = entries.stream()
                .filter(Objects::nonNull)
                .filter(e -> e.getDate() != null && e.getDate().isAfter(cutoff))
                .sorted(Comparator.comparing(JournalEntry::getDate))
                .collect(Collectors.toList());

        Map<String, Integer> sentimentCounts = new HashMap<>();
        List<Map<String, Object>> trendList = new ArrayList<>();

        for (JournalEntry entry : filteredEntries) {
            String sentiment = entry.getSentiment() != null ? entry.getSentiment().name() : "NEUTRAL";
            sentimentCounts.put(sentiment, sentimentCounts.getOrDefault(sentiment, 0) + 1);

            Map<String, Object> trendPoint = new HashMap<>();
            trendPoint.put("date", entry.getDate());
            trendPoint.put("title", entry.getTitle());
            trendPoint.put("sentiment", sentiment);
            trendPoint.put("sentimentScore", entry.getSentimentScore());
            trendList.add(trendPoint);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalEntries", filteredEntries.size());
        response.put("days", days);
        response.put("sentimentCounts", sentimentCounts);
        response.put("trend", trendList);
        response.put("currentStreak", user.getCurrentStreak() == null ? 0 : user.getCurrentStreak());
        response.put("longestStreak", user.getLongestStreak() == null ? 0 : user.getLongestStreak());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
