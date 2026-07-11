package com.chinmay.journalapp.service;

import com.chinmay.journalapp.model.MoodAnalysis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MoodEventConsumerService {

    @Autowired
    private NotificationService emailService;

    @Autowired
    private com.chinmay.journalapp.repository.AccountRepository userRepository;

    @Autowired
    private ClaudeSentimentService claudeSentimentService;

    @KafkaListener(topics = "weekly-sentiments", groupId = "weekly-sentiment-group")
    public void consume(MoodAnalysis sentimentData) {
        sendEmail(sentimentData);
    }

    private void sendEmail(MoodAnalysis sentimentData) {
        String emailBody = sentimentData.getSentiment();
        try {
            com.chinmay.journalapp.entity.UserAccount user = userRepository.findByEmail(sentimentData.getEmail());
            if (user != null) {
                java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minus(7, java.time.temporal.ChronoUnit.DAYS);
                java.util.List<String> entryDetails = new java.util.ArrayList<>();
                for (com.chinmay.journalapp.entity.JournalRecord entry : user.getJournalEntries()) {
                    if (entry != null && entry.getDate() != null && entry.getDate().isAfter(sevenDaysAgo)) {
                        String detail = "- Title: " + entry.getTitle();
                        if (entry.getAiInsight() != null) {
                            detail += " (Insight: " + entry.getAiInsight() + ")";
                        }
                        entryDetails.add(detail);
                    }
                }
                
                if (!entryDetails.isEmpty()) {
                    String recap = claudeSentimentService.generateWeeklyRecap(entryDetails);
                    emailBody += "\n\n--- AI Weekly Mirror ---\n" + recap;
                }
            }
        } catch (Exception e) {
            // Fall back to original message if database or AI fails
        }
        emailService.sendEmail(sentimentData.getEmail(), "Sentiment for previous week", emailBody);
    }
}



