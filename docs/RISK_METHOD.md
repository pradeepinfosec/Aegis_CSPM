# Risk priority methodology

This is a versioned, explainable policy priority index for reviewer ordering. It is not a probability, CVSS replacement, calibrated expected loss, or vendor-equivalent exposure score. Code and JSON policy are the source of truth. `backend/src/main/java/.../Core.java` exposes each factor, contribution and uncertainty; `config/policies.json` is versioned `policy-priority-v1`.

## Formula and factor rubric / Risk Calculation Methodology:

`P = 100 × (0.30 S + 0.20 E + 0.20 X + 0.20 I + 0.10 G)`

`I = 0.60 C + 0.40 D`

All inputs lie in [0,1]. This weighted sum is monotonic in every factor and bounded by 100. A policy control creates a finding only after a failed check. Unknown check state never produces an invented pass or asserted failure.

| Factor | Implemented rubric | Justification and limitation |
|---|---|---|
| S severity | Control-specific policy rubric, or supplied CVSS/10 for WRK001 | A stable starting point. CVSS describes vulnerability severity; configuration controls use an explicit author policy rubric |
| E exposure context | 1.0 for asserted anonymous storage access or verified reachability; 0.65 for broad admin rule/public-IP signal; otherwise 0.25 | Reachability matters. 0.65 represents a signal needing further assessment, not a reachability probability. Missing reachability lowers confidence |
| X exploitability signal | 1.0 when known-exploitation is asserted; 0.8 for an exploitability signal; 0.4 otherwise | Makes exploit intelligence visible; no live KEV feed is claimed. Unknown evidence and explicit negative share a conservative priority floor and differ in confidence |
| C criticality | Owner-defined business importance | 0.1 disposable lab; 0.3 development; 0.6 business supporting; 0.9 customer critical; 1.0 essential service. Owner must justify assignment |
| D sensitivity | Owner-defined information sensitivity | 0.1 public; 0.3 internal; 0.6 confidential; 0.9 regulated; 1.0 highest-impact sensitive information. No automatic data classification |
| G path participation | 1.0 if in a qualifying explicit graph path, else 0 | Adds correlation context. Missing graph evidence does not establish absence of an attack path |

Critical >=80, high >=60, medium >=35, low <35. These bands guide review order. A local decision never resolves a technical finding. Rescan evidence is required to establish a real correction.

The rubric is motivated by likelihood/impact reasoning and modern context-based CSPM, but the exact coefficients are author policy choices. Neither NIST nor FIRST prescribes them. Severity gets 30% as the common technical anchor; exposure, exploitability and impact each get 20%; graph gets 10% to avoid dominating correlated signals. CVSS exploitability and the X factor can overlap, as can E and graph entry conditions. Therefore the model is not an independent-factor probability model. It needs expert elicitation and calibration before operational use.

Missing criticality/sensitivity defaults to 0.5. Missing effective exposure gives the context floor or a collected signal. Missing exploit intelligence gives 0.4. Every missing dimension is returned in `unknown_context`. Confidence is `limited` if any context input is missing or evidence is older than 24 hours, otherwise `supported`. Supported means inputs are present, not that the index is empirically validated.

## Worked example

The demo AWS web workload has CVSS 9.8, asserted Internet reachability, an asserted known-exploitation signal, criticality 0.9, sensitivity 0.8 and a verified scenario path. S=0.98, E=1, X=1, I=0.86, G=1. Contributions: 29.4+20+20+17.2+10 = 96.6. A private lab workload with the same CVSS can rank lower because business impact and exposure differ. The demo assertions are synthetic, not a statement about an actual CVE or account.

## Evaluation and calibration

Run `mvn exec:java -Dexec.mainClass="evaluation.benchmark"`. It compares severity-only, context without graph, and context with graph on 12 author-labelled synthetic vulnerability scenarios. Labels 0–3 describe authored review relevance. Output contains NDCG@5, precision@5 for relevance 3, ranking, ±20% one-weight perturbations normalized back to sum 1, and local assessment timing. Baseline ties use resource ID; this affects results and must be disclosed. The graph improved path ordering here but did not improve the measured NDCG@5 over context alone.

The experiment establishes reproducibility and model behavior on constructed cases. It does not establish expert agreement, real-world ranking quality or superiority to a vendor engine. For stronger research: collect independently labelled sandbox/real account cases; have two reviewers label without viewing scores; adjudicate disagreement; lock weights before holdout evaluation; repeat baseline ties with random seeds; compute bootstrap confidence intervals; evaluate unknown and stale evidence separately. Measure analyst effort and correctness using a crossover study if permitted by the institution.

## Graph and what-if reasoning

Only explicit verified `runs_as`, `assumes`, and `can_read` edges are traversed. A qualifying start is a workload with reachable and exploitable assertions. A qualifying end is storage sensitivity >=0.7. Depth <=4 prevents unbounded traversal; repeated nodes are excluded. Findings on those paths receive the correlation factor. Edges across providers require recorded federation relationships.

What-if simulation copies the snapshot and changes only selected catalog fields. Patching `exploitable` to false removes a matching path hypothesis. Reducing a broad privilege grant does not automatically delete a separately evidenced read edge. This preserves the distinction between a broad grant and actual effective access. Simulation is planning evidence, never proof of real operational success.

## Per-control severity anchors

These are author policy anchors with explicit consequence rationales, not externally validated numerical severity estimates. Use independent review to revise them.

| Control | S default | Rationale |
|---|---|---|
| STO001 | 0.85 | High potential data disclosure from an anonymous read grant; owner sensitivity determines impact. |
| STO002 | 0.7 | Loss of at-rest confidentiality protection under storage compromise; does not itself establish external exposure. |
| STO003 | 0.45 | Audit and investigation visibility gap; lower direct compromise contribution than a public data grant. |
| STO004 | 0.65 | Transport confidentiality and integrity protection gap; exploitability depends on actual traffic and network position. |
| STO005 | 0.5 | Public configuration capability rather than observed data exposure; lower anchor than STO001. |
| NET001 | 0.8 | Potential external administration entry point; effective reachability is separately assessed. |
| IAM001 | 0.85 | Broad authorization can amplify a compromised identity; limiting policies and alternate grants remain contextual. |
| IAM002 | 0.8 | Missing registered MFA for a console user weakens an account takeover defense; enforcement still needs review. |
| IAM003 | 0.45 | Dormancy is a governance review signal rather than proof of misuse; deliberately lower severity. |
| WRK001 | 0.9 | Supplied CVSS normalized to [0,1]; fallback 0.9 only for an explicit exploitability assertion without CVSS. |
| WRK002 | 0.6 | Loss of workload detection visibility; a missing monitoring channel is not proof of compromise. |
| EXP001 | 0.55 | Internet reachability increases opportunity but may be an approved service requirement; exploit signal is separate. |
| K8S001 | 0.85 | Cluster-admin role bound to an unauthenticated or over-privileged group; permits broad workload compromise within a Kubernetes environment. |
| K8S002 | 0.65 | Missing network policies allowing unrestricted pod-to-pod communication; facilitates lateral movement, though exploitability depends on network topology. |
| DB001 | 0.70 | Missing at-rest encryption for a graph database or relational instance; loss of confidentiality upon underlying volume compromise without establishing direct network exposure. |
| DSPM001 | 0.90 | Unclassified or unconsented Personal Identifiable Information (PII) discovered in unmanaged storage; severe regulatory impact depending on data sensitivity mapping. |
| SEC001 | 0.60 | Missing or misconfigured continuous vulnerability telemetry agent (e.g., Defender or Wazuh); represents a security monitoring gap rather than a direct exploit path. |
