# Historical Records & Archives

## Web archives

```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=example.com*&output=json&limit=500&collapse=digest"
gau --threads 5 example.com
waybackurls < seeds.txt
```

Use for: old staff pages, former product pages, historical contact details, retired portals,
security-relevant pages that were later removed.

## Historical DNS and registration

Archived WHOIS records and passive DNS show nameservers, registrants, and hostnames that existed
before a privacy change or a migration. These are how "current" contact details are recovered for a
domain that is now privacy-protected.

## Old accounts and aliases

- Archived profile pages (LinkedIn snapshots, Twitter archives, forum posts).
- Old usernames from breach data or archived bios.
- Past employers and job titles — an employment timeline.
- Deleted-and-recreated accounts, and the usernames that were reused.

## Breach timeline

Corpus timestamps give an activity history: which services were used and when. That dates the
subject's digital life and shows when a given credential was created.

## Corporate history

- Company name changes, mergers, acquisitions, rebrandings → old domains → old assets.
- Archived marketing pages list former staff and former email formats.
- Regulatory filings and press releases over time.

## Git history as an archive

```bash
git log --all --format='%h %ad %an <%ae> %s' --date=short
git log --all -p --diff-filter=D -- '*.env' '*.pem' '*.key'
```

Deleted files stay in history: old config, old credentials, old internal hostnames, old employee
emails. Use `--diff-filter=D` to find what was removed.

## Archive hygiene

- Archived pages can be poisoned or misleading — confirm with a second source before a claim.
- A snapshot is a point-in-time fact: date every archived finding.
- If an archived page exposes something that is now fixed, it is still a finding — historical
  exposure matters in a breach/incident timeline.
