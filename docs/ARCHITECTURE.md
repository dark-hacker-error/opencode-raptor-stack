# Architecture

## Data flow

```
operator message
      │
      ▼
┌──────────────────────────────────────────────────────────┐
│ context hook (plugin)                                    │
│  ├─ resolves the message against master-attacks.json      │
│  │  → injects <attack-selection> with the matched names, │
│  │    the skill + reference to load, and the route intent │
│  └─ injects <privdata-sources> with the live API keys     │
└──────────────────────────────────────────────────────────┘
      │
      ▼
raptor agent (model)
      │  loads: raptor / redteam-* / mobile-rat / private-osint / toolsmith
      │  calls:  raptor_attacks → raptor_route → privdata_* → tools
      ▼
plugins
  raptor  : engage · route · kali · state · finding · doctor · report · diff · note · attacks
  privdata: apis · key · call · search · save
      │
      ▼
~/.raptor/engagements/<id>/   state.json · findings.jsonl · evidence/ · report.md
```

## Why the master index exists

Scanners find single bugs. The index is the **decision layer**: the operator's requirement is
resolved to a named attack technique, and each technique already knows its skill, its reference
file, its toolchain and how to verify it. That removes the improvisation step where an agent
guesses a technique and produces noise.

The index is built from three raw lists:

| Source | Content |
|---|---|
| `references1.md` | 26 technical categories (~1,216 techniques after segmentation) |
| `reference-human.md` | human / social / account attack families |
| `reference-account.md` | additional account & trust attacks |

`references1.md` has no delimiter between names, so `scripts/segment_attacks.py` does a
longest-match segmentation over a curated vocabulary, and `scripts/build_master_index.py` enriches
every name with its routing.

Regenerate after editing the raw lists:

```bash
python3 ~/.raptor/build_master_index.py
```

## Routing

`raptor_route(intent=...)` returns, for a curated intent:

- the exact command line, with `{target}` / `{out}` / `{param}` substituted
- whether the binary is installed
- the install line for what is missing (apt / go / pip / cargo / npm / snap / GitHub release)
- the fallback when the primary tool is absent
- how to read the result

Unknown intent → falls back to a raw tool name → then to a keyword search across the whole Kali
inventory (`raptor_kali`).

## Permissions model

| Action | Default | When |
|---|---|---|
| Conversation | always | a question gets an answer, no tools |
| Clarify | once | target missing or genuinely ambiguous |
| Execute | no second approval | inside the operator's declared target set |
| Destructive | on the operator's ask | inside the declared target set |
| Evidence | always | a finding needs proof; candidates are `confirmed=false` |

The target set is a parameter, not a restriction. The only hard limits are honesty (never fabricate
a result) and scope (a target the operator did not declare is not yours to work).

## Files that carry the load

| File | Role |
|---|---|
| `agents/raptor.md` | doctrine, the loop, the output contract |
| `plugins/raptor.ts` | the tool spine + master index resolver |
| `plugins/privdata.ts` | private-data API registry, keys, fan-out |
| `skills/*/references/*` | the playbooks — 1,469 techniques' how-to |
| `runtime/master-attacks.json` | the index data |
| `runtime/kali-catalog.json` | Kali classifier patterns |
