# Twelve minute viva demonstration

## Preparation

Run `mvn spring-boot:run -Dspring-boot.run.arguments="--mode demo"` (and `npm run dev` in `frontend/`) and open http://localhost:5173. Run the tests beforehand and retain the log. Keep the revised report, RISK_METHOD.md, CONNECTORS.md and evaluation/results.json accessible. All dashboard data in this run is synthetic and labelled DEMO. Fixed evidence timestamps may become stale; explain freshness instead of silently editing them.

## 0 to 2 minutes Describe the research problem

Explain that modern CSPM already includes context and attack paths. The project studies how a small transparent multi-cloud prototype can preserve evidence coverage and support defensible review prioritization. State the scoped contribution: normalized observations, tri-state checks, explicit relationship paths, visible factors and reproducible evaluation. Show 24 resources, 30 findings, 3 scenario paths and 18 unknown checks.

## 2 to 4 minutes Explain a score

Open the workload vulnerability finding. Explain 96.6 as 29.4 severity +20 exposure +20 known-exploitation context +17.2 impact +10 path. Point to the source, timestamp and confidence. State that it is a policy ordering index, not attack probability. Explain unknown inputs and the 24-hour freshness rule.

## 4 to 6 minutes Demonstrate multi-cloud and correlation

Filter the queue to each provider and a domain. Open Risk paths. Trace workload → service identity → sensitive storage. Show explicit `runs_as` and `can_read` evidence. Explain that live collectors do not invent effective authorization/reachability edges and that cross-cloud federation must be supplied explicitly.

## 6 to 8 minutes Demonstrate remediation planning

Open the AWS payments workload vulnerability finding and preview its change. One path is interrupted in the copied snapshot. Explain that a vulnerability patch in reality requires testing and a rescan; this preview changes no cloud resource. Record a deferred or accepted-for-planning review with rationale. Show the evidence history and clarify the hash chain's limits.

## 8 to 9 minutes Demonstrate compliance evidence

Open Control evidence. Explain 77.8% evaluated coverage and 52.4% pass rate among evaluated checks. Show an unknown storage result and why it is not a pass. Explain selected NIST mappings and why an export is supporting evidence, not ISO/SOC certification.

## 9 to 10 minutes Demonstrate the bounded analyst

Generate a priority briefing. Show the deterministic mode label and evidence IDs. Explain the optional model configuration and its limits: only finding-ID selection leaves the deterministic pipeline; no score, policy mutation or cloud write is delegated to a model.

## 10 to 12 minutes Defend the research results

Show `evaluation/results.json`: severity baseline, context and graph ablation. Explain authored labels, the lexical baseline tie rule, why graph changed path order without improving NDCG@5, and why synthetic data does not establish industrial effectiveness. Run a relevant test subset or show the saved log. Close with the independent reviewer/holdout and live-sandbox validation plan.

## Optional identity and live demonstrations

`mvn exec:java -Dexec.mainClass="scripts.access_review" --evidence-file fixtures/access-review.example.json` shows wildcard expansion, local NotActions subtraction and unobserved review candidates. Explain why data-plane actions and alternate grants cannot be inferred from one management-plane catalog.

After a real sandbox account is configured and verified, restart explicitly in `--mode live`. Show actual collector status, null observations and a matching provider-console state. Do not open a live connector for the first time during the viva. Never show secrets or switch a demo label off to imitate live evidence.
