# Modern API Surfaces — GraphQL, gRPC, WebSocket, Protobuf, Gateways

## GraphQL

### Discovery

```
/graphql, /api/graphql, /gql, /query, /v1/graphql
```
Try `GET` with `?query={__schema{types{name}}}` — many servers allow introspection on GET.

```bash
curl -s 'https://target/graphql' -H 'content-type: application/json' \
  -d '{"query":"{__schema{types{name,fields{name,args{name,type{name}}}}}}}"}' | jq .
```

### What to pull

```
__schema { types { name kind fields { name args { name type { name kind ofType { name } } } } } }
__type(name: "Query") { fields { name } }
```

Build a table: `query/mutation -> field -> args -> auth`.

### Attack classes

| Class | Test |
|---|---|
| Introspection exposed | production leak of the whole schema |
| Missing resolver authz | call an admin mutation with a normal token |
| Field-level authz | query a field you should not see, nested through another resolver |
| Batching abuse | send 100 aliases in one query to amplify |
| Nested depth | recursive `friends { friends { ... } }` to exhaust resources |
| Query complexity / cost | does the server enforce a cost limit? |
| Batching bypass | per-request cost limits instead of per-operation |
| Error-based injection | string/number fields flow into a SQL/NoSQL sink |
| Mutation CSRF | state-changing mutation reachable by GET or by a cross-origin POST |
| Aliasing | the same field requested under many aliases to bypass a per-field rate limit |
| Fragment abuse | circular fragments cause stack exhaustion |

### Batching and amplification

```json
{"query":"query { a:user(id:1){email} b:user(id:2){email} c:user(id:3){email} ... }"}
```

Ten thousand aliases in one request — if it succeeds, that is a denial-of-service vector and a
data-exfiltration amplifier. Report it as an amplification finding (and keep the batch size sane
while testing — 100, not 10000).

### Persisted queries and allowlists

If the server only allows persisted/hashed queries, the allowlist itself is the attack surface:
hash collisions, disabled persisted-query validation, GET vs POST differences.

### Tools

```bash
pip install graphql-cop inql
graphql-cop -u https://target/graphql -o schema.json
```

## gRPC / Protobuf

### Discovery

gRPC over HTTP/2 with `application/grpc` content type. Signs: port 50051/8080/443, `grpc-` headers,
`.proto` files in JS bundles, `grpc-web` in the frontend.

```bash
# grpcurl reflection (if enabled)
grpcurl -plaintext target:50051 list
grpcurl -plaintext target:50051 describe api.Service
grpcurl -plaintext -d '{"id":"1"}' target:50051 api.Service/GetUser

# HTTP/2 prior knowledge
curl --http2-prior-knowledge -s https://target:50051/ -H 'content-type: application/grpc' --data-binary $'\x00\x00\x00\x00\x00'
```

### Where the schema comes from

- Reflection enabled → enumerate everything.
- `.proto` in the repo, in a JS bundle, or in a published SDK.
- Error messages that echo method names.

### Attack classes

- **Missing per-method authz** — the interceptor checks login but not the method.
- **Reflection exposed in production** — full schema.
- **No TLS** or TLS without verification.
- **Metadata leakage** — auth headers passed in gRPC metadata are logged by proxies.
- **Message fields not validated** — a field the client can set that changes server behaviour (role, tenant, price).
- **Protobuf `Any`/oneof abuse** — arbitrary type confusion.
- **No rate limit** on unary calls → amplification.

## WebSocket

```bash
websocat -v wss://target/ws
```

Test:
- **Origin check** — connect with `Origin: https://evil.tld`.
- **Auth at handshake vs per-message** — is the token checked on every frame?
- **Message tampering** — change `role`, `userId`, `amount`, `action` in a client→server frame.
- **Reconnection replay** — an old frame replayed after reconnect.
- **Subscription authorisation** — subscribe to another user's channel/topic.
- **Rate limiting** — flood count per connection.
- **No WSS** — plain `ws://` leaking tokens.

```
{"action":"subscribe","topic":"user:42"}      <- does it check you are user 42?
```

## Protobuf / binary protocols

For non-gRPC protobuf over HTTP or in a mobile app:

```bash
# discover the schema from a .pb / descriptor set
protoc --decode_raw < payload.bin
# look for field numbers in JS bundles
grep -rn 'protobuf' bundle.js
```

`protoc --decode_raw` on captured bytes often reveals field names and structure even without the
schema. Add unknown fields — servers often ignore unrecognised field numbers, which is a classic
mass-assignment vector in binary protocols.

## API gateways

| Gateway | Where to look |
|---|---|
| Kong | admin API `/admin`, key-auth plugin, `/status` |
| Envoy | `/stats`, `/clusters`, admin interface on 9001 |
| APISIX | `/apisix/admin` (default key `edd1c9f034335f136f87ad84b625c8f1`) |
| Traefik | `/api/overview`, `/dashboard` |
| AWS API Gateway | `_apis` path, `OPTIONS` on the stage |
| Cloudflare | `cdn-cgi/trace`, `/cdn-cgi/*` |

```bash
curl -s https://target/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'
curl -s http://target:9001/stats/prometheus | grep -i upstream
```

A gateway admin API left reachable is a critical finding: it usually allows adding a route that
bypasses authentication entirely.

## Cross-cutting

1. **Map every surface** before testing: GraphQL schema, gRPC services, WS channels, gateway
   endpoints, plus the REST surface.
2. **Test authz per operation**, not per surface — a surface can have 40 operations and one
   unprotected mutation.
3. **Look for the second protocol** — many apps expose REST and gRPC over the same service, and the
   gRPC path often skips the REST middleware.
4. **Batch and alias** to measure amplification, in small doses.
5. **Prove the operation, not the endpoint** — one successful unauthorized mutation is the finding.
