package com.chinmay.journalapp.repository;

import com.chinmay.journalapp.entity.JournalRecord;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface EntryRepository extends MongoRepository<JournalRecord, ObjectId> {
    Page<JournalRecord> findByIdIn(List<ObjectId> ids, Pageable pageable);
    Page<JournalRecord> findByIdInAndTagsContaining(List<ObjectId> ids, String tag, Pageable pageable);

    @org.springframework.data.mongodb.repository.Query("{ 'id': { '$in': ?0 }, '$or': [ { 'title': { '$regex': ?1, '$options': 'i' } }, { 'content': { '$regex': ?1, '$options': 'i' } } ] }")
    Page<JournalRecord> searchEntries(List<ObjectId> ids, String keyword, Pageable pageable);
}



