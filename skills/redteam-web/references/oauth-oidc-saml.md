# OAuth / OIDC / SAML Attacks

Identity providers are the highest-leverage single target in a web app: break the IdP and every
downstream service inherits the break.

## OAuth 2.0 — test the flow, not the docs

### Redirect URI validation

```
/authorize?client_id=...&redirect_uri=https://evil.tld/cb&response_type=code&state=...
```

| Case | Test |
|---|---|
| Exact match only | `https://app.target/cb` → `https://app.target/cb.evil.tld` |
| Prefix match | `https://app.target` → `https://app.target.evil.tld` |
| Subdomain wildcard | `https://evil.app.target` |
| Scheme downgrade | `https://` → `http://` |
| Path confusion | `https://app.target/cb` → `https://app.target/cb/../../x` |
| Fragment leak | `https://app.target/cb#` |
| Open-redirect relay | register `https://app.target/redirect?url=` as your redirect_uri |

A successful redirect to your domain with the `code` in the query = **authorization code interception**.

### Authorization code vs implicit

- If the app still supports `response_type=token` (implicit), the token lands in the URL fragment → leakable via referrer/history.
- If it supports `response_type=code` without PKCE, the code is replayable from the browser history or a leaked referrer.

### PKCE

- `code_challenge` absent → no PKCE.
- `code_challenge_method=plain` → `code_challenge == code_verifier` → PKCE is decorative.
- S256 present → challenge is fine; the attack becomes code-interception via another vector (open redirect, referrer, log).

### Other OAuth checks

- **State**: missing or not validated → CSRF into your account (login CSRF / account pre-hijacking).
- **Scope**: request `scope=openid email https://mail.google.com/` or broader than the app needs → over-scoped tokens.
- **Client type**: public clients with a `client_secret` in the app → secret extraction.
- **Refresh token**: long-lived, not rotated, not bound to a client → replay after logout.
- **Token storage**: ID token in `localStorage` → any XSS steals it.

### Token attacks

```bash
# decode and inspect
python3 -c "import jwt,sys;print(jwt.decode(sys.argv[1],options={'verify_signature':False}))" "$TOKEN"

# algorithm confusion / alg=none
jwt_tool $TOKEN -T
```

Check the token for: `aud` (is it the right client?), `iss`, `exp` enforcement, `azp`, `scope`,
`nonce` (must be bound to the session), and `at_hash`.

## OIDC

### Discovery

```
GET /.well-known/openid-configuration
```

Note the endpoints, the supported algorithms (`id_token_signing_alg_values_supported`), whether
`userinfo` is present, and the `scopes_supported`.

### The core bug class: `sub` confusion

In OIDC, `sub` must be locally unique and **pairwise** per client. Bugs:

- `sub` = email → email change = account takeover.
- `sub` = username → username reuse across sites = takeover.
- `sub` = constant or absent → all accounts merge.
- `sub` changes between client A and client B → the same user is two users (or vice versa).

### ID token validation

- `alg: none` accepted?
- `aud` = client id? (not just "present")
- `azp` present when there are multiple audiences?
- `iss` exact match (no subdomain wildcard)?
- `nonce` checked against the session?
- `at_hash` checked when the token is returned alongside an access token?
- `exp` and `nbf` enforced?
- `iat` freshness?

### Dynamic client registration

If the IdP allows open registration (`POST /register`), you can create a client with a redirect_uri
you control, then walk the flow.

### Account linking

An IdP that auto-links accounts by verified email lets an attacker who controls one email at a
consumer site take over the enterprise account with the same email. Test the linking flow with an
email you control at a non-IdP site.

### Logout

- RP-initiated logout without `id_token_hint` → the session at the IdP survives.
- No `post_logout_redirect_uri` validation → open redirect through the IdP.
- Front-channel logout not implemented → the session survives on other RPs.

## SAML

### Signature wrapping

The classic: the XML contains **two** signatures — one over the real assertion, one over a
tampered copy. A naive verifier validates signature #1 and reads assertion #2.

Test: take a valid response, modify the assertion, re-sign with a signature the verifier will
accept, and see if the signature still validates.

Practical check: does the verifier check that the signed element is the one it uses?

### Assertion vs response validation

| Check | Why |
|---|---|
| Signature covers the element you read | signature wrapping |
| `NotBefore` / `NotOnOrAfter` enforced | replay window |
| `Audience`/`AudienceRestriction` | token replay to another SP |
| `Recipient`/`Destination` | cross-SP replay |
| `InResponseTo` | CSRF / unsolicited assertion injection |
| `SubjectConfirmationData` | bearer vs holder-of-key |
| `Issuer` | cross-IdP acceptance |

### Common SAML flaws

- **Unsigned assertion accepted** — sign it yourself.
- **`alg` confusion** — `RSA-SHA1` downgraded, or the XMLDSig reference to a comment node.
- **XML signature wrapping** as above.
- **`Destination` not checked** — replay a SAML response from SP A to SP B.
- **`InResponseTo` not checked** — inject a SAML response into a victim's browser (login CSRF).
- **Assertion replay** — no `NotOnOrAfter` or a long window; capture and replay for hours.
- **XSLT in the SAML XML** — an `<xsl:stylesheet>` in the response can read files or make the
  verifier issue requests. Test with a benign `<xsl:value-of select="document('file:///etc/passwd')"/>`.
- **Open redirect via `RelayState`** — it is passed to the SP without validation.

### Tools

```bash
# enumerate and decode
python3 -c "import xml.dom.minidom,sys;print(xml.dom.minidom.parse(sys.argv[1]).toprettyxml()[:4000])" response.xml

# toolkite
pip install toolkite
python3 toolkite.py -t https://saml.target/login -r saml_rce.txt
```

`references/../` — pair with `toolsmith` if `samltool`, `pysaml2` or `xmlsec1` are missing:

```bash
apt-get install -y xmlsec1
pip install pysaml2
```

## Chaining

- OAuth redirect misconfig → code theft → access token → API access → chain into the resource server.
- SAML assertion injection → login as the victim → same.
- OIDC `sub` confusion → account linking between two RPs → cross-app pivot.

Each of these ends with the same next step: take the token, call the API, and record what you got.
