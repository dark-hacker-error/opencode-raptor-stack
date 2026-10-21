# Race Conditions & Business-Logic Chains

No scanner finds these. They need you to model what the application *means*.

## Race conditions

### The technique

Two requests, one shared resource, no locking. The window is usually between "check" and "act".

```python
import threading, requests

def race(url, n=50):
    s = requests.Session()
    hits = []
    def fire(i):
        try:
            r = s.post(url, json={"item": "x", "coupon": "SUMMER"}, timeout=10)
            if r.status_code == 200 and "discount" in r.text:
                hits.append(r.text[:200])
        except Exception: pass
    ts = [threading.Thread(target=fire, args=(i,)) for i in range(n)]
    for t in ts: t.start()
    for t in ts: t.join()
    return hits

hits = race("https://target/checkout")
print(len(hits), "wins")
```

`curl --parallel` works too:

```bash
seq 1 40 | xargs -P 20 -I{} curl -s -o /dev/null -w "%{http_code} " -X POST https://target/coupon
```

### Where races live

| Pattern | Example |
|---|---|
| Check-then-act | balance check, then debit |
| Coupon / voucher | one coupon applied twice |
| Invite / seat | last seat taken twice |
| Stock reservation | item ordered beyond stock |
| Password reset | two tokens generated, both valid |
| Email uniqueness | two registrations with the same email |
| Nonce / OTP | one OTP accepted twice |
| Refund / payment | refund processed twice |
| File lock / temp name | two writers collide on `/tmp/app.tmp` |

### Making the window reliable

- Increase parallelism (20-100 threads) and repeat for a few minutes.
- Add latency *before* the critical section if you can find the "check" request.
- Use `X-Forwarded-For` or a distinct `User-Agent` per thread if the app caches per client.
- Look for an artificial delay parameter, a slow upstream, or a queue.

### Proof

Show the **end state**, not just the double response: two successful charges, a negative balance,
a second order for the last seat, two valid reset tokens. Capture the final account state.

### Server-side races (not just HTTP)

Filesystem races: `ln`/`open(O_CREAT|O_EXCL)` as the safe pattern; a naive `if (!exists) write` is a
race. Symlink races in temp directories. TOCTOU in permission checks.

## Business logic

Model the workflow, then attack the model.

### Step skipping

Find the state machine from the UI/API, then call the final step directly:

```
/cart → /cart/checkout → /payment → /order/confirm
```

Call `/payment` or `/order/confirm` without the earlier steps. Look for:
- a missing server-side state check,
- a client-only `enabled` flag,
- an endpoint that trusts a client-supplied `state`/`status` field.

### Mass assignment / parameter trust

```json
{"sku": 1, "qty": 1, "price": 9999, "total": 0, "status": "paid", "userId": 42}
```

Does the server recompute `price` from the SKU, or trust the client? Does it accept `status`,
`role`, `tenantId`, `discount`, `balance`?

### Numeric & currency logic

| Attack | Test |
|---|---|
| Negative quantity | `qty: -5` |
| Integer overflow | `qty: 99999999999999999999` |
| Float precision | `qty: 0.0000001` |
| Currency mismatch | price in cents vs units, mixed currency codes |
| Rounding abuse | 33 x 0.01 across many orders |
| Coupon stacking | two coupons on one order |
| Coupon replay | one coupon on many orders |

### Inventory / pricing

- Order more than stock (negative stock reveals a fulfilment bug).
- Order with a client-supplied `price` field.
- Claim a coupon on a different account than the one that created it.
- Free trial → cancel → still keep the entitlement.

### Payment flows

- Set `amount=0` or `amount=1` and keep the item.
- Change the payee after initiating the payment (tamper with the amount in the redirect).
- Use a webhook/callback without verifying the payment actually happened.
- Replay a payment callback.
- Payment provider returns success for a failed charge (always verify server-side).

### Account & identity logic

- Change email/phone without re-authentication → account takeover.
- Link a second factor to an account you just took over.
- Signup with an email you do not control, then trigger a reset.
- Takeover via a "forgot password" flow that trusts a client-supplied account id.
- Enumeration → user list → targeted credential stuffing against the confirmed accounts only.

### Workflow / approval

- Approve your own request (self-approval).
- Skip the second approver by calling the approve endpoint directly.
- Reuse an approval token from a completed request.
- Change the amount after approval but before execution.

### Rate limits & abuse

- Per-endpoint vs per-user vs per-IP limits — where is the boundary?
- Burst vs sustained: a token bucket is bypassable in bursts.
- Limits on the UI but not the API (the API is where the money is).
- Multi-account: registration abuse, free-tier farming, review bombing.

## Method

1. **Write the workflow down** — every state, every transition, every endpoint.
2. **For each transition, find the check that guards it** and ask: is it server-side? is it bound to
   the actor? is it bound to the object?
3. **For each value that crosses the wire, ask**: does the server recompute it?
4. **Attack the cheapest assumption first** — usually "the client will not send a negative qty".
5. **Prove the end state**, and report the business impact in the operator's language: money,
   inventory, access, data.

## Reporting

```
WORKFLOW:  <state diagram in one line>
FLAW:      <which assumption is broken>
REQUEST:   <the exact request>
END STATE: <what is true after> — proof
IMPACT:    <business consequence>
```
