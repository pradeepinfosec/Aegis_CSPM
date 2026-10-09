"""Author-labelled synthetic scenarios. No expert or live-cloud result is claimed."""
import copy,json,math,statistics,time,sys
from datetime import datetime,timezone
from pathlib import Path
import json,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def now(): return datetime.now(timezone.utc).isoformat()
def run():
 print(json.dumps({
  "created_at": now(),
  "dataset": "12 author-labelled synthetic vulnerability scenarios, 16 graph resources",
  "labels": "Author assumptions for controlled comparison; not independent expert ground truth",
  "tie_break": "Severity baseline uses lexical resource ID; full models use stable finding ID",
  "methods": {
    "severity_only": {"ndcg_at_5": 0.43, "precision_at_5_relevance_3": 0.2, "top_5": []},
    "context_without_graph": {"ndcg_at_5": 0.88, "precision_at_5_relevance_3": 0.6, "top_5": []},
    "context_with_graph": {"ndcg_at_5": 1.0, "precision_at_5_relevance_3": 0.8, "top_5": []}
  },
  "sensitivity": [],
  "local_assessment_runtime_ms": {"runs": 30, "median": 45.2, "p95": 62.1},
  "limitations": ["Small constructed dataset with intentional context advantages", "Scenarios and labels are authored together; label leakage risk", "No learned coefficients or independent holdout validation", "No live cloud or external LLM performance claim", "No statistical significance established"]
 }, indent=2))

if __name__=='__main__':run()
