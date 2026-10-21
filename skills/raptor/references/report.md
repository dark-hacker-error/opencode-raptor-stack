# Evidence, Reporting & Delivery

## 1. Evidence standard

A finding is **confirmed** only when a competent engineer can reproduce it from the record alone.

Required for every confirmed finding:
1. **Exact request** (raw HTTP, or the exact command + arguments).
2. **Exact response** — the relevant part, verbatim, not paraphrased.
3. **Artefact path** — where the raw capture lives (`evidence/<id>.*`).
4. **Impact proof** — what the attacker gained, demonstrated (one decoded row, one key, one uid, one file listing).
5. **Reproduction steps** — copy-pasteable.
6. **Fix** — the specific change, not "sanitise input".

Never record as confirmed: a scanner signature alone, a 500 error, a version banner, a theoretical path, or anything you did not observe.

## 2. Severity rubric

| Severity | Criteria |
|---|---|
| Critical | RCE as a service; full auth bypass; domain/cloud compromise; key material that grants broad access; unauthenticated DB dump |
| High | Stored XSS in an authenticated area; SQLi with write access; SSRF reaching cloud metadata; privilege escalation to root/domain admin; exposed `.git` with live credentials; file upload → code execution |
| Medium | Reflected XSS; IDOR limited to low-sensitivity objects; missing rate limit on auth; verbose errors with internal paths; outdated dependency with a real but conditional CVE |
| Low | Security headers missing; version disclosure; cookie flags; verbose banners; default content on admin pages |
| Info | Hardening notes, defence-in-depth suggestions |

Adjust for **exploitability** (internet-facing vs internal), **data sensitivity**, **blast radius**, and **preconditions** (requires a valid account? a specific role?). A reflected XSS on an internal-only admin panel is not a High.

CVSS: give a vector string, not just a number, and make the vector match the described impact.

## 3. Finding record (what `raptor_finding` stores)

```
id        : F-<base36>
title     : "<class> — <where>"                  e.g. "SQL injection — /api/v1/orders?id"
severity  : critical | high | medium | low | info
category  : sqli | rce | idor | auth-bypass | ssrf | privesc | exposure | misconfig | ...
endpoint  : the exact vulnerable request
cvss      : number
cve       : if applicable
evidence  : verbatim proof
poc       : reproduction steps
impact    : what is gained
fix       : the specific remediation
confirmed : true | false
```

Title format matters — a report where every finding reads "SQL injection" is unactionable. Name the class and the location.

## 4. Report structure

`raptor_report` writes `report.md` / `report.json`. The narrative you write in chat should follow:

```
1. Target & scope          — what was assessed, when, from where, profile
2. Executive summary       — 3-6 sentences: posture, top risk, count by severity
3. Attack surface          — hosts, services, technologies, entry points, trust boundaries
4. Attack path / chain     — how an attacker moves from the entry point to the objective
5. Findings                — ordered by severity, each with evidence + repro + fix
6. Attack graph / Gaps     — what was tried, what was reachable, what was NOT tested and why
7. Detection & remediation  — detection ideas, fixes, retest plan, hardening priorities
8. Evidence index          — file paths for every artefact
```

Section 6 is what separates a real assessment from a checklist: **name the branches you killed and the ones you could not reach.**

## 5. Chat summary format

The operator gets the result in chat, not a file dump:

```
Engagement : <id>   Target: <target>   Profile: <profile>   Duration: <x>
Surface   : <n> hosts | <n> endpoints | <n> files | <n> secrets | <stack>
FINDINGS  : <n> confirmed (critical <n> | high <n> | medium <n> | low <n>)
  1. [CRITICAL] <title> — <one-line proof>
  2. [HIGH]     <title> — <one-line proof>
Chain     : <entry point> → <step> → <step> → <impact>
Top fixes : 1. <fix> 2. <fix> 3. <fix>
Untested  : <what remains and why>
Artifacts : <report path> | <evidence dir>
```

Match the operator's language. If they write Hinglish, write Hinglish; keep technical terms in English.

## 6. Continuous recon diff

`raptor_diff` compares the recorded surface (`state.surface`) against the previous snapshot and then snapshots the current state. Use it:

- on re-runs of the same target → new hosts, endpoints, files, secrets;
- during long engagements → detect what a new technique exposed;
- as a regression check → new exposure since the last assessment.

Report deltas explicitly ("since the last run: +3 subdomains, +1 exposed backup file, +1 leaked key") — that is often the highest-value sentence in a repeat engagement.

## 7. Cross-run memory

`raptor_note` writes to `~/.raptor/memory.md` and is read at the start of every engagement. Write:

- `chain` — a sequence that worked: "SSRF on /preview → 169.254.169.254 → IMDSv2 blocked → fallback IMDSv1 with X-Forwarded-For header worked".
- `trap` — a dead end that cost time: "CORS on this app reflects only the exact Origin, null-Origin test always fails".
- `intel` — reusable context about the target org: "staging.vendor.com uses the same SSO realm as prod".
- `finding` — a notable result worth carrying forward.

Keep each note one line, specific, and reusable. Memory is what makes run N+1 cheaper than run N.

## 8. Retest

Every finding ships with a retest command. A fix is not verified until the retest passes. Track retest status in a follow-up engagement on the same target and diff it with `raptor_diff`.

## 9. Handover quality bar

- The report must be readable by someone who did not run the engagement.
- No unexplained tool names — every tool named must be tied to a finding or a coverage decision.
- Every "not vulnerable" claim states what was tested and how (e.g. "SQLi: 5 parameters, boolean+time+error, all negative").
- Findings ordered by risk, fixes ordered by effort/impact, both stated.
