# Identity Resolution — handle to real person

## Platform enumeration

```bash
sherlock <handle> --output sherlock.txt --print-all
maigret --timeout 20 --no-color --txt maigret.txt <handle>
holehe <email> --no-color -o holehe.txt     # which services the address is registered on
ghunt <email> --output ghunt.json            # Google-centric account correlation
```

Read the results for **more than hits**: a platform account usually carries an email fragment, a
display name, a location string, a bio URL, or a linked GitHub — each one is a new seed.

## Deriving sibling handles

| Known | Implied | Test |
|---|---|---|
| `alice.smith@corp.com` | GitHub `alicesmith`, `asmith`, `alice-smith` | search each on GitHub/GitLab |
| `alice.smith` on 3 platforms | same person owns them? | avatar hash, bio, cross-links |
| `<handle>@gmail.com` in a paste | other handles in the same paste | grep for `handle`, `twitter`, `github` |
| git commit author | GitHub/GitLab account | `git log --format='%ae %an'` → search the author string |
| npm/PyPI package author | GitHub handle | package metadata → repository URL |
| breached username list | same username reused on other services | sweep the list against the target's own login endpoints |

## Corporate email format discovery

```
first.last@corp.com  |  flast@corp.com  |  first_last@corp.com
firstlast@corp.com   |  firstl@corp.com |  <first>@<last>.corp.com
```

Determine the rule from a **known-good pair** (from a published source, a commit, a press release).
Then:

1. Get a name list (company website, LinkedIn, press, conference talks, WHOIS org contacts).
2. Generate candidates.
3. Validate passively: does the address appear in a breach corpus, a public paste, a repo, a WHOIS contact, a certificate?
4. Use `smtp-user-enum` / `swaks` only when the operator asked for active verification, and only
   against the target organisation's own mail server.

Validated addresses become the credential-testing wordlist and the phishing-pretext basis.

## Real name and employment

- Published staff pages, conference rosters, press releases, patent filings, GitHub profiles,
  `whois` org contacts, regulatory filings.
- Certificates (`crt.sh`) sometimes expose names in the subject field.
- Public records and business registries for directorships and company roles.

## Identity graph

Store the graph, not the list:

```
handle:alice.smith ──email──> alice.smith@corp.com ──domain──> corp.com
      │                              │                             │
      ├──github──> github.com/alicesmith   ├──org──> Acme Ltd
      ├──linkedin──> linkedin.com/in/alicesmith
      └──matrix──> @alice.smith:corp.com
```

Each edge stores: relation, evidence URL, capture time, confidence. The graph is what makes a
dossier defensible — and what surfaces the unexpected connection (a personal handle that also owns
a company domain, an old handle that maps to a different employer).

## Aliases and history

- Old usernames, previous employers, former brand names, misspelled names, maiden names.
- Archive search for deleted profiles; breach timestamps give a timeline of account activity.
- An alias that maps back to the same person is a strong link — and also a finding (an alias
  intended to be unlinkable was linkable).
