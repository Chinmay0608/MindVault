package com.chinmay.journalapp.entity;

import lombok.*;
import com.chinmay.journalapp.enums.Sentiment;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "journal_records")
@Data
@NoArgsConstructor
public class JournalRecord {
    @Id
    @com.fasterxml.jackson.databind.annotation.JsonSerialize(using = com.fasterxml.jackson.databind.ser.std.ToStringSerializer.class)
    private ObjectId id;
    @jakarta.validation.constraints.NotBlank(message = "Title cannot be blank")
    @jakarta.validation.constraints.Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;
    @jakarta.validation.constraints.NotBlank(message = "Content cannot be blank")
    private String content;
    private java.time.LocalDateTime date;
    private Sentiment sentiment;
    private String aiInsight;
    private String sentimentScore;
    private java.time.LocalDateTime sentimentAnalyzedAt;
    private java.util.List<String> tags;
    private Integer wordCount;
    private Integer readingTime; // In seconds
}



