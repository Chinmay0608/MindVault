package journalApp.service;

import journalApp.entity.JournalEntry;
import journalApp.model.JournalSavedEvent;
import journalApp.repository.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SentimentConsumer {

    @Autowired
    private SentimentService sentimentService;

    @Autowired
    private LexiconSentimentService lexiconSentimentService;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

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
            Optional<JournalEntry> optionalEntry = journalEntryRepository.findById(new ObjectId(journalId));
            if (optionalEntry.isPresent()) {
                JournalEntry entry = optionalEntry.get();
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
                
                journalEntryRepository.save(entry);
            }
        } catch (Exception ex) {
            // Safe fallback
        }
    }
}
