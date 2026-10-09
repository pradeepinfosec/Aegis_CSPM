package com.aegis.capstone.repository;

import com.aegis.capstone.model.Finding;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FindingRepository extends MongoRepository<Finding, String> {
}
