package com.chinmay.journalapp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.chinmay.journalapp.entity.JournalRecord;
import com.chinmay.journalapp.entity.UserAccount;
import com.chinmay.journalapp.service.EntryService;
import com.chinmay.journalapp.service.AccountService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller class managing the lifecycle of journal records.
 * I built this controller to expose CRUD features, asynchronous sentiment trigger points, and text lookups.
 */
@RestController
@RequestMapping({"", "/", "/journal", "/journal/", "/api/journals", "/api/journals/"})
@Tag(name = "Journal APIs")
public class EntryController {

    @Autowired
    private EntryService entryService;

    @Autowired
    private com.chinmay.journalapp.repository.EntryRepository entryRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @org.springframework.beans.factory.annotation.Value("${spring.kafka.enabled:true}")
    private boolean kafkaEnabled;

    @Autowired
    private com.chinmay.journalapp.service.SentimentService sentimentService;

    @Autowired
    private com.chinmay.journalapp.service.LexiconSentimentService lexiconSentimentService;

    /**
     * Resolves the current sentiment score of a specific journal entry.
     * If not already calculated, I structured this to execute a synchronous fallback analysis.
     *
     * @param myId identifier of the journal record
     * @return analysis results map on success
     */
    @GetMapping({"id/{myId}/sentiment", "/{myId}/sentiment"})
    @Operation(summary = "Get sentiment score of a journal entry, triggers synchronous analysis if not yet calculated")
    public ResponseEntity<?> getJournalSentiment(@PathVariable String myId) {
        ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        
        List<JournalRecord> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(objectId)).collect(Collectors.toList());
        if (collect.isEmpty()) {
            throw new com.chinmay.journalapp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }

        Optional<JournalRecord> journalEntryOpt = entryService.findById(objectId);
        if (journalEntryOpt.isEmpty()) {
            throw new com.chinmay.journalapp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }

        JournalRecord entry = journalEntryOpt.get();
        if (entry.getSentimentScore() == null) {
            String score;
            try {
                score = sentimentService.analyze(entry.getContent());
            } catch (Exception e) {
                score = lexiconSentimentService.analyze(entry.getContent());
            }
            entry.setSentimentScore(score);
            entry.setSentimentAnalyzedAt(java.time.LocalDateTime.now());
            
            String insight;
            if ("POSITIVE".equalsIgnoreCase(score)) {
                insight = "Your thoughts reflect an optimistic, positive, or happy state of mind.";
            } else if ("NEGATIVE".equalsIgnoreCase(score)) {
                insight = "Your reflections show signs of negative emotions, sadness, or frustration.";
            } else {
                insight = "Your writing carries a calm, neutral, and balanced tone.";
            }
            entry.setAiInsight(insight);
            
            entryService.saveEntry(entry);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("journalId", entry.getId().toString());
        response.put("sentiment", entry.getSentimentScore());
        response.put("analyzedAt", entry.getSentimentAnalyzedAt());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Lists journal entries for the authenticated user.
     * I added an optional tag filter parameter to support hashtags like '#reflection'.
     *
     * @param page index page
     * @param size page limit size
     * @param sort sorting order
     * @param tag optional tag filter
     * @return paginated entries list
     */
    @GetMapping
    @Operation(summary = "Get all journal entries of a user with optional tag filtering and pagination")
    public ResponseEntity<?> getAllJournalEntriesOfUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date,desc") String sort,
            @RequestParam(required = false) String tag) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<JournalRecord> allEntries = user.getJournalEntries();
        if (allEntries == null || allEntries.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("content", new ArrayList<>());
            response.put("totalPages", 0);
            response.put("totalElements", 0L);
            response.put("size", size);
            response.put("number", page);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        List<ObjectId> ids = allEntries.stream()
                .filter(Objects::nonNull)
                .map(JournalRecord::getId)
                .collect(Collectors.toList());

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortParts[0]));

        org.springframework.data.domain.Page<JournalRecord> paged;
        if (tag != null && !tag.trim().isEmpty()) {
            paged = entryRepository.findByIdInAndTagsContaining(ids, tag.trim().toLowerCase(), pageable);
        } else {
            paged = entryRepository.findByIdIn(ids, pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", paged.getContent());
        response.put("totalPages", paged.getTotalPages());
        response.put("totalElements", paged.getTotalElements());
        response.put("size", paged.getSize());
        response.put("number", paged.getNumber());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Executes a case-insensitive full-text search across journal records.
     * I engineered this query to scan both titles and entry contents.
     *
     * @param q search query string
     * @param page index page
     * @param size page limit size
     * @param sort sorting parameter
     * @return search matching records
     */
    @GetMapping("/search")
    @Operation(summary = "Full-text search across journal entries of the user")
    public ResponseEntity<?> searchJournalEntries(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date,desc") String sort) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<JournalRecord> allEntries = user.getJournalEntries();
        if (allEntries == null || allEntries.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("content", new ArrayList<>());
            response.put("totalPages", 0);
            response.put("totalElements", 0L);
            response.put("size", size);
            response.put("number", page);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        List<ObjectId> ids = allEntries.stream()
                .filter(Objects::nonNull)
                .map(JournalRecord::getId)
                .collect(Collectors.toList());

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortParts[0]));

        org.springframework.data.domain.Page<JournalRecord> paged = entryRepository.searchEntries(ids, q, pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("content", paged.getContent());
        response.put("totalPages", paged.getTotalPages());
        response.put("totalElements", paged.getTotalElements());
        response.put("size", paged.getSize());
        response.put("number", paged.getNumber());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Autowired
    private com.chinmay.journalapp.service.ClaudeSentimentService claudeSentimentService;

    @Autowired
    private com.chinmay.journalapp.service.PromptFallbackService promptFallbackService;

    /**
     * Recommends personalized reflection prompts based on dominant sentiments.
     * I added fallback loops in case the external API service encounters connectivity issues.
     *
     * @return list of guided prompts
     */
    @GetMapping("/guided-prompts")
    @Operation(summary = "Get personalized guided reflection prompts based on recent mood")
    public ResponseEntity<?> getGuidedPrompts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            UserAccount user = accountService.findByUserName(userName);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<JournalRecord> entries = user.getJournalEntries();
            List<JournalRecord> lastThree = entries.stream()
                .filter(e -> e != null && e.getSentiment() != null && e.getDate() != null)
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .limit(3)
                .collect(Collectors.toList());

            com.chinmay.journalapp.enums.Sentiment dominantSentiment = com.chinmay.journalapp.enums.Sentiment.HAPPY;
            if (!lastThree.isEmpty()) {
                Map<com.chinmay.journalapp.enums.Sentiment, Integer> frequency = new HashMap<>();
                for (JournalRecord entry : lastThree) {
                    frequency.put(entry.getSentiment(), frequency.getOrDefault(entry.getSentiment(), 0) + 1);
                }
                int maxCount = 0;
                for (Map.Entry<com.chinmay.journalapp.enums.Sentiment, Integer> entry : frequency.entrySet()) {
                    if (entry.getValue() > maxCount) {
                        maxCount = entry.getValue();
                        dominantSentiment = entry.getKey();
                    }
                }
            }

            List<String> prompts;
            try {
                prompts = claudeSentimentService.generateGuidedPrompts(dominantSentiment);
            } catch (Exception ex) {
                prompts = promptFallbackService.getFallbackPrompts(dominantSentiment);
            }

            return new ResponseEntity<>(prompts, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Creates and records a new journal entry.
     * I structured this to automatically schedule asynchronous sentiment evaluation via Kafka when active.
     *
     * @param myEntry content elements
     * @return the created journal entry
     */
    @PostMapping
    public ResponseEntity<JournalRecord> createEntry(@jakarta.validation.Valid @RequestBody JournalRecord myEntry) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            entryService.saveEntry(myEntry, userName);

            if (kafkaEnabled) {
                try {
                    com.chinmay.journalapp.model.EntryCreatedEvent event = new com.chinmay.journalapp.model.EntryCreatedEvent(myEntry.getId().toString(), myEntry.getContent());
                    kafkaTemplate.send("entry-created", myEntry.getId().toString(), event);
                } catch (Exception kafkaEx) {
                    // Fallback
                }
                try {
                    com.chinmay.journalapp.model.JournalSavedEvent savedEvent = new com.chinmay.journalapp.model.JournalSavedEvent(myEntry.getId().toString(), myEntry.getContent());
                    kafkaTemplate.send("journal-sentiment-analysis", myEntry.getId().toString(), savedEvent);
                } catch (Exception kafkaEx) {
                    // Fallback
                }
            } else {
                try {
                    String score;
                    try {
                        score = sentimentService.analyze(myEntry.getContent());
                    } catch (Exception e) {
                        score = lexiconSentimentService.analyze(myEntry.getContent());
                    }
                    myEntry.setSentimentScore(score);
                    myEntry.setSentimentAnalyzedAt(java.time.LocalDateTime.now());
                    
                    String insight;
                    if ("POSITIVE".equalsIgnoreCase(score)) {
                        insight = "Your thoughts reflect an optimistic, positive, or happy state of mind.";
                    } else if ("NEGATIVE".equalsIgnoreCase(score)) {
                        insight = "Your reflections show signs of negative emotions, sadness, or frustration.";
                    } else {
                        insight = "Your writing carries a calm, neutral, and balanced tone.";
                    }
                    myEntry.setAiInsight(insight);
                    entryService.saveEntry(myEntry);
                } catch (Exception e) {
                    // Fallback
                }
            }
            return new ResponseEntity<>(myEntry, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Resolves single journal record details by identifier.
     * I implemented this to verify ownership before querying database values.
     *
     * @param myId database identifier
     * @return the journal record
     */
    @GetMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> getJournalEntryById(@PathVariable String myId) {
        ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        List<JournalRecord> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(objectId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalRecord> journalEntry = entryService.findById(objectId);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        throw new com.chinmay.journalapp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
    }

    /**
     * Deletes a journal entry from the user's registry.
     * I designed this to keep transactional logs safe during delete operations.
     *
     * @param myId database record ID
     * @return status confirmation
     */
    @DeleteMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> deleteJournalEntryById(@PathVariable ObjectId myId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean removed = entryService.deleteById(myId, username);
        if (removed) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            throw new com.chinmay.journalapp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }
    }

    /**
     * Modifies the values of an existing entry.
     * I added Kafka synchronization triggers on successful updates.
     *
     * @param myId database entry ID
     * @param newEntry new data properties
     * @return the updated entry
     */
    @PutMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> updateJournalById(@PathVariable ObjectId myId, @jakarta.validation.Valid @RequestBody JournalRecord newEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        UserAccount user = accountService.findByUserName(userName);
        if (user.getJournalEntries() != null) {
            List<JournalRecord> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(myId)).collect(Collectors.toList());
            if (!collect.isEmpty()) {
                Optional<JournalRecord> journalEntry = entryService.findById(myId);
                if (journalEntry.isPresent()) {
                    JournalRecord old = journalEntry.get();
                    old.setTitle(newEntry.getTitle() != null && !newEntry.getTitle().equals("") ? newEntry.getTitle() : old.getTitle());
                    old.setContent(newEntry.getContent() != null && !newEntry.getContent().equals("") ? newEntry.getContent() : old.getContent());
                    old.setSentiment(newEntry.getSentiment() != null ? newEntry.getSentiment() : old.getSentiment());
                    entryService.saveEntry(old);
                    if (kafkaEnabled) {
                        try {
                            com.chinmay.journalapp.model.JournalSavedEvent savedEvent = new com.chinmay.journalapp.model.JournalSavedEvent(old.getId().toString(), old.getContent());
                            kafkaTemplate.send("journal-sentiment-analysis", old.getId().toString(), savedEvent);
                        } catch (Exception kafkaEx) {
                            // Fallback
                        }
                    }
                    return new ResponseEntity<>(old, HttpStatus.OK);
                }
            }
        }
        throw new com.chinmay.journalapp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
    }
}
