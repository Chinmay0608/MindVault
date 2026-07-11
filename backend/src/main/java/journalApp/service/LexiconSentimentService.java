package journalApp.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class LexiconSentimentService {

    private final List<String> positiveWords = Arrays.asList(
        "happy", "joy", "excited", "grateful", "wonderful", "amazing", "love", "great", 
        "fantastic", "good", "blessed", "hopeful", "peaceful", "proud", "motivated"
    );

    private final List<String> negativeWords = Arrays.asList(
        "sad", "angry", "frustrated", "hate", "terrible", "awful", "depressed", "anxious", 
        "worried", "fear", "pain", "cry", "hurt", "lost", "hopeless"
    );

    public String analyze(String content) {
        if (content == null || content.trim().isEmpty()) {
            return "NEUTRAL";
        }

        String lower = content.toLowerCase();
        int positiveCount = 0;
        int negativeCount = 0;

        for (String word : positiveWords) {
            positiveCount += countOccurrences(lower, word);
        }

        for (String word : negativeWords) {
            negativeCount += countOccurrences(lower, word);
        }

        if (positiveCount > negativeCount) {
            return "POSITIVE";
        } else if (negativeCount > positiveCount) {
            return "NEGATIVE";
        } else {
            return "NEUTRAL";
        }
    }

    private int countOccurrences(String text, String word) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(word, index)) != -1) {
            count++;
            index += word.length();
        }
        return count;
    }
}
