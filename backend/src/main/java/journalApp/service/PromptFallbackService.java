package journalApp.service;

import journalApp.enums.Sentiment;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class PromptFallbackService {

    public List<String> getFallbackPrompts(Sentiment sentiment) {
        if (sentiment == null) {
            sentiment = Sentiment.HAPPY;
        }

        switch (sentiment) {
            case HAPPY:
                return Arrays.asList(
                    "What did you enjoy most about today, and how can you savor this positive moment?",
                    "Who is someone you are grateful for today, and why do they bring you joy?"
                );
            case SAD:
                return Arrays.asList(
                    "What is a small thing you can do to comfort yourself today?",
                    "Write about a gentle, warm memory that makes you feel safe."
                );
            case ANGRY:
                return Arrays.asList(
                    "What triggered this reaction, and what important boundary does it represent?",
                    "Describe where you feel this anger physically in your body, and how you can gently let it go."
                );
            case ANXIOUS:
                return Arrays.asList(
                    "List 3 things in your current surroundings that are safe, quiet, and reliable.",
                    "What is one small worry you can choose to set down for the next hour?"
                );
            default:
                return Arrays.asList(
                    "How does your body feel right now, and what does it need?",
                    "What is one thing you want to focus on tomorrow?"
                );
        }
    }
}
