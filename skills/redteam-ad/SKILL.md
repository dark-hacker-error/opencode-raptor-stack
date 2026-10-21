---
name: RedTeam AD — Active Directory & Identity Attack
description: Active Directory and identity attack paths - Kerberos abuse (AS-REP, Kerberoast, delegation), AD CS certificate abuse (ESC1-ESC8), coercion and relay, ACL and group abuse, DCSync, GPO and ADCS escalation, and hybrid Entra ID / on-prem pivoting. Use when the target is a Windows domain, a directory service, or an identity provider that federates with one.
---

# RedTeam AD — Active Directory & Identity Attack

A domain is a graph of trust edges. The engagement is not "find a weak password" — it is "find the
shortest path from my foothold to Domain Admin, then walk it".

> `references/kerberos.md` — Kerberos attacks end to end.
> `references/adcs.md` — AD CS / certificate abuse (ESC1-ESC8).
> `references/relay-acl.md` — coercion, relay and ACL abuse.
> `references/hybrid.md` — Entra ID, federation and hybrid paths.
> `references/graph.md` — BloodHound path hunting and manual graph analysis.

## Method

### 1. Get a foothold and map it

```bash
whoami /all
net group "Domain Admins" /domain
net group "Enterprise Admins" /domain
net session
net localgroup Administrators
klist
```

Then collect the graph:

```bash
# BloodHound collection
SharpHound.exe -c All -d target.local -o collection.zip
bloodhound-python> ingest collection.zip
```

### 2. Find the shortest path

The question is never "can I dump the domain" — it is "what is the shortest chain to a Tier-0
principal, and which of its edges can I actually use?".

Priority edge types (weakest first):

```
GenericWrite / GenericAll on a user  ->  add to a privileged group
WriteDacl on a user                   ->  add myself to a group they are in
DCSync rights (GetChanges/GetChangesAll) ->  domain admin
WriteSPN                             ->  Kerberoast -> TGS -> crack
AllowedToDelegate (RBCD/constrained) ->  delegate to a Tier-0 service
AddMember / AddMemberToGroup         ->  join a privileged group
Coerce authentication (ESC8 / shadow) ->  relay
AD CS enrollment + weak templates     ->  any account's certificate
```

### 3. Execute the path

Each step needs proof. A DCSync proof is `secretsdump` returning hashes. A group-add proof is
`net group "Domain Admins" <user>` then a new token showing the membership.

### 4. Report the path, not just the endpoint

The finding is the chain: which edge was weak, and where it led. Rank by path length and by which
principals it reaches.

## Quick wins checklist

| Check | Tool |
|---|---|
| AS-REP roastable accounts | `Get-ASREPRecon`, `impacket-GetUserSPNs` |
| Kerberoastable accounts | `netexec <domain> --kerberoasting` |
| DCSync-capable principals | BloodHound, `impacket-secretsdump` |
| AD CS web enrollment | `certipy req`, `Certipy` |
| Constrained delegation | BloodHound `AllowedToDelegate` |
| ACL abuse | BloodHound `WriteDacl`, `GenericAll`, `GenericWrite` |
| SMB signing not enforced | `nmap --script smb2-security-mode` |
| LDAP signing not enforced | `nmap -p 389 --script ldap-rootdse` |
| Unprivileged SMB enumeration | `netexec <domain> --enum-smb-share` |
| Group nesting to DA | `net group "Domain Admins" /domain` recursion |
| GPO abuse | BloodHound `GPO` edges |
| Trust abuse | BloodHound `trustedTo` edges |

## Rules

1. **Prefer path analysis over brute force.** A path of length 2 beats a password list.
2. **Escalate privilege deliberately.** A path through a user that is only a stepping stone is not the finding.
3. **Do not DCSync unless the path is otherwise closed** — it is loud, it triggers detections, and it may be out of scope.
4. **Do not modify group membership without an explicit go** — it is a state change on the target. Prove the edge, then ask.
5. **Every step gets evidence**, and the report shows the path with the weakest edge highlighted.
