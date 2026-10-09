# Cloud connector setup and supported evidence

The demo is credential free. Live collectors are real SDK/REST integrations, but no account credentials were supplied during development. Live authentication, response shape and permissions must be validated in your own sandbox before the viva. Do not present demo screenshots as live-cloud evidence.

## Common setup

Use Java 17 or later and Maven. From the project directory:

```sh
mvn clean install
cp .env.example .env
cp config/clouds.example.json config/clouds.json
```

Windows PowerShell activation: `.venv\Scripts\Activate.ps1`. Configure actual scope identifiers and set `enabled` to true only for selected clouds. The command, not the file's descriptive `mode`, selects operating mode:

```sh
mvn spring-boot:run -Dspring-boot.run.arguments="--mode live" --config config/clouds.json
```

All collections are read-only. The optional STS AssumeRole call creates a temporary session; it does not change role permissions. GCP getIamPolicy and Azure Logs query use HTTP POST for read operations. Dependencies are optional for demo and are version bounded for live mode; freeze resolved versions after sandbox validation with `pip freeze > requirements-live.lock.txt`. The Docker image is demo-only and was not built in this session.

Set business context by the provider-native resource ID in `business_context.resources`. AWS EC2 IDs use `region:resource-id`; S3 uses the ARN. Azure uses the full ARM resource ID. GCP uses the bucket name or firewall selfLink. For example:

```json
{"business_context":{"default":{"criticality":null,"sensitivity":null},"resources":{"arn:aws:s3:::approved-test-bucket":{"criticality":0.8,"sensitivity":0.9}}}}
```

Business inputs must be documented owner assessments. Missing values use a scoring midpoint and remain visibly uncertain. They are not automatically inferred from names or tags.

## AWS

Choose one credential route: `aws sso login --profile your-profile` and configure `aws.profile`; use the standard environment variables in `.env`; or provide workload credentials through the usual SDK chain. For temporary credentials include `AWS_SESSION_TOKEN`. For cross-account reads set `role_arn` and put the external ID in the environment variable named by `external_id_env`. The target role trust policy is an account-owner responsibility.

`config/aws-readonly-policy.json` contains the operations used. Inventory reads use `Resource: *` because list/describe operations often require it; the owner can restrict supported resource-level statements and scope regions. Remove Security Hub permissions when unused. No S3 object data is downloaded and no IAM writes are allowed.

| Stage | Evidence | Important boundary |
|---|---|---|
| IAM users | Login-profile existence and MFA registration | No federated MFA enforcement, effective grants, role trust, boundaries or CloudTrail telemetry |
| S3 | Bucket PAB, policy public signal, server-access logging | Public policy is not effective anonymous read; unknown access remains unknown when account PAB, policies and ACLs are incomplete |
| EC2 groups | Broad inbound SSH/RDP configuration | No effective network routing, NACL or Internet reachability assertion |
| EC2 instances | Resource inventory and public-IP signal | No installed vulnerability scanner or runtime monitoring assertion |
| Security Hub CSPM optional | Active ASFF vulnerability records | Separate native records; no speculative join to VM identities; unsupported semantics remain unknown |

S3 encrypts new uploads by default. An absent explicit SSE setting is not reported as unencrypted; object age, old objects and customer-managed-key requirements need separate checks. List-bucket scope is account wide, EC2 and Security Hub are region scoped. Pagination and retry are implemented; per-resource denied reads remain null, while list failures appear as failed/partial stages.

## Microsoft Azure

Use `az login` in a test tenant or fill `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` for a read-only application. DefaultAzureCredential also supports managed/workload identity. Disable unused credential routes operationally if your environment requires a specific identity; interactive browser auth is disabled in this project. Supply one or more subscription IDs in the configuration.

A subscription Reader role is the normal starting point; `config/azure-readonly-role.example.json` lists narrower read actions used by this collector. Neither template is deployed by the project. Defender assessment reads require the service to be enabled and permissions at the appropriate scope. Reader does not imply Microsoft Graph, directory MFA, blob contents or Log Analytics query access.

| Stage | Evidence | Important boundary |
|---|---|---|
| Storage accounts | allowBlobPublicAccess and HTTPS enforcement | Account allowance does not prove a public container; actual anonymous reads remain unknown |
| NSGs | Broad inbound allow rules | Priority, subnet/NIC association, routing and deny interactions are not resolved |
| RBAC assignments | Known broad built-in role grants | Not an effective permissions evaluator; custom roles and directory roles remain unknown |
| Defender optional | Unhealthy assessment records in inventory | Generic recommendations are not CVEs; exploitability needs subassessment evidence |

The telemetry helper is separate and read-only:

```sh
mvn exec:java -Dexec.mainClass="scripts.collect_azure_activity" --workspace-id ACTUAL_WORKSPACE_ID --output data/live-activity.json
```

It requires exported AzureActivity logs, verified retention and workspace query access such as Log Analytics Reader. It groups successful events and keeps caller identifiers unresolved. `telemetry_complete` is deliberately false for live output. Data-plane operations, read operations, missing export windows and seasonal activity must be checked before an access reduction. The script does not transform activity absence into a revocation decision.

## Google Cloud

Prefer `gcloud auth application-default login` for a sandbox, or a workload identity federation credential configuration via `GOOGLE_APPLICATION_CREDENTIALS`. A service-account key path is supported by ADC if needed; never add the key file to the repository. Supply project IDs; enable Storage JSON API, Compute API and Cloud Resource Manager API as required.

The custom-role permission template is `config/gcp-readonly-role.example.json`. Apply bindings only after account-owner review. Optional SCC needs `securitycenter.findings.list` at the configured project/folder/organization parent, enabled SCC and the correct location. Set `scc_parent` to e.g. `organizations/123456789`; supported API is v2 with `scc_location: global` by default. Regional SCC installations require their actual location.

| Stage | Evidence | Important boundary |
|---|---|---|
| Storage | Bucket IAM, UBLA and explicit PAP | allUsers grants differ from allAuthenticatedUsers; fine-grained ACLs and inherited PAP can leave uncertainty |
| Firewall | Enabled broad ingress allows | Source tags and service-account selectors are not treated as Internet sources; effective hierarchy/routing is not evaluated |
| Project IAM | Owner/editor allow grants | Inherited grants, denies, conditions and principal access boundaries are not fully evaluated |
| SCC optional | Active native findings | A CVE exploit-release signal is not proof of active exploitation or asset reachability |

Google Cloud service encryption is an at-rest default; customer-managed-key policy, historical coverage and rotation need additional controls.

## Importing evidence

```sh
mvn spring-boot:run -Dspring-boot.run.arguments="--mode import" --import-file fixtures/import.example.json --db mongodb://localhost:27019/import
```

The supplied file is illustrative synthetic evidence with `source: import`; replace it with reviewed observations. Each resource needs provider/account/kind, source, timestamp with timezone and attributes. Use `null` for unknown values. Booleans must be actual JSON booleans. `edges` require existing endpoints, an allowed type, an evidence description and explicit `verified` status. Cross-cloud identity relationships are only accepted when explicitly recorded, never inferred by matching display names. No live connector currently emits effective authorization or reachability edges; path demos use reviewed imports.

## Troubleshooting and evidence capture

A failed connector is never replaced with demo data. Inspect Connectors and setup, check the enabled scope, credentials, API enablement, region and permission. Per-resource fields that fail remain unknown. Do not count zero-resource output as a secure account. Capture the account IDs with sensitive values masked, SDK versions, enabled APIs, grant scope, collector status, source timestamps and a provider-console screenshot for each sandbox check.

The dashboard normally binds only to localhost. For the demo Docker option use a random `DASHBOARD_TOKEN` of at least 24 characters and `docker compose up --build`. Its port is mapped to localhost. Enter only the dashboard access token at the prompt, never a cloud key. It is not an enterprise authenticated portal; do not deploy it publicly without proper identity, TLS, access controls and operational hardening.
