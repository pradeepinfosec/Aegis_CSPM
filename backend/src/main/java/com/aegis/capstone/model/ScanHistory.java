package com.aegis.capstone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "scans")
public class ScanHistory {

    @Id
    private String id;
    private String timestamp;
    private String mode;
    private int resources;
    private String auditStatus;
    private int riskPaths;

    public ScanHistory() {}

    public ScanHistory(String id, String timestamp, String mode, int resources, String auditStatus, int riskPaths) {
        this.id = id;
        this.timestamp = timestamp;
        this.mode = mode;
        this.resources = resources;
        this.auditStatus = auditStatus;
        this.riskPaths = riskPaths;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    
    public int getResources() { return resources; }
    public void setResources(int resources) { this.resources = resources; }
    
    public String getAuditStatus() { return auditStatus; }
    public void setAuditStatus(String auditStatus) { this.auditStatus = auditStatus; }
    
    public int getRiskPaths() { return riskPaths; }
    public void setRiskPaths(int riskPaths) { this.riskPaths = riskPaths; }
}
