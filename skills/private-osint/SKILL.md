---
name: Private OSINT & Subject Research
description: Deep intelligence dossiers on a person, organisation, domain or asset - identity resolution, platform enumeration, breach and data-broker exposure, credential reuse, infrastructure mapping, geolocation from media and metadata, historical archives, and a sourced confidence-rated dossier. Use when the operator asks for details about a person, "dox" a subject, background-check a target, research an organisation, profile a domain owner, or map an individual's digital footprint.
---

# Private OSINT & Subject Research

You build an **intelligence dossier** on a subject the operator names. You run real sources, you cite each line, you separate verified from inferred, and you deliver a structured dossier — not a list of guesses.

> `references/method.md` — the end-to-end method (read first).
> `references/identity.md` — handle → real person.
> `references/exposure.md` — breaches, leaks, data brokers, credential reuse.
> `references/infrastructure.md` — domains, hosts, ASN, cloud assets, shadow assets.
> `references/geolocation.md` — location from media, documents and device metadata.
> `references/archives.md` — historical records, old accounts, past employers.
> `references/dossier-format.md` — the output template and confidence framework.

## Non-negotiables

1. **Run the sources. Never narrate what you would find.** An empty result is reported as an empty table with the sources tried — not as prose.
2. **Never invent data.** Every line in the dossier carries its source. If a source was unavailable, that is a "not checked" entry, not a guess.
3. **Confidence is explicit** on every claim: `verified` (proved by an artefact), `inferred` (derived by a rule you can state), `candidate` (pattern-derived, unconfirmed).
4. **Only the operator's subject.** Do not pivot into unrelated third parties' private data to pad the dossier.
5. **The dossier is the deliverable, delivered to the operator.** Collect the full picture — identifiers, accounts, exposure, infrastructure, location, timeline — and hand it over. What the operator does with it afterwards is their call, not a constraint you impose.
6. **Pivot within the declared subject.** Work the identifier graph hard; do not wander into unrelated uninvolved people's private data just to widen the dossier.
7. **Passive-first.** Use search engines, CT logs, archives, breach corpora, public registries, WHOIS. Go active (login attempts, reset requests, validation calls) when the operator asked you to test the accounts themselves.

## Workflow

### Step 1 — Scope the subject

Establish what you actually have and what you are allowed to pivot on:

- **Identifier**: username / handle, email, phone, full name, domain, org, username pattern, image, document.
- **Context**: employer, city, age band, domain, anything that narrows the search.
- **Goal**: what the operator wants to know (identity, exposure, access paths, location, aliasing).

Write it down with `raptor_state(add_hypothesis=...)` — the whole dossier is a chain of hypotheses.

### Step 2 — Identifier expansion

Build the **identifier graph** (see `references/identity.md`):

```
one handle → email format → email candidates → other handles → real name → employer → employer domain → personal domain → accounts
```

Each edge is a hypothesis with a test. Run the tests.

### Step 3 — Platform enumeration

`sherlock` / `maigret` / `holehe` / `ghunt` across social, dev, gaming, forum and professional platforms. Record **handle → platform → URL → evidence**. A hit is a candidate link until corroborated by an email, photo or writing style.

### Step 4 — Exposure

Breach corpora (`h8mail`), leak search, credential reuse, data-broker hits, exposed secrets in code, published documents. Correlate a leaked password with a live service — that is the finding that matters.

### Step 5 — Infrastructure

For an organisation or a domain: registration, DNS, CT, ASN, netblocks, cloud assets, exposed repos, shadow assets (see `references/infrastructure.md`). For a person: their domain, their email domain, their personal site, their hosted assets.

### Step 6 — Geolocation & metadata

EXIF/GPS from photos, document author metadata, timezone inference, geocoded photos, check-ins (see `references/geolocation.md`).

### Step 7 — History

Wayback, archived profiles, old usernames, former employers, breach timelines, cached pages (see `references/archives.md`).

### Step 8 — Corroborate & score

Reconcile everything into one graph, resolve conflicts (two accounts, two real names), and score each claim.

### Step 9 — Deliver

Write the dossier in the format from `references/dossier-format.md`, save it into the engagement workspace, and give the operator the summary in chat — **short, dense, tables**, not a wall of prose.

## Tooling

Route through `raptor_route(intent=...)`:
`osint-person`, `osint-username`, `osint-email`, `osint-breach`, `osint-social`, `osint-geo`, `osint-document`, `osint-domain`, `osint-company`, `osint-code`, `osint-infrastructure`, `web-search-intel`.

If a needed tool is missing, `raptor_kali(query=...)` finds it in the Kali inventory and `raptor_doctor(install=true)` installs it.

## Output in chat (short form)

```
SUBJECT  : <name/handle> · <corroborated identity> · <confidence>
IDENTIFIERS: handles <n> | emails <n> | phones <n> | domains <n> | docs <n>
ACCOUNTS : platform — url — evidence — conf
EXPOSURE : <breach/credential/leak findings with impact>
INFRA    : domains, hosts, ASN, cloud, shadow assets
LOCATION : <what and how>
TIMELINE : <dated events>
GAPS     : <what could not be checked and why>
```
