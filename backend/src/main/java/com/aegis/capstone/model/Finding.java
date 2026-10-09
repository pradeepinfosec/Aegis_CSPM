package com.aegis.capstone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "findings")
public class Finding {
    @Id
    private String id;
    private String title;
    private String resource;
    private String cloud;
    private String resourceGroup;
    private String accountId;
    private String control;
    private double score;
    private String severity;
    private String confidence;
    private String review;

    public Finding() {}

    public Finding(String title, String resource, String resourceGroup, String cloud, String accountId, String control, double score, String severity, String confidence, String review) {
        this.title = title;
        this.resource = resource;
        this.resourceGroup = resourceGroup;
        this.cloud = cloud;
        this.accountId = accountId;
        this.control = control;
        this.score = score;
        this.severity = severity;
        this.confidence = confidence;
        this.review = review;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getCloud() { return cloud; }
    public void setCloud(String cloud) { this.cloud = cloud; }
    public String getResourceGroup() { return resourceGroup; }
    public void setResourceGroup(String resourceGroup) { this.resourceGroup = resourceGroup; }
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }
    public String getControl() { return control; }
    public void setControl(String control) { this.control = control; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }
    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }
}
