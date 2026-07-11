package com.chinmay.journalapp.service;

import lombok.extern.slf4j.Slf4j;
import com.chinmay.journalapp.entity.JournalRecord;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.repository.EntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service managing database transactions for JournalRecords.
 * I developed this service layer to isolate transactional logic, auto-calculate word stats, parse hashtags, and update user streak metrics.
 */
@Service
@Slf4j
public class EntryService {

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private AccountService accountService;

    /**
     * Saves a new entry to the database and links it to the UserAccount.
     * I designed this to automatically calculate metadata and update consecutive logging streaks.
     *
     * @param journalEntry entry values
     * @param userName user owner identifier
     */
    @Transactional
    public void saveEntry(JournalRecord journalEntry, String userName) {
        try {
            UserAccount user = accountService.findByUserName(userName);
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

            JournalRecord saved = entryRepository.save(journalEntry);
            if (user.getJournalEntries() == null) {
                user.setJournalEntries(new java.util.ArrayList<>());
            }
            user.getJournalEntries().add(saved);
            accountService.saveUser(user);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while saving the entry.", e);
        }
    }

    /**
     * Updates/saves a journal record directly without altering parent user relations.
     * I created this helper path for background consumers updating sentiment analysis.
     *
     * @param journalEntry entry document values
     */
    public void saveEntry(JournalRecord journalEntry) {
        calculateMetadataAndTags(journalEntry);
        entryRepository.save(journalEntry);
    }

    /**
     * Helper mapping method to calculate word count, reading speed, and extract tags.
     * I added this algorithm to auto-parse hashtag formats.
     */
    private void calculateMetadataAndTags(JournalRecord entry) {
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

    /**
     * Obtains list of all entries.
     * I created this to assist platform administration lookups.
     *
     * @return list of entries
     */
    public List<JournalRecord> getAll() {
        return entryRepository.findAll();
    }

    /**
     * Finds single entry by database identifier.
     * I developed this to ensure safe object retrieval.
     *
     * @param id entry identifier
     * @return matching entry details
     */
    public Optional<JournalRecord> findById(ObjectId id) {
        return entryRepository.findById(id);
    }

    /**
     * Deletes single entry and clears parent user records.
     * I designed this with clean delete procedures to protect database integrity.
     *
     * @param id record identifier
     * @param userName user owner name
     * @return boolean state on successful deletion
     */
    @Transactional
    public boolean deleteById(ObjectId id, String userName) {
        boolean removed = false;
        try {
            UserAccount user = accountService.findByUserName(userName);
            if (user.getJournalEntries() != null) {
                removed = user.getJournalEntries().removeIf(x -> x.getId().equals(id));
            }
            if (removed) {
                accountService.saveUser(user);
                entryRepository.deleteById(id);
            }
        } catch (Exception e) {
            log.error("Error ", e);
            throw new RuntimeException("An error occurred while deleting the entry.", e);
        }
        return removed;
    }
}
