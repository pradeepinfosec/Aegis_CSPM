package com.aegis.capstone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "connectors")
public class ConnectorCredential {
    @Id
    private String id;
    private String provider;
    private String accountId;
    private String roleArn;
    private String externalId;
    private String tenantId;
    private String clientId;
    private String clientSecret;
    private String projectId;
    private String serviceAccountEmail;
    private String jsonKey;
    private String workspace;
    private String apiToken;
    private String timestamp;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }
    public String getRoleArn() { return roleArn; }
    public void setRoleArn(String roleArn) { this.roleArn = roleArn; }
    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getServiceAccountEmail() { return serviceAccountEmail; }
    public void setServiceAccountEmail(String serviceAccountEmail) { this.serviceAccountEmail = serviceAccountEmail; }
    public String getJsonKey() { return jsonKey; }
    public void setJsonKey(String jsonKey) { this.jsonKey = jsonKey; }
    public String getWorkspace() { return workspace; }
    public void setWorkspace(String workspace) { this.workspace = workspace; }
    public String getApiToken() { return apiToken; }
    public void setApiToken(String apiToken) { this.apiToken = apiToken; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
