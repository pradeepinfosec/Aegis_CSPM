# Aegis CSPM

A runnable academic prototype that expands the supplied Azure access-review project into an evidence-driven multi-cloud posture assessment system. It covers configuration, identity, exposure, workload signals and selected compliance evidence. It includes a revised academic report, a viva guide, a local dashboard, real read-only AWS/Azure/GCP collectors, configuration/permission templates and reproducible evaluation.

## Run the demonstration or live mode

Requires Java 17+ and Maven; no pip install, cloud keys, database service or paid API is needed for the demo.

### Running the Backend

```sh
cd cloud-risk-capstone
# Start in demo mode (uses synthetic offline data):
mvn spring-boot:run "-Dspring-boot.run.arguments=--mode demo"
```

### Switching to Live Mode

To stop the currently running backend (e.g. `demo` mode), simply go to the terminal where it is running and press **`Ctrl+C`**. 

Once the server has stopped, you can start it in `live` mode by running:

```sh
mvn spring-boot:run "-Dspring-boot.run.arguments=--mode live"
```

In a separate terminal, start the frontend development server:

```sh
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 for the frontend dashboard. The backend API runs on port 8765. The demo has 24 synthetic resources, three explicit scenario paths and intentionally unknown observations. Fixed collection timestamps preserve honest provenance; running a new assessment does not silently refresh old evidence.

### Troubleshooting: Port 8765 already in use

If you encounter the error `Web server failed to start. Port 8765 was already in use.`, a previous instance of the server is likely still running in the background. 

On Windows, you can forcefully kill it by opening PowerShell and running:

```powershell
# 1. Find the Process ID (PID) listening on port 8765:
netstat -ano | findstr :8765

# 2. Force kill the process (replace <PID> with the number from the last column above):
taskkill /F /PID <PID>
```

## Frontend development and build

To develop or build the React frontend, you will need Node.js and npm installed.

```sh
cd frontend
npm install

# Start the development server with hot-reloading
npm run dev

# Build for production
npm run build
```

## Docker and Database Setup

The project includes a `docker-compose.yml` file to quickly spin up a local MongoDB instance required by the backend.

**Start MongoDB:**
Ensure Docker is running, then start the database via Docker Compose:
```sh
docker compose up -d
```
This maps MongoDB to `localhost:27019` with the `aegis_capstone` database.



## Included behavior

- Provider/domain/priority filters, evidence drill-down and score contribution bars.
- Explicit relationship paths and preconditions; no inferred cross-cloud identity joins.
- Tri-state controls with coverage separate from pass rate.
- What-if remediation previews and persisted local review decisions.
- JSON/CSV exports and a locally verifiable audit hash chain.
- Evidence briefing without credentials, plus optional bounded OpenAI reference selection.
- Azure activity query helper and a wildcard-aware permission observation review CLI.
- Synthetic ranking benchmarks, ablations, weight sensitivity analysis and test suite.

## Live cloud setup

See [connector instructions](docs/CONNECTORS.md). Copy `config/clouds.example.json` to `config/clouds.json` and `.env.example` to `.env`. Set actual scopes, enable selected clouds and use SDK credentials or server-side environment variables. These local files are ignored. Never put keys into the dashboard. Install the dependencies in `requirements-live.txt` (which includes `reportlab` and `python-docx` for evidence exports) in a virtual environment, then run `mvn spring-boot:run -Dspring-boot.run.arguments="--mode live"`.

Live collectors have not been tested against authenticated customer accounts in this build. They return failed/partial stages and unknown fields instead of substituting demonstration data. Workload imports are native evidence, not a runtime scanning agent. Effective network reachability, full cloud authorization evaluation, automatic cloud remediation and full compliance certification are beyond this prototype.

## Import and identity review

```sh
mvn spring-boot:run -Dspring-boot.run.arguments="--mode import" --import-file fixtures/import.example.json --db mongodb://localhost:27019/import
mvn exec:java -Dexec.mainClass="scripts.access_review" --evidence-file fixtures/access-review.example.json
```

`import.example.json` is also synthetic; replace it with reviewed observations. `backend/src/main/java/.../Identity.java` expands wildcards against a supplied operation catalog and treats unobserved permissions as review candidates. It does not infer that observed use equals business need or evaluate all inherited policy semantics.

## Verification and research

```sh
mvn test
mvn exec:java -Dexec.mainClass="evaluation.benchmark"
```

47 automated tests passed in the development environment; browser QA passed 13 interaction and layout checks covering navigation, evidence, simulation, decisions, filters, exports and mobile layout. See `docs/VALIDATION.md` for exact scope and recorded evidence. HTTP tests bind a local temporary port. Demo data is entirely authored synthetic data. No real-cloud performance, independent expert ground truth, plagiarism score or institutional approval is claimed.

Read [risk methodology](docs/RISK_METHOD.md), [demo script](docs/DEMO_SCRIPT.md), [viva preparation](docs/VIVA_GUIDE.md) and [feedback response](docs/EXAMINER_RESPONSE.md). The revised report is in `deliverables/`. Review the candidate declaration, author contribution and institution-required formatting before submission. Original ownership statements are not overridden by this code bundle; no license or institutional approval is invented.

## Architecture

- **Frontend**: Built with **Vite** and **React** (running on port 5173), providing a responsive and interactive dashboard for cloud posture assessment.
- **Backend**: Powered by **Spring Boot**, **Maven** and **Java** (running on port 8765), handling API requests, policy evaluation, and connector logic.
- **Database**: Uses **MongoDB** running in **Docker** (port 27019), offering a scalable NoSQL schema for storing scans, resources, decisions, and local audit chains.

### Component Diagram

```text
+-----------------------+           +-----------------------+
|  Frontend Dashboard   |           |  LLM Briefing Agent   |
|    (React + Vite)     |           |     (Optional AI)     |
+-----------+-----------+           +-----------+-----------+
            |                                   ^
            | REST API                          | Query
            v                                   v
+-----------------------------------------------------------+
|               Backend (Spring Boot + Java)                |
|  +-----------------+  +-----------------+  +-----------+  |
|  |   API Server    |<-> Policy & Risk   |<-- Cloud     |  |
|  |  (Port 8765)    |  | Engine / Graph  |  | Connectors|  |
|  +-----------------+  +-----------------+  +-----------+  |
+-----------------------------------------------------------+
            ^                     |                 |
            | Read / Write        | Store           | Read-Only API
            v                     v                 v
+-----------------------+           +-----------------------+
|      Persistence      |           |    Cloud Providers    |
| (MongoDB Port 27019)  |           |   (AWS, Azure, GCP)   |
+-----------------------+           +-----------------------+
```

### Data Flow

```text
  Dashboard       API           Core       Collectors       DB          Cloud
      |            |              |             |            |            |
      |            |              |     [1. Evidence Collection]          |
      |            |              |             |-- Request Configs ----->|
      |            |              |             |<-- JSON Payloads -------|
      |            |              |<-- Normalize-            |            |
      |            |              |             |            |            |
      |            |      [2. Evaluation & Prioritization]   |            |
      |            |              |-- Apply Policies         |            |
      |            |              |-- Build Attack Graph     |            |
      |            |              |-- Compute Risk Score     |            |
      |            |              |------ Store Findings --->|            |
      |            |              |             |            |            |
      |    [3. User Interaction]  |             |            |            |
      |-- GET/state->|            |             |            |            |
      |            |----- Fetch Prioritized Findings ------->|            |
      |            |<------------- Return Data --------------|            |
      |<-- Render -|              |             |            |            |
      |            |              |             |            |            |
```

## Project layout

```text
backend/src/main/java/.../Core.java            policy assessment, priority and graph analysis
backend/src/main/java/.../connectors/        real read-only cloud collectors
backend/src/main/java/.../Server.java          local HTTP/API server
backend/src/main/java/.../Store.java           MongoDB collections, decisions, audit chain
backend/src/main/java/.../Agent.java           bounded evidence briefing
backend/src/main/java/.../Identity.java        permission observation review
frontend/            React dashboard
config/                cloud, credential and permission templates
fixtures/              synthetic demo and import/access examples
evaluation/            scenarios, benchmark, recorded results
scripts/               telemetry, access review, optional QA helpers
tests/                 assessment, connector parsing, persistence and HTTP tests
docs/                  operation, scoring, viva and validation
deliverables/          revised capstone report
```

The document-generation and browser-QA helper scripts use the bundled Codex artifact environment and are development tools; running the product and tests uses ordinary Java/Maven. No external model is contacted unless AI is enabled, external processing is explicitly allowed and a key/model is configured. Non-loopback binding requires a strong dashboard access token. Docker Compose is an optional demo route; see the connector guide.
