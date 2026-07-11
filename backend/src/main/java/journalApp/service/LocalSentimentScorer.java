package journalApp.service;

import journalApp.enums.Sentiment;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class LocalSentimentScorer {

    private static final List<String> HAPPY_WORDS = Arrays.asList(
        "happy", "joy", "excited", "great", "good", "wonderful", "celebrate", "peaceful", "love", "smile", "pleasant", "delight", "delighted"
    );

    private static final List<String> SAD_WORDS = Arrays.asList(
        "sad", "lonely", "down", "hurt", "grief", "tear", "cry", "sorry", "miss", "lost", "gloomy", "heavy"
    );

    private static final List<String> ANGRY_WORDS = Arrays.asList(
        "angry", "mad", "hate", "furious", "annoyed", "irritated", "frustrated", "unfair", "rage"
    );

    private static final List<String> ANXIOUS_WORDS = Arrays.asList(
        "anxious", "worry", "worried", "nervous", "fear", "panic", "scared", "stress", "restless"
    );

    public Sentiment analyze(String content) {
        if (content == null || content.trim().isEmpty()) {
            return Sentiment.HAPPY;
        }

        String lowerContent = content.toLowerCase();
        int happyScore = countMatches(lowerContent, HAPPY_WORDS);
        int sadScore = countMatches(lowerContent, SAD_WORDS);
        int angryScore = countMatches(lowerContent, ANGRY_WORDS);
        int anxiousScore = countMatches(lowerContent, ANXIOUS_WORDS);

        // Find the maximum score
        int maxScore = happyScore;
        Sentiment sentiment = Sentiment.HAPPY;

        if (sadScore > maxScore) {
            maxScore = sadScore;
            sentiment = Sentiment.SAD;
        }
        if (angryScore > maxScore) {
            maxScore = angryScore;
            sentiment = Sentiment.ANGRY;
        }
        if (anxiousScore > maxScore) {
            maxScore = anxiousScore;
            sentiment = Sentiment.ANXIOUS;
        }

        return sentiment;
    }

    private int countMatches(String text, List<String> words) {
        int count = 0;
        for (String word : words) {
            int index = 0;
            while ((index = text.indexOf(word, index)) != -1) {
                count++;
                index += word.length();
            }
        }
        return count;
    }
}
