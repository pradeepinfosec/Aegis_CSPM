import subprocess
import json
import sys

def scan():
    try:
        # Call az cli to get storage accounts
        # Note: using shell=True can help on Windows if az is a cmd script
        result = subprocess.run(["az", "storage", "account", "list", "--output", "json"], 
                                capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print(json.dumps([])) # Return empty if fails
            return
            
        accounts = json.loads(result.stdout)
        
        findings = []
        for acc in accounts:
            name = acc.get("name", "unknown")
            res_id = acc.get("id", "")
            
            # Extract subscription ID from the resource ID (e.g. /subscriptions/1234-.../)
            sub_id = "unknown"
            if "/subscriptions/" in res_id:
                parts = res_id.split("/")
                try:
                    sub_idx = parts.index("subscriptions")
                    sub_id = parts[sub_idx + 1]
                except (ValueError, IndexError):
                    pass
            
            rg_name = "unknown"
            if "/resourceGroups/" in res_id:
                parts = res_id.split("/")
                try:
                    rg_idx = [p.lower() for p in parts].index("resourcegroups")
                    rg_name = parts[rg_idx + 1]
                except (ValueError, IndexError):
                    pass

            tls_version = acc.get("minimumTlsVersion", "TLS1_2")
            public_access = acc.get("allowBlobPublicAccess", False)

            # Check STO004 (TLS)
            if tls_version in ["TLS1_0", "TLS1_1"]:
                findings.append({
                    "title": f"Storage transport protection is absent (TLS {tls_version})",
                    "resource": name,
                    "resourceGroup": rg_name,
                    "cloud": "AZURE",
                    "accountId": sub_id,
                    "control": "STO004",
                    "score": 65.0,
                    "severity": "MEDIUM",
                    "confidence": "SUPPORTED",
                    "review": "open"
                })
            else:
                findings.append({
                    "title": f"Storage transport protection (TLS {tls_version})",
                    "resource": name,
                    "resourceGroup": rg_name,
                    "cloud": "AZURE",
                    "accountId": sub_id,
                    "control": "STO004",
                    "score": 0.0,
                    "severity": "LOW",
                    "confidence": "SUPPORTED",
                    "review": "closed"
                })

            # Check STO005 (Public Access)
            if public_access:
                findings.append({
                    "title": f"Storage permits anonymous access configuration",
                    "resource": name,
                    "resourceGroup": rg_name,
                    "cloud": "AZURE",
                    "accountId": sub_id,
                    "control": "STO005",
                    "score": 50.0,
                    "severity": "MEDIUM",
                    "confidence": "SUPPORTED",
                    "review": "open"
                })
            else:
                findings.append({
                    "title": f"Storage blocks anonymous access configuration",
                    "resource": name,
                    "resourceGroup": rg_name,
                    "cloud": "AZURE",
                    "accountId": sub_id,
                    "control": "STO005",
                    "score": 0.0,
                    "severity": "LOW",
                    "confidence": "SUPPORTED",
                    "review": "closed"
                })
            
    except Exception as e:
        pass
        
    try:
        # Scan NSGs
        nsg_result = subprocess.run(["az", "network", "nsg", "list", "--output", "json"], 
                                capture_output=True, text=True, shell=True)
        if nsg_result.returncode == 0:
            nsgs = json.loads(nsg_result.stdout)
            for nsg in nsgs:
                name = nsg.get("name", "unknown")
                res_id = nsg.get("id", "")
                sub_id = "unknown"
                if "/subscriptions/" in res_id:
                    try:
                        sub_id = res_id.split("/")[2]
                    except Exception:
                        pass
                
                rg_name = "unknown"
                if "/resourceGroups/" in res_id:
                    parts = res_id.split("/")
                    try:
                        rg_idx = [p.lower() for p in parts].index("resourcegroups")
                        rg_name = parts[rg_idx + 1]
                    except (ValueError, IndexError):
                        pass

                admin_open = False
                for rule in nsg.get("securityRules", []):
                    if rule.get("access") == "Allow" and rule.get("direction") == "Inbound":
                        src = rule.get("sourceAddressPrefix", "")
                        port = rule.get("destinationPortRange", "")
                        if (src == "Internet" or src == "*") and (port == "22" or port == "3389" or port == "*"):
                            admin_open = True
                            
                if admin_open:
                    findings.append({
                        "title": f"Network has a broad inbound administration rule",
                        "resource": name,
                        "resourceGroup": rg_name,
                        "cloud": "AZURE",
                        "accountId": sub_id,
                        "control": "NET001",
                        "score": 80.0,
                        "severity": "MEDIUM",
                        "confidence": "SUPPORTED",
                        "review": "open"
                    })
                else:
                    findings.append({
                        "title": f"Network blocks broad inbound administration rules",
                        "resource": name,
                        "resourceGroup": rg_name,
                        "cloud": "AZURE",
                        "accountId": sub_id,
                        "control": "NET001",
                        "score": 0.0,
                        "severity": "LOW",
                        "confidence": "SUPPORTED",
                        "review": "closed"
                    })
    except Exception:
        pass

    try:
        # Scan Static Web Apps
        swa_result = subprocess.run(["az", "staticwebapp", "list", "--output", "json"], 
                                capture_output=True, text=True, shell=True)
        if swa_result.returncode == 0:
            swas = json.loads(swa_result.stdout)
            for swa in swas:
                name = swa.get("name", "unknown")
                res_id = swa.get("id", "")
                sub_id = "unknown"
                if "/subscriptions/" in res_id:
                    try:
                        sub_id = res_id.split("/")[2]
                    except Exception:
                        pass
                
                rg_name = "unknown"
                if "/resourceGroups/" in res_id:
                    parts = res_id.split("/")
                    try:
                        rg_idx = [p.lower() for p in parts].index("resourcegroups")
                        rg_name = parts[rg_idx + 1]
                    except (ValueError, IndexError):
                        pass

                findings.append({
                    "title": f"Workload is reachable from the Internet",
                    "resource": name,
                    "resourceGroup": rg_name,
                    "cloud": "AZURE",
                    "accountId": sub_id,
                    "control": "EXP001",
                    "score": 55.0,
                    "severity": "MEDIUM",
                    "confidence": "SUPPORTED",
                    "review": "open"
                })
    except Exception:
        pass

    print(json.dumps(findings))

if __name__ == "__main__":
    scan()
