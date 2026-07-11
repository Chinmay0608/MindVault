package journalApp.repository;

import journalApp.entity.JournalEntry;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface JournalEntryRepository extends MongoRepository<JournalEntry, ObjectId> {
    Page<JournalEntry> findByIdIn(List<ObjectId> ids, Pageable pageable);
}
