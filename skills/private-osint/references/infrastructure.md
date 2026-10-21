# Infrastructure Mapping — domains, hosts, cloud, shadow assets

## Registration

```bash
whois <domain> > whois.txt
amass intel -d <domain> -whois -asn
```

Capture: registrant, admin/tech contacts, registrar, creation and expiry dates, nameservers,
DNSSEC state. Historical WHOIS (via archives) often exposes contacts from before a privacy change —
that is the pivot to a person.

## DNS

```bash
dnsx -d <domain> -a -aaaa -cname -ns -mx -txt -ptr -soa -silent
dig <domain> ANY +noall +answer
```

Look for: mail config (SPF/DMARC — a weak SPF is a spoofing finding), CNAMEs to third-party SaaS
(takeover surface), TXT records with internal hostnames or verification tokens, delegated subdomains
to other providers.

## Certificate transparency

```bash
curl -s "https://crt.sh/?q=%25.<domain>&output=json"
tlsx -d <domain> -san -cn -so
```

CT is the cheapest passive subdomain source and often shows **staging and internal names** that DNS
does not resolve publicly.

## ASN and netblocks

```bash
amass intel -d <domain> -asn -ip
whois -h whois.arin.net <ip>
```

Map the organisation's whole address space, then look for hosts that resolve inside it but are not
obviously hosted — forgotten servers, jump hosts, build boxes.

## Cloud assets

```bash
aws s3 ls s3://<bucket> --no-sign-request
s3scanner scan -bucket-file buckets.txt -enumerate
cloud_enum -k <keyword> -l bucket_list.txt
gcloud storage ls -a gs://<bucket>
az storage account list -o table
```

Name patterns to try: `<org>`, `<org>-dev`, `<org>-backup`, `<org>-assets`, `<org>-<service>-<env>`,
`www-<org>`, `<service>-<org>`. An open bucket holding app files or credentials is a critical finding
on its own.

## Shadow assets

The highest-yield category:

- **Forgotten subdomains** still resolving (staging, dev, old, v1, test, admin, backup, internal).
- **Historical DNS** showing decommissioned hosts that may still be up.
- **Leaked internal hostnames** in code, configs, logs, JS bundles, certificates.
- **Public CI/CD configs** (`.github/workflows`, `.gitlab-ci.yml`) that leak deploy keys or endpoints.
- **Default admin panels** on non-standard ports.
- **Telegram / VPN / proxy endpoints** mentioned in leaked configs.

## Source-level intelligence

```bash
git clone --mirror <repo> repo.git && git -C repo.git log --all -p | head -5000
trufflehog git file://repo.git --only-verified
```

Commit history leaks internal hostnames, employee emails, API keys, deleted credentials and design
documents.

## Infrastructure output

| Field | Content |
|---|---|
| Domain / registrant / dates / NS | registration record |
| Subdomains | resolved hosts, source (CT/DNS/brute/passive), and what each runs |
| ASN / netblocks | owned address space |
| Cloud assets | buckets, containers, registries, and whether they are open |
| Shadow assets | forgotten hosts and why they matter |
| Leaked infrastructure | hostnames, endpoints, keys, from source or breaches |
| Takeover candidates | dangling CNAMEs with the provider |
