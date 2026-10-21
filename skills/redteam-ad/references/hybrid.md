# Hybrid — Entra ID, Federation & On-Prem ↔ Cloud Pivots

Cloud and on-prem are one graph now. The strongest paths cross the boundary.

## Entra ID (Azure AD) enumeration

```bash
# Graph API via az
az ad user list --all -o table
az ad group list --all
az ad app list --all
az ad service-principal list --all
az role assignment list --all --include-inherited -o table
az account show

# unauthenticated surface
curl -s https://graph.microsoft.com/v1.0/$metadata | head
curl -s 'https://login.microsoftonline.com/common/discovery/keys' | jq 'keys[].kid' | head
```

## The hybrid path catalogue

| Path | Mechanism |
|---|---|
| On-prem DA → Entra Global Admin | Azure AD Connect's `MSOL_` account, or the sync account |
| Entra → on-prem DA | AAD Connect privileged sync identity |
| Entra Global Admin → on-prem | the admin's on-prem admin (Tier 0 equivalent) |
| On-prem → Entra | machine trust / federation trust / Azure AD Connect |
| Entra app → on-prem | a service principal with on-prem federation |
| Entra → Azure subscription | a GA can grant themselves Owner via Graph |
| Azure → on-prem | a managed identity with an on-prem federation trust |
| On-prem → Azure | a machine account in the sync OU with cloud privileges |

### Azure AD Connect

```bash
# from a foothold on the sync server
cat /opt/microsoft/azureadconnect/provisioning/Configuration.xml
ls /var/lib/azuresyncd
# the MSOL_ account and its password are in the config
```

If the Azure AD Connect server is reachable and you can read the provisioning config, you get the
**Tier-0 equivalent** of both environments: the `MSOL_<suffix>` account (Entra Global Admin) and
the on-prem domain admin.

This is the single highest-value hybrid finding. Test it explicitly.

### Federation trusts

```bash
nmap -p 88,389,445 -sV dc.target.local
# check for trusts
netexec target.local --enum-trusts
bloodhound-python> match (m:DomainTrust)
```

A two-way trust means compromising the small side compromises the big side.

## Entra ID application abuse

| Abuse | Check |
|---|---|
| Over-permissioned app consent | `az ad app permission list` + Graph permissions |
| A service principal with directory write | escalate to GA |
| OAuth app with a redirect to a domain you control | token theft |
| App role assignment to a privileged role | who can be assigned it |
| `Application.ReadWrite.All` | add a credential to any app |
| `Directory.ReadWrite.All` | modify any user |
| Managed identity with an over-permissive role | Azure → cloud |
| Guest accounts with a stale MFA | offboarding gap |

```bash
az ad app list --all --query "[].{app:appId,perm:permissions}" -o json
az ad sp list --all
# who consented to what
grep -i "consent" /var/log/azure/adirectory/*.log 2>/dev/null
```

## Device identity

```bash
# Entra joined devices
az ad device list --all -o table
az ad device get-object-id ...
# Intune / MEM
# check for stale devices (decommissioned but still trusted)
az ad device list --all --query "[?].{name:displayName,id:deviceId,trust:isCompliant}"
```

A decommissioned device that is still Entra joined and holds a certificate is a persistent
access path.

## The on-prem → cloud relay

```bash
# relay through an Azure AD Connect or a federation endpoint
ntlmrelayx -t ldaps://dc.target.local -I 10.10.10.5 -l /tmp/relay
# the relayed auth can be used to authenticate to Entra via the federation service
```

## Detecting hybrid weakness

| Weakness | Why it matters |
|---|---|
| Entra GA == on-prem DA | one credential, two crowns |
| AAD Connect server reachable from user networks | the sync account is there |
| Federation trusts not locked down | small domain → big domain |
| `MSOL_` password never rotated | it is often years old |
| App consent not admin-restricted | any user can grant an app directory access |
| Guest accounts not governed | an external identity with an internal role |
| Devices not removed from Entra on decommission | stale trust |

## Reporting a hybrid finding

```
BOUNDARY:   on-prem AD <-> Entra ID
BRIDGE:     <AAD Connect / trust / app / device>
CREDENTIAL: <which credential crosses the boundary>
IMPACT:     <what you reach on the other side>
CHAIN:      <the full path>
FIX:        <break the bridge, rotate the credential, lock the trust>
```
