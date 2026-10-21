# Recon & Fingerprinting

Goal: know the target precisely enough to plan. Everything here is cheap except the last section.

## 0. Passive first (free, silent, highest yield)

```
CT logs     : crt.sh JSON API  ->  curl -s "https://crt.sh/?q=%25.target.com&output=json"
Certificates: openssl s_client -connect host:443 -servername host </dev/null | openssl x509 -noout -text
Archives    : gau / waybackurls  ->  historical URLs reveal forgotten admin panels
Search      : websearch for  "<target>" filetype:pdf OR filetype:sql OR "admin"
Code        : github dorks — org name, internal hostnames, API keys
Registrant  : whois / amass intel -org  ->  ASN, nameservers, netblocks
```

Passive results become the wordlist for everything downstream. Extract from CT logs: base names → permutations (`api`, `dev`, `staging`, `uat`, `internal`, `old`, `v1`, `beta`, `admin`, `grafana`, `kibana`, `jenkins`).

## 1. Subdomain enumeration

Multi-source, then resolve. One source misses; three agree.

```
subfinder -d {target} -all -silent -o subs.txt
amass enum -d {target} -o amass.txt
assetfinder --subs-only {target} > asset.txt
findomain -t {target} -o findomain.txt
cat subs.txt amass.txt asset.txt findomain.txt | sort -u > all_subs.txt

dnsx -l all_subs.txt -a -silent -resp -o resolved.txt   # A record + response
tlsx -l all_subs.txt -san -cn -silent -o tls.txt          # SAN expansion -> new names
```

**Takeover check** on every dangling CNAME/NS:

```
subjack -w all_subs.txt -ssl -v
nuclei -tags takeover -l resolved.txt
```

Dangling CNAME to a deprovisioned SaaS = subdomain takeover. Verify by attempting the provider-specific unclaim (usually an unauthenticated HTTP request returning the provider's "claim this domain" page). Fingerprint the provider first (`CNAME` target) — the claim path differs per provider.

## 2. Port scanning

```
naabu -host {target} -top-ports 1000 -rate 1000 -silent        # quick
masscan -p1-65535 {cidr} --rate 2000                          # wide, fast, noisy
nmap -sV -sC -Pn -T4 -p <ports> {target} -oA raw/nmap_{target} # detail + evidence
```

Rules:
- Scan **declared scope** only.
- `masscan` needs raw sockets → needs `setcap cap_net_raw,cap_net_admin+eip $(which masscan)`.
- Always capture nmap output as XML (`-oX`) into `evidence/` — it is the version-to-CVE source of truth.
- Rate-limit residential/customer-owned hosts. Mass-scanning feels like an attack to a target's IDS; that is a finding against you, not the target.

## 3. Service / version fingerprinting

```
nmap -sV --version-all -p <ports> {target}
httpx -l hosts.txt -title -tech-detect -status-code -web-server -follow-redirects -o web.txt
whatweb -a 3 {url}
```

Extract: product + version + edition. Then:

```
searchsploit {product} {version}
nuclei -t cves/ -severity critical,high -l hosts.txt
grype dir:/path  OR  osv-scanner --lockfile / SBOM
```

**Version verification matters**: distro backports break CVE applicability. If the banner says `nginx 1.18.0` on Ubuntu, check the Ubuntu package version before claiming CVE-2021-23017.

## 4. HTTP fingerprinting

```bash
curl -skI https://{host} | head -30          # server, powered-by, cookies, headers
curl -sk https://{host} -o /dev/null -w '%{http_code} %{time_total} %{redirect_url}\n'
wafw00f https://{host} -a
```

Fingerprint and record:

| Signal | Where | Means |
|---|---|---|
| `X-Powered-By`, `Server` | headers | stack + version |
| `Set-Cookie` | headers | session framework (PHPSESSID, JSESSIONID, ASP.NET_SessionId) + flags (HttpOnly/Secure/SameSite) |
| `X-Frame-Options`, CSP | headers | clickjacking/XSS posture |
| `X-AspNet-Version`, `X-AspNetMvc-Version` | headers | exact framework version → CVE |
| `Location` on `/` | redirect | CDN, SSO, vanity routing |
| `/.well-known/openid-configuration` | 200 | OIDC provider → auth map |
| `/actuator`, `/debug`, `/_profiler`, `/server-status` | 200 | exposed management console |
| `/.git/HEAD` | 200 | source exposure |

## 5. WAF, CDN, honeypot detection

```
wafw00f -a {url}
httpx -l hosts.txt -cdn -asn -probe
```

CDN detection changes strategy: the origin may be reachable directly (historical DNS, `origin.target.com`, certificate SANs, `crt.sh` CNAMEs). If a WAF is present, prefer low-volume, high-precision testing and move to other classes (logic flaws, auth, secrets, infrastructure) rather than spraying payloads at it.

**Honeypot tells**: identical banner hash across unrelated hosts, uniformly fast responses, decoy filenames (`admin_backup.sql` that is 1 byte), every random path returning 200 with a login page, instant MFA challenge on first login. On detection: switch to `stealth` profile, single host, drop noisy tools.

## 6. Cloud & SaaS asset discovery

```
aws s3 ls s3://{bucket} --no-sign-request     # existence + listing
s3scanner scan -bucket-file buckets.txt
cloud_enum -k {keyword} -k {keyword} -l bucket_list.txt
gcloud storage ls -a gs://{bucket}
az storage account list
```

Naming patterns to try: `{org}`, `{org}-dev`, `{org}-backup`, `{org}-assets`, `{org}-dev-<team>`, `www-{org}`, `{org}-<service>-<env>`. An open bucket with app files or credentials is a critical finding on its own — verify with a single `curl` of one known key file, do not enumerate the whole bucket.

Also: dangling DNS, `*.targets` files in public buckets, CI/CD configs (`.github/workflows`, `.gitlab-ci.yml`) that leak secrets or deploy keys.

## 7. Content discovery

```
ffuf -u https://{host}/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt \
     -mc all -fc 404 -t 40 -o raw/ffuf_{host}.json -of json
gobuster dir -u https://{host} -w common.txt -x php,html,txt,bak,zip,old,conf,env -t 40
```

Extensions that matter: `.bak .old .orig .swp .save .sql .zip .tar.gz .env .git .yml .yaml .conf .ini .log .pem .key .p12 .pfx .kdbx .json .map .php~ .inc .bak.php`.

Status-code discipline: `-mc all -fc 404` kills soft-404 noise; if the app returns 200 for everything, switch to response-length + word filtering (`-fs`).

## 8. API mapping

Sources: `robots.txt`, `sitemap.xml`, JS bundles, `swagger.json`/`openapi.json`/`api-docs`, GraphQL introspection, error pages, mobile app traffic, HAR/PCAP.

```
katana -u https://{host} -d 3 -jc -kf all -silent -o raw/katana.txt
curl -s https://{host}/openapi.json | jq '.paths | keys'
curl -s https://{host}/graphql -H 'content-type: application/json' \
     -d '{"query":"{__schema{types{name,fields{name,args{name,type{name}}}}}}}"}'
```

Build the table: `method | path | auth required | params | response shape | IDOR candidate?`.

**IDOR screen** — the highest-yield web bug class:
- Take a numeric/UUID identifier from a normal response.
- Swap it for another value you own or that is publicly guessable.
- Compare status + body length + content.
- Equal-length different content → real IDOR. 403 vs 200 → hidden parameter test. 302 to login → auth enforced.

## 9. Secret & credential hunting

```
trufflehog filesystem /path
trufflehog git file:///path/to/repo --only-verified
gitleaks detect -s /path --no-git -v
grep -rInE "(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|xox[baprs]-|-----BEGIN [A-Z ]*PRIVATE KEY)" /path
```

In JS bundles: `SecretFinder`/`LinkFinder` on the downloaded bundle, then regex for `api[_-]?key|token|secret|password|authorization|bearer`.

Recovered secrets are findings in themselves even before you use them — report the leak and the impact (which service it unlocks).

## 10. Ordering & noise budget

1. Passive → CT, archives, search, code, whois (no traffic to target)
2. DNS resolve → cheap, low noise, high yield
3. HTTP triage → one request per host (`httpx`)
4. Content + API + secrets → targeted
5. Template sweep → `nuclei` low/medium/high/critical
6. Manual validation → high value only

Record every discovered host/endpoint/secret into `raptor_state(set={surface:{...}})` as you go — that is what powers `raptor_diff` on re-runs.
