package journalApp.repository;

import journalApp.entity.JournalEntry;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface JournalEntryRepository extends MongoRepository<JournalEntry, ObjectId> {
    Page<JournalEntry> findByIdIn(List<ObjectId> ids, Pageable pageable);
    Page<JournalEntry> findByIdInAndTagsContaining(List<ObjectId> ids, String tag, Pageable pageable);

    @org.springframework.data.mongodb.repository.Query("{ 'id': { '$in': ?0 }, '$or': [ { 'title': { '$regex': ?1, '$options': 'i' } }, { 'content': { '$regex': ?1, '$options': 'i' } } ] }")
    Page<JournalEntry> searchEntries(List<ObjectId> ids, String keyword, Pageable pageable);
}
