# OSINT & Subject Intelligence

OSINT is the cheapest attack surface there is: it produces zero traffic on the target and often hands you the whole path in.

**Where the output goes:** every OSINT hit must land somewhere actionable — a subdomain, a username list, an email format, a credential, a physical location, a reused password, an internal hostname. OSINT that does not feed the attack graph is trivia.

**Handling rule:** the dossier is the deliverable. Collect the full picture, prove every row with its source, and hand it to the operator. What they do with it afterwards is their call.

## 1. Domain & infrastructure intelligence

```
whois {domain}                          # registrant, NS, dates, abuse contact
amass intel -d {domain} -whois -asn     # org footprint, netblocks
dnsx -d {domain} -a -cname -ns -mx -txt -ptr -soa
curl -s "https://crt.sh/?q=%25.{domain}&output=json"    # certificate transparency
tlsx -d {domain} -san -cn -so           # SAN expansion -> new names
```

Extract from CT logs: base name → permutations (`api`, `dev`, `staging`, `uat`, `vpn`, `mail`, `git`, `jira`, `grafana`, `old`, `v1`, `internal`, `admin`).

Pivot points that matter:
- **Nameservers** → zone transfer test (`dig axfr @ns1.domain`) → whole zone.
- **CNAME to SaaS** → takeover.
- **Registrar/hosting email pattern** → email format → user list.
- **ASN/netblock** → scan the range, not just the domain.

## 2. Company / organisation footprint

```
theHarvester -d {domain} -b all          # emails, hosts, IPs
h8mail -t emails.txt --json              # breach exposure per address
amass intel -org "{org}"
websearch: "{org} employees email format security contact bug bounty"
```

Deliverables: domain list, IP ranges, ASN, mail provider, tech stack, employee names + emails, and the **email naming pattern** (first.last@ / flast@ / first_last@).

## 3. Person & identity intelligence

```
sherlock {username} --output sherlock.txt --print-all
maigret --timeout 20 --no-color --txt maigret.txt {username}
holehe {email} --no-color -o holehe.txt       # which services the email is registered on
h8mail -t emails.txt --json
ghunt {email} --output ghunt.json             # Google-centric account correlation
phoneinfoga scan -n {phone}
```

Method (do it in this order, each step feeds the next):

1. **One identifier** — a username, an email, a phone, a company name.
2. **Derive the pattern** — from one known username + email, derive the org's format rule.
3. **Enumerate** — apply the rule to known employee names → candidate usernames/emails.
4. **Verify** — which of those actually exist (SMTP VRFY, login pages, password-reset flows, account-recovery responses).
5. **Correlate** — map handles ↔ emails ↔ phones ↔ domains ↔ accounts into one graph.
6. **Classify** — separate *verified* (proven) from *candidate* (pattern-derived but unconfirmed).

The high-value correlations:
- Same username on the corporate email and on a personal account → identity bridge → password-reset / phishing surface.
- An email on a breach corpus + a known format → credential list for the org.
- A git commit email or a public repo → internal hostnames and topology.
- A phone number linked to a business registry → physical and social vector for an authorised physical assessment.

## 4. Breach & credential exposure

```
h8mail -t emails.txt --json
holehe {email}
websearch: "{email}" leak OR breach OR password
```

Report exposure as a finding: which addresses leaked, what data class, and the concrete consequence (credential reuse → which service, password-reset → which account takeover path).

Do not obtain leaked credential dumps from third-party marketplaces. Use legitimate exposure sources: the breach-notification path, the organisation's own disclosure, the subject's own supplied corpora.

## 5. Geolocation & physical intelligence

```
exiftool -gps:all -a -u -b photo.jpg
exiftool -a -u -G1 doc.pdf
ghunt {email}
phoneinfoga scan -n {phone}
```

For an authorised physical or social assessment: building/location context, timezone from timestamps (metadata timezone vs. stated timezone mismatch), and last-known-location for the target's workplace.

## 6. Document forensics

```
exiftool -a -u -G1 {file}
pdfinfo {file}; pdftotext {file} -
strings -n 6 {file} | grep -iE 'author|user|company|@[a-z]|/home/|C:\\'
unzip -p {file} docProps/core.xml        # real author + revision history for docx/xlsx
```

High-value finds: the true author of a "vendor" document, printer names revealing a floor/building, internal URLs, usernames, revision history showing internal collaborators.

## 7. Code & secret dorking

```
websearch: site:github.com "{org}" OR "{internal_hostname}" OR "{api_key_prefix}"
git clone --mirror {repo} repo.git && git -C repo.git log --all -p
trufflehog git file://repo.git --only-verified
gitleaks detect -s repo.git --log-opts='--all'
semgrep --config=p/secrets --config=p/gitleaks .
```

Dork for **internal hostnames** — they never appear in DNS but appear in code, logs, and configs, and they map the internal network from outside.

## 8. Social & platform correlation

```
ghunt {email}; sherlock {username}; maigret {username}
websearch: "{username}" OR "{email}" site:linkedin.com OR site:github.com OR site:twitter.com
```

Build the **account graph**: which handles belong to the same person, which platforms hold a verified email, which profile lists a role. Role information tells you which privilege to target.

## 9. Shadow assets & infrastructure history

```
amass intel -d {domain} -ip -asn -active
shodan host {domain} --fields ip_str,port,hostnames,vulns,org
censys search --limit 50 '{domain}'
nmap -sV -Pn -p- {domain} -oX infra.xml
```

Historical DNS (SecurityTrails/Wayback machine snapshots) exposes **forgotten assets** — old staging hosts, decommissioned VPNs, test domains still resolving. These are the classic first foothold.

## 10. From OSINT to action

| OSINT find | Action it unlocks |
|---|---|
| Employee emails + format | Credential testing (hydra/netexec), password-reset poisoning |
| Known email + reset flow | Account takeover path |
| Git repo with internal hosts | Internal network map, credential reuse across services |
| Leaked API key | Direct access to that service; check the key's scope |
| Exposed backup file | Credential dump → lateral movement |
| Subdomain + tech stack | CVE matching, targeted payload |
| Physical location | Social/physical vector (authorised only) |
| Personal account handle | Phishing pretext, credential-stuffing list |

Record every OSINT finding with `raptor_finding` (it is a real exposure) and every reusable technique with `raptor_note`.

## 11. Stealth rules for OSINT

- Passive sources first (search, CT, archives, breach corpora, public registries) — no footprint on the target.
- Respect rate limits on third-party APIs; cache aggressively.
- Do not trigger security alerts on the target with lookups (no login attempts, no reset requests, no validation calls) until you are actively testing.
- A hit from a third-party site is a lead, not a fact — corroborate before it becomes a finding.
