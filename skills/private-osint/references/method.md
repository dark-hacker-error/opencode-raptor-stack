# Method

## Phase map

| Phase | Question answered | Primary sources |
|---|---|---|
| 1. Scope | Who/what exactly, and what do we want to know? | operator |
| 2. Seed | What identifiers do we already hold? | operator |
| 3. Expand | What else does this identifier imply? | format rules, search engines, breach corpora |
| 4. Enumerate | Which accounts exist? | sherlock, maigret, holehe, ghunt, site searches |
| 5. Verify | Which links are real? | cross-account corroboration, live checks |
| 6. Expose | What is already public about them? | breach corpora, data brokers, leak search, code search |
| 7. Map | What infrastructure do they own/control? | whois, DNS, CT, ASN, cloud, repos |
| 8. Locate | Where are they / where were they? | EXIF, document metadata, timezone, geo-tagged media |
| 9. History | What changed over time? | Wayback, cached pages, breach timestamps |
| 10. Correlate | Which claims survive? | cross-source reconciliation |
| 11. Deliver | What does the operator need? | dossier template |

## Rules of expansion

**Format rules are the multiplier.** One confirmed username + email pair reveals the organisation's
naming rule. From `first.last@corp.com` you can generate every employee address from a name list —
and from the email you get the handle format, the GitHub namespace, the Jira username, the VPN account.

**Pivot ladder** (stop when the operator's goal is met):

```
handle → email → full name → employer → employer domain → org email pattern → sibling handles
      → personal domain → hosted assets → phone → physical location
```

**One pivot per hypothesis.** Record each as `raptor_state(add_hypothesis=...)` and close it with a
result, so the dossier shows what was tested and not just what was found.

## Corroboration rules

| Evidence | Confidence | Note |
|---|---|---|
| Same handle + same avatar + same bio on two platforms | verified | strong |
| Handle appears in a breach dump with an email | verified | the email belongs to that account |
| Handle exists on a platform | candidate | handle may belong to someone else |
| Email format matches and a profile shows the name | inferred | state the rule |
| Same name + same city + same employer | inferred | state the rule |
| Name search result | candidate | cheap, noisy |
| Geo-tagged photo from an account | verified (location of photo) | not necessarily current residence |

**Never upgrade a candidate silently.** If a claim ends as `candidate`, it stays `candidate` in the
dossier.

## Rate and footprint

- Passive first; no traffic to the subject's own infrastructure unless testing was requested.
- Respect platform rate limits; cache aggressively, sleep between bulk queries.
- Do not trigger account-recovery, login or validation flows to "check" an address — that creates an
  alert on the subject's side and can tip them off. Use breach corpora and public records instead.
- Randomised delays on any bulk enumeration.

## Handling collected data

- Store in the engagement workspace under `evidence/osint/` with the source URL and the capture time.
- Keep the raw artefact and the parsed claim side by side.
- The dossier goes to the operator. It is not posted anywhere, not published, not sold.
