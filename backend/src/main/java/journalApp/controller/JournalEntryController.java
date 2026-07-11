package journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import journalApp.entity.JournalEntry;
import journalApp.entity.User;
import journalApp.service.JournalEntryService;
import journalApp.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"", "/", "/journal", "/journal/", "/api/journals", "/api/journals/"})
@Tag(name = "Journal APIs")
public class JournalEntryController {

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private journalApp.repository.JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @org.springframework.beans.factory.annotation.Value("${spring.kafka.enabled:true}")
    private boolean kafkaEnabled;

    @Autowired
    private journalApp.service.SentimentService sentimentService;

    @Autowired
    private journalApp.service.LexiconSentimentService lexiconSentimentService;

    @GetMapping({"id/{myId}/sentiment", "/{myId}/sentiment"})
    @Operation(summary = "Get sentiment score of a journal entry, triggers synchronous analysis if not yet calculated")
    public ResponseEntity<?> getJournalSentiment(@PathVariable String myId) {
        ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(objectId)).collect(Collectors.toList());
        if (collect.isEmpty()) {
            throw new journalApp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }

        Optional<JournalEntry> journalEntryOpt = journalEntryService.findById(objectId);
        if (journalEntryOpt.isEmpty()) {
            throw new journalApp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }

        JournalEntry entry = journalEntryOpt.get();
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
            
            journalEntryService.saveEntry(entry);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("journalId", entry.getId().toString());
        response.put("sentiment", entry.getSentimentScore());
        response.put("analyzedAt", entry.getSentimentAnalyzedAt());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    @Operation(summary = "Get all journal entries of a user with optional tag filtering and pagination")
    public ResponseEntity<?> getAllJournalEntriesOfUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date,desc") String sort,
            @RequestParam(required = false) String tag) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<JournalEntry> allEntries = user.getJournalEntries();
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
                .map(JournalEntry::getId)
                .collect(Collectors.toList());

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortParts[0]));

        org.springframework.data.domain.Page<JournalEntry> paged;
        if (tag != null && !tag.trim().isEmpty()) {
            paged = journalEntryRepository.findByIdInAndTagsContaining(ids, tag.trim().toLowerCase(), pageable);
        } else {
            paged = journalEntryRepository.findByIdIn(ids, pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", paged.getContent());
        response.put("totalPages", paged.getTotalPages());
        response.put("totalElements", paged.getTotalElements());
        response.put("size", paged.getSize());
        response.put("number", paged.getNumber());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/search")
    @Operation(summary = "Full-text search across journal entries of the user")
    public ResponseEntity<?> searchJournalEntries(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date,desc") String sort) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<JournalEntry> allEntries = user.getJournalEntries();
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
                .map(JournalEntry::getId)
                .collect(Collectors.toList());

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortParts[0]));

        org.springframework.data.domain.Page<JournalEntry> paged = journalEntryRepository.searchEntries(ids, q, pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("content", paged.getContent());
        response.put("totalPages", paged.getTotalPages());
        response.put("totalElements", paged.getTotalElements());
        response.put("size", paged.getSize());
        response.put("number", paged.getNumber());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Autowired
    private journalApp.service.ClaudeSentimentService claudeSentimentService;

    @Autowired
    private journalApp.service.PromptFallbackService promptFallbackService;

    @GetMapping("/guided-prompts")
    @Operation(summary = "Get personalized guided reflection prompts based on recent mood")
    public ResponseEntity<?> getGuidedPrompts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            User user = userService.findByUserName(userName);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<JournalEntry> entries = user.getJournalEntries();
            List<JournalEntry> lastThree = entries.stream()
                .filter(e -> e != null && e.getSentiment() != null && e.getDate() != null)
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .limit(3)
                .collect(Collectors.toList());

            journalApp.enums.Sentiment dominantSentiment = journalApp.enums.Sentiment.HAPPY;
            if (!lastThree.isEmpty()) {
                Map<journalApp.enums.Sentiment, Integer> frequency = new HashMap<>();
                for (JournalEntry entry : lastThree) {
                    frequency.put(entry.getSentiment(), frequency.getOrDefault(entry.getSentiment(), 0) + 1);
                }
                int maxCount = 0;
                for (Map.Entry<journalApp.enums.Sentiment, Integer> entry : frequency.entrySet()) {
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

    @PostMapping
    public ResponseEntity<JournalEntry> createEntry(@jakarta.validation.Valid @RequestBody JournalEntry myEntry) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            journalEntryService.saveEntry(myEntry, userName);
            if (kafkaEnabled) {
                try {
                    journalApp.model.EntryCreatedEvent event = new journalApp.model.EntryCreatedEvent(myEntry.getId().toString(), myEntry.getContent());
                    kafkaTemplate.send("entry-created", myEntry.getId().toString(), event);
                } catch (Exception kafkaEx) {
                    // Fallback
                }
                try {
                    journalApp.model.JournalSavedEvent savedEvent = new journalApp.model.JournalSavedEvent(myEntry.getId().toString(), myEntry.getContent());
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
                    journalEntryService.saveEntry(myEntry);
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

    @GetMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> getJournalEntryById(@PathVariable String myId) {
        ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(objectId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findById(objectId);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        throw new journalApp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
    }

    @DeleteMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> deleteJournalEntryById(@PathVariable ObjectId myId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean removed = journalEntryService.deleteById(myId, username);
        if (removed) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else{
            throw new journalApp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
        }
    }

    @PutMapping({"id/{myId}", "/{myId}"})
    public ResponseEntity<?> updateJournalById(@PathVariable ObjectId myId, @jakarta.validation.Valid @RequestBody JournalEntry newEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        if (user.getJournalEntries() != null) {
            List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(myId)).collect(Collectors.toList());
            if (!collect.isEmpty()) {
                Optional<JournalEntry> journalEntry = journalEntryService.findById(myId);
                if (journalEntry.isPresent()) {
                    JournalEntry old = journalEntry.get();
                    old.setTitle(newEntry.getTitle() != null && !newEntry.getTitle().equals("") ? newEntry.getTitle() : old.getTitle());
                    old.setContent(newEntry.getContent() != null && !newEntry.getContent().equals("") ? newEntry.getContent() : old.getContent());
                    old.setSentiment(newEntry.getSentiment() != null ? newEntry.getSentiment() : old.getSentiment());
                    journalEntryService.saveEntry(old);
                    if (kafkaEnabled) {
                        try {
                            journalApp.model.JournalSavedEvent savedEvent = new journalApp.model.JournalSavedEvent(old.getId().toString(), old.getContent());
                            kafkaTemplate.send("journal-sentiment-analysis", old.getId().toString(), savedEvent);
                        } catch (Exception kafkaEx) {
                            // Fallback
                        }
                    }
                    return new ResponseEntity<>(old, HttpStatus.OK);
                }
            }
        }
        throw new journalApp.exception.JournalNotFoundException("Journal entry not found with ID: " + myId);
    }


}
