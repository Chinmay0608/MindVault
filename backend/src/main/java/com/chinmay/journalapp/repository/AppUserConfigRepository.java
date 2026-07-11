package com.chinmay.journalapp.repository;

import com.chinmay.journalapp.entity.AppUserConfig;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppUserConfigRepository extends MongoRepository<AppUserConfig, ObjectId> {

}

