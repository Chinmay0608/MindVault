package com.chinmay.journalapp.service;

import com.chinmay.journalapp.enums.Sentiment;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class ClaudeSentimentService {

    public static class AnalysisResult {
        public Sentiment sentiment;
        public String aiInsight;

        public AnalysisResult(Sentiment sentiment, String aiInsight) {
            this.sentiment = sentiment;
            this.aiInsight = aiInsight;
        }
    }

    public AnalysisResult analyze(String content) {
        if (content == null || content.trim().isEmpty()) {
            return new AnalysisResult(Sentiment.HAPPY, "Your thoughts are logged securely.");
        }

        String lower = content.toLowerCase();
        int happyCount = countOccurrences(lower, "happy", "good", "great", "joy", "smile", "love", "peace", "excited", "wonderful", "blessed", "glad");
        int sadCount = countOccurrences(lower, "sad", "cry", "lonely", "hurt", "tear", "pain", "sorry", "grief", "depressed", "blue", "down", "gloomy");
        int angryCount = countOccurrences(lower, "angry", "mad", "hate", "furious", "rage", "annoy", "frustrate", "irritated", "pissed", "bitter");
        int anxiousCount = countOccurrences(lower, "anxious", "worry", "nervous", "fear", "scared", "stress", "panic", "dread", "uneasy", "tense");

        Sentiment sentiment = Sentiment.HAPPY;
        int max = happyCount;

        if (sadCount > max) {
            max = sadCount;
            sentiment = Sentiment.SAD;
        }
        if (angryCount > max) {
            max = angryCount;
            sentiment = Sentiment.ANGRY;
        }
        if (anxiousCount > max) {
            max = anxiousCount;
            sentiment = Sentiment.ANXIOUS;
        }

        String insight;
        switch (sentiment) {
            case HAPPY:
                insight = "It's wonderful to see positive reflections in your day; keep savoring these warm moments.";
                break;
            case SAD:
                insight = "It's natural to feel down sometimes; writing about it is a strong step toward self-comfort.";
                break;
            case ANGRY:
                insight = "Acknowledge this frustration; it often shows us what boundaries are important to protect.";
                break;
            case ANXIOUS:
                insight = "Breathe gently; acknowledging your worry can help reduce its weight over time.";
                break;
            default:
                insight = "Your thoughts are registered securely.";
        }

        return new AnalysisResult(sentiment, insight);
    }

    private int countOccurrences(String text, String... keywords) {
        int count = 0;
        for (String word : keywords) {
            int index = 0;
            while ((index = text.indexOf(word, index)) != -1) {
                count++;
                index += word.length();
            }
        }
        return count;
    }

    public String generateWeeklyRecap(List<String> entryDetails) {
        if (entryDetails == null || entryDetails.isEmpty()) {
            return "No entries logged this week. Consistent reflection helps build mindfulness.";
        }
        return "You have successfully documented your journey this week. Reflecting on these moments helps build emotional awareness and positive habits.";
    }

    public List<String> generateGuidedPrompts(Sentiment sentiment) {
        return new PromptFallbackService().getFallbackPrompts(sentiment);
    }
}



