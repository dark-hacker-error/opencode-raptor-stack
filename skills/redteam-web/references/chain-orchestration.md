# Chain Orchestration

A chain is a sequence of findings where each step's output is the next step's input. The report
leads with the verdict.

## Anatomy

```
SEED        a small, real defect
  │         e.g. IDOR on /api/v1/invoices/{id} returns another tenant's invoice
  ▼
AMPLIFIER  a property that turns it into a capability
  │         e.g. the invoice contains the tenant's API key, or a signed download URL
  ▼
PIVOT      the action the capability enables
  │         e.g. use that key against /api/v1/admin/export
  ▼
VERDICT    what you now control
            e.g. full export of every tenant's data (verified by one row count)
```

A finding with no amplifier is just a finding. A finding with an amplifier is a breach.

## Building chains

### Step 1 — collect the "boring" findings

Low-severity issues are the raw material: verbose errors, ID enumeration, open redirects, leaked
internal hostnames, weak rate limits, predictable IDs, unused parameters.

### Step 2 — map outputs to inputs

For every endpoint, list what it returns. Then ask: **is any returned value an input to another
endpoint?**

| Returned | Feeds |
|---|---|
| `user_id`, `org_id`, `tenant_id` | IDOR / cross-tenant access |
| API key, bearer token, session id | privilege escalation to that principal |
| internal URL, service name | SSRF into the internal network |
| file path, filename, bucket | path traversal, cloud storage access |
| email, username, phone | credential stuffing, account recovery abuse |
| signed URL, nonce, OTP code | replay, auth bypass |
| object key, cache key | cache poisoning, cross-user cache read |

That mapping is the chain graph. Build it explicitly.

### Step 3 — hunt for amplifiers

Amplifiers are properties that upgrade severity:

- **Privilege**: the data belongs to a more privileged principal than you.
- **Scope**: it works across tenants/orgs, not just your own objects.
- **Freshness**: it is live data, not a stale cache.
- **Multiplicity**: it works in bulk, not one record.
- **Persistence**: the access survives a restart or a token rotation.

Ask for each: does the seed's output amplify on this axis?

### Step 4 — walk the chain for real

```
1. capture request A (from your account)
2. capture request B (from the victim's object)
3. swap identifiers
4. observe the response
5. use what came back in the next request
6. repeat until the verdict
```

Save every request/response pair. The chain's value is that someone else can walk it too.

### Step 5 — classify the verdict honestly

| Verdict | Severity |
|---|---|
| Read one record you should not see | Medium |
| Read many records across tenants | High |
| Modify another user's data | High |
| Execute code on the server | Critical |
| Take over an administrator account | Critical |
| Access the cloud control plane | Critical |

## Multi-tenant chains

The highest-yield web chains are tenancy chains, because the IDOR primitive is usually easy and the
amplifier is usually total.

```
1. register account in tenant A
2. enumerate object IDs (numeric guess, or a leaked ID from another endpoint)
3. read tenant B's object  -> seed confirmed
4. look for tenant B's identifiers in the payload
5. reuse tenant B's identifier on a privileged endpoint
6. act as tenant B
```

Key questions that reveal the amplifier:
- Do IDs encode the tenant (`1002-9f3a`)? If so, changing the prefix may be enough.
- Is there a `tenantId` parameter that is validated client-side only?
- Do object IDs come from a global sequence (so you can enumerate other tenants')?
- Is there a "switch organisation" endpoint whose `orgId` is not re-authorised?

## Chaining session/identity attacks

```
password reset + email change without re-auth  ->  persistent account takeover
MFA bypass on one factor + session reuse          ->  bypass on all factors
OAuth redirect_uri manipulation + state leak      ->  code interception -> token
Open redirect + OAuth authorize                   ->  token theft via referrer
CORS misconfig + credentialed cookies            ->  read authenticated responses cross-origin
```

Test each link independently, then together.

## Chaining injection into lateral movement

```
SQLi (read-only)  ->  credential table  ->  log in as that user  ->  their permissions  ->  next hop
```

Limit extraction to what proves the point (one credential row), then use the credential. The finding
is the chain; the dump is evidence.

## Chaining web into infrastructure

```
SSRF -> 169.254.169.254 -> IAM role -> STS AssumeRole -> cloud API
SSRF -> internal admin API (port 8080) -> actuator/env -> database URL -> lateral
XXE -> file read -> /proc/self/environ -> credentials
Path traversal -> source of the app -> hardcoded keys -> other environments
```

Each hop changes the blast radius, so prove the hop and record the new position.

## Reporting a chain

```
CHAIN: <one line — from what to what>
SEED:    <finding> — evidence ref
AMPLIFY: <what the seed returned>
PIVOT:   <what you did with it>
VERDICT: <what you control now> — proof (row count, scope, one record)
IMPACT:  <business consequence>
LINKS:   <each finding id>
```

Report the chain first, the individual links after, ordered by severity.
