package journalApp.repository;

import journalApp.entity.JournalEntry;
import journalApp.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, ObjectId> {
    User findByUserName(String username);
    User findByEmail(String email);

    void deleteByUserName(String username);
}
