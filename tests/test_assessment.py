import copy,json,tempfile,unittest
from datetime import datetime,timezone,timedelta
from pathlib import Path
from app.core import ROOT,assess,load_json,simulate,validate_snapshot,attack_paths
from app.identity import review
from app.store import Store
from app.agent import brief
from app.connectors.common import Collector,CollectionError
from app.connectors.aws import admin_rule as aws_admin
from app.connectors.azure import admin_rule as azure_admin
from app.connectors.gcp import admin_rule as gcp_admin
T=datetime(2026,10,7,12,tzinfo=timezone.utc)
class AssessmentTests(unittest.TestCase):
 def setUp(self):self.s=load_json(ROOT/'fixtures/demo.json');self.p=load_json(ROOT/'config/policies.json')
 def test_multicloud_domains(self):
  a=assess(self.s,reference_time=T)
  self.assertEqual({r['provider'] for r in a['resources']},{'aws','azure','gcp'})
  self.assertEqual({f['domain'] for f in a['findings']},{'Configuration','Identity','Workload','Exposure','Compliance evidence'})
  self.assertEqual(len(a['paths']),3)
 def test_unknown_coverage(self):
  a=assess(self.s,reference_time=T);c=a['summary']['checks']
  self.assertEqual(c['unknown'],18)
  self.assertEqual(a['summary']['coverage_percent'],round(100*(c['passed']+c['failed'])/sum(c.values()),1))
 def test_score_contributions(self):
  for f in assess(self.s,reference_time=T)['findings']:
   self.assertAlmostEqual(f['risk']['value'],round(sum(f['risk']['contributions'].values()),2));self.assertTrue(0<=f['risk']['value']<=100)
 def test_monotonic_exposure_and_impact(self):
  low=copy.deepcopy(self.s);low['resources'][0]['attributes'].update(internet_reachable=False,criticality=0,sensitivity=0,kev=False)
  def v(s):return next(f['risk']['value'] for f in assess(s,reference_time=T)['findings'] if f['rule_id']=='WRK001' and f['resource_id']=='aws:web')
  self.assertGreater(v(self.s),v(low))
 def test_unknown_confidence(self):
  self.s['resources'][0]['attributes']['criticality']=None
  f=next(f for f in assess(self.s,reference_time=T)['findings'] if f['resource_id']=='aws:web' and f['rule_id']=='WRK001')
  self.assertEqual(f['risk']['confidence'],'limited');self.assertIn('business criticality',f['risk']['unknown_context'])
 def test_stale(self):
  for r in self.s['resources']:r['observed_at']=(T-timedelta(days=3)).isoformat()
  a=assess(self.s,reference_time=T);self.assertTrue(all(f['risk']['stale'] for f in a['findings']));self.assertTrue(all(p['confidence']=='limited' for p in a['paths']))
 def test_incomplete_logs_abstain(self):
  r=next(r for r in self.s['resources'] if r['id']=='aws:user');r['attributes']['telemetry_complete']=False
  a=assess(self.s,reference_time=T);self.assertFalse(any(f['resource_id']==r['id'] and f['rule_id']=='IAM003' for f in a['findings']))
  self.assertEqual(next(c['status'] for c in a['checks'] if c['resource_id']==r['id'] and c['rule_id']=='IAM003'),'unknown')
 def test_unverified_no_paths(self):
  for e in self.s['edges']:e['verified']=False
  self.assertEqual(attack_paths(self.s),[])
 def test_public_ip_not_reachability(self):
  for r in self.s['resources']:
   if r['kind']=='workload':r['attributes']['internet_reachable']=None;r['attributes']['has_public_ip']=True
  self.assertEqual(attack_paths(self.s),[])
 def test_unknown_sensitivity(self):
  for r in self.s['resources']:
   if r['kind']=='storage':r['attributes']['sensitivity']=None
  self.assertEqual(attack_paths(self.s),[])
 def test_cycle_bounded(self):
  self.s['edges'].append({'from':'aws:service','to':'aws:service','type':'assumes','verified':True,'evidence':'fixture'});self.assertEqual(len(attack_paths(self.s)),3)
 def test_missing_edge_evidence_rejected(self):
  self.s['edges'][0]['evidence']=''
  with self.assertRaises(ValueError):validate_snapshot(self.s)
 def test_unknown_node_rejected(self):
  self.s['edges'][0]['to']='missing'
  with self.assertRaises(ValueError):validate_snapshot(self.s)
 def test_duplicate_rejected(self):
  self.s['resources'].append(self.s['resources'][0])
  with self.assertRaises(ValueError):validate_snapshot(self.s)
 def test_boolean_type_rejected(self):
  self.s['resources'][0]['attributes']['exploitable']='false'
  with self.assertRaises(ValueError):validate_snapshot(self.s)
 def test_nan_rejected(self):
  self.s['resources'][0]['attributes']['criticality']=float('nan')
  with self.assertRaises(ValueError):validate_snapshot(self.s)
 def test_invalid_weights(self):
  self.p['weights']['severity']=.7
  with self.assertRaises(ValueError):assess(self.s,self.p)
 def test_negative_weights(self):
  self.p['weights']['path']=-.1;self.p['weights']['severity']=.5
  with self.assertRaises(ValueError):assess(self.s,self.p)
 def test_simulation_immutable(self):
  initial=json.dumps(self.s,sort_keys=True);a=assess(self.s);f=next(f for f in a['findings'] if f['resource_id']=='aws:web' and f['rule_id']=='WRK001')
  r=simulate(self.s,[f['id']]);self.assertEqual(r['paths_removed'],1);self.assertEqual(json.dumps(self.s,sort_keys=True),initial)
 def test_manual_review_not_simulated(self):
  f=next(f for f in assess(self.s)['findings'] if f['rule_id']=='IAM003')
  with self.assertRaises(ValueError):simulate(self.s,[f['id']])
 def test_unknown_finding(self):
  with self.assertRaises(ValueError):simulate(self.s,['unknown'])
 def test_brief_grounding(self):
  a=assess(self.s);r=brief(a);self.assertTrue({i['finding_id'] for i in r['items']}<={f['id'] for f in a['findings']});self.assertIn('deterministic',r['mode'])
 def test_ai_explicit_external_processing(self):
  with self.assertRaises(ValueError):brief(assess(self.s),config={'ai':{'enabled':True}})
 def test_null_cvss(self):
  self.s['resources'][0]['attributes']['cvss']=None;self.assertTrue(assess(self.s)['findings'])
class ConnectorTests(unittest.TestCase):
 def test_permission_pattern_expansion(self):
  r=review(['Microsoft.Storage/*'],['*/delete'],['microsoft.storage/read'],['Microsoft.Storage/read','Microsoft.Storage/write','Microsoft.Storage/delete'],True)
  self.assertEqual(r['unobserved_candidates'],['Microsoft.Storage/write'])
 def test_incomplete_catalog_abstains(self):self.assertEqual(review(['*'],[],[],['op/read'],False)['unobserved_candidates'],[])
 def test_aws_ipv6_all_protocol(self):self.assertTrue(aws_admin([{'IpProtocol':'-1','Ipv6Ranges':[{'CidrIpv6':'::/0'}]}]))
 def test_aws_private_not_broad(self):self.assertFalse(aws_admin([{'IpProtocol':'tcp','FromPort':22,'ToPort':22,'IpRanges':[{'CidrIp':'10.0.0.0/8'}]}]))
 def test_azure_range(self):self.assertTrue(azure_admin([{'properties':{'access':'Allow','direction':'Inbound','protocol':'Tcp','sourceAddressPrefix':'Internet','destinationPortRange':'20-25'}}]))
 def test_azure_deny(self):self.assertFalse(azure_admin([{'properties':{'access':'Deny','direction':'Inbound','protocol':'*','sourceAddressPrefix':'*','destinationPortRange':'*'}}]))
 def test_gcp_disabled(self):self.assertFalse(gcp_admin({'disabled':True,'allowed':[{'IPProtocol':'all'}],'sourceRanges':['0.0.0.0/0']}))
 def test_gcp_tags_not_internet(self):self.assertFalse(gcp_admin({'sourceTags':['bastion'],'allowed':[{'IPProtocol':'tcp','ports':['22']}]}))
 def test_gcp_default_source(self):self.assertTrue(gcp_admin({'allowed':[{'IPProtocol':'tcp','ports':['22']}]}))
 def test_partial_failure_redacted(self):
  c=Collector('aws',{},{} )
  def bad():c.add('a','x','x','storage',{},'fixture');raise RuntimeError('TOKEN_DO_NOT_LEAK')
  c.stage('storage',bad);self.assertEqual(c.coverage[0]['status'],'partial');self.assertNotIn('TOKEN_DO_NOT_LEAK',str(c.coverage))
 def test_url_host_allowlist(self):
  with self.assertRaises(CollectionError):Collector('gcp',{},{}).get('https://evil.example/page','SECRET',{'storage.googleapis.com'})
class StoreTests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'test.sqlite');self.s=load_json(ROOT/'fixtures/demo.json');self.a=assess(self.s);self.scan=self.store.add_scan(self.s,self.a)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def test_decision_persist_chain(self):
  self.store.decision(self.scan,self.a['findings'][0]['id'],'deferred','Owner review');self.assertEqual(self.store.state()['findings'][0]['decision']['state'],'deferred');self.assertTrue(self.store.verify_audit())
 def test_stale_scan_rejected(self):
  self.store.add_scan(self.s,self.a)
  with self.assertRaises(ValueError):self.store.decision(self.scan,self.a['findings'][0]['id'],'open','')
 def test_tamper_detected(self):
  self.store.db.execute("UPDATE audit SET event='tampered' WHERE id=1");self.store.db.commit();self.assertFalse(self.store.verify_audit())
 def test_decision_not_detection_resolution(self):
  self.store.decision(self.scan,self.a['findings'][0]['id'],'accepted_for_planning','Plan');self.assertEqual(len(self.store.state()['findings']),len(self.a['findings']))
if __name__=='__main__':unittest.main()
