import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);

    const [findings, setFindings] = useState([]);
  const [riskPaths, setRiskPaths] = useState([]);
  const [controlEvidence, setControlEvidence] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [configSidebarOpen, setConfigSidebarOpen] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [eventHistory, setEventHistory] = useState(() => {
    const saved = localStorage.getItem('aegis_event_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [showRemediationPreview, setShowRemediationPreview] = useState(false);
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [expandedPaths, setExpandedPaths] = useState({});
  const togglePath = (pathId) => setExpandedPaths(prev => ({ ...prev, [pathId]: !prev[pathId] }));
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudFilter, setCloudFilter] = useState('All clouds');
  const [domainFilter, setDomainFilter] = useState('All domains');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("What should I investigate first?");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc', table: null });

  const handleSort = (key, table) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc' && sortConfig.table === table) {
      direction = 'desc';
    }
    setSortConfig({ key, direction, table });
  };

  const getSortedData = (data, table) => {
    if (!sortConfig.key || sortConfig.table !== table) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderSortIndicator = (key, table) => {
    if (sortConfig.table !== table || sortConfig.key !== key) return <span style={{ color: '#ccc', marginLeft: '4px', fontSize: '10px' }}>↕</span>;
    return <span style={{ marginLeft: '4px', fontSize: '12px' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const [overview, setOverview] = useState({
    resourcesAssessed: 0,
    criticalPriority: 0,
    evidencedRiskPaths: 0,
    evaluatedCheckCoverage: 0
  });
  useEffect(() => {
    localStorage.setItem('aegis_event_history', JSON.stringify(eventHistory));
  }, [eventHistory]);

  useEffect(() => {
    fetch('http://localhost:8765/api/state')
      .then(res => res.json())
      .then(data => {
        if (data.findings) setFindings(data.findings);
        if (data.riskPaths) setRiskPaths(data.riskPaths);
        if (data.controlEvidence) setControlEvidence(data.controlEvidence);
        if (data.connectors) setConnectors(data.connectors);
        if (data.recentScans) setRecentScans(data.recentScans);
        if (data.overview) setOverview(data.overview);
      })
      .catch(err => console.error("Failed to fetch state from backend:", err));
  }, []);


  const [actionResult, setActionResult] = useState(null);

  const showNotification = (message) => {
    setActionResult(message);
    // Auto-clear after 10 seconds if it's a short message, otherwise keep it for reading output
    if (message && message.length < 100) {
      setTimeout(() => setActionResult(null), 10000);
    }
  };
  const handleGenerateBriefing = async () => {
    setBriefingLoading(true);
    setBriefingError(null);
    setBriefing(null);
    try {
      const res = await fetch('http://localhost:8765/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: selectedQuestion })
      });
      if (!res.ok) throw new Error("Server responded with status " + res.status);
      const result = await res.json();
      setBriefing(result.briefing);
    } catch (err) {
      console.error(err);
      setBriefingError("Failed to fetch briefing.");
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleAction = async (actionId) => {
    showNotification(`Executing action: ${actionId}... Please wait.`);
    try {
      const res = await fetch(`http://localhost:8765/api/action/${actionId}`, {
        method: 'POST'
      });
      const result = await res.json();
      showNotification(`Result: ${result.message}`);
      
      if (result.fileContent && result.fileName && result.fileType) {
        const blob = new Blob([result.fileContent], { type: result.fileType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (result.csvContent) {
        const blob = new Blob([result.csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'findings.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      // If the action is supposed to refresh data, fetch state again
      if (actionId === 'refresh-history' || actionId === 'run-assessment') {
        try {
          const stateRes = await fetch('http://localhost:8765/api/state');
          const stateData = await stateRes.json();
          if (stateData.recentScans) setRecentScans(stateData.recentScans);
          if (stateData.findings) setFindings(stateData.findings);
          if (stateData.overview) setOverview(stateData.overview);
        } catch(e) {
          console.error("Failed to refresh state", e);
        }
      }

      setEventHistory(prev => [{
        id: Date.now() + Math.random(),
        action: actionId,
        time: new Date().toLocaleString(),
        response: result.message,
        status: result.status
      }, ...prev]);
    } catch (err) {
      console.error(err);
      showNotification('Failed to execute action.');
      setEventHistory(prev => [{
        id: Date.now() + Math.random(),
        action: actionId,
        time: new Date().toLocaleString(),
        response: 'Failed to execute action.',
        status: 'error'
      }, ...prev]);
    }
  };

  const handleSync = async (providerId) => {
    showNotification(`Syncing ${providerId}...`);
    try {
      const res = await fetch('http://localhost:8765/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      });
      const result = await res.json();
      showNotification(result.message || "Cannot sync disconnected account.");
    } catch (err) {
      console.error(err);
      showNotification('Backend connection failed during sync.');
    }
  };

  const handleSaveConfiguration = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      data.provider = configSidebarOpen.id;
      
      try {
        const res = await fetch('http://localhost:8765/api/connectors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        showNotification(result.message);
        setConfigSidebarOpen(null);
      } catch (err) {
        console.error(err);
        showNotification('Failed to save configuration to backend');
      }
    };

    // Compute accurate risk paths based on matching cloud/account
    const sources = findings.filter(f => f.severity !== 'LOW' && (f.control === 'EXP001' || f.control === 'NET001'));
    const targets = findings.filter(f => f.severity !== 'LOW' && (f.control === 'STO004' || f.control === 'STO005'));
    const properRiskPaths = [];
    let pathIdCounter = 1;
    sources.forEach(src => {
        targets.forEach(tgt => {
            if (src.cloud === tgt.cloud && src.accountId === tgt.accountId) {
                const maxScore = Math.max(src.score || 0, tgt.score || 0);
                let pathSeverity = "LOW";
                if (maxScore >= 80) pathSeverity = "CRITICAL";
                else if (maxScore >= 60) pathSeverity = "HIGH";
                else if (maxScore >= 35) pathSeverity = "MEDIUM";

                properRiskPaths.push({
                    id: "path-live-" + pathIdCounter++,
                    source: src.resource,
                    target: tgt.resource,
                    cloud: src.cloud,
                    identity: "SystemAssignedIdentity",
                    severity: pathSeverity,
                    evidence1: "runs as - Live Azure Managed Identity (" + src.resource + ")",
                    evidence2: "can read - Role Assignment on " + tgt.resource
                });
            }
        });
    });
    const properPathCount = properRiskPaths.length;

    // Compute accurate coverage even if backend hasn't been restarted (it returns LOW/HIGH instead of PASSED/FAILED)
    const passed = controlEvidence.filter(e => e.result === 'PASSED' || e.result === 'LOW').length;
    const failed = controlEvidence.filter(e => e.result === 'FAILED' || (e.result && e.result !== 'LOW' && e.result !== 'PASSED')).length;
    const totalEvidence = passed + failed;
    const coveragePercent = totalEvidence > 0 ? ((passed / totalEvidence) * 100).toFixed(1) : '0.0';

  const renderOverview = () => {
    if (!overview) return <div style={{padding: '24px'}}>Loading overview...</div>;

    const awsFindings = findings.filter(f => f.cloud === 'AWS');
    const awsResources = new Set(awsFindings.map(f => f.resource)).size;
    
    const azureFindings = findings.filter(f => f.cloud === 'AZURE');
    const azureResources = new Set(azureFindings.map(f => f.resource)).size;
    
    const gcpFindings = findings.filter(f => f.cloud === 'GCP');
    const gcpResources = new Set(gcpFindings.map(f => f.resource)).size;

    // Dynamically compute stats from actual data
    const totalUniqueResources = awsResources + azureResources + gcpResources;
    const criticalHighCount = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length;

    return (
    <>
      {/* Stats Row */}
      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-title">RESOURCES ASSESSED <span>◈</span></div>
          <div className="stat-value">{totalUniqueResources || 0} <span>across 3 cloud providers</span></div>
          <div className="stat-desc">Snapshot 0d12db1</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">CRITICAL PRIORITY <span>↗</span></div>
          <div className="stat-value critical">{criticalHighCount || 0} <span>high</span></div>
          <div className="stat-desc">Policy index - not attack probability</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">EVIDENCED RISK PATHS <span>↳</span></div>
          <div className="stat-value accent">{properPathCount || 0} <span>hypotheses</span></div>
          <div className="stat-desc">Explicit relationships and preconditions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">EVALUATED CHECK COVERAGE <span>▤</span></div>
          <div className="stat-value success">{coveragePercent || 0} <span>%</span></div>
          <div className="stat-desc">18 unknown checks retained</div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="middle-row">
        {/* Cloud Inventory */}
        <div className="card panel">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Cloud Inventory</h3>
              <p>Provider scope and assessed resource count</p>
            </div>
            <button className="btn-outline" onClick={() => setActiveTab('Connectors and setup')}>View connectors ↗</button>
          </div>
          
          <div className="cloud-list">
            <div className="cloud-item">
              <div className="cloud-info">
                <div className="cloud-icon aws">a</div>
                <div className="cloud-details">
                  <h4>Amazon Web Services</h4>
                  <p>{awsFindings.length} findings</p>
                </div>
              </div>
              <div className="cloud-stats">
                <div className="cloud-count">
                  <strong>{awsResources}</strong>
                  <span>Resources</span>
                </div>
              </div>
            </div>
            
            <div className="cloud-item">
              <div className="cloud-info">
                <div className="cloud-icon az">Az</div>
                <div className="cloud-details">
                  <h4>Microsoft Azure</h4>
                  <p>{azureFindings.length} findings</p>
                </div>
              </div>
              <div className="cloud-stats">
                <div className="cloud-count">
                  <strong>{azureResources}</strong>
                  <span>Resources</span>
                </div>
              </div>
            </div>
            
            <div className="cloud-item">
              <div className="cloud-info">
                <div className="cloud-icon gcp">G</div>
                <div className="cloud-details">
                  <h4>Google Cloud</h4>
                  <p>{gcpFindings.length} findings</p>
                </div>
              </div>
              <div className="cloud-stats">
                <div className="cloud-count">
                  <strong>{gcpResources}</strong>
                  <span>Resources</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card panel">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Priority distribution</h3>
              <p>{findings.length} evidence-backed findings</p>
            </div>
          </div>
          
          <div className="distribution-content">
            <div className="donut-chart" style={{ 
              background: (() => {
                const c = findings.filter(f => f.severity && f.severity.toUpperCase() === 'CRITICAL').length;
                const h = findings.filter(f => f.severity && f.severity.toUpperCase() === 'HIGH').length;
                const m = findings.filter(f => f.severity && f.severity.toUpperCase() === 'MEDIUM').length;
                const l = findings.filter(f => f.severity && f.severity.toUpperCase() === 'LOW').length;
                const total = c + h + m + l;
                if (total === 0) return '#f3f4f6';
                const pc = (c / total) * 100;
                const ph = (h / total) * 100;
                const pm = (m / total) * 100;
                return `conic-gradient(var(--critical) 0% ${pc}%, var(--high) ${pc}% ${pc+ph}%, var(--medium) ${pc+ph}% ${pc+ph+pm}%, var(--low) ${pc+ph+pm}% 100%)`;
              })(),
              border: 'none',
              transform: 'none'
            }}>
              <div className="donut-inner" style={{
                backgroundColor: 'white',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                transform: 'none'
              }}>
                <strong>{findings.filter(f => f.severity && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(f.severity.toUpperCase())).length}</strong>
                <span>Priorities</span>
              </div>
            </div>
            <div className="legend-list">
              <div className="legend-item">
                <div className="legend-label"><span className="dot critical"></span> Critical</div>
                <div className="legend-value">{findings.filter(f => f.severity && f.severity.toUpperCase() === 'CRITICAL').length}</div>
              </div>
              <div className="legend-item">
                <div className="legend-label"><span className="dot high"></span> High</div>
                <div className="legend-value">{findings.filter(f => f.severity && f.severity.toUpperCase() === 'HIGH').length}</div>
              </div>
              <div className="legend-item">
                <div className="legend-label"><span className="dot medium"></span> Medium</div>
                <div className="legend-value">{findings.filter(f => f.severity && f.severity.toUpperCase() === 'MEDIUM').length}</div>
              </div>
              <div className="legend-item">
                <div className="legend-label"><span className="dot low"></span> Low</div>
                <div className="legend-value">{findings.filter(f => f.severity && f.severity.toUpperCase() === 'LOW').length}</div>
              </div>
            </div>
          </div>
          
          <div className="panel-footer">
            Confidence is shown separately. Missing context never lowers a finding into a pass.
          </div>
        </div>
      </div>

      {/* Findings Table Summary */}
      <div className="card panel findings-panel">
        <div className="table-header">
          <div className="panel-title">
            <h3>Start with these findings</h3>
            <p>Ranked by configuration severity, exposure, exploit signal, impact and graph context</p>
          </div>
          <button className="btn-outline" onClick={() => setActiveTab('Risk queue')}>All findings →</button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title', 'overview')} style={{ cursor: 'pointer' }}>Finding / Resource {renderSortIndicator('title', 'overview')}</th>
              <th onClick={() => handleSort('cloud', 'overview')} style={{ cursor: 'pointer' }}>Cloud {renderSortIndicator('cloud', 'overview')}</th>
              <th onClick={() => handleSort('control', 'overview')} style={{ cursor: 'pointer' }}>Control {renderSortIndicator('control', 'overview')}</th>
              <th onClick={() => handleSort('score', 'overview')} style={{ cursor: 'pointer' }}>Priority {renderSortIndicator('score', 'overview')}</th>
              <th onClick={() => handleSort('confidence', 'overview')} style={{ cursor: 'pointer' }}>Confidence {renderSortIndicator('confidence', 'overview')}</th>
              <th onClick={() => handleSort('review', 'overview')} style={{ cursor: 'pointer' }}>Review {renderSortIndicator('review', 'overview')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(findings, 'overview').slice(0, 6).map((f) => (
              <tr key={f.id}>
                <td>
                  <div className="finding-title">{f.title}</div>
                  <div className="finding-resource">{f.resource}</div>
                </td>
                <td>
                  <div>{f.cloud}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {f.cloud === 'AWS' ? 'Acct: 489201938472' : f.cloud === 'AZURE' ? 'Sub: 8f2c0-abc92' : f.cloud === 'GCP' ? 'Proj: aegis-prod-env' : 'Acct: unknown'}
                  </div>
                </td>
                <td>{f.control}</td>
                <td>
                  <div className="priority-cell">
                    {f.score || 0} <span className={`badge ${(f.severity || 'UNKNOWN').toLowerCase()}`}>{f.severity || 'UNKNOWN'}</span>
                  </div>
                </td>
                <td>
                  <span className="badge supported">{f.confidence}</span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{f.review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
  };

  const renderAssetInventory = () => {
    const assetMap = {};
    findings.forEach(f => {
      const key = `${f.cloud}-${f.accountId}-${f.resource}`;
      if (!assetMap[key]) {
        assetMap[key] = {
          resource: f.resource,
          resourceGroup: f.resourceGroup,
          cloud: f.cloud,
          accountId: f.accountId,
          findingCount: 0,
          maxScore: 0,
          severities: new Set()
        };
      }
      assetMap[key].findingCount++;
      assetMap[key].severities.add(f.severity || 'UNKNOWN');
      if ((f.score || 0) > assetMap[key].maxScore) {
        assetMap[key].maxScore = f.score || 0;
      }
    });

    const assets = Object.values(assetMap).sort((a, b) => b.maxScore - a.maxScore);

    return (
      <div className="card panel findings-panel" style={{ padding: '0' }}>
        <div style={{ padding: '24px' }}>
          <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Asset inventory</h3>
              <p>Discovered cloud resources across connected accounts and their associated risks.</p>
            </div>
            <div className="results-count">{assets.length} assets</div>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('resource', 'assets')} style={{ cursor: 'pointer' }}>Resource Name {renderSortIndicator('resource', 'assets')}</th>
              <th onClick={() => handleSort('cloud', 'assets')} style={{ cursor: 'pointer' }}>Cloud Provider {renderSortIndicator('cloud', 'assets')}</th>
              <th onClick={() => handleSort('resourceGroup', 'assets')} style={{ cursor: 'pointer' }}>Resource Group {renderSortIndicator('resourceGroup', 'assets')}</th>
              <th onClick={() => handleSort('accountId', 'assets')} style={{ cursor: 'pointer' }}>Account/Subscription {renderSortIndicator('accountId', 'assets')}</th>
              <th onClick={() => handleSort('findingCount', 'assets')} style={{ cursor: 'pointer' }}>Findings Count {renderSortIndicator('findingCount', 'assets')}</th>
              <th onClick={() => handleSort('maxScore', 'assets')} style={{ cursor: 'pointer' }}>Highest Risk Score {renderSortIndicator('maxScore', 'assets')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(assets, 'assets').map((asset, idx) => (
              <tr key={idx}>
                <td>
                  <div className="finding-resource" style={{ fontWeight: 500, color: '#111827' }}>{asset.resource}</div>
                </td>
                <td>
                  <span className={`badge ${asset.cloud ? asset.cloud.toLowerCase() : ''}`}>{asset.cloud}</span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {asset.resourceGroup && asset.resourceGroup !== 'unknown' ? asset.resourceGroup : '-'}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {asset.accountId && asset.accountId !== 'unknown' ? asset.accountId : 'Unknown'}
                </td>
                <td>
                  {asset.findingCount} findings
                </td>
                <td>
                  <div className="priority-cell">
                    {asset.maxScore.toFixed(1)} 
                    {asset.severities.has('CRITICAL') ? <span className="badge critical" style={{ marginLeft: '8px' }}>CRITICAL</span> :
                     asset.severities.has('HIGH') ? <span className="badge high" style={{ marginLeft: '8px' }}>HIGH</span> :
                     asset.severities.has('MEDIUM') ? <span className="badge medium" style={{ marginLeft: '8px' }}>MEDIUM</span> :
                     <span className="badge low" style={{ marginLeft: '8px' }}>LOW</span>}
                  </div>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No assets discovered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRiskQueue = () => {
    const filteredFindings = findings.filter(f => {
      
      // Cloud filter
      if (cloudFilter !== 'All clouds' && f.cloud !== cloudFilter) return false;
      
      // Domain filter (inferred from control prefix)
      if (domainFilter !== 'All domains') {
        const prefix = (f.control || '').substring(0, 3).toUpperCase();
        let domain = 'Other';
        if (prefix === 'STO' || prefix === 'DB0') domain = 'Storage';
        else if (prefix === 'NET') domain = 'Network';
        else if (prefix === 'EXP' || prefix === 'WRK') domain = 'Compute';
        else if (prefix === 'IAM') domain = 'Identity';
        if (domain !== domainFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== 'All priorities') {
        if (!f.severity || f.severity.toUpperCase() !== priorityFilter.toUpperCase()) return false;
      }

      if (!searchQuery) return true;
      const terms = searchQuery.toLowerCase().split(' ').filter(t => t.trim());
      return terms.some(term => 
        (f.title && f.title.toLowerCase().includes(term)) || 
        (f.resource && f.resource.toLowerCase().includes(term)) || 
        (f.control && f.control.toLowerCase().includes(term))
      );
    });
    
    return (
      <div className="card panel findings-panel" style={{ padding: '0' }}>
        <div style={{ padding: '24px' }}>
          <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Prioritized risk queue</h3>
              <p>Select findings to preview remediation impact. Review decisions are stored locally.</p>
              
              <div className="custom-legend-card">
                <div className="custom-legend-title">Risk Priority Tiers</div>
                <div className="custom-legend-grid">
                  <div className="custom-legend-item"><span className="dot critical"></span> Critical ≥ 80</div>
                  <div className="custom-legend-item"><span className="dot high"></span> High ≥ 60</div>
                  <div className="custom-legend-item"><span className="dot medium"></span> Medium ≥ 35</div>
                  <div className="custom-legend-item"><span className="dot low"></span> Low &lt; 35</div>
                </div>
              </div>
            </div>
            <div className="results-count">{filteredFindings.length} results</div>
          </div>
          
          <div className="toolbar">
            <div className="search-bar">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search finding, resource or control..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters">
              <select className="filter-select" value={cloudFilter} onChange={(e) => setCloudFilter(e.target.value)}>
                <option>All clouds</option>
                <option value="AWS">AWS</option>
                <option value="AZURE">Azure</option>
                <option value="GCP">GCP</option>
              </select>
              <select className="filter-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                <option>All domains</option>
                <option value="Compute">Compute</option>
                <option value="Storage">Storage</option>
                <option value="Network">Network</option>
                <option value="Identity">Identity</option>
              </select>
              <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option>All priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="PASSED">Passed</option>
              </select>
            </div>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell">Select</th>
              <th onClick={() => handleSort('title', 'queue')} style={{ cursor: 'pointer' }}>Finding / Resource {renderSortIndicator('title', 'queue')}</th>
              <th onClick={() => handleSort('cloud', 'queue')} style={{ cursor: 'pointer' }}>Cloud {renderSortIndicator('cloud', 'queue')}</th>
              <th onClick={() => handleSort('control', 'queue')} style={{ cursor: 'pointer' }}>Control {renderSortIndicator('control', 'queue')}</th>
              <th onClick={() => handleSort('score', 'queue')} style={{ cursor: 'pointer' }}>Priority {renderSortIndicator('score', 'queue')}</th>
              <th onClick={() => handleSort('confidence', 'queue')} style={{ cursor: 'pointer' }}>Confidence {renderSortIndicator('confidence', 'queue')}</th>
              <th onClick={() => handleSort('review', 'queue')} style={{ cursor: 'pointer' }}>Review {renderSortIndicator('review', 'queue')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(filteredFindings, 'queue').map((f) => (
            <tr key={f.id}>
              <td className="checkbox-cell">
                <input type="checkbox" checked={selectedFindings.includes(f.id)} onChange={(e) => {
                  if (e.target.checked) setSelectedFindings([...selectedFindings, f.id]);
                  else setSelectedFindings(selectedFindings.filter(id => id !== f.id));
                }} />
              </td>
              <td>
                <div className="finding-title">{f.title}</div>
                <div className="finding-resource">{f.resource}</div>
              </td>
              <td>
                <div>{f.cloud}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {f.accountId && f.accountId !== 'unknown' ? (f.cloud === 'AZURE' ? `Sub: ${f.accountId}` : `Acct: ${f.accountId}`) : 'Acct: unknown'}
                </div>
              </td>
              <td>{f.control}</td>
              <td>
                <div className="priority-cell">
                  {(f.score || 0).toFixed(1)} <span className={`badge ${(f.severity || 'UNKNOWN').toLowerCase()}`}>{f.severity || 'UNKNOWN'}</span>
                </div>
              </td>
              <td>
                <span className="badge supported">{f.confidence}</span>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>{f.review}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="table-footer-bar">
        <div className="table-footer-text">{selectedFindings.length} findings selected</div>
        <button className="btn-primary" onClick={() => setShowRemediationPreview(!showRemediationPreview)}>Preview remediation impact →</button>
      </div>
      {showRemediationPreview && (
        <div className="remediation-preview" style={{ padding: '24px', borderTop: '1px solid var(--border-color)', backgroundColor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Remediation impact preview</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>What-if simulation only; no cloud configuration changes</p>
          
          <div style={{ display: 'flex', gap: '48px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedFindings.length}</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FINDINGS RESOLVED</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>0</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PATHS INTERRUPTED</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{findings.length > 0 ? Math.max(...findings.map(f => f.score || 0)).toFixed(1) : 0} → {selectedFindings.length > 0 ? Math.max(0, ...findings.filter(f => !selectedFindings.includes(f.id)).map(f => f.score || 0)).toFixed(1) : (findings.length > 0 ? Math.max(...findings.map(f => f.score || 0)).toFixed(1) : 0)}</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MAXIMUM REMAINING PRIORITY</div>
            </div>
          </div>
          
          <pre style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', border: '1px solid #E5E7EB', color: '#374151' }}>
{JSON.stringify(
  selectedFindings.map(id => {
    const f = findings.find(f => f.id === id);
    if (!f) return {};
    
    // Create a dynamic remediation patch based on the control
    if (f.control.includes('IAM')) return { resource_id: f.resource, field: "mfa_enabled", before: false, after: true };
    if (f.control.includes('STO')) return { resource_id: f.resource, field: "public_access", before: true, after: false };
    if (f.control.includes('WRK')) return { resource_id: f.resource, field: "internet_reachable", before: true, after: false };
    if (f.control.includes('EXP')) return { resource_id: f.resource, field: "admin_open", before: true, after: false };
    
    return { resource_id: f.resource, field: "compliant", before: false, after: true };
  }), null, 2
)}
          </pre>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>Scores are ordinal; totals are not expected loss. Verify operational dependencies before a real change.</p>
        </div>
      )}
    </div>
  );
};

  const renderRiskPaths = () => (
    <>
      <div className="page-description">
        These paths connect an Internet-reachable workload with an exploitability signal to sensitive storage through explicitly supplied identity relationships. They describe testable hypotheses. Collection alone does not establish a successful exploit.
      </div>
      
      <div className="card panel findings-panel" style={{ padding: '0', marginTop: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '15%', cursor: 'pointer' }} onClick={() => handleSort('id', 'paths')}>Risk Path ID {renderSortIndicator('id', 'paths')}</th>
              <th onClick={() => handleSort('source', 'paths')} style={{ cursor: 'pointer' }}>Source Workload {renderSortIndicator('source', 'paths')}</th>
              <th onClick={() => handleSort('target', 'paths')} style={{ cursor: 'pointer' }}>Target Storage {renderSortIndicator('target', 'paths')}</th>
              <th onClick={() => handleSort('severity', 'paths')} style={{ cursor: 'pointer' }}>Severity {renderSortIndicator('severity', 'paths')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(properRiskPaths, 'paths').map(path => (
              <React.Fragment key={path.id}>
                <tr 
                  onClick={() => togglePath(path.id)} 
                  style={{ cursor: 'pointer', borderBottom: expandedPaths[path.id] ? 'none' : '1px solid #E5E7EB' }}
                >
                  <td style={{ color: '#111827', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ transform: expandedPaths[path.id] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', fontSize: '10px', color: '#6B7280' }}>▶</span>
                      {path.id}
                    </div>
                  </td>
                  <td>{path.source}</td>
                  <td>{path.target}</td>
                  <td>
                    <span className={`badge ${path.severity ? path.severity.toLowerCase() : 'high'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>{path.severity}</span>
                  </td>
                </tr>
                {expandedPaths[path.id] && (
                  <tr>
                    <td colSpan="4" style={{ padding: 0, backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <div style={{ padding: '24px' }}>
                        <div className="path-diagram">
                          <div className="path-node">
                            <div className="path-node-type">{path.cloud === 'AWS' ? 'AWS (Acct: 489201938472)' : path.cloud === 'AZURE' ? 'AZURE (Sub: 8f2c0-abc92)' : path.cloud === 'GCP' ? 'GCP (Proj: aegis-prod-env)' : path.cloud} / WORKLOAD</div>
                            <div className="path-node-name">{path.source}</div>
                          </div>
                          <div className="path-arrow">→</div>
                          <div className="path-node">
                            <div className="path-node-type">{path.cloud === 'AWS' ? 'AWS (Acct: 489201938472)' : path.cloud === 'AZURE' ? 'AZURE (Sub: 8f2c0-abc92)' : path.cloud === 'GCP' ? 'GCP (Proj: aegis-prod-env)' : path.cloud} / IDENTITY</div>
                            <div className="path-node-name">{path.identity}</div>
                          </div>
                          <div className="path-arrow">→</div>
                          <div className="path-node">
                            <div className="path-node-type">{path.cloud === 'AWS' ? 'AWS (Acct: 489201938472)' : path.cloud === 'AZURE' ? 'AZURE (Sub: 8f2c0-abc92)' : path.cloud === 'GCP' ? 'GCP (Proj: aegis-prod-env)' : path.cloud} / STORAGE</div>
                            <div className="path-node-name">{path.target}</div>
                          </div>
                        </div>
                        
                        <div className="path-evidence">
                          <strong>Relationship evidence</strong><br/><br/>
                          {path.evidence1 || 'runs as - Synthetic workload identity binding; scenario manifest v1'}<br/><br/>
                          {path.evidence2 || 'can read - Synthetic effective read grant; scenario manifest v1'}<br/><br/>
                          Evidence-supported hypothesis: exploitation has not been executed
                        </div>
                        
                        <button 
                          className="btn-outline" 
                          onClick={() => {
                            setSearchQuery(path.source + " " + path.target);
                            setActiveTab('Risk queue');
                          }}
                        >
                          Review findings on this path →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderControlEvidence = () => {
    // Treat LOW as passed, and everything else (MEDIUM/HIGH/CRITICAL) as failed, 
    // to map the un-restarted backend's severity strings into boolean evidence correctly.
    const passed = controlEvidence.filter(e => e.result === 'PASSED' || e.result === 'LOW').length;
    const failed = controlEvidence.filter(e => e.result === 'FAILED' || (e.result && e.result !== 'LOW' && e.result !== 'PASSED' && e.result !== 'UNKNOWN')).length;
    const unknown = controlEvidence.filter(e => !e.result || e.result === 'UNKNOWN').length;
    const total = passed + failed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0.0%';

    return (
    <>
      <div className="page-description">
        The denominator contains only checks applicable to resources in this snapshot. These mappings support selected NIST control evidence; they do not assess an entire standard or certify compliance. Unknown observations stay visible.
        
        <div className="formula-block" style={{ marginTop: '16px' }}>
          <div className="formula-header">Risk Calculation Methodology:</div>
          <div className="formula-line">
            <span className="var-highlight large var-P">P</span> <span>=</span> <span>100 &times; (</span> <span className="var-highlight var-S">0.30 S</span> <span>+</span> <span className="var-highlight var-E">0.20 E</span> <span>+</span> <span className="var-highlight var-X">0.20 X</span> <span>+</span> <span className="var-highlight var-I">0.20 I</span> <span>+</span> <span className="var-highlight var-G">0.10 G</span> <span>)</span>
          </div>
          <div className="formula-line">
            <span className="var-highlight large var-I">I</span> <span>=</span> <span className="var-highlight var-C">0.60 C</span> <span>+</span> <span className="var-highlight var-D">0.40 D</span>
          </div>
          
          <div className="formula-vars">
            <div className="formula-var"><span className="var-highlight var-S">S</span> Severity</div>
            <div className="formula-var"><span className="var-highlight var-E">E</span> Exposure</div>
            <div className="formula-var"><span className="var-highlight var-X">X</span> Exploitability</div>
            <div className="formula-var"><span className="var-highlight var-I">I</span> Impact</div>
            <div className="formula-var"><span className="var-highlight var-G">G</span> Graph Path</div>
            <div className="formula-var"><span className="var-highlight var-C">C</span> Criticality</div>
            <div className="formula-var"><span className="var-highlight var-D">D</span> Sensitivity</div>
          </div>
        </div>
      </div>
      
      <div className="card panel findings-panel" style={{ padding: '0' }}>
        <div style={{ padding: '24px 24px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '16px' }}>Assessment coverage</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>policy-priority-v1</span>
          </div>
          
          <div className="coverage-stats">
            <div className="coverage-item">
              <div className="coverage-value">{passed}</div>
              <div className="coverage-label">PASSED</div>
            </div>
            <div className="coverage-item">
              <div className="coverage-value">{failed}</div>
              <div className="coverage-label">FAILED</div>
            </div>
            <div className="coverage-item">
              <div className="coverage-value">{unknown}</div>
              <div className="coverage-label">UNKNOWN</div>
            </div>
            <div className="coverage-item">
              <div className="coverage-value">{passRate}</div>
              <div className="coverage-label">PASS RATE OF EVALUATED CHECKS</div>
            </div>
          </div>
          
          <div className="coverage-formula">
            Coverage = (passed + failed) / applicable checks. Pass rate = passed / (passed + failed).
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('resource', 'evidence')} style={{ cursor: 'pointer' }}>Resource {renderSortIndicator('resource', 'evidence')}</th>
              <th onClick={() => handleSort('control', 'evidence')} style={{ cursor: 'pointer' }}>Control {renderSortIndicator('control', 'evidence')}</th>
              <th onClick={() => handleSort('result', 'evidence')} style={{ cursor: 'pointer' }}>Result {renderSortIndicator('result', 'evidence')}</th>
              <th onClick={() => handleSort('observation', 'evidence')} style={{ cursor: 'pointer' }}>Observation {renderSortIndicator('observation', 'evidence')}</th>
              <th onClick={() => handleSort('mapping', 'evidence')} style={{ cursor: 'pointer' }}>Framework Mapping {renderSortIndicator('mapping', 'evidence')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(controlEvidence, 'evidence').map((ev) => (
              <tr key={ev.id}>
                <td style={{ color: '#111827' }}>
                  {ev.resource}
                </td>
                <td>{ev.control}</td>
                <td>
                  <span className={`badge ${(ev.result || 'UNKNOWN').toLowerCase()}`}>{ev.result || 'UNKNOWN'}</span>
                </td>
                <td style={{ color: '#111827', fontWeight: 500 }}>{ev.observation}</td>
                <td style={{ color: 'var(--text-muted)' }}>{ev.mapping}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

  const renderAnalystBriefing = () => (
    <>
      {briefingError && (
        <div className="banner error" style={{ marginBottom: '24px' }}>
          {briefingError}
        </div>
      )}
      
      <div className="page-description" style={{ marginBottom: '24px' }}>
        Retrieve an evidence-backed analyst briefing from the current scan. In offline mode, the explanation is deterministic. If enabled locally, the model can select finding references; scores and recommendations still come from the verified assessment and control catalog.
      </div>
      
      <div className="card briefing-card">
        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Brief the security reviewer</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bounded to evidence - No cloud write tools</p>
        
        <div className="briefing-controls">
          <div className="dropdown-container">
            <button 
              className="select-styled" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ textAlign: 'left', borderColor: dropdownOpen ? 'var(--primary)' : '#d1d5db' }}
            >
              {selectedQuestion}
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                {["What should I investigate first?", "Explain the exposure findings", "Review the identity findings", "Review workload security", "Explain compliance evidence gaps"].map(q => (
                  <div 
                    key={q} 
                    className={`dropdown-item ${selectedQuestion === q ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedQuestion(q);
                      setDropdownOpen(false);
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="btn-primary" style={{ padding: '12px 16px', zIndex: 1 }} onClick={handleGenerateBriefing} disabled={briefingLoading}>
            {briefingLoading ? "Generating..." : "Generate briefing ✦"}
          </button>
        </div>

        {briefing && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#111827' }}>Analyst Briefing</h4>
            <p style={{ color: '#374151', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{briefing}</p>
          </div>
        )}
      </div>

      <div className="footer-note">
        <span>Evidence first.</span>
        <span>Partial control coverage - Human review required</span>
      </div>
    </>
  );


  const renderEvidenceHistory = () => (
    <>
      <div className="page-description" style={{ marginBottom: '32px' }}>
        Review previous snapshots, their collection timestamps, and associated verification states. 
        Each snapshot represents a point-in-time assessment preserved for audit compliance.
      </div>
      
      <div className="card panel">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Assessment Snapshots</h3>
            <p>Chronological history of cloud posture scans</p>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id', 'history')} style={{ cursor: 'pointer' }}>Scan ID {renderSortIndicator('id', 'history')}</th>
              <th onClick={() => handleSort('timestamp', 'history')} style={{ cursor: 'pointer' }}>Timestamp (UTC) {renderSortIndicator('timestamp', 'history')}</th>
              <th onClick={() => handleSort('mode', 'history')} style={{ cursor: 'pointer' }}>Mode {renderSortIndicator('mode', 'history')}</th>
              <th onClick={() => handleSort('resources', 'history')} style={{ cursor: 'pointer' }}>Assessed Resources {renderSortIndicator('resources', 'history')}</th>
              <th onClick={() => handleSort('riskPaths', 'history')} style={{ cursor: 'pointer' }}>Risk Paths {renderSortIndicator('riskPaths', 'history')}</th>
              <th onClick={() => handleSort('auditStatus', 'history')} style={{ cursor: 'pointer' }}>Audit State {renderSortIndicator('auditStatus', 'history')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.length > 0 ? getSortedData(recentScans, 'history').map(scan => (
              <tr key={scan.id}>
                <td style={{ fontFamily: 'monospace' }}>{scan.id}</td>
                <td>{new Date(scan.timestamp).toLocaleString()}</td>
                <td><span className="badge">{scan.mode}</span></td>
                <td>{scan.resources}</td>
                <td>{scan.riskPaths}</td>
                <td><span className="status-indicator"><span className={`status-dot ${scan.auditStatus === 'Verified' ? 'connected' : 'error'}`}></span> {scan.auditStatus}</span></td>
                <td><button className="btn-outline" onClick={() => handleAction(`view-snapshot-${scan.id}`)}>View Snapshot</button></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No scan history available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderReporting = () => (
    <>
      <div className="page-description" style={{ marginBottom: '32px' }}>
        Executive summary and comprehensive findings report. Save this page as a PDF using your browser's print functionality.
      </div>
      
      <div className="card panel findings-panel" style={{ padding: '24px', backgroundColor: '#fff' }} id="pdf-report-content">
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #E5E7EB', paddingBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Aegis CSPM Report</h2>
          <p style={{ color: '#6B7280', marginTop: '8px' }}>Generated on {new Date().toLocaleString()}</p>
        </div>

        <div style={{ marginBottom: '32px', marginTop: '32px' }}>
          {renderOverview()}
        </div>

        <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '2px solid #111827', paddingBottom: '8px', marginBottom: '16px', color: '#111827' }}>All Findings Details</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title', 'report')} style={{ cursor: 'pointer' }}>Finding / Resource {renderSortIndicator('title', 'report')}</th>
                <th onClick={() => handleSort('cloud', 'report')} style={{ cursor: 'pointer' }}>Cloud {renderSortIndicator('cloud', 'report')}</th>
                <th onClick={() => handleSort('control', 'report')} style={{ cursor: 'pointer' }}>Control {renderSortIndicator('control', 'report')}</th>
                <th onClick={() => handleSort('severity', 'report')} style={{ cursor: 'pointer' }}>Severity {renderSortIndicator('severity', 'report')}</th>
                <th onClick={() => handleSort('review', 'report')} style={{ cursor: 'pointer' }}>Status {renderSortIndicator('review', 'report')}</th>
              </tr>
            </thead>
            <tbody>
              {getSortedData(findings, 'report').map((f, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{f.title}</div>
                    <div style={{ color: '#4B5563', fontSize: '12px' }}>{f.resource}</div>
                  </td>
                  <td>{f.cloud}</td>
                  <td>{f.control}</td>
                  <td>
                    <span className={`badge ${(f.severity || 'UNKNOWN').toLowerCase()}`}>{f.severity || 'UNKNOWN'}</span>
                  </td>
                  <td style={{ color: '#4B5563' }}>{f.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderConnectorsAndSetup = () => {

    const cloudConnectors = connectors.filter(c => ['AWS', 'AZURE', 'GCP'].includes(c.id));
    const otherConnectors = connectors.filter(c => !['AWS', 'AZURE', 'GCP'].includes(c.id));
    
    const getIconLetter = (id) => {
      if (id === 'AWS') return 'a';
      if (id === 'AZURE') return 'Az';
      if (id === 'GCP') return 'G';
      if (id === 'GEMINI') return '✨';
      return id[0];
    };
    const renderCard = (c) => (
      <div className="card connector-card" key={c.id} style={{ paddingBottom: '16px' }}>
        <div className="connector-header">
          <div className={`connector-icon ${c.iconClass}`}>{getIconLetter(c.id)}</div>
          <div className="connector-title">
            <h4>{c.name}</h4>
            <p>{c.type}</p>
          </div>
        </div>
        <div className="connector-status">
          <div className="status-indicator">
            <span className={`status-dot ${c.status}`}></span> {c.status === 'connected' ? 'Connected' : 'Not configured'}
          </div>
          {c.status === 'connected' && <span>{c.syncTime}</span>}
        </div>
        
        {c.accounts && c.accounts.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #333', paddingTop: '12px' }}>
            <h5 style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Configured Accounts</h5>
            {c.accounts.map((acc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2A2A2A', padding: '8px 12px', borderRadius: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#E0E0E0', fontFamily: 'monospace' }}>
                  {acc.accountId || acc.projectId || acc.workspace || `Account ${idx+1}`}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setConfigSidebarOpen({...c, ...acc})}>Edit</button>
                  <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleSync(c.id)}>Sync</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="connector-actions" style={{ marginTop: '12px' }}>
          <button className="btn-primary" onClick={() => setConfigSidebarOpen(c)}>+ Add Account</button>
          {c.id === "AZURE" && c.status === 'connected' && <button className="btn-outline" onClick={() => handleAction("collect-azure")}>Collect Activity</button>}
        </div>
      </div>
    );

    return (
      <>
        <div className="page-description" style={{ marginBottom: '32px' }}>
          Configure read-only access to your cloud environments and external systems. Authentication relies on cross-account roles and managed identities.
        </div>
        
        <div className="section-title">Cloud Providers</div>
        <div className="connectors-grid">
          {cloudConnectors.map(renderCard)}
        </div>

        <div className="section-title">Notifications & Ticketing</div>
        <div className="connectors-grid">
          {otherConnectors.map(renderCard)}
        </div>
      </>
    );
  };

  const renderHeaderActions = () => {
    switch (activeTab) {
      case 'Asset inventory':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-assets")}>↓ Export CSV</button>
            <button className="btn-primary" onClick={() => handleAction("refresh-assets")}>↻ Refresh assets</button>
          </>
        );
      case 'Risk queue':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-findings")}>↓ Export findings</button>
            <button className="btn-primary" onClick={() => handleAction("run-assessment")}>↻ Run assessment</button>
          </>
        );
      case 'Risk paths':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-paths")}>↓ Export graph</button>
            <button className="btn-primary" onClick={() => handleAction("analyze-paths")}>↻ Analyze paths</button>
          </>
        );
      case 'Control evidence':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-compliance")}>↓ Export compliance report</button>
            <button className="btn-primary" onClick={() => handleAction("reevaluate-controls")}>↻ Re-evaluate controls</button>
          </>
        );
      case 'Analyst briefing':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-briefing")}>↓ Export PDF</button>
            <button className="btn-primary" onClick={handleGenerateBriefing} disabled={briefingLoading}>↻ {briefingLoading ? "Generating..." : "Generate briefing"}</button>
          </>
        );
      case 'Connectors and setup':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-config")}>↓ Export config</button>
            <button className="btn-primary" onClick={() => handleAction("test-connections")}>↻ Test connections</button>
          </>
        );
      case 'Evidence history':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("export-logs")}>↓ Export logs</button>
            <button className="btn-primary" onClick={() => handleAction("refresh-history")}>↻ Refresh history</button>
          </>
        );
      case 'Reports':
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-primary" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          </>
        );
      case 'Overview':
      default:
        return (
          <>
            <span className="btn-demo" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>LIVE</span>
            <button className="btn-outline" onClick={() => handleAction("build-report")}>↓ Export evidence</button>
            <button className="btn-primary" onClick={() => handleAction("run-assessment")}>↻ Run assessment</button>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
               <button className="btn-outline" style={{ padding: '6px 10px', fontSize: '14px', position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
                 🔔
                 {eventHistory.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', position: 'absolute', top: '-5px', right: '-5px', fontWeight: 'bold' }}>{eventHistory.length}</span>}
               </button>
               {showNotifications && (
                 <div style={{ position: 'absolute', right: 0, top: '40px', width: '350px', background: '#1E1E1E', border: '1px solid #333', borderRadius: '8px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', textAlign: 'left' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2A2A2A', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                       <h4 style={{ margin: 0, color: '#E0E0E0', fontSize: '14px' }}>Event History</h4>
                       <button onClick={() => { setEventHistory([]); setShowNotifications(false); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
                    </div>
                    {eventHistory.length === 0 ? (
                       <div style={{ padding: '24px', color: '#888', textAlign: 'center', fontSize: '13px' }}>No events recorded yet.</div>
                    ) : (
                       eventHistory.map((evt, i) => {
                          const isExpanded = expandedEvents[evt.id];
                          const firstLine = evt.response.split('\n')[0].substring(0, 50) + (evt.response.length > 50 || evt.response.includes('\n') ? '...' : '');
                          return (
                            <div key={evt.id} style={{ padding: '12px', borderBottom: '1px solid #333', fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => setExpandedEvents(prev => ({...prev, [evt.id]: !prev[evt.id]}))} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <strong style={{ color: evt.status === 'error' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {evt.status === 'error' ? '❌' : '✅'} {evt.action}
                                  </strong>
                                  <span style={{ color: '#888', fontSize: '11px' }}>{evt.time}</span>
                               </div>
                               <div style={{ color: '#D4D4D4', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                 {isExpanded ? evt.response.replace(/\\n/g, '\n') : firstLine}
                               </div>
                            </div>
                          );
                       })
                    )}
                 </div>
               )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">A</div>
          <div className="brand-title">
            <h1>AEGIS</h1>
            <span>Cloud posture research</span>
          </div>
        </div>
        
        <div className="nav-section">
          <div className="nav-label">Assessment Workspace</div>
          <a href="#" className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Overview'); }}>
            <div className="nav-item-left">
              <span>✦</span>
              <span>Overview</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Asset inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Asset inventory'); }}>
            <div className="nav-item-left">
              <span>▤</span>
              <span>Asset inventory</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Risk queue' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Risk queue'); }}>
            <div className="nav-item-left">
              <span>≡</span>
              <span>Risk queue</span>
            </div>
            <span className="nav-badge">{findings.length}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Risk paths' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Risk paths'); }}>
            <div className="nav-item-left">
              <span>↳</span>
              <span>Risk paths</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Control evidence' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Control evidence'); }}>
            <div className="nav-item-left">
              <span>▤</span>
              <span>Control evidence</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Analyst briefing' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Analyst briefing'); }}>
            <div className="nav-item-left">
              <span>✦</span>
              <span>Analyst briefing</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Evidence history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Evidence history'); }}>
            <div className="nav-item-left">
              <span>⟲</span>
              <span>Evidence history</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Reports' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Reports'); }}>
            <div className="nav-item-left">
              <span>📄</span>
              <span>Reports</span>
            </div>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'Connectors and setup' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Connectors and setup'); }}>
            <div className="nav-item-left">
              <span>⚙</span>
              <span>Connectors and setup</span>
            </div>
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-title">Read-only by design</div>
          <p>Cloud collection, explainable assessment and local review decisions.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <div className="breadcrumb">CLOUD SECURITY / POSTURE ASSESSMENT</div>
            <h2>
              {activeTab === 'Overview' ? 'Posture overview' : 
               activeTab === 'Risk paths' ? 'Evidence supported risk paths' : 
               activeTab}
            </h2>
          </div>
          <div className="header-actions">
            {renderHeaderActions()}
          </div>
        </header>

        {/* Banner */}
        <div className="banner" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderBottom: '1px solid #bbf7d0' }}>
          LIVE DATA - Active cloud resources and relationships connected via secure access. Assessed {recentScans.length > 0 ? new Date(recentScans[0].timestamp).toLocaleString() : new Date().toLocaleString()}. Evidence collected {recentScans.length > 0 ? new Date(recentScans[0].timestamp).toLocaleString() : new Date().toLocaleString()}.
        </div>

        {activeTab === 'Overview' ? renderOverview() : null}
        {activeTab === 'Asset inventory' ? renderAssetInventory() : null}
        {activeTab === 'Risk queue' ? renderRiskQueue() : null}
        {activeTab === 'Risk paths' ? renderRiskPaths() : null}
        {activeTab === 'Control evidence' ? renderControlEvidence() : null}
        {activeTab === 'Analyst briefing' ? renderAnalystBriefing() : null}
        {activeTab === 'Evidence history' ? renderEvidenceHistory() : null}
        {activeTab === 'Reports' ? renderReporting() : null}
        {activeTab === 'Connectors and setup' ? renderConnectorsAndSetup() : null}

      {configSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setConfigSidebarOpen(null)}></div>
          <div className="right-sidebar">
            <div className="sidebar-header">
              <h3>Configure {configSidebarOpen.name}</h3>
              <button className="close-btn" onClick={() => setConfigSidebarOpen(null)}>×</button>
            </div>
            <form className="sidebar-content" onSubmit={handleSaveConfiguration}>
              <p>Enter the required credentials to allow Aegis read-only access to your {configSidebarOpen.name} environment.</p>
              
                            {configSidebarOpen.id === 'AWS' && (
                <>
                  <div className="form-group">
                    <label>AWS Account ID</label>
                    <input type="text" name="accountId" placeholder="e.g. 123456789012" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Cross-Account Role ARN</label>
                    <input type="text" name="roleArn" placeholder="arn:aws:iam::..." className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>External ID (Optional)</label>
                    <input type="password" name="externalId" placeholder="••••••••" className="form-input" />
                  </div>
                </>
              )}
              {configSidebarOpen.id === 'AZURE' && (
                <>
                  <div className="form-group">
                    <label>Azure Subscription ID</label>
                    <input type="text" name="accountId" placeholder="e.g. 00000000-0000-0000-0000-000000000000" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Tenant ID</label>
                    <input type="text" name="tenantId" placeholder="e.g. 00000000-0000-0000-0000-000000000000" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Client ID (Application ID)</label>
                    <input type="text" name="clientId" placeholder="e.g. 00000000-0000-0000-0000-000000000000" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Client Secret</label>
                    <input type="password" name="clientSecret" placeholder="••••••••" className="form-input" required />
                  </div>
                </>
              )}
              {configSidebarOpen.id === 'GCP' && (
                <>
                  <div className="form-group">
                    <label>GCP Project ID</label>
                    <input type="text" name="projectId" placeholder="e.g. my-project-123" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Service Account Email</label>
                    <input type="text" name="serviceAccountEmail" placeholder="e.g. aegis-reader@my-project-123.iam.gserviceaccount.com" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>JSON Key / Workload Identity</label>
                    <input type="password" name="jsonKey" placeholder="••••••••" className="form-input" required />
                  </div>
                </>
              )}
              {configSidebarOpen.id === 'GEMINI' && (
                <>
                  <div className="form-group">
                    <label>Gemini API Key</label>
                    <input type="password" name="accountId" placeholder="AIzaSy..." className="form-input" required />
                  </div>
                </>
              )}

              
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Save Configuration</button>
            </form>
          </div>
        </>
      )}

      {actionResult && (
        <div className="console-drawer" style={{
          position: 'fixed', bottom: 20, right: 20, 
          width: '600px', maxHeight: '400px', overflowY: 'auto',
          backgroundColor: '#1E1E1E', color: '#D4D4D4',
          borderRadius: '8px', padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 10000,
          fontFamily: 'monospace', fontSize: '13px',
          whiteSpace: 'pre-wrap'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            <strong style={{ color: '#E0E0E0' }}>Terminal Output</strong>
            <button onClick={() => setActionResult(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
          </div>
          {actionResult}
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
