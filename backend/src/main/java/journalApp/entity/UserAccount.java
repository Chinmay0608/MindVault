package journalApp.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAccount {

    @Id
    @com.fasterxml.jackson.databind.annotation.JsonSerialize(using = com.fasterxml.jackson.databind.ser.std.ToStringSerializer.class)
    private ObjectId id;

    @Indexed(unique = true)
    @NonNull
    private String userName;

    private String email;

    private boolean sentimentAnalysis;

    @NonNull
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Builder.Default
    @DBRef
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<JournalRecord> journalEntries = new ArrayList<>();

    private List<String> roles;
    private String location;
    
    @Builder.Default
    private Integer currentStreak = 0;
    @Builder.Default
    private Integer longestStreak = 0;
    private java.time.LocalDate lastJournaledDate;
}
