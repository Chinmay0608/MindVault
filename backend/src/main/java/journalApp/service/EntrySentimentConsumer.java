package journalApp.service;

import journalApp.entity.JournalRecord;
import journalApp.enums.Sentiment;
import journalApp.model.EntryCreatedEvent;
import journalApp.repository.EntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EntrySentimentConsumer {

    @Autowired
    private ClaudeSentimentService claudeSentimentService;

    @Autowired
    private LocalSentimentScorer localSentimentScorer;

    @Autowired
    private EntryRepository entryRepository;

    @KafkaListener(topics = "entry-created", groupId = "journal-entry-sentiment-group")
    public void consume(EntryCreatedEvent event) {
        String entryId = event.getEntryId();
        String content = event.getContent();

        Sentiment sentiment;
        String aiInsight;

        try {
            ClaudeSentimentService.AnalysisResult result = claudeSentimentService.analyze(content);
            sentiment = result.sentiment;
            aiInsight = result.aiInsight;
        } catch (Exception e) {
            // Fallback to local lexicon scoring
            sentiment = localSentimentScorer.analyze(content);
            aiInsight = "Reflected on your mood. Take a slow deep breath and notice how you feel right now.";
        }

        try {
            Optional<JournalRecord> optionalEntry = entryRepository.findById(new ObjectId(entryId));
            if (optionalEntry.isPresent()) {
                JournalRecord entry = optionalEntry.get();
                entry.setSentiment(sentiment);
                entry.setAiInsight(aiInsight);
                entryRepository.save(entry);
            }
        } catch (Exception ex) {
            // Suppress error in background task
        }
    }
}
