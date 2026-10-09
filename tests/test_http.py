import json,threading,tempfile,unittest,urllib.request,urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer
from app.server import Application,Handler
from app.core import ROOT
class HttpTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.tmp=tempfile.TemporaryDirectory();cls.app=Application('demo',ROOT/'config/clouds.example.json',Path(cls.tmp.name)/'http.sqlite')
  cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler);cls.port=cls.server.server_address[1]
  cls.server.app=cls.app;cls.server.allowed_hosts={f'127.0.0.1:{cls.port}'};cls.server.api_token=''
  cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.app.store.db.close();cls.tmp.cleanup()
 def request(self,path,body=None,headers=None):
  h=headers or {};data=None
  if body is not None:data=json.dumps(body).encode();h={'Content-Type':'application/json',**h}
  req=urllib.request.Request(f'http://127.0.0.1:{self.port}'+path,data=data,headers=h)
  return urllib.request.urlopen(req,timeout=5)
 def test_static_dashboard(self):
  with self.request('/') as r:self.assertIn(b'Cloud posture research',r.read());self.assertIn("frame-ancestors 'none'",r.headers['Content-Security-Policy'])
 def test_health(self):
  with self.request('/api/health') as r:self.assertTrue(json.load(r)['audit_valid'])
 def test_cross_origin_rejected(self):
  with self.assertRaises(urllib.error.HTTPError) as e:self.request('/api/state',headers={'Origin':'https://evil.example'})
  self.assertEqual(e.exception.code,403)
 def test_host_rebinding_rejected(self):
  with self.assertRaises(urllib.error.HTTPError) as e:self.request('/api/state',headers={'Host':'evil.example'})
  self.assertEqual(e.exception.code,403)
 def test_mutation_requires_session(self):
  with self.assertRaises(urllib.error.HTTPError) as e:self.request('/api/scan',{})
  self.assertEqual(e.exception.code,403)
 def test_valid_scan(self):
  with self.request('/api/scan',{},headers={'X-Session-Token':self.app.csrf}) as r:self.assertEqual(json.load(r)['source'],'demo')
 def test_export_no_keys(self):
  with self.request('/api/export.json') as r:
   raw=r.read();self.assertIn(b'findings',raw);self.assertNotIn(b'AWS_SECRET_ACCESS_KEY',raw)
 def test_invalid_body(self):
  with self.assertRaises(urllib.error.HTTPError) as e:self.request('/api/brief',[],headers={'X-Session-Token':self.app.csrf})
  self.assertEqual(e.exception.code,400)
if __name__=='__main__':unittest.main()
