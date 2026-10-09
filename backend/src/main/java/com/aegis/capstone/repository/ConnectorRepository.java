package com.aegis.capstone.repository;

import com.aegis.capstone.model.ConnectorCredential;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConnectorRepository extends MongoRepository<ConnectorCredential, String> {
}
