# Exposure — breaches, leaks, brokers, credential reuse

## Breach corpora

```bash
h8mail -t emails.txt --json h8mail.json     # breach hits + exposed password material
holehe <email> --no-color -o holehe.txt      # which services the address is registered on
websearch: "<email>" leak OR breach OR paste OR "combo"
```

For each hit record: **source, date, data classes exposed, and whether the credential still works**.

## What matters (not just "found in a breach")

| Finding | Why it matters |
|---|---|
| Same password reused on a live service | direct account takeover path — test it |
| Corporate email in a breach | phishing pretext + credential-stuffing wordlist |
| Password contains a pattern the organisation uses | predict other accounts |
| Breach reveals internal hostnames / usernames | maps the internal network from outside |
| Breach reveals personal data (address, DOB, family) | enables SIM-swap, account-recovery and social attacks |
| Passport/ID numbers exposed | identity-theft risk, report as high |

**Credential reuse testing** against the target's own services is the highest-value follow-up:
the reuse is the finding, the successful login is the proof.

## Leaks in code and configuration

```bash
trufflehog filesystem /path --no-update
gitleaks detect -s /path --no-git -v
semgrep --config=p/secrets --json -o semgrep.json /path
websearch: site:github.com "<api-key-prefix>" OR "<internal-hostname>" OR "<email-domain>"
```

Keys found in a public repo are a finding on their own, before any use.

## Paste and forum exposure

Search engines index paste sites and forums. Look for:
- credential dumps posted by the subject,
- config files, `.env`, backup archives,
- internal URLs and IPs,
- arguments between the subject and third parties.

## Data brokers and people-search

Public people-search and data-broker listings reveal: current address, age, relatives, employers,
phone numbers, email addresses, vehicle, property records. Treat each as a **corroboration source**
and a **privacy finding** — the subject's data being publicly buyable is itself the exposure.

## Records and registries

- Corporate registries: directors, shareholders, filings, charges, insolvency.
- Property and court records (where publicly accessible).
- Professional and academic records: publications, patents, conference talks, thesis.
- Electoral/licence registers (jurisdiction-dependent, treat carefully and legally).

## Exposure assessment output

| Field | Content |
|---|---|
| Source | where the exposure was found + URL + capture date |
| Data classes | passwords, emails, phone, address, DOB, ID docs, IP history, purchases |
| Freshness | date of the breach or post |
| Reachability | does the credential still work against a live service |
| Subject impact | what the operator could do with it |
| Remediation | rotate the credential, MFA, monitoring, breach notification |
