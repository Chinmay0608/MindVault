package com.chinmay.journalapp.scheduler;

import com.chinmay.journalapp.cache.AppCache;
import com.chinmay.journalapp.entity.JournalRecord;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.enums.Sentiment;
import com.chinmay.journalapp.model.MoodAnalysis;
import com.chinmay.journalapp.repository.AccountRepositoryImpl;
import com.chinmay.journalapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class UserScheduler {

    @Autowired
    private NotificationService emailService;

    @Autowired
    private AccountRepositoryImpl userRepository;

    @Autowired
    private AppCache appCache;

    @Autowired
    private KafkaTemplate<String, MoodAnalysis> kafkaTemplate;

    @Autowired
    private com.chinmay.journalapp.repository.EntryRepository entryRepository;

    @Scheduled(cron = "0 0 9 * * SUN")
    public void fetchUsersAndSendSaMail() {
        List<UserAccount> users = userRepository.getUserForSA();
        for (UserAccount user : users) {
            try {
                List<JournalRecord> userEntries = user.getJournalEntries();
                List<org.bson.types.ObjectId> ids = (userEntries == null) ? java.util.Collections.emptyList() :
                    userEntries.stream()
                        .filter(java.util.Objects::nonNull)
                        .map(JournalRecord::getId)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toList());

                List<JournalRecord> journalEntries = ids.isEmpty() ? java.util.Collections.emptyList() : entryRepository.findByIdIn(ids);
                List<Sentiment> sentiments = journalEntries.stream()
                    .filter(java.util.Objects::nonNull)
                    .filter(x -> x.getDate() != null && x.getDate().isAfter(LocalDateTime.now().minus(7, ChronoUnit.DAYS)))
                    .map(JournalRecord::getSentiment)
                    .collect(Collectors.toList());
                Map<Sentiment, Integer> sentimentCounts = new HashMap<>();
                for (Sentiment sentiment : sentiments) {
                    if (sentiment != null)
                        sentimentCounts.put(sentiment, sentimentCounts.getOrDefault(sentiment, 0) + 1);
                }
                Sentiment mostFrequentSentiment = null;
                int maxCount = 0;
                for (Map.Entry<Sentiment, Integer> entry : sentimentCounts.entrySet()) {
                    if (entry.getValue() > maxCount) {
                        maxCount = entry.getValue();
                        mostFrequentSentiment = entry.getKey();
                    }
                }
                if (mostFrequentSentiment != null) {
                    MoodAnalysis sentimentData = MoodAnalysis.builder().email(user.getEmail()).sentiment("Sentiment for last 7 days " + mostFrequentSentiment).build();
                    try {
                        kafkaTemplate.send("weekly-sentiments", sentimentData.getEmail(), sentimentData);
                    } catch (Exception e) {
                        org.slf4j.LoggerFactory.getLogger(UserScheduler.class).error("Kafka send failed for user: {}", user.getEmail(), e);
                    }
                }
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(UserScheduler.class).error("Failed to process weekly SA mail for user: {}", user != null ? user.getEmail() : "null", e);
            }
        }
    }

    @Scheduled(cron = "0 0/10 * ? * *")
    public void clearAppCache() {
        appCache.init();
    }
}
