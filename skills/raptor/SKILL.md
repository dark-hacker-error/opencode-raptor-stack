---
name: Raptor Playbooks
description: Deep operational playbooks for the Raptor autonomous offensive-security agent - recon and fingerprinting, web exploitation, auth/session attacks, infrastructure and lateral movement, reverse engineering, malware analysis, detection artifacts and reporting. Load when running or planning an engagement.
---

# Raptor Playbooks

These are the depth behind the agent's decision loop. Load the reference that matches the current phase, not all of them.

| Phase | Reference | Use when |
|---|---|---|
| recon / fingerprint | `references/recon.md` | You know the target but not its shape |
| web + API surface | `references/web.md` | Target is an HTTP service, API, SPA |
| infra / post-ex | `references/infra.md` | You have a foothold, or the target is a network/AD |
| cloud / k8s / containers / IaC | `references/cloud-k8s.md` | Target is a cloud account, cluster, Docker host, IaC repo or mesh |
| forensics (disk/memory/stego/metadata) | `references/forensics.md` | Target is a disk image, memory dump, image file, document or incident |
| crypto / hashes / classic ciphers / CTF | `references/crypto.md` | Target is an MD5/SHA/bcrypt hash, a base64/hex blob, a substitution cipher or RSA key material |
| bug bounty / extended OSINT | `references/bugbounty.md` | Target is an in-scope bounty program or a person/org to correlate online |
| OSINT / subject intel | `references/osint.md` | Target is a domain, org, email, username or person |
| reverse engineering | `references/reverse.md` | Target is a binary, app, APK, firmware, .NET/Electron/WASM |
| malware | `references/malware.md` | Target is a suspicious sample, dropper, implant or PCAP |
| delivery | `references/report.md` | Turning evidence into a report the operator can act on |
| **attack selection** | `references/attacks-master.md` | **The master index — 1,469 techniques. Start here when the operator names a goal or a technique.** |

## Engagement decision tree

```
Target given
  │
  ├─ URL / domain / IP / CIDR ──► recon.md ──► web.md ──► infra.md
  ├─ source repo / web app dir ──► secret-hunt + code review ──► web.md
  ├─ binary / APK / .NET / WASM ──► reverse.md
  ├─ firmware image ─────────────► reverse.md (firmware section)
  ├─ cloud account / k8s cluster / docker host / IaC dir ──► cloud-k8s.md
  ├─ disk image / memory dump / picture / document ──► forensics.md
  ├─ hash / encoded blob / cipher / RSA key ──► crypto.md
  ├─ bounty program / handle / email to correlate ──► bugbounty.md
  └─ sample / PCAP ──────────────► malware.md
```

## Non-negotiables (repeat for every phase)

1. **Fingerprint before striking.** A plan built on a wrong stack guess wastes the whole run. Stack, version, auth model, and edge device first.
2. **Route, don't guess.** `raptor_route(intent=...)` gives the command, the install line, and the fallback. Guessing commands is how runs die.
3. **Prove or drop it.** `raptor_finding` only for reproduced issues. Candidates are `confirmed=false`.
4. **Low-impact proof first.** A marker string, one decoded row, one directory listing. Escalate only when the profile permits and the payoff is real.
5. **Record as you go.** Surface into `raptor_state`, proofs into `evidence/`, reusable lessons into `raptor_note`. A crash or compaction must not cost the run.
6. **Leave the target alive.** Stealth costs nothing and buys access. Trashing the target destroys the engagement.

## The attack graph

Do not think "checklist" — think "graph". Nodes are assets; edges are hypotheses.

```
seed host
 ├── dns ──► subdomains ──► vhosts ──► takeover? ──► zone claim (often no-fix)
 │                              └──► http services ──► tech stack ──► CVE match
 │                                                   ├──► auth model ──► role logic ──► admin
 │                                                   ├──► endpoints ──► injection ──► data
 │                                                   └──► JS/SPA ──► hidden routes ──► admin panel
 ├── credentials ──► reuse ──► sibling hosts ──► lateral ──► tier-0
 └── exposed artifacts ──► .git / .env / backup / source map ──► keys ──► cloud ──► full scope
```

Each edge gets: a hypothesis, the cheapest test, and what result would confirm or kill it. Write hypotheses into `raptor_state(add_hypothesis=...)` so the run stays coherent after compaction.

## Kill criteria (stop a branch)

- The hypothesis is disproven twice with different techniques → mark dead, move on, `raptor_note(kind="trap")`.
- The payoff is below the noise cost → drop it, record why.
- The target is a honeypot or a shared production box → switch to `stealth`/`friendly` profile immediately and reduce coverage.

## Noise budget

| Situation | Budget |
|---|---|
| Unknown target, first touch | ≤ 5 requests/host, no scanning |
| Identified production host | ≤ 1 req/s, no directory brute force without a signal |
| Confirmed vulnerable host | free, but keep proof minimal |
| Honey/limited-monitor environment | profile `stealth`, single-thread, randomised delay |

## Order of operations (default)

1. `raptor_engage` → `raptor_doctor` → read memory
2. Passive recon (CT logs, archives, search) — free, silent, high yield
3. Active surface (resolve, port scan, HTTP triage) — quiet
4. Content discovery + API mapping + secret hunting — targeted
5. Template sweep (`nuclei`) — triage list, not findings
6. Manual validation of top candidates — confirm or kill
7. Exploit chain: identify → confirm → exploit → pivot → persist → prove
8. Post-ex: enumerate next pivots, capture depth proof
9. `raptor_finding` for each proven issue, `raptor_report`, chat summary
