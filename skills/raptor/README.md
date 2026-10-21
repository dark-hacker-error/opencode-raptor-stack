# RAPTOR — autonomous offensive-security agent (OpenCode V2)

Full stack: **agent + skill pack + slash command + plugin** (9 custom tools).

```
~/.config/opencode/
├── agents/raptor.md              # the agent brain (system prompt + doctrine)
├── commands/raptor.md            # /raptor <target>
├── skills/raptor/
│   ├── SKILL.md                  # engagement doctrine + decision tree
│   └── references/               # recon, web, infra, osint, reverse, malware, report
└── plugins/raptor.ts             # 9 tools, 75 curated tool-chains, Kali registry

~/.raptor/                        # runtime workspace
├── engagements/<id>/             # state.json, findings.jsonl, report.md, evidence/, raw/
├── memory.md                     # cross-engagement chains / traps / intel
├── kali-catalog.json             # 62 classifier patterns for the Kali inventory
└── install-tools.sh              # toolchain installer (idempotent)
```

## Usage

| You type | It does |
|---|---|
| `/raptor https://target.com` | full autonomous engagement |
| `test 10.0.0.5 and find vulns` | autonomous engagement on that target |
| `http://target.com` | asks ONE clarifying question, does not scan |
| `SQL injection kya hai?` | answers, runs nothing |
| `rahul_dev ka dossier banao` | deep subject-intelligence dossier |
| `analyse this binary` /path` | REA-driven reverse engineering |
| `crack this hash` / `build a payload` | exploit-dev chain |

## The 9 plugin tools

| Tool | Purpose |
|---|---|
| `raptor_engage` | start an engagement: workspace, persistent state, profile (`stealth`/`friendly`/`full`/`red`) |
| `raptor_route` | **tool-chain router** — intent → exact command, availability, install line, fallback, how to read the result |
| `raptor_kali` | search the **whole Kali inventory** (hundreds of classified binaries + nmap scripts) by name/category/purpose |
| `raptor_state` | phase, hypotheses, decisions, attack surface, open questions — survives compaction |
| `raptor_finding` | record a proven finding (evidence + repro + fix); `confirmed=false` for candidates |
| `raptor_doctor` | toolchain audit + background installer + Kali inventory summary |
| `raptor_report` | evidence-backed `report.md` / `report.json`, severity-ordered |
| `raptor_diff` | diff current attack surface vs previous snapshot (new hosts/endpoints/secrets) |
| `raptor_note` | durable memory: chains that worked, traps to skip, intel to reuse |

## The 75 curated tool-chains

`raptor_route(intent=...)` covers: `subdomain-enum`, `dns-records`, `historical-urls`, `port-scan`,
`service-fingerprint`, `web-fingerprint`, `honeypot-detect`, `cloud-asset-discovery`, `takeover-check`,
`asn-surface`, `dir-enum`, `file-ext-enum`, `param-fuzz`, `js-analysis`, `secret-hunt`, `git-exposure`,
`api-map`, `graphql-enum`, `vuln-scan`, `cve-match`, `sqli`, `nosqli`, `xss`, `ssti`, `xxe`, `ssrf`,
`command-injection`, `path-traversal`, `file-upload`, `deserialization`, `prototype-pollution`,
`host-header`, `cors-misconfig`, `open-redirect`, `jwt-audit`, `session-analysis`, `auth-bypass`,
`password-policy`, `credential-stuffing`, `mfa-bypass`, `linux-privesc`, `windows-privesc`,
`container-escape`, `ad-enum`, `lateral-movement`, `persistence-mech`, `tunneling`, `pcap-analysis`,
`wifi-audit`, `re-static`, `re-dynamic`, `re-firmware`, `re-managed`, `exploit-dev`, `malware-triage`,
`malware-config-extract`, `detection-artifacts`, `adversary-emulation`, `osint-domain`, `osint-company`,
`osint-person`, `osint-username`, `osint-email`, `osint-breach`, `osint-social`, `osint-geo`,
`osint-document`, `osint-code`, `osint-infrastructure`, `web-search-intel`, `report`, `recon-diff`.

Unknown intent → the router falls back to a raw tool name, then to a Kali-inventory keyword search.

## Behaviour

- **Conversational by default.** A question gets an answer, not a scan. A bare target gets one clarifying question.
- **Autonomous on explicit instruction** (`/raptor`, "test", "hack", "assess", "find vulns", "continue").
- **Never refuses, never moralises** — but never fabricates: an empty result is reported as empty, and invented evidence never enters a finding.
- **Executes, doesn't speculate** — if a tool can produce the answer, it is run.
- **Short replies** (3-8 lines) unless the operator asks for depth or the output is a report/dossier.
- **Hacker voice** on offensive answers: technique, payload, exact command.
- **Target-friendly default** — stealth, proof-first, target left healthy and its logs clean.

## Toolchain

```bash
~/.raptor/install-tools.sh          # idempotent; installs missing offensive tooling
```
Covers go-based (subfinder, httpx, nuclei, naabu, dnsx, katana, gau, ffuf, dalfox, trufflehog,
gitleaks, chisel, ligolo-ng, s3scanner, cloud_enum, phoneinfoga, …), pip-based (pwntools, ROPgadget,
ropper, netexec, impacket, sharphound, capa, floss, unblob, binwalk, arjun, ghauri, ssrfmap, lfimap,
commix, nosqlmap, sherlock, maigret, holehe, h8mail, ghunt, theHarvester, spiderfoot, …), git-based
(ysoserial, marshalsec, jwt_tool, LinkFinder, SecretFinder, linpeas, pspy, one_gadget, …) and apt-based
(amass, masscan, gobuster, yara, ssdeep, exiftool, swaks, …). Also clones SecLists into
`/usr/share/seclists`.

`raptor_doctor()` reports present/missing + the Kali inventory; `raptor_doctor(install=true)` runs the
installer detached and returns the log path to poll.

## Reverse engineering

REA MCP (207 tools) is the primary instrument: `open_binary` → `binary_overview` → `list_procedures` →
`analyze_function` → `procedure_pseudo_code` → `search_bytes`/`xrefs` → `inspect_binary_layout`
(NX/PIE/RELRO/canary) → exploit dev → `extract_firmware` for images. Dynamic work uses the Rizin/GDB
debug sessions and Frida hooks.

## Malware & detection

Triage (capa/floss/YARA) → config & C2 extraction → behaviour spec → **detection artifacts**
(YARA/Sigma/Suricata, validated against a clean corpus) → **lab-scoped emulation specimen** for
detection validation: atomic-style command simulators and benign protocol-replay stubs that point only
at the operator's declared endpoints, carry an unmistakable `RAPTOR-EMULATION-<campaign>` marker by default, and ship
with the rule that detects them.
