# Viva preparation and technical defense

Read the code and run the demonstrations before rehearsing these answers. Explain decisions in your own words; do not claim validations that have not been performed.

## Positioning and research

**What is your revised project?** A transparent multi-cloud posture assessment and access-review prototype. It collects read-only evidence, preserves unknown observations, correlates explicit paths and prioritizes reviewer attention.

**How is CSPM different from CIEM, CWPP and CNAPP?** CSPM concerns resource configuration and policy posture. CIEM concerns entitlements and effective access. CWPP concerns workload protection and vulnerability/runtime signals. CNAPP combines several domains. Modern offerings overlap; the project implements selected functions across these areas, not a complete replacement.

**What is new?** The engineering contribution is an auditable, reproducible multi-cloud evidence pipeline and controlled comparison of priority models under explicit coverage and uncertainty. The weighted sum and path traversal are established techniques; algorithmic novelty is not claimed.

**Why not simply use a commercial tool?** This academic prototype exposes assumptions, factors and limitations for teaching and experimentation. Commercial products have broader coverage and mature graph/response capabilities. No superiority claim is made.

**How did you formulate the problem?** Missing or incomparable observations can distort review prioritization. The research questions ask whether a normalized tri-state representation preserves coverage and whether context changes ranking in constructed scenarios.

**Is the dataset real?** The demo and benchmark are authored synthetic fixtures. The collectors are executable integrations but authenticated live testing is pending. Synthetic results demonstrate behavior, not field effectiveness.

**Why is the literature primarily technical documentation?** Current vendor capabilities, IAM evaluation and APIs need primary documentation. Foundational research informs graph and formal-policy reasoning. Documentation establishes capabilities, not independent performance evidence.

## Authentication and authorization

**OAuth 2.0 versus OIDC?** OAuth defines delegated authorization/token flows. OIDC adds identity/authentication assertions. An access token targets an API audience; an ID token identifies a user to its relying application. They are not interchangeable.

**What is client credentials?** A confidential workload authenticates itself to obtain an application access token. No end-user session is involved. The application still needs separately assigned API/resource permissions.

**How does your Azure authentication work?** DefaultAzureCredential selects available workload/managed/environment/CLI credentials and obtains an ARM audience token. Reader grants ARM reads, not Graph or blob data-plane access. The Logs helper obtains a separate Log Analytics audience token.

**How does AWS work?** Boto3 uses the SDK credential chain or named profile. Optional STS AssumeRole obtains short-lived access-key/session-token credentials after the trust policy and caller permissions allow it. Requests are SigV4 signed by the SDK.

**How does GCP work?** Application Default Credentials acquires the configured principal's OAuth access token. IAM bindings at resource scopes govern API access. Workload federation can avoid stored private keys. scopes do not substitute for IAM grants.

**What is Azure RBAC?** A principal receives a role definition at a scope. Actions and DataActions concern different planes. Inheritance, conditions, deny assignments and additional grants matter. Directory roles in Entra are separate from ARM resource roles.

**Does Contributor grant blob read?** Not directly as a blob DataAction. Management operations such as access to account keys may indirectly enable data access in some configurations. Analyze key access and data-plane authentication separately.

**What is NotActions?** It subtracts operations from a role's Actions. It is not an explicit deny across all grants; another role may grant the same operation. Likewise NotDataActions is local to that grant.

**How does AWS effective authorization differ?** Identity/resource policies, explicit denies, organization controls, boundaries, session policies and conditions interact. The project does not implement the full evaluator; broad-grant and registration signals are scoped observations.

**How does GCP effective access differ?** Roles map permissions into allow bindings with inheritance and conditions. Deny policies and principal access boundaries can restrict access. allUsers is anonymous; allAuthenticatedUsers is broader than your organization but not the same as anonymous access.

**Does MFA registration prove MFA enforcement?** No. An IAM user may register a device but enforcement can depend on policy. Federated users and Azure conditional access require other APIs and evidence.

## Telemetry and access review

**Why is grant minus observed not automatic least privilege?** Logs may omit reads, data operations, identities or time periods. Disaster recovery, seasonal jobs and approved future tasks may be unobserved. The difference is a candidate set for review.

**How are wildcards handled?** Expand against a supplied, plane-specific operation catalog using case-insensitive matching, subtract local exclusions, then compare with normalized observed operations. The catalog version and coverage bound the result.

**How do you know the 90-day window is complete?** Verify diagnostic exports, retention, source coverage, gaps, principal resolution and relevant workload periods. The live Logs helper leaves completeness false and cannot auto-revoke.

**Why separate control and data planes?** ARM management APIs and service data APIs have different role permissions, audiences, logging and enforcement. One event table cannot prove both are fully covered.

**Is ordinary role assignment JIT?** No. Real JIT requires bounded activation/expiry and revocation, often PIM or another time-bound mechanism. This revision offers a local review decision and preview, not JIT provisioning.

## Risk scoring and graphs

**Where did the weights come from?** A documented author policy allocation: severity .30, exposure .20, exploitability .20, impact .20, graph .10. They are testable hypotheses, not coefficients prescribed by NIST or learned from incidents.

**How is this better than the original arbitrary score?** Every input has a rubric, provenance, defaults, a contribution and a sensitivity test. It is explainable and reproducible. Independent calibration is still required before relying on it operationally.

**Why not multiply likelihood by impact?** Reliable breach probabilities are unavailable in this dataset. A weighted ordering index avoids pretending ordinal observations are calibrated probabilities. It can be replaced after proper estimation.

**What if evidence is unknown?** The check is unknown, excluded from pass-rate denominator and retained in coverage. Missing score context uses documented defaults and reduces confidence. Zero inventory after a failure is not a secure-cloud result.

**Is CVSS a risk score?** It is a vulnerability severity framework with context metrics. Here a supplied base value contributes severity; the project also considers business/exposure context and discloses overlapping signals.

**What does KEV mean in this project?** A known-exploitation assertion is a context input. The demo asserts it synthetically; no live KEV ingestion or specific exploit occurrence is claimed.

**What starts a graph path?** A reachable workload with an exploitability assertion. The path must follow verified runs_as, optional assumes, and can_read edges to storage sensitivity >=.7. Depth is bounded and cycles are excluded.

**Does a public IP prove exposure?** No. Routes, firewalls, associations, service listeners and denies matter. It increases a context signal but never satisfies the confirmed path start by itself.

**Do same-named identities in different clouds imply trust?** No. A federation relationship must be explicitly evidenced. The graph does not join identities by name.

**What does a simulation prove?** It shows what happens to the model when a field changes. It does not validate that the cloud operation succeeded, preserved function or actually removed all attack paths.

**Why does reducing broad privilege sometimes leave a path?** The can_read edge is separately evidenced. Removing one broad grant does not prove effective read access disappeared through other grants.

## AI and security engineering

**Is the offline briefing a trained AI?** No. It is explicitly labelled deterministic. Optional OpenAI processing selects evidence IDs under a schema; prose, scores and plans remain deterministic.

**Why bound the model to reference selection?** It keeps authoritative risk calculations, policy logic and remediation outside free-form generation. Returned IDs must belong to the supplied evidence or the system falls back visibly.

**Does RAG eliminate hallucinations?** No. Retrieval supplies context. Schema checks validate structure, not truth. This implementation reduces the generative surface and validates references rather than claiming hallucination elimination.

**How are secrets handled?** Server-side SDK chains or local .env. Secrets are ignored, not shown in the UI, not put in exports and not forwarded to the briefing. .env parsing performs no shell expansion.

**What protects the local API?** Loopback defaults, Host/Origin checks, a session token for POST, optional strong dashboard token for non-loopback binding, bounded requests, same-origin CSP, no exposed cloud write endpoint and no raw token-bearing exception logs.

**Is your audit chain immutable?** No. It detects edits when stored hashes disagree. An administrator who can rewrite the database can recompute the chain. Enterprise provenance needs signed records or external immutable storage.

**Does the report certify compliance?** No. Selected control mappings provide supporting evidence. Full standards require organizational controls, scope, review and independent audit.

## Evaluation and limits

**What do the tests establish?** Normalization, unknown handling, score arithmetic/monotonicity, graph conditions, simulation isolation, connector parsing, persistence, grounding and local HTTP safeguards. They do not establish real-cloud detection sensitivity.

**What does NDCG@5 measure?** Discounted relevance of the top five compared with the ideal authored ranking. Precision@5 counts authored maximum-relevance cases among those five. Label quality determines validity.

**What was the graph ablation result?** It moved explicit-path scenarios higher but did not improve NDCG@5 on these 12 cases. That limits the claim: graph is explanatory here, not proven to improve aggregate ranking quality.

**What are the strongest threats to validity?** Small authored data, labels created with scenarios, deliberate context differences, baseline tie handling, untested live credentials, partial cloud semantics and no analyst study.

**What work is needed before calling this production ready?** Independent holdout labels, native reachability/effective-IAM evidence, live integration validation, stronger identity/audit controls, resource-scale tests, secure hosting and operational remediation testing.
