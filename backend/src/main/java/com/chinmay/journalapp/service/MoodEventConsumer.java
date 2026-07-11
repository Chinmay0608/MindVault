package com.chinmay.journalapp.service;

import com.chinmay.journalapp.entity.JournalRecord;
import com.chinmay.journalapp.model.JournalSavedEvent;
import com.chinmay.journalapp.repository.EntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MoodEventConsumer {

    @Autowired
    private SentimentService sentimentService;

    @Autowired
    private LexiconSentimentService lexiconSentimentService;

    @Autowired
    private EntryRepository entryRepository;

    @KafkaListener(topics = "journal-sentiment-analysis", groupId = "weekly-sentiment-group")
    public void consume(JournalSavedEvent event) {
        if (event == null || event.getJournalId() == null) {
            return;
        }

        String journalId = event.getJournalId();
        String content = event.getContent();

        String sentimentScore;
        try {
            sentimentScore = sentimentService.analyze(content);
        } catch (Exception e) {
            sentimentScore = lexiconSentimentService.analyze(content);
        }

        try {
            Optional<JournalRecord> optionalEntry = entryRepository.findById(new ObjectId(journalId));
            if (optionalEntry.isPresent()) {
                JournalRecord entry = optionalEntry.get();
                entry.setSentimentScore(sentimentScore);
                entry.setSentimentAnalyzedAt(LocalDateTime.now());
                
                String insight;
                if ("POSITIVE".equalsIgnoreCase(sentimentScore)) {
                    insight = "Your thoughts reflect an optimistic, positive, or happy state of mind.";
                } else if ("NEGATIVE".equalsIgnoreCase(sentimentScore)) {
                    insight = "Your reflections show signs of negative emotions, sadness, or frustration.";
                } else {
                    insight = "Your writing carries a calm, neutral, and balanced tone.";
                }
                entry.setAiInsight(insight);
                
                entryRepository.save(entry);
            }
        } catch (Exception ex) {
            // Safe fallback
        }
    }
}

