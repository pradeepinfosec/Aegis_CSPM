# Validation record

Validation on 7 October 2026 in the local development environment:

- 47 automated Maven tests passed: 39 assessment, connector parsing, identity and persistence tests plus 8 local HTTP integration tests.
- Browser QA passed 13 interaction and layout checks covering navigation, evidence drill-down, score display, remediation preview, local review decisions, graph views, control evidence, briefing, audit history, connector setup, filters and reassessment. Desktop 1440×1050 and mobile 390×844 were checked; no console errors or horizontal mobile overflow.
- JavaScript syntax checked with Node. Dashboard pages were visually inspected.
- The credential-free backend server was run at http://localhost:8765, and the frontend at http://localhost:5173.
- The 12-scenario benchmark and 10 weight perturbations were executed. Exact results are in evaluation/results.json, with assumptions and limitations.

Records are retained as `artifacts/tests.log`, `artifacts/browser-qa.json` and dashboard QA screenshots in the authoring workspace. Final document render images are internal QA artifacts. Source distributions include the reproducible tests and evaluation outputs; they omit local database files and credentials.

Not performed: authenticated AWS/Azure/GCP account tests; live Azure Logs data validation; external model calls; Docker build/run; independent analyst judgement study; production-scale performance; full effective IAM/network analysis; institutional plagiarism/approval checks. These are explicit limits, not successful results.

## Before submission

1. Configure one disposable sandbox per provider and validate every enabled stage against provider console/API evidence.
2. Add known-safe and misconfigured resources without exposing sensitive production data. Record collection failures and unknowns as well as true/false positives.
3. Have independent reviewers label risks without seeing scores. Lock weights before evaluating a separate holdout set.
4. Add native effective access and reachability evidence if claiming live attack paths. Do not fill missing edges from display names.
5. Test restoration, business dependencies and expiry before proposing any future cloud-write remediation workflow.
6. Update candidate contribution/AI disclosures and obtain institutional verification for declarations, certificates and similarity reports.
