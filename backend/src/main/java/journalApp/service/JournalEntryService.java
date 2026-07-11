package journalApp.service;

import lombok.extern.slf4j.Slf4j;
import journalApp.entity.JournalEntry;
import journalApp.entity.User;
import journalApp.repository.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public void saveEntry(JournalEntry journalEntry, String userName) {
        try {
            User user = userService.findByUserName(userName);
            journalEntry.setDate(LocalDateTime.now());
            calculateMetadataAndTags(journalEntry);

            // Streak Tracking
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate last = user.getLastJournaledDate();
            if (last == null) {
                user.setCurrentStreak(1);
                user.setLongestStreak(Math.max(user.getLongestStreak() == null ? 0 : user.getLongestStreak(), 1));
            } else {
                long diff = java.time.temporal.ChronoUnit.DAYS.between(last, today);
                if (diff == 1) {
                    int next = (user.getCurrentStreak() == null ? 0 : user.getCurrentStreak()) + 1;
                    user.setCurrentStreak(next);
                    user.setLongestStreak(Math.max(user.getLongestStreak() == null ? 0 : user.getLongestStreak(), next));
                } else if (diff > 1) {
                    user.setCurrentStreak(1);
                }
            }
            user.setLastJournaledDate(today);

            JournalEntry saved = journalEntryRepository.save(journalEntry);
            if (user.getJournalEntries() == null) {
                user.setJournalEntries(new java.util.ArrayList<>());
            }
            user.getJournalEntries().add(saved);
            userService.saveUser(user);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while saving the entry.", e);
        }
    }

    public void saveEntry(JournalEntry journalEntry) {
        calculateMetadataAndTags(journalEntry);
        journalEntryRepository.save(journalEntry);
    }

    private void calculateMetadataAndTags(JournalEntry entry) {
        String content = entry.getContent();
        if (content == null) {
            entry.setWordCount(0);
            entry.setReadingTime(0);
            return;
        }
        String trimmed = content.trim();
        if (trimmed.isEmpty()) {
            entry.setWordCount(0);
            entry.setReadingTime(0);
        } else {
            String[] words = trimmed.split("\\s+");
            entry.setWordCount(words.length);
            // Reading speed ~200 WPM => seconds = (words * 60) / 200 = words * 0.3
            entry.setReadingTime((int) Math.ceil((words.length * 60.0) / 200.0));
        }

        // Parse hashtags
        java.util.List<String> parsedTags = new java.util.ArrayList<>();
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("#(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            String tag = matcher.group(1).toLowerCase();
            if (!parsedTags.contains(tag)) {
                parsedTags.add(tag);
            }
        }
        if (entry.getTags() == null) {
            entry.setTags(parsedTags);
        } else {
            for (String t : parsedTags) {
                if (!entry.getTags().contains(t)) {
                    entry.getTags().add(t);
                }
            }
        }
    }

    public List<JournalEntry> getAll() {
        return journalEntryRepository.findAll();
    }

    public Optional<JournalEntry> findById(ObjectId id) {
        return journalEntryRepository.findById(id);
    }

    @Transactional
    public boolean deleteById(ObjectId id, String userName) {
        boolean removed = false;
        try {
            User user = userService.findByUserName(userName);
            if (user.getJournalEntries() != null) {
                removed = user.getJournalEntries().removeIf(x -> x.getId().equals(id));
            }
            if (removed) {
                userService.saveUser(user);
                journalEntryRepository.deleteById(id);
            }
        } catch (Exception e) {
            log.error("Error ",e);
            throw new RuntimeException("An error occurred while deleting the entry.", e);
        }
        return removed;
    }

}
