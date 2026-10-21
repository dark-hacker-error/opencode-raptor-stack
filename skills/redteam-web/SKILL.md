---
name: RedTeam Web — Advanced Exploitation Chains
description: Advanced web and API exploitation beyond single-bug scanning - multi-stage attack chains, OAuth/OIDC/SAML attacks, HTTP request smuggling and cache poisoning, race conditions and business-logic chains, GraphQL/gRPC/WebSocket/protobuf APIs, and WAF/CDN-aware testing. Use when the target is an HTTP service and the goal is a full chain rather than a single finding.
---

# RedTeam Web — Advanced Exploitation Chains

Scanners find single bugs. This skill finds **paths**: a low-severity quirk chained into account takeover into data access. The output is the chain, not the link.

> `references/chain-orchestration.md` — how to build and prove a chain.
> `references/oauth-oidc-saml.md` — identity-provider attacks.
> `references/smuggling-cache.md` — request smuggling, desync, cache poisoning.
> `references/race-business.md` — race conditions and business-logic chains.
> `references/api-modern.md` — GraphQL, gRPC, WebSocket, protobuf, API gateways.

## The method

### 1. Model the trust boundaries first

Before probing, write down:

```
browser ──> edge/CDN/WAF ──> gateway ──> service ──> data
                    │             │           │
              auth boundary   rate limit   tenancy
```

Every chain crosses at least one boundary. The interesting question is always: **which boundary does
this specific input cross?** A parameter that is only checked in one tier is a bypass waiting to be
found.

### 2. Build the asset model

| Asset | How to get it |
|---|---|
| Endpoints | JS bundles, OpenAPI, GraphQL introspection, sitemap, wordlist |
| Roles/tenants | register several accounts; look for tenant IDs in JWT/API keys |
| Identifiers | numeric IDs, UUIDs, slugs, emails — and how they are generated |
| Trust edges | internal service names in responses, `X-Forwarded-*` handling, CORS |
| State machines | the order of steps a workflow requires |

### 3. Probe by class, not by tool

Pick the class, then the technique, then the tool. A tool without a hypothesis produces noise.

### 4. Chain and prove

See `references/chain-orchestration.md`. Every chain needs:
- a **seed** (the low-severity opening),
- an **amplifier** (what turns it into something worse),
- a **verdict** (what the chain actually achieves),
- **evidence** for each hop.

## Class quick-reference

| Class | Start here | Typical verdict |
|---|---|---|
| AuthN / session | JWT alg & key confusion, OAuth redirect/PKCE/state, session fixation | Account takeover |
| AuthZ / IDOR | identifier swapping across roles and tenants | Cross-tenant data access |
| Injection | SQLi/NoSQLi/command/SSTI/XXE/LDAP | RCE or data read |
| Request layer | smuggling, desync, cache poisoning, host header | Auth bypass, cache-wide compromise |
| Client-side | DOM XSS, prototype pollution, postMessage, open redirect | Session theft, phishing |
| API surface | GraphQL introspection & batching, gRPC/protobuf, WebSocket auth | Mass data exposure |
| Logic | order skipping, price manipulation, race, coupon stacking | Financial loss, free access |
| Supply chain | leaked keys in JS/CI, exposed .git, subdomains | Full environment compromise |

## Rules

1. **Prove every hop.** A chain with an unproven middle link is three hypotheses, not one finding.
2. **One variable at a time.** When a request changes three things, you learn nothing when it fails.
3. **Keep the target healthy.** A desync or a race that crashes the service destroys the engagement and the evidence with it. Use `Connection: close` and small payloads first.
4. **Report the chain, then the links.** Lead with the verdict; the individual bugs are supporting evidence.
5. **Never fabricate.** A chain that you did not walk end to end is a candidate chain — label it as such.
