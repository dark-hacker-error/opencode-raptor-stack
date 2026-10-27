# Bug-bounty & extended OSINT playbooks

Targets: an in-scope web target, a domain, a user handle, a personal email.

## One-pass subdomain siege

```bash
subfinder -d {target} -all -silent -o {out}/subs.txt            # fast passive
amass enum -passive -d {target} -o {out}/amass.txt               # deep passive
cat {out}/subs.txt {out}/amass.txt | sort -u > {out}/all_subs.txt # MERGE FIRST
dnsx -l {out}/all_subs.txt -silent -a -resp -o {out}/resolved.txt  # one resolution pass
httpx -l {out}/resolved.txt -silent -status-code -title -tech-detect -o {out}/live.txt
# brute with alterx only after passive failed to load the attack surface
alterx -l {out}/all_subs.txt | sort -u | dnsx -silent -a -o {out}/alterx_resolved.txt
```

Add per-source counts to the report — "subfinder 128, amass 211, ct-logs via dnsx 44" — that is
provenance, not noise.

## Takeover

```bash
subjack -w {out}/all_subs.txt -ssl -v -o {out}/takeover.txt
subzy run --targets {out}/all_subs.txt -o {out}/subzy.txt
nuclei -tags takeover -l {out}/resolved.txt -silent -o {out}/takeover_nuclei.txt
```

A tool hit is a **candidate**. The finding is real when the claim path is verifiable: name the
service, the CNAME, what a deploy would give you.

## Parameter + secret hunting

```bash
waymore -i {target} -mode U -oU {out}/waymore.txt           # historical urls
gau {target} > {out}/gau.txt
katana -u https://{target} -d 3 -jc -kf all -silent -o {out}/katana.txt
paramspider --domain {target} --output {out}/params.json       # archived parameter keys
arjun -u https://{target}/endpoint -m GET,POST -o {out}/arjun.json # live param discovery
x8 -u https://{target}/endpoint -w params_wordlist.txt         # diff-based param probing
trufflehog git https://github.com/{org}/{repo} --only-verified --json | head -120
detect-secrets scan {path} --json > {out}/detect_secrets.json
```

Report secrets by **type + file + 8-char fingerprint**. Never paste the raw value.

## Visual survey + screenshots

```bash
aquatone -out {out}/aquatone -n 8 -t 10m < {out}/live.txt        # screenshots + html report
gospider -S {out}/live.txt -q -s -d 3 -o {out}/gospider          # light crawl for form endpoints
```

## Infrastructure / platform OSINT

```bash
theHarvester -d {domain} -b all -f {out}/harvester.html          # emails, hosts, subdomains
shodan search 'ssl:{domain}' --limit 80 --fields ip_str,port,transport
censys search 'services.tls.certificates.leaf.subject: {host}' --limit 50
recon-ng -m recon/domain-hosts/hackertarget ...                    # module-driven workflows
spiderfoot --scan {target} --output json                           # multi-source graph
social-analyzer --username '{handle}' --profile info               # social account metadata
# local helpers — no key needed / tells you when a key IS needed
python3 ~/.raptor/tools/local/hibp_lookup.py --breaches '<email>'
python3 ~/.raptor/tools/local/hibp_lookup.py --password '<pw>'      # k-anonymity: true pwn-status
python3 ~/.raptor/tools/local/pipl_lookup.py --query '<name,city>'  # honest 'no key' when absent
```

When a source is paid-tier only, say exactly which tier would have answered and stop. Do not pad
the dossier with simulated results.

## Proof-of-concept discipline in bounty work

- one bug per finding — chains become their own entries with a parent reference
- every finding: **surface → entry point → proof payload → impact → fix** in 5 lines
- severity evidence: cannot bypass = "high: auth bypass, no MFA", not "info: might be possible"
- leave the target functional — PAY INTO THE FUTURE: prevent permanent damage from rate-limit or destructive proof
