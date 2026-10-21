# BloodHound Path Hunting & Manual Graph Analysis

## Collection

```bash
# from a Windows foothold
SharpHound.exe -c All -d target.local -o collection.zip
SharpHound.exe -c Session,LoggedOn,ACL,GroupMembership,LocalAdmin,All -d target.local

# from Linux, no Windows host needed
python3 -m bloodhound -c All -d target.local -u user -p pass
```

Collection types and what each gives you:

| Type | Gives |
|---|---|
| `Group` | group memberships |
| `Session` | who is logged on where (smells of admin) |
| `LoggedOn` | same, lower fidelity |
| `ACL` | the edges you care about most |
| `LocalAdmin` | admin on machines |
| `Trusts` | domain trusts |
| `Sessions` | SMB sessions |
| `RDP` | RDP sessions |
| `DCOM` | DCOM sessions |
| `Container` | GPO and OU structure |
| `CertServices` | AD CS configuration (ESC detection) |

## Analysis

```python
from bloodhound import Bloodhound
bh = Bloodhound()
bh.load_from_file("collection.zip")
graph = bh.graph
```

### Shortest paths to Tier-0

```python
for t in ["DOMAIN ADMIN@TARGET.LOCAL", "ADMINISTRATOR@TARGET.LOCAL", "DC=target,DC=local"]:
    data = bh.query_shortest_path_to_object("User", "USER@TARGET.LOCAL", t)
    if data:
        for path in data:
            print(" -> ".join(edge["name"] for edge in path["Path"]))
```

### Common high-value queries

| Question | Query pattern |
|---|---|
| Everyone with DCSync | `MATCH (u:User) WHERE u.objectid ends with '-512' RETURN u` then find who can read the domain |
| Paths to DA | shortest path from each owned principal to `DOMAIN ADMIN` |
| Unconstrained delegation | `MATCH (u:User {hasconstraineddelegation: false})` |
| RBCD writable targets | `MATCH (m:Computer) WHERE m.objectid ...` |
| GPO abuse | edges of type `GPO` |
| AD CS templates | `CertServices` collection |
| Machine accounts that are DA | `MATCH (c:Computer) WHERE c.memberof ...` |

### The edges that matter, ranked

```
WriteDacl / GenericAll / GenericWrite   ->  instant escalation, no cracking needed
AddMember / AddMemberToGroup             ->  instant group entry
DCSync                                   ->  whole domain
AllowedToDelegate                        ->  any user
WriteSPN                                ->  crack to the service account
SQLAdmin                                ->  MSSQL -> service account
AllowedToDelegate + ADCS template        ->  cert for any user
```

### Manual graph analysis when BloodHound is not available

```bash
# group nesting
net group "Domain Admins" /domain
net group "Domain Admins" | findstr /i ">"
net localgroup Administrators

# who is logged on as admin
netexec target.local --sessions
netexec target.local --local-auth --wins

# who has admin on machines
netexec target.local --local-auth -q -S 10.10.10.5

# ACLs
dsacls "CN=Users,DC=target,DC=local"
dsacls "CN=<user>,DC=target,DC=local"
```

## Building the path report

```
FOOTHOLD:  <principal you start from>
PATH:      A --[WriteDacl]--> B --[AddMember]--> Domain Admins
WEAKEST:  <the first edge - the actual finding>
PROOF:     <the command that executed each step>
VALUE:     <Domain Admin>
```

Rank several paths by length so the operator can fix the shortest one first. The shortest path is
usually a single edge that nobody notices — that is the finding worth reporting first.

## Detecting the defender's view

A separate, valuable question: **would BloodHound have found this?** If the path relies on an edge
type that is not in the default collection, the defender's tooling is blind to it. That is a
detection-gap finding and belongs in the report.

```bash
# what would the defender see? run the same query as their tooling
```

## Pitfalls

- **Collection ≠ reality.** The graph is a snapshot. Confirm the interesting edges by hand before
  reporting them.
- **Session edges are noisy.** A logged-on admin session is a great shortcut but is not a privilege
  escalation on its own — describe it as an access path with a precondition.
- **Do not run the escalation.** Proving `WriteDacl` exists is enough; actually taking over a
  production domain is not an assessment action. Prove it, describe it, and let the operator decide.
