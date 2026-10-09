# Response to examiner feedback

This revision replaces unsupported claims with a scoped implementation and a reproducible evidence base. It does not assert that external examiners have approved it. The candidate must understand the implementation, complete real-cloud validation where required and update declarations before submission.

| Examiner concern | Revision | Reviewable evidence | Remaining validation |
|---|---|---|---|
| Scope and technical depth insufficient | Configuration, identity, exposure, workload signals and selected compliance evidence are assessed in one normalized pipeline | backend/src/main/java/.../Core.java, 12 controls, dashboard and scenario paths | More services and native effective access/reachability collectors |
| Literature unrelated to the problem | Primary CSPM, risk, IAM, protocol, attack graph and bounded AI sources are connected to design choices | Revised Chapter 2 and references | Maintain citations as product features evolve |
| Traditional CSPM discussion outdated | Modern vendor capabilities and overlap are acknowledged; no claim that vendors lack AI or attack paths | Literature capability comparison | No vendor benchmark has been performed |
| Risk score arbitrary | Explicit rubric, weights, assumptions, factor contributions, worked example and sensitivity experiment | config/policies.json, RISK_METHOD.md, evaluation/results.json | Independent expert elicitation and calibration of weights |
| Implementation basic | Modular collectors, tri-state assessment, graph traversal, MongoDB via Docker audit/decisions, API/UI, what-if and grounding constraints | Running code plus automated and browser tests | Live API compatibility and enterprise hardening |
| Broad cloud risk lacking | Risks combine technical condition, exposure, exploit context and owner-supplied impact | Score explanation and graph views | No expected-loss or exploit-probability model claimed |
| Weak protocol/identity understanding | OAuth/OIDC/STS/ADC, plane distinctions, deny semantics, wildcard review and telemetry caveats documented | Revised Chapters 5, 7 and viva guide; identity module tests | Full authorization engines and identity-provider controls are beyond prototype |
| Problem assumed to be a mainstream use case | Bounded research questions focus on evidence loss and transparent review ordering | Problem formulation and evaluation protocol | Validate organizational need through independent analyst study |
| Weak data definition | Fixed synthetic fixtures, authored relevance labels, timestamps, unknowns and limits described | fixtures/, evaluation/scenarios.json | Independently labelled real/sandbox holdout data |
| Objectives lack evidence | Each objective is linked to executable modules, measurable checks and honest evidence status | Chapter 4 objective matrix and Chapter 9 tests | External approval and live efficacy remain unverified |
| Research contribution weak | Reproducible coverage-aware comparison and graph ablation with negative result discussion | Chapter 10 and benchmark | Statistical generalization requires more data |

Specific corrections: observed activity is not identical to permission need; Azure Contributor management-plane access is not automatically blob data access; NotActions is not a global deny; role JSON validity is not proof of safe authorization; ordinary role assignment is not time-bound JIT; ATT&CK techniques are behavior labels rather than a compliance control count; RAG does not eliminate hallucination; a hash chain is not administrator-proof immutability; a report export does not certify ISO 27001 or SOC 2; and credentials being accepted is not evidence that a cloud assessment was implemented.
