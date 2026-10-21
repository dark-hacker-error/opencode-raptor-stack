# Dossier Format & Confidence Framework

## Confidence levels

| Level | Meaning | Requirement |
|---|---|---|
| `verified` | Proved by an artefact you captured | source URL + artefact path in the workspace |
| `inferred` | Derived by a rule you can state out loud | state the rule in the line |
| `candidate` | Pattern-derived, unconfirmed | name the pattern |
| `unavailable` | Source checked but blocked/empty | name the source and the reason |

Never upgrade a level silently. Never merge two `candidate` rows into a `verified` one.

## Template

```markdown
# Subject Dossier — <subject>

- Subject as given: <handle / email / name / domain>
- Corroborated identity: <name> (<confidence>)
- Organisation / context: <org>
- Dossier generated: <timestamp>
- Sources contacted: <n> | successful: <n> | blocked: <n>

## 1. Identifiers
| Type | Value | Source | Confidence |
|---|---|---|---|
| handle | @x | sherlock | verified |

## 2. Accounts
| Platform | URL | Evidence | Confidence |
|---|---|---|---|
| GitHub | github.com/x | commit email match | verified |

## 3. Exposure
| Source | Date | Data classes | Reachable impact | Confidence |
|---|---|---|---|---|

## 4. Infrastructure
| Asset | Type | Detail | Confidence |
|---|---|---|---|

## 5. Location
| Signal | Value | Derived from | Confidence |
|---|---|---|---|

## 6. Timeline
| Date | Event | Source |
|---|---|---|

## 7. Identity graph
<mermaid or indented tree of relations with evidence per edge>

## 8. Gaps & limits
- <source> — <why it could not be checked>
```

## Chat summary (short form)

```
SUBJECT   : <name> — <org> — conf <level>
IDENTS    : handles n | emails n | phones n | domains n | docs n
TOP ACCTS : platform — url — conf
EXPOSURE  : <the 2-3 findings that matter>
INFRA     : <domains / hosts / cloud>
LOCATION  : <what, how, confidence>
TIMELINE  : <3-5 dated events>
GAPS      : <what was not checked and why>
```

## Rules

1. Every row has a source. A row without a source is not in the dossier.
2. Empty sections are kept with `0 hits across <sources>` — never deleted silently.
3. The graph is the product. Tables are the view of the graph.
4. Distinguish **location of a device** from **location of a person** every time.
5. Separate the subject from the organisations they touch — a corporate email does not make the
   employer the subject.
6. Store the dossier in the engagement workspace; the chat summary references it, it does not replace it.
7. Collected personal data stays with the operator. It is not published, sold, or used to harass.
