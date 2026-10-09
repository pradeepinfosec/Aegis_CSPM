# Local dashboard API

Base URL: `http://localhost:8765`. Responses are JSON unless noted. No cloud mutation endpoint exists. A configured `DASHBOARD_TOKEN` requires an `Authorization: Bearer ...` header on API requests. POST additionally requires the ephemeral session token from bootstrap in `X-Session-Token`. No cross-origin API access is enabled.

| Method | Route | Purpose |
|---|---|---|
| GET | /api/bootstrap | Get session token and mode |
| GET | /api/state | Latest assessment, decisions and recent scans |
| GET | /api/health | Mode and local audit verification |
| GET | /api/audit | Local hash-chain records and verification result |
| GET | /api/export.json | Download assessment evidence |
| GET | /api/export.csv | Download findings as formula-safe CSV |
| POST | /api/scan | Run the selected source mode and record a scan |
| POST | /api/simulate | Preview selected catalog changes in copied evidence |
| POST | /api/decision | Record current-scan local planning state |
| POST | /api/brief | Evidence reference briefing for a selected focus |

Simulation request: `{"scan_id":1,"finding_ids":["CURRENT_FINDING_ID"]}`.
Decision request: `{"scan_id":1,"finding_id":"CURRENT_FINDING_ID","state":"deferred","note":"Owner review required"}`. States: open, deferred, accepted_for_planning.
Briefing request: `{"question":"priority"}`. Other supported focus values: exposure, identity, workload, compliance.

A scan ID must match the current snapshot for decisions and simulations. Concurrent scans are rejected. JSON bodies are limited to 100 KB; selected simulation IDs are limited to 100. Errors return 400 for invalid requests, 401 for access-token failures, 403 for host/origin/session rejection and 500 for unexpected failures. Configuration files and credentials are never returned by the API.

The schema contract and policy code are in backend/src/main/java/.../Core.java. Normalized import samples are in fixtures/import.example.json. Imports are loaded from a local CLI path; the dashboard does not accept arbitrary uploaded cloud evidence or credentials.
