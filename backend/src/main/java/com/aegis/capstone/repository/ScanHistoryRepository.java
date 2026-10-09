package com.aegis.capstone.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.aegis.capstone.model.ScanHistory;

public interface ScanHistoryRepository extends MongoRepository<ScanHistory, String> {
}
