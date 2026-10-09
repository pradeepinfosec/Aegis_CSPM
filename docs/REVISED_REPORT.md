# Evidence Guided Multi Cloud Security Posture Assessment

## Technical revision for candidate review

A capstone implementation and research report expanding the Azure User Access Review AI Agent into a multi-cloud posture assessment and access-review prototype.

Candidate: Pradeep Krishnamurthy | Student identifier: R22DI04
Programme: Master of Science in Cloud Architecture and Security
Institution: REVA Academy for Corporate Excellence, REVA University
Guide named in the supplied report: Nishant Krishna
Revision date: 7 October 2026

This report accompanies a runnable code project. It is prepared for candidate review and further validation. It does not certify candidate authorship, institutional approval, plagiarism similarity, real-cloud efficacy or successful cloud remediation. The original institution-required declarations and ownership terms require the candidate and institution to verify and sign them separately.

<!--page-->
# Abstract

The supplied Azure User Access Review AI Agent focused on comparing provisioned permissions with activity and producing role recommendations. Its external viva feedback identified shallow CSPM scope, insufficient technical defense, weak research evidence and an unexplained scoring method. This revision develops a transparent multi-cloud prototype for assessing selected configuration, identity, exposure and workload signals while preserving unknown observations and their provenance.

The system uses a normalized resource schema, 12 versioned policy controls, read-only AWS, Azure and Google Cloud collectors, a bounded explicit relationship graph, an explainable policy priority index and a React dashboard. Risk priority combines control severity, exposure signals, exploitability signals, owner-supplied business impact and graph participation. Every factor, default and contribution is visible. A local review workflow records decisions and what-if outcomes without changing cloud resources. A bounded analyst briefing retrieves finding references; optional model processing may select references but cannot calculate authoritative scores or execute remediation.

The runnable synthetic demonstration contains 24 resources, 30 failed checks, 33 passed checks, 18 unknown checks and three explicit scenario paths. Evaluated check coverage is 77.8%; the pass rate among evaluated checks is 52.4%. Forty-seven automated tests and a browser interaction suite passed in the development environment. A separate 12-scenario authored ranking experiment compares severity-only, context and graph variants. Context changes review ordering; graph participation changes the order of path scenarios without improving NDCG at five over the context-only variant in this dataset. These are reproducible prototype results, not independent evidence of enterprise effectiveness.

The research contribution is a coverage-aware and auditable implementation and evaluation protocol. The report corrects the assumption that absent activity proves unnecessary permission, distinguishes authentication from authorization and management-plane from data-plane evidence, and acknowledges current commercial CSPM capabilities. Authenticated cloud testing, independent reviewer labels, calibration and broader effective-access and reachability collection remain required before operational claims or academic final submission.

Keywords: CSPM, multi-cloud security, identity governance, evidence coverage, attack paths, explainable prioritization, controlled AI assistance.

<!--page-->
# Report navigation

Chapter 1 Introduction and scope
Chapter 2 Literature review and related work
Chapter 3 Problem formulation and research questions
Chapter 4 Objectives and acceptance criteria
Chapter 5 Methodology and identity mechanisms
Chapter 6 Resource requirements and reproducibility
Chapter 7 Software architecture and threat model
Chapter 8 Implementation and operational behavior
Chapter 9 Testing and evaluation protocol
Chapter 10 Results and critical analysis
Chapter 11 Conclusions and future work
Appendix A Examiner response and claim corrections
Appendix B Control catalog and evidence schema
Appendix C Demonstration and live validation plan
Appendix D Academic integrity and handover
References

The document uses Word heading styles for navigation. The repository contains the more detailed operator and viva guides. All numbered references identify primary technical sources or foundational research consulted on 7 October 2026; product documentation describes capabilities and is not independent performance evidence.

<!--page-->
# Abbreviations

| Abbreviation | Meaning |
|---|---|
| CSPM | Cloud Security Posture Management |
| CIEM | Cloud Infrastructure Entitlement Management |
| CWPP | Cloud Workload Protection Platform |
| CNAPP | Cloud Native Application Protection Platform |
| IAM | Identity and Access Management |
| RBAC | Role Based Access Control |
| ARM | Azure Resource Manager |
| ADC | Application Default Credentials |
| STS | Security Token Service |
| OIDC | OpenID Connect |
| CVSS | Common Vulnerability Scoring System |
| NDCG | Normalized Discounted Cumulative Gain |
| PAB | AWS Public Access Block |
| PAP | Google Cloud Public Access Prevention |
| UBLA | Uniform Bucket Level Access |

<!--page-->
# Chapter 1 Introduction and scope

## 1.1 Why the project is being revised

Cloud environments combine resource configuration, application workloads, network paths and identity relationships. A permission review alone can identify useful governance questions, but it cannot represent the whole posture of an environment. The supplied report used broad CSPM and compliance language while its strongest described capability was Azure entitlement observation. It also treated a finite activity window as a mathematically sufficient definition of least privilege. The examiners reasonably requested a broader scope and stronger explanation of the data, implementation and risk model.

This revision treats access review as one assessment domain. It adds configuration checks, exposure signals, imported workload security evidence, selected compliance mappings and graph-based context. The project is deliberately an academic prototype with visible assumptions. Its value is that a reviewer can trace a result from an observation through a policy decision and scoring contribution to a planning recommendation.

## 1.2 Contemporary cloud security context

Modern CSPM products already provide more than static identity lists or simple benchmark checks. Microsoft documents foundational and advanced posture capabilities; AWS and Google document exposure and attack-path context [1–3]. This project therefore does not claim to introduce context-based CSPM to the industry. It asks how those concepts can be implemented in a small, inspectable system for multi-cloud education and experimental evaluation.

The capability boundaries matter. CSPM focuses on configuration and policy posture. CIEM focuses on access entitlements and effective authorization. CWPP focuses on workload protection, vulnerability and runtime signals. CNAPP commonly combines these domains. Terminology overlaps between products, and the project uses these as conceptual boundaries rather than claiming exact feature equivalence with a commercial platform.

## 1.3 Implemented scope

The runnable system assesses 12 selected controls over storage, network, identity and workload records from AWS, Azure and Google Cloud. It normalizes observations, preserves collection status, produces passed, failed or unknown results, computes a documented priority index and presents evidence in a dashboard. It supports explicit graph paths, immutable-in-memory what-if previews, locally persisted decisions, exports and a verifiable local hash chain.

AWS collection covers IAM users, S3 evidence, EC2 groups and instances, plus optional Security Hub CSPM vulnerability imports. Azure collection covers storage accounts, NSGs, selected broad RBAC grants and optional Defender assessments. Google collection covers buckets, project IAM, firewall rules and optional SCC findings. A separate Azure Logs helper collects grouped activity evidence, while the permission-review module demonstrates catalog-aware wildcard expansion and local exclusions.

## 1.4 Boundaries of the prototype

The live collectors do not establish complete effective access, actual network reachability or all identity-provider controls. They do not install runtime protection. Azure generic Defender assessments are retained as native inventory evidence without automatically labeling them CVEs. Live graph edges are not inferred from resource names. Reviewed imported graph assertions enable path analysis where effective relationship evidence exists.

The prototype contains no cloud mutation endpoint. A reviewer decision approves planning rather than deploying a fix. It implements neither time-bound JIT activation nor automated role revocation. An evidence export supports selected controls; it is not a certificate of ISO 27001, SOC 2 or any full framework. These boundaries prevent the implementation from inheriting unsupported claims from the supplied report.

## 1.5 Intended users and value

Security reviewers need a prioritized evidence queue, resource owners need an understandable remediation proposal, and academic examiners need a defensible methodology with reproducible tests. The dashboard supports these needs through provenance, uncertainty and factor explanations. The candidate should be able to demonstrate why an observation creates a finding, why a score changes and why unknown data limits a conclusion.

<!--page-->
# Chapter 2 Literature review and related work

## 2.1 Review method and source selection

The review includes primary sources about modern CSPM, risk assessment, identity evaluation, relevant protocols and controlled model assistance, together with foundational attack-graph and formal-policy research. Sources were selected for their direct relationship to an implemented module or a limitation that affects the interpretation of results. Unrelated generic cloud or AI references have not been used to inflate the bibliography.

The source types answer different questions. Product documentation establishes published capabilities and API behavior. Standards establish terminology and assessment frameworks. Research papers demonstrate established methods and motivate careful semantic modeling. None of these sources validates the performance of this capstone; that requires its own measurements and independently assessed cases.

## 2.2 Current posture and exposure capabilities

Microsoft Defender for Cloud distinguishes foundational posture functions from additional Defender CSPM capabilities, including contextual prioritization and attack-path analysis [1]. This establishes that broad context is already part of the field. The project adopts the distinction between a resource observation and a correlated risk hypothesis, while implementing a much smaller rule set and graph.

AWS Security Hub exposure documentation describes combining security observations to identify contextual exposure [2]. The connector in this project reads selected Security Hub CSPM ASFF vulnerability evidence. It does not implement or claim to reproduce the newer exposure engine. Keeping those functions distinct prevents a native vulnerability import from being described as a complete exposure assessment.

Google Security Command Center describes attack exposure assessment using simulated attacker progress toward high-value resources [3]. The capstone's explicit template traversal is more limited: it checks asserted entry conditions and verified relationship edges. It does not simulate arbitrary attack actions or assign a vendor-equivalent exposure score.

| Capability | Contemporary primary sources | Capstone implementation |
|---|---|---|
| Configuration posture | Microsoft CSPM and native cloud APIs | Selected normalized policy controls |
| Compliance evidence | Native posture policies and NIST controls | Partial mappings with explicit denominators |
| Workload context | Native vulnerability and protection findings | Import signals without deploying a scanner |
| Exposure prioritization | AWS, Microsoft and Google contextual engines | Visible author policy index |
| Attack paths | Native security graphs and exposure simulation | Bounded traversal of explicit verified edges |
| Entitlement analysis | Provider policy semantics and formal reasoning | Broad grant observations and scoped access review |

## 2.3 Risk and severity foundations

NIST SP 800-30 provides a structured approach to risk assessment and the relationship between threats, vulnerabilities, likelihood and impact [4]. It informs the separation of technical condition and business consequence. It does not prescribe this project's weights. FIRST CVSS describes vulnerability severity and context-related metrics [5]; a supplied CVSS value contributes to the workload severity factor, but cannot alone establish business risk.

The project therefore uses the term priority index. The index orders review tasks under explicit policy choices. It is not an estimate of incident frequency or financial loss. This framing avoids pretending that ordinal inputs and correlated observations are calibrated probabilities. A later study could estimate calibrated quantities, but the current dataset is insufficient for that purpose.

## 2.4 Authorization semantics and formal reasoning

AWS documents interactions among identity policies, resource policies, boundaries, organization controls and explicit denies [6]. Azure defines role permissions, scopes, actions and data actions [7,8]. Google describes allow bindings, resource hierarchy and conditions [9]. These sources show why extracting role names or performing string subtraction is not enough to reconstruct complete effective authorization.

Backes and colleagues formalized AWS access-policy reasoning using SMT in Zelkova [10]. That work is directly relevant because security properties depend on policy semantics, not merely JSON syntax. The capstone does not implement an SMT solver or an equivalent evaluator. Its contribution is to state that limitation and avoid labeling broad-grant observations as proven effective privilege in every context.

## 2.5 Attack graph research

Sheyner and colleagues studied automated attack-graph generation and analysis [11]. The general lesson used here is that a chain of preconditions and relationships can explain risk better than disconnected alerts. The project adopts a bounded graph representation with explicit evidence and cycle prevention. It does not claim complete attack-graph generation, minimal exploit paths or model-checking completeness.

Graph participation is therefore a small context factor and an explanation mechanism. If input relationships are incomplete, an absent path is not proof that no path exists. The benchmark explicitly removes graph context in an ablation to determine what the path feature changes in the authored dataset.

## 2.6 Authentication protocols and telemetry evidence

OAuth 2.0 specifies authorization flows, while OpenID Connect adds identity assertions for relying applications [12,13]. Cloud access also depends on provider-specific credential acquisition and policy enforcement. Understanding the audience and purpose of a token is necessary to explain why an ARM read token does not grant a Graph or data-plane API access.

Azure Activity Log documentation establishes the nature of management activity evidence [14]. A query window is not a complete record of every read, data operation or business requirement. The project leaves live completeness unasserted and treats unobserved operations as candidates for owner review rather than automatic permission removal.

## 2.7 Retrieval and constrained model assistance

Lewis and colleagues combined retrieval with language generation for knowledge-intensive tasks [15]. Retrieval motivates connecting model assistance to explicit context, but does not guarantee truthful security conclusions. OpenAI documentation describes schema-constrained outputs [16]; structural compliance still requires application-level reference validation.

The implemented assistant reduces the generative surface. A model, when explicitly enabled, receives allowlisted numeric features and catalog text and returns at most five finding IDs. IDs are validated against the current evidence. Scores, explanation prose and remediation catalog content remain deterministic. This is a bounded evidence-selection assistant rather than a demonstrated vector-database RAG system.

## 2.8 Research gap addressed by this prototype

The project does not claim that the industry lacks attack paths, compliance evidence or AI assistance. The scoped opportunity is a reproducible academic system that exposes normalization, unknown data, factor assumptions and graph conditions in one multi-cloud review workflow. The evaluation compares transparent variants and reports both useful changes and negative results, without claiming industrial novelty or field superiority.

<!--page-->
# Chapter 3 Problem formulation and research questions

## 3.1 Formal problem

Given provider-specific observations about a scoped set of resources at recorded times, construct a comparable assessment that preserves uncertainty and supports review prioritization. The challenge is that an unavailable API response, an explicit false condition and an inapplicable control have different meanings. Collapsing them can make partial data look like a secure posture.

A second challenge is prioritization. Severity describes a technical condition, while review urgency also depends on exposure, available exploit signals and the importance of an asset. A third challenge is correlation: a reachable workload, an identity binding and sensitive data may form a relevant chain only when the relationships and required preconditions are supported.

## 3.2 Unit of analysis and input data

The unit of analysis is a resource observation with provider, account, native identity, kind, attributes, timestamp and source. A policy check pairs one applicable control with one observation. A finding represents a failed check. A graph edge is a separate relationship assertion, with endpoints, type, verification flag and evidence description.

The demonstration uses authored scenarios across three providers. The ranking experiment uses a separate set of 12 vulnerability scenarios with authored relevance labels. Live API data is an implemented collection route, but no authenticated account observations were supplied or validated in this development session. The report separates these evidence classes throughout.

## 3.3 Research questions

RQ1 asks whether a normalized tri-state assessment can preserve unknown observations and prevent them from inflating the pass rate. RQ2 asks whether adding documented context changes review ranking relative to severity alone on authored scenarios. RQ3 asks what an explicit graph factor adds relative to a context-only variant. RQ4 asks whether reviewers can trace a priority and preview to its evidence, factors and policy transformation without granting a model cloud-write authority.

The questions are intentionally bounded. They do not assume a new mainstream product category or attempt to prove universal cloud-risk reduction from a small demo. They can be answered through inspectable artifacts and controlled experiments, while field efficacy remains a separate validation stage.

## 3.4 Working hypotheses

H1 is that unknown observations remain visible and excluded from evaluated-check pass-rate calculations. H2 is that context will move some important exposed production cases above high-severity local laboratory cases. H3 is that graph participation will change the order of cases on explicitly evidenced paths, but any improvement in a ranking metric must be measured rather than assumed. H4 is that immutable-in-memory simulation and a restricted assistant interface can preserve separation between assessment, planning and cloud execution.

## 3.5 Threat and operational assumptions

The synthetic scenarios assume an attacker can exploit a reachable vulnerable workload and use its explicitly recorded identity relationship to reach sensitive storage. This is a modeled possibility, not an executed attack. Live read credentials are authorized only for selected inventory APIs. Owner-provided criticality and sensitivity are trusted inputs requiring justification. Provider evidence can be incomplete or stale. No attempt is made to probe customer systems, exploit vulnerabilities or change cloud permissions.

## 3.6 Success and failure conditions

Success means a runnable dashboard with inspectable factors, preserved unknowns, reproducible paths and evaluation, plus documented live collection boundaries. A failed collector must produce visible failed/partial status without fallback to synthetic data. A stale observation must retain its original timestamp. A model output with unknown references must not create a fabricated finding. A planning decision must not remove an unresolved technical finding.

<!--page-->
# Chapter 4 Objectives and acceptance criteria

## 4.1 Measurable objectives

| Objective | Acceptance criterion | Implementation evidence | Validation status |
|---|---|---|---|
| O1 Normalize multi-cloud observations | Three supported providers and validated resource schema | backend/src/main/java/.../Core.java and connectors | Synthetic and parser tests passed; authenticated collection pending |
| O2 Broaden posture scope | Controls cover five assessment domains | 12 policies and dashboard domains | Demonstrated on synthetic resources |
| O3 Explain priority methodology | All factors, weights, defaults and contributions visible | Score detail and RISK_METHOD.md | Arithmetic and monotonicity tested |
| O4 Correlate explicit risk paths | Verified edges and entry/target preconditions required | attack_paths function and path view | Three synthetic paths and negative tests |
| O5 Support accountable planning | What-if isolation and locally persisted decisions | simulate, Store and API | Unit, HTTP and browser checks |
| O6 Bound AI assistance | Model has no scoring/write authority; IDs validated | backend/src/main/java/.../Agent.java | Offline behavior tested; external call untested |
| O7 Produce reproducible research evidence | Baselines, ablation and weight sensitivity outputs | evaluation/benchmark.py | Executed on 12 authored cases |

## 4.2 Requirement traceability

Each objective maps to an executable module and a bounded validation claim. This avoids a common reporting error: treating the existence of a connector form, report screenshot or model response as evidence that the entire intended system was implemented. The scope matrix in the operator guide describes observed and unobserved capabilities by provider.

Tests evaluate observable behavior that matters to the research questions: denominator treatment, missing-context confidence, bounded graph traversal, stale timestamps, simulation isolation, failed collection status and persisted decisions. The browser suite verifies that users can actually reach and inspect these results. Live-cloud and independent-label validation are explicitly pending rather than inserted into the result column as successful tests.

## 4.3 Nonfunctional requirements

The demo requires Java 17 or later and Maven and no credentials or mandatory third-party packages. Requirements include responsive escaped rendering, read-only collection, bounded requests, server-side secrets, versioned evidence and separate provider adapters. Chapters 6 and 7 explain their implementation and limits.

<!--page-->
# Chapter 5 Methodology and identity mechanisms

## 5.1 Evidence pipeline

The system acquires or imports observations, validates the normalized schema, identifies applicable controls and computes tri-state results. Failed checks become findings. Explicit verified edges are traversed under bounded conditions, then policy priority is calculated and stored with the assessment. The dashboard and optional assistant read this completed evidence rather than altering its collection or scoring semantics.

A collector reports complete, partial, failed or disabled stages. A successful list operation does not mean every attribute was collected: per-resource denied reads remain null. A failed list stage does not prove zero resources exist. API pagination is followed within caps, transient HTTP failures are retried with bounded delay, and resource caps stop collection instead of silently truncating it as a complete result.

## 5.2 Authentication and token boundaries

OAuth access tokens authorize API requests within an audience and granted scope; OpenID Connect identity tokens serve a different relying-party purpose [12,13]. Confidential client credentials authenticate a workload rather than an interactive human. Authentication proves a principal to the identity provider; authorization still depends on separately configured resource/API permissions.

Azure DefaultAzureCredential obtains an ARM token through available environment, workload, managed-identity or CLI routes. The separate Logs helper obtains a Log Analytics token. AWS Boto3 uses standard credential chains, optionally assuming a target role through STS; the SDK signs requests with SigV4. Google ADC obtains OAuth credentials for a configured principal, including workload federation where set up. No provider's token route grants all cloud read access by itself.

## 5.3 Authorization and resource hierarchy

An Azure role assignment joins a principal, role definition and scope. A role definition separates management Actions from DataActions. Local exclusions subtract from that role's granted operations; other grants and deny assignments can change final authorization [7,8]. Entra directory roles are separate from ARM resource roles. This project collects selected broad subscription grants without claiming a complete effective-permissions result.

AWS policy interactions include explicit deny and multiple limiting policy layers [6]. The prototype therefore leaves broad effective permissions unknown when those layers are not collected. Google bindings likewise require hierarchy and condition-aware interpretation [9]. A project-level Owner or Editor binding is a broad allow-grant observation, while inherited deny and boundary effects remain beyond the implemented evaluator.

## 5.4 Management plane and data plane

Control-plane permission to manage a storage account is not identical to data-plane permission to read a blob. Some management operations, such as acquiring keys where permitted, can indirectly enable data access, so the planes must be analyzed together without treating their permissions as interchangeable. The review module accepts a plane-specific operation catalog and never equates a management-plane wildcard with every storage data operation.

The live Azure activity helper groups successful events using Caller and OperationNameValue. Caller resolution, export gaps and source retention are not inferred from query success. Live completeness remains false. A different collection route is required for relevant service data logs. Missing API events cannot establish that a principal has no business need for a permission.

## 5.5 Permission observation review

The review helper expands granted patterns against a supplied catalog, subtracts local exclusions and compares with normalized observed operations. With complete asserted fixture coverage, the remaining set is called unobserved candidates. When completeness is false, it abstains from producing candidates for automatic interpretation.

Even complete observation over a finite window does not prove that all unobserved permissions are unnecessary. Disaster recovery, seasonal work, approved changes and future obligations can be valid. Owner review and operational tests are mandatory before a real privilege reduction. The helper produces no role deployment and no cloud write.

## 5.6 Priority formula and parameter definitions

[equation]P = 100(0.30S + 0.20E + 0.20X + 0.20I + 0.10G)
[equation]I = 0.60C + 0.40D

S is policy severity or supplied workload CVSS divided by ten. E is an exposure-context signal. X is an exploitability/known-exploitation signal. C and D are owner-supplied criticality and sensitivity; I combines them. G is membership in an eligible evidenced path. All factors are bounded between zero and one, and the weights sum to one.

Severity has 30% as the technical anchor; exposure, exploit signal and business impact each have 20%; graph has 10% to keep correlated path context from dominating. This is an author policy hypothesis. NIST and FIRST do not prescribe these coefficients. The model is monotonic, explainable and experimentally perturbed, but not empirically calibrated.

## 5.7 Rubrics and uncertainty

| Input | Implemented value rule | Unknown interpretation |
|---|---|---|
| Severity S | Per-control rubric; WRK001 uses supplied CVSS divided by ten | Policy severity used when workload CVSS absent |
| Exposure E | 1.0 asserted public/reachable; 0.65 broad rule or public-IP signal; 0.25 otherwise | Effective reachability listed as unknown |
| Exploit X | 1.0 known-exploitation assertion; 0.8 exploitability assertion; 0.4 otherwise | Exploit intelligence listed as unknown |
| Criticality C | Owner input from zero to one | Default 0.5 and limited confidence |
| Sensitivity D | Owner input from zero to one | Default 0.5 and limited confidence |
| Graph G | 1.0 on qualifying path; 0 otherwise | Absence of recorded path is not proof of safety |

Critical priority begins at 80, high at 60 and medium at 35; lower scores are low. Missing context reduces confidence independently of priority. Evidence older than 24 hours is marked stale and confidence is limited. Supported confidence means supplied inputs are present and fresh, not that the score is statistically validated. Confidence categories are intentionally simple and not probabilities.

CVSS, exploit signals and graph entry conditions can overlap. The sum therefore must not be interpreted as a combination of independent likelihoods. Defaults are visible, but can bias ranking. Sensitivity analysis tests local response to weights; it cannot validate the rubric by itself.

## 5.8 Worked priority example

The synthetic AWS payments workload has S=0.98, E=1, X=1, C=0.9, D=0.8 and G=1. Impact is 0.86. Its contributions are 29.4, 20, 20, 17.2 and 10, giving priority 96.6. The dashboard displays each contribution and the associated source. This example demonstrates arithmetic and explanation; it does not assert an actual account, CVE or exploit occurrence.

<!--page-->
# Chapter 6 Resource requirements and reproducibility

## 6.1 Development and demonstration requirements

The demonstration requires a computer with Java 17 or later and Maven and a current browser. Standard-library modules supply HTTP serving, JSON validation, MongoDB via Docker, hashing and tests. The frontend is React frontend. No database server, vector service, cloud account or paid model is needed for the demo. This reduces setup friction while retaining modular implementation and reviewable behavior.

Optional live collection needs Boto3, azure-identity, google-auth and requests. Versions are bounded in requirements-live.txt; exact resolved versions should be frozen after validation in the candidate's environment. A Docker Compose option is supplied for demonstration, but Docker execution was not tested during this development session.

## 6.2 Configuration and secret management

The project supplies clouds.example.json, .env.example and read-permission templates for each provider. The operator copies examples to ignored local files and enables only intended scopes. The CLI explicitly selects demo, import or live mode. Mode is never silently changed after a failed connection.

Credentials are resolved through SDK chains, profiles or local environment variables. The dashboard never requests cloud keys. Configuration secrets are excluded from exports and model input. The .env reader accepts assignments without shell execution, variable expansion or overwriting existing process variables. Long-lived secrets can still exist on disk if an operator uses .env, so workload identities and short-lived sessions are preferred operationally.

## 6.3 Persisted and distributed artifacts

The MongoDB database running in Docker records scans, review decisions and local audit events. Database files and actual credentials are excluded from the distributable bundle. Fixed fixtures and policy JSON remain in source control, making the demonstration repeatable. Benchmark output stores authored labels, assumptions, ranking methods, sensitivity results and local timing.

The report-generation and bundled browser scripts are authoring-environment helpers. They are not required to run the product. The artifact handover provides the editable Word report, Markdown report source, implementation, tests, operator guides and evaluation outputs. The original supplied report is preserved separately from this implementation.

## 6.4 Resource and collection limits

The default collector caps are 10,000 resources and 100 pages where implemented. These are operational guardrails, not evidence of tested enterprise scalability. Calls have bounded timeouts and retry policies. The dashboard runs in one process and MongoDB via Docker serializes local operations under a lock; simultaneous rescan requests are rejected while one scan is running.

Larger fleets need a distributed collection architecture. The benchmark measures small-fixture assessment, not provider latency, continuous monitoring or high availability.

<!--page-->
# Chapter 7 Software architecture and threat model

## 7.1 Components and separation of responsibilities

The provider adapters collect observations and stage coverage. The core validates schema, evaluates policies, traverses paths and calculates priority. MongoDB via Docker stores completed snapshots and decisions. A local HTTP API exposes state, simulation, briefing, history and exports. The frontend renders reviewer views. The optional assistant only selects valid finding references after deterministic assessment.

[figure:architecture]

Figure 1 illustrates the evidence flow. There is no cloud-write component. The what-if operation works on a deep copy, and the local review state is stored separately from detected configuration state. A decision therefore cannot remove a failed control or claim that a cloud fix has occurred.

## 7.2 Canonical resource and check schema

Each resource contains id, name, provider, account, kind, observed_at, source and attributes. Valid providers are AWS, Azure and GCP; kinds are storage, network, identity, workload and account. Resource IDs must be unique. Timestamps require a timezone. Numeric context is finite and bounded. Security attributes are actual JSON booleans or null rather than truthy strings.

Checks contain resource ID, rule ID, provider, status, field, observed value, mappings, source and timestamp. Findings add a stable hash-derived identifier, priority details, remediation text and related path IDs. An assessment records policy version and a snapshot digest so reviewers can correlate an exported result with its inputs.

## 7.3 Evidence graph

Nodes are normalized resources. Permitted edges are runs_as, assumes and can_read. Each edge requires known endpoints, a verification flag and an evidence description. Paths begin at a reachable exploitable workload, traverse its identity and optionally explicit role assumptions, and end at storage whose sensitivity is at least 0.7. Traversal is bounded to four edges and repeated nodes are excluded.

The graph describes evidence-supported hypotheses rather than verified exploit execution. Stale node evidence limits path confidence. It does not automatically establish the freshness or truth of a textual edge assertion; richer edge provenance is a future requirement. Cross-provider chains are permitted only through supplied explicit relationships and are not demonstrated by the three independent provider scenarios.

## 7.4 Dashboard and reviewer workflow

The overview shows inventory, priority distribution, path counts and evaluated coverage. The queue supports provider, domain, priority and text filters. Finding detail exposes evidence, score contributions, confidence and a catalog remediation plan. Path views expose the actual relationships. Control evidence shows passed, failed and unknown checks. Analyst briefing and evidence history complete the review workflow.

[figure:dashboard]

Figure 2 shows the credential-free synthetic demonstration. The DEMO label and observation timestamps are part of the interface. A live collector failure cannot display this fixture under a LIVE label because startup always records a new explicitly sourced assessment.

## 7.5 Security threat model

The local server can encounter untrusted resource names, notes, imported observations, pagination links and optional model output. The frontend escapes rendered strings. CSV output prefixes values that could become spreadsheet formulas. The API bounds request bodies, validates JSON shapes and requires a session token on mutations. Host and Origin checks reduce cross-origin and DNS-rebinding exposure.

The default bind address is loopback. A non-loopback bind requires a configured dashboard token with at least 24 characters. Bearer credentials for cloud requests are sent only to allowed HTTPS provider hosts, and redirects are blocked. Collector exceptions are summarized without raw token-bearing details. These are local-prototype safeguards, not a complete authenticated enterprise security architecture.

## 7.6 Audit design and limitations

Local events store the previous hash and a digest of timestamp, event and canonical payload. Verification detects inconsistent stored history. It does not prevent an administrator from rewriting all records and recomputing the chain. The UI explicitly states this limit. Signed events, external immutable storage and authenticated reviewer identities would be needed for stronger assurance.

The current decision actor is a local session, not enterprise SSO. Approval labels therefore describe a local planning state, not an organizational access certification. No certificate or signed declaration is generated by the code.

<!--page-->
# Chapter 8 Implementation and operational behavior

## 8.1 Policy assessment

Policies are stored in a versioned JSON catalog. Each rule declares resource kinds, optional applicability condition, field, comparison, failing value, severity, domain, mappings, explanation, remediation and optional simulated field change. Missing observation produces unknown. The dormant-identity rule also requires declared telemetry completeness. Inapplicable checks do not enter the denominator.

A failed check creates one stable finding per resource and rule. The assessment retains every applicable check, including passes and unknowns. Framework summaries count the mapped checks rather than claiming coverage of every framework requirement. Selected NIST mapping identifiers are author mappings that should be reviewed against organizational scope [17,18].

## 8.2 AWS collector

The adapter uses Boto3 sessions, optional STS role assumption and read-only APIs. It lists IAM users and inspects console-profile and MFA-registration evidence. It reads S3 bucket policy public status, bucket public-access block and server-access logging. It reads EC2 group and instance inventory in configured regions, and optionally native Security Hub CSPM vulnerability records.

Missing effective authorization remains unknown. A public bucket policy is retained as a signal, while incomplete PAB/ACL evidence is not converted into effective anonymous read. S3 default encryption is recognized for new uploads [19]; historical object state and customer-managed-key requirements remain unassessed. A public EC2 address does not become a confirmed reachability assertion.

## 8.3 Azure collector and activity helper

The Azure adapter reads management-plane storage account settings, NSGs, selected broad built-in RBAC assignments and optional unhealthy Defender assessments. An account that allows anonymous container configuration creates a capability finding, while actual public blob access remains unknown without container evidence [20]. Broad inbound NSG rules are configuration signals; priority resolution, route and NIC/subnet effects are not evaluated.

Known built-in Owner, Contributor and User Access Administrator grants are reported as broad assignments. Custom role semantics, deny assignments and directory roles remain unknown. Generic unhealthy Defender recommendations are imported without pretending they are exploitable CVEs. The optional Azure Logs script collects grouped events and explicitly leaves live telemetry completeness false.

## 8.4 Google Cloud collector

The Google adapter uses ADC and REST APIs for bucket configuration, bucket IAM, project IAM and firewall rules. Public Access Prevention and UBLA inform anonymous access interpretation. An allUsers read grant is different from allAuthenticatedUsers. Fine-grained object ACLs, inherited prevention and conditional/inherited authorization can leave observations unknown.

Enabled broad ingress rules are treated as configuration signals. Source tags and service-account source selectors are not assumed to represent Internet sources. Optional SCC v2 records retain native category, asset identity and vulnerability signals. Unsupported exploitability semantics remain unknown rather than being inferred from a severity word.

## 8.5 Explicit graph and remediation preview

The demo supplies six verified scenario edges and three paths. The algorithm does not collect effective authorization from names or assume that reducing a broad grant removes every read relationship. This conservative behavior is intentional: different grants may still allow access. Live effective relationship collection is a future extension, while reviewed imports can supply explicit evidence today.

A simulated change uses catalog values, assesses the copied snapshot and returns before/after finding and path counts. Patching the synthetic AWS workload removes its associated path hypothesis. No cloud API write follows. Controls requiring judgment, such as dormancy review, have no automatic simulated fix.

## 8.6 Review decisions and exports

The API stores open, deferred and accepted-for-planning states against the current scan. If the scan changes, a decision submitted for the prior scan is rejected and the reviewer refreshes. A decision does not resolve the detected finding. Exports contain assessment evidence and review state without local cloud configuration secrets. CSV export additionally protects downstream spreadsheet handling.

## 8.7 Bounded analyst assistant

The offline briefing selects top matching findings by deterministic order. Optional OpenAI integration requires a key, an explicitly selected model, enabled AI and explicit external-processing allowance. Input is limited to finding ID, catalog title/domain, numeric factors, priority and confidence. Account names, raw provider evidence, tags, notes and cloud credentials are omitted.

The model returns IDs under a JSON schema. The application validates membership, cardinality and uniqueness. Invalid or unavailable output causes a visibly labelled deterministic fallback. The model authors no remediation commands, risk values or authoritative prose. The assistant is deliberately narrower than a general autonomous security agent and has no write tools.

## 8.8 Operational failure behavior

Failure behavior is part of the implementation. Disabled stages claim no coverage. Authentication failures are visible. Partial list stages retain collected resources and a partial status. Per-resource denied reads stay null. Missing business context limits confidence. Old collection timestamps remain old after a reassessment. No failure path silently switches to the demo or produces a compliance pass.

<!--page-->
# Chapter 9 Testing and evaluation protocol

## 9.1 Evidence classes

Three evidence classes are kept separate: authored synthetic scenarios, automated/browser verification of software behavior, and implemented but unauthenticated live integrations. The first can illustrate risk conditions, the second can establish deterministic behavior, and the third requires account-specific sandbox validation. Neither synthetic fixtures nor unit tests prove live detection accuracy.

The demo fixture has eight resources per provider, with deliberately failed, passed and unknown attributes. It includes reachable vulnerable workloads, service identities, sensitive storage, public exports, broad administration rules, dormant console users, internal healthy workloads and unobserved buckets. Repeated provider scenarios check representation consistency rather than pretending to be independent real-world samples.

## 9.2 Automated test design

| Test family | Meaningful assertions | Boundaries |
|---|---|---|
| Assessment | Unknown coverage, score arithmetic, monotonicity and stale confidence | Not empirical calibration |
| Graph | Missing/unverified edges, public-IP abstention, cycles and sensitive targets | Not exploit execution |
| Identity | Wildcard catalog expansion, local exclusions and incomplete-window abstention | Not full policy evaluation |
| Connector parsing | IPv6, port ranges, private sources, deny rules and source tags | Not authenticated API contracts |
| Simulation | Input isolation, review-only controls and unknown IDs | Not successful cloud remediation |
| Persistence | Current-scan decisions, unresolved findings and hash-chain verification | Not externally immutable audit |
| HTTP | State/export, request shape, Origin/Host rejection and session requirement | Local-prototype boundary only |
| Browser | Views, filters, details, preview, decisions and mobile layout | Not a large-scale usability study |

Forty-seven automated tests passed in the development environment. The browser suite checked the actual local UI at desktop and mobile sizes and reported no console errors. The operator validation guide records checks that were not performed, including live credentials, external model calls, Docker execution and independent reviewer evaluation.

## 9.3 Ranking dataset and labels

A separate benchmark defines 12 authored vulnerability scenarios. Severity, reachability, exploit signal, criticality, sensitivity and path context vary across cases. Author relevance labels range from zero to three. These labels are scenario assumptions for controlled comparison and are not described as expert ground truth.

The dataset deliberately includes high-severity laboratory cases and lower-severity but exposed important production cases. This allows the effect of context to be observed, but also introduces construction bias. Scenarios and labels were authored together, which creates label leakage risk. There is no trained model and no independent holdout result in this build.

## 9.4 Baselines and ablations

The severity-only baseline ranks the same workload vulnerability records by normalized severity; ties use lexical resource ID. The context-only variant retains severity, exposure, exploit and impact contributions while disabling graph membership. The complete variant adds graph membership. These comparisons isolate the contribution of context and then graph within the implemented formula.

Only WRK001 vulnerability findings enter the ranking experiment, avoiding accidental comparison of different finding sets. Baseline ranking values are normalized severity multiplied by 100, while context variants report their own policy index. The ranking comparison uses the same candidate IDs and authored labels for every variant.

## 9.5 Metrics and perturbation

NDCG at five measures the discounted authored relevance of the first five results relative to the ideal ranking. Precision at five measures the fraction of maximum-relevance cases among those five. Neither metric is meaningful beyond the validity of the supplied labels. Local timing measures assessment of an in-memory fixture, not cloud API performance.

Each of five weights is changed by minus and plus 20%, then weights are normalized back to a sum of one. Ten perturbations report NDCG and top-five membership overlap. This is local sensitivity analysis, not uncertainty calibration. It is useful because it reveals whether nearby parameter choices change the review set.

## 9.6 Proposed independent validation protocol

Before stronger efficacy claims, create independently reviewed cases from authorized sandbox accounts and representative workload contexts. Two reviewers should assign relevance without viewing scores. Record disagreement, adjudication and inter-rater agreement. Freeze weights and thresholds before holdout evaluation. Repeat baseline ties with random seeds and report bootstrap intervals rather than a single best ordering.

Measure connector coverage and rule true/false positives against provider-console evidence. Record denied reads and stale observations, not just successes. If an analyst study is approved, use a crossover design to compare task correctness, evidence-tracing time and review decisions with and without context. This protocol is proposed future validation, not a completed experiment.

<!--page-->
# Chapter 10 Results and critical analysis

## 10.1 Reproducible demonstration results

| Measure | Observed result | Interpretation |
|---|---|---|
| Resources | 24 | Eight authored resources per provider |
| Policy controls | 12 | Selected controls, not a complete benchmark |
| Failed checks and findings | 39 | One finding per failed applicable check |
| Passed checks | 24 | Explicit observed nonfailure |
| Unknown checks | 18 | Missing evidence retained |
| Explicit scenario paths | 3 | One independent path per provider |
| Evaluated coverage | 77.8 percent | 63 evaluated checks divided by 81 applicable checks |
| Pass rate of evaluated checks | 52.4 percent | 33 passes divided by 63 evaluated checks |
| Automated tests | 47 passed | Software behavior, not field efficacy |

The difference between coverage and pass rate is central to RQ1. Counting the unknown bucket checks as passes would misrepresent posture. The implementation preserves those unknowns and records their sources. These results are deterministic for the supplied fixtures, except confidence freshness and assessment timestamps respond to real time.

## 10.2 Ranking comparison

| Variant | NDCG at five | Precision at five for relevance three |
|---|---|---|
| Severity only | 0.1095 | 0.0 |
| Context without graph | 0.9595 | 0.8 |
| Context with graph | 0.9595 | 0.8 |

[figure:ranking]

The authored cases show the expected context effect: exposed important production scenarios move upward. However, the severity baseline is sensitive to its lexical tie rule and deliberately constructed laboratory cases. The large metric difference must not be generalized to real security teams, vendor platforms or arbitrary cloud accounts.

Graph participation changes the top ordering, placing explicit-path cases ahead of comparable nonpath cases. It does not increase NDCG at five or precision at five over context-only in this dataset. This is a useful negative result for RQ3: graph explains correlation and changes order here, but measurable aggregate benefit remains unestablished.

## 10.3 Weight sensitivity

Across the ten local perturbations, top-five membership overlap is either 0.8 or 1.0 relative to the full model, and NDCG at five ranges from 0.9595 to 1.0. Reducing exposure weight or increasing impact weight admits a higher-relevance private production case to the top five. This reveals a tradeoff: exposure can outweigh business importance near the fifth position.

The result supports transparency, not definitive calibration. A chosen default does not become correct because neighboring choices are stable on a small authored dataset. An owner should inspect the affected borderline cases and decide whether the policy allocation matches the organization's review priorities.

## 10.4 Runtime and interaction evidence

The benchmark records median and 95th-percentile local assessment times over 30 small-fixture runs in evaluation/results.json. These are environment-specific in-memory measurements; no provider latency, population-scale throughput or distributed performance is claimed. Browser verification demonstrates that the intended review steps are reachable and function together rather than existing only in a report mockup.

The demonstration server was run in credential-free mode. Authenticated cloud collection and external model processing were not executed because no credentials were supplied. Consequently, the code is reviewable and runnable, while live compatibility and detection claims remain bounded by the validation plan.

## 10.5 Comparison with the supplied report

The supplied report asserted that a perfectly least-privilege identity should hold exactly observed permissions, that valid role JSON established safe remediation, and that generated PDFs fulfilled compliance sign-off requirements. These claims do not follow from the described evidence. The revision replaces them with observation-based review candidates, deterministic assessment, bounded planning and selected control evidence.

The report also described ordinary role creation/assignment as JIT. This revision does not retain that claim. It documents what a real time-bound workflow would need. Likewise, ATT&CK labels are used as context for potential adversary behavior, not a count of compliance controls or proof that a particular attack occurred [21].

## 10.6 Research contribution and threats to validity

The implementation contributes an inspectable normalized schema, visible unknown handling, policy explanation, graph conditions and a reproducible comparison workflow. It shows how to make claims proportionate to evidence. The contribution is engineering and evaluation design rather than a new weighted-sum algorithm or complete cloud authorization model.

Internal validity is limited by scenarios and labels authored together, deliberate context advantages and baseline tie handling. Construct validity is limited because an ordinal priority score is not probability or expected loss. External validity is limited by a small synthetic dataset, partial provider semantics and absence of independently validated live accounts. Operational validity is limited because no real remediation, usability study or enterprise authentication deployment was performed.

<!--page-->
# Chapter 11 Conclusions and future work

## 11.1 Conclusions tied to objectives

The revision broadens the identity-only framing into selected multi-cloud configuration, exposure, workload, identity and compliance-evidence assessment. It delivers a runnable dashboard, read-only collector source, explicit policy configuration, graph hypotheses, what-if previews, local decisions and reproducible tests. Every objective is connected to implemented code and a stated validation limit.

The priority model is now defined and defensible as a transparent author policy hypothesis. Inputs, defaults, weights and contributions are visible, and local perturbations are reported. It is not empirically calibrated. The comparison demonstrates context effects on constructed cases, while the graph ablation prevents a blanket claim that correlation necessarily improves ranking metrics.

The original access-review goal remains meaningful when formulated carefully. Catalog expansion and observation complement can support candidate review, but complete authorization semantics, business need and telemetry coverage require additional evidence. The candidate should defend these distinctions rather than claim a finite observation window proves perfect least privilege.

## 11.2 Immediate academic completion work

The candidate should run the project, inspect the modules and understand every demonstrated finding. Complete authenticated sandbox validation for each enabled provider, capture source evidence and update the live-validation record. Independently review the factor rubric and case labels. Update the report's validation status only when evidence exists.

Institution-required declarations, ownership terms, AI disclosure, plagiarism checks and signatures require human verification. The supplied duplicated certificates and approval language have not been reproduced as if verified. The report remains an editable technical revision for candidate review until those steps are completed.

## 11.3 Technical extension priorities

First, add native effective network reachability and authorization evidence with structured edge timestamps. Second, improve workload normalization using native vulnerability subassessments and explicit asset joins, separating configuration recommendations from exploitability. Third, add entitlement telemetry with verified identity resolution, catalog versions, plane-specific logs and retention coverage. Fourth, extend control coverage using reviewed provider benchmarks without treating partial checks as complete compliance.

Enterprise deployment would need authenticated reviewer identities, scope-based API authorization, TLS, external immutable audit storage and secret management. If cloud-write remediation is added later, it should be a separate service with plan review, resource preconditions, bounded privileges, canary tests, expiry where relevant and independently validated restoration. These features are proposed, not implemented.

Future research should use independent holdout cases and blinded reviewer labels, calibrate weights and measure analyst decisions with confidence intervals.

<!--page-->
# Appendix A Examiner response and claim corrections

| Concern from external viva | Concrete response in this revision | Evidence or remaining limit |
|---|---|---|
| Narrow identity scope | Five domains and multi-cloud schema | 12 controls; partial product coverage |
| Outdated CSPM discussion | Modern native context and graph capabilities acknowledged | Primary sources; no vendor performance comparison |
| Arbitrary scoring | Explicit formula, rubric, defaults and perturbations | Author policy; independent calibration pending |
| Basic implementation | Working API/UI, graph, decisions, simulation and tests | 47 tests plus browser QA |
| Weak problem and data definition | Bounded research questions and authored scenario labels | No independent real-cloud ground truth |
| Protocol and identity weakness | Token audiences, STS/ADC, planes and policy semantics | Full authorization evaluator not claimed |
| Weak objective evidence | Acceptance matrix and executable artifacts | Live account tests remain pending |
| Limited research contribution | Baselines, graph ablation and negative-result discussion | Small constructed experiment |

Corrections that should be defended in the viva include: absence of events is not absence of need; role JSON validity is not safe effective authorization; Contributor is not automatically blob DataActions; NotActions is not a global deny; ordinary assignment is not time-bound JIT; ATT&CK techniques are not a compliance control catalog; RAG and schema validation do not guarantee factuality; a local hash chain is not administrator-proof immutability; and exporting a report does not certify a complete compliance standard.

# Appendix B Control catalog and evidence schema

| Control and severity S | Assessed observation | Domain | Key limitation |
|---|---|---|---|
| STO001 0.85 | Anonymous storage read grant | Configuration | Surrounding effective controls matter |
| STO002 0.7 | Explicit encryption-disabled evidence | Configuration | Provider defaults and historical objects differ |
| STO003 0.45 | Inspected access-logging channel disabled | Compliance evidence | Other audit channels may exist |
| STO004 0.65 | Explicit absence of HTTPS enforcement | Configuration | Missing policy is not inferred automatically |
| STO005 0.5 | Anonymous configuration capability allowed | Configuration | Does not prove public container data |
| NET001 0.8 | Broad inbound administration rule | Exposure | Effective routing/deny priority not proven |
| IAM001 0.85 | Broad privilege grant | Identity | Effective authorization layers remain partial |
| IAM002 0.8 | Console user lacks registered MFA | Identity | Registration differs from enforcement |
| IAM003 0.45 | Over 90 days inactivity with asserted complete window | Identity | Owner review rather than revocation |
| WRK001 0.9 | Exploitability signal | Workload | Not successful exploit execution |
| WRK002 0.6 | Explicit monitoring-disabled evidence | Workload | No runtime agent deployed |
| EXP001 0.55 | Supplied Internet reachability assertion | Exposure | Public IP alone is insufficient |

The severity values in the first column are author policy anchors. Their per-control consequence rationale is recorded in config/policies.json and docs/RISK_METHOD.md. Public data and broad grants receive higher anchors than configuration capability or dormancy review signals. WRK001 replaces its 0.9 default with supplied CVSS divided by ten. These values require independent elicitation and are not published standard coefficients.

A resource object requires an ID, provider, account, kind, timestamp with timezone, source and attribute object. Null denotes unknown. An edge requires from, to, type, verified and evidence. The schema validator rejects duplicate resources, unknown providers/kinds, invalid booleans, nonfinite/out-of-range context values and unsupported graph endpoints/types. Example import evidence is intentionally synthetic and must be replaced with reviewed observations for live claims.

# Appendix C Demonstration and live validation plan

Start the demo with mvn spring-boot:run -Dspring-boot.run.arguments="--mode demo" (along with `npm run dev` for the frontend) and open localhost port 5173. Show the mode label, scope and unknown count; inspect the 96.6 workload priority and its factors; trace a path; preview one change; record a local decision; compare control coverage with pass rate; generate a labelled briefing; and show the benchmark's limitations. The full timed script is docs/DEMO_SCRIPT.md.

For live use, install optional dependencies in a virtual environment, copy the cloud and environment examples, configure actual accounts and enable only intended providers. Start explicitly in live mode. Check all collector stages against provider-console evidence. Capture masked scope identifiers, API status, SDK versions, timestamps and false/unknown results. No secret should appear in a screenshot or report.

An independent validation log should contain test ID, provider, resource/control, expected state, observed state, source record, timestamp, completeness caveat and reviewer. Include known-safe and misconfigured cases. Do not label a collector complete solely because authentication worked. Edge-producing claims require effective authorization and reachability evidence beyond the current inventory adapters.

# Appendix D Academic integrity and handover

The candidate identity and institution metadata were retained from the supplied document for review. Original certificates, approval assertions, similarity percentages and signatures were not reproduced as verified facts. The candidate and guide must assess the revised content, identify actual contributions and complete institution-specific declarations independently.

AI-assisted work in this revision includes technical analysis, source review, report drafting, code generation and verification assistance through Codex. The candidate must record the actual tools, dates, scope of assistance and human verification in the institution's required disclosure form. No invented percentage of original work or completed human review is inserted.

Handover includes the implementation, editable report, Markdown source, risk methodology, connector instructions, permission templates, demo script, viva guide, examiner-response matrix, tests and authored benchmark results. The original institutional ownership terms remain for institutional interpretation; the generated code does not invent a new license or override them.

<!--page-->
# References

[1] Microsoft. Cloud Security Posture Management in Microsoft Defender for Cloud. https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management

[2] Amazon Web Services. Generating exposure findings in AWS Security Hub. https://docs.aws.amazon.com/securityhub/latest/userguide/exposure-findings-generate.html

[3] Google Cloud. Overview of attack exposure scores and attack paths in Security Command Center. https://docs.cloud.google.com/security-command-center/docs/attack-exposure-learn

[4] NIST. Guide for Conducting Risk Assessments. SP 800-30 Revision 1, 2012. https://csrc.nist.gov/pubs/sp/800/30/r1/final

[5] FIRST. CVSS version 4 specification document. https://www.first.org/cvss/v4.0/specification-document

[6] Amazon Web Services. IAM policy evaluation logic. https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html

[7] Microsoft. Azure role-based access control overview. https://learn.microsoft.com/en-us/azure/role-based-access-control/overview

[8] Microsoft. Understand Azure role definitions. https://learn.microsoft.com/en-us/azure/role-based-access-control/role-definitions

[9] Google Cloud. Understanding IAM allow policies. https://docs.cloud.google.com/iam/docs/allow-policies

[10] Backes J and colleagues. Semantic based automated reasoning for AWS access policies using SMT. 2018. https://www.amazon.science/publications/semantic-based-automated-reasoning-for-aws-access-policies-using-smt

[11] Sheyner O and colleagues. Automated generation and analysis of attack graphs. IEEE Symposium on Security and Privacy, 2002. https://www.cs.cmu.edu/~wing/publications/Sheyner-Wing02.pdf

[12] Hardt D editor. The OAuth 2.0 Authorization Framework. RFC 6749, 2012. https://datatracker.ietf.org/doc/html/rfc6749

[13] OpenID Foundation. OpenID Connect Core 1.0 incorporating errata set 2. https://openid.net/specs/openid-connect-core-1_0.html

[14] Microsoft. Azure Monitor activity log. https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log

[15] Lewis P and colleagues. Retrieval augmented generation for knowledge intensive NLP tasks. 2020. https://arxiv.org/abs/2005.11401

[16] OpenAI. Structured model outputs. https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses

[17] NIST. Security and Privacy Controls for Information Systems and Organizations. SP 800-53 Revision 5. https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final

[18] NIST. Cybersecurity Framework. https://www.nist.gov/cyberframework

[19] Amazon Web Services. S3 default encryption FAQ. https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html

[20] Microsoft. Configure anonymous read access for Azure containers and blobs. https://learn.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure

[21] MITRE. ATT and CK technique T1530 Data from Cloud Storage. https://attack.mitre.org/techniques/T1530/
