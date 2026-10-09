"""Optional read-only Azure Logs query. Preserves unmapped callers and incomplete coverage."""
import argparse,json,sys,urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
import datetime
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def env_file(path): pass
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None

p=argparse.ArgumentParser();p.add_argument('--workspace-id',default='demo-workspace');p.add_argument('--output',default='azure-output.json');args=p.parse_args()
env_file(ROOT/'.env')
from azure.identity import DefaultAzureCredential
cred=DefaultAzureCredential(exclude_interactive_browser_credential=True)
try:
 token=cred.get_token('https://api.loganalytics.io/.default').token
 query=(ROOT/'config/azure_activity.kql').read_text()
 from urllib.parse import quote
 request=urllib.request.Request('https://api.loganalytics.azure.com/v1/workspaces/'+quote(args.workspace_id,safe='')+'/query',data=json.dumps({'query':query,'timespan':'P90D'}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
 with urllib.request.build_opener(NoRedirect()).open(request,timeout=45) as response:data=json.load(response)
 records=[]
 for table in data.get('tables',[]):
  cols=[c['name'] for c in table['columns']];records.extend(dict(zip(cols,row)) for row in table['rows'])
 result={'collected_at':now(),'source':'Azure Log Analytics AzureActivity query','telemetry_complete':False,
         'records':records,'partial_error':bool(data.get('error')),
         'limitations':['Caller values require directory object resolution','Data-plane logs require separate diagnostic exports','Retention and missing ingestion periods must be independently verified','Activity logs do not prove complete observation of every permission']}
 Path(args.output).write_text(json.dumps(result,indent=2));print(f'Wrote {len(records)} activity groups; coverage remains incomplete until independently verified.')
except urllib.error.HTTPError as e:
 if e.code == 404 and args.workspace_id == 'demo-workspace':
  result={'collected_at':now(),'source':'Azure Log Analytics AzureActivity query','telemetry_complete':False,
          'records':[],'partial_error':True,
          'limitations':['Default demo-workspace not found. Configure a real Log Analytics Workspace ID for live telemetry.']}
  Path(args.output).write_text(json.dumps(result,indent=2));print('Simulated empty collection for unconfigured workspace.')
  sys.exit(0)
 else:
  print('Azure Logs collection failed. Verify identity, workspace ID, permissions, diagnostic settings and retention. No tokens are logged.',file=sys.stderr);sys.exit(1)
except Exception as e:
 print('Azure Logs collection failed. Verify identity, workspace ID, permissions, diagnostic settings and retention. No tokens are logged.',file=sys.stderr);sys.exit(1)
finally:cred.close()
