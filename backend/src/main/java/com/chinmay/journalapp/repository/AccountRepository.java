package com.chinmay.journalapp.repository;

import com.chinmay.journalapp.entity.UserAccount;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AccountRepository extends MongoRepository<UserAccount, ObjectId> {
    UserAccount findByUserName(String username);
    UserAccount findByEmail(String email);

    void deleteByUserName(String username);
}



