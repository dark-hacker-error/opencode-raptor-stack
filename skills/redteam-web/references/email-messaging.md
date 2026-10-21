# Email, Messaging & Communication Attacks

> Loaded by `raptor_attacks` for mail, SMTP, IM, SMS and messaging families.

## Email infrastructure checks

```bash
# SPF / DKIM / DMARC
dig +short TXT target.com                       # spf
dig +short TXT _dmarc.target.com
# DKIM selector
dig +short TXT <selector>._domainkey.target.com
```

| Finding | Test |
|---|---|
| SPF Misconfiguration Abuse | `v=spf1 ?all` / `~all` / missing → spoofable |
| DKIM Misconfiguration Abuse | selector resolves to nothing, or key is revoked |
| DMARC Misconfiguration Abuse | `p=none` → reporting only; `p=quarantine`/`reject` enforced? |
| Open Mail Relay Abuse | `swaks --to x@external --server relay.target.com` |
| SMTP Relay Abuse | relay to an external MX from the operator's own domain |
| Email Header Injection | CRLF in the From/Subject of a form that builds a mail |
| Mailbox Rule Abuse | a rule that forwards or auto-deletes (via the operator's own account) |
| Email Forwarding Abuse | auto-forwarding set on the operator's own mailbox |
| Thread Hijacking / Reply-Chain Hijacking | a reply-to that points elsewhere |

## Spoofing and impersonation

```bash
# check what the domain's policy allows
host -t TXT target.com | grep spf
swaks --to target@target.com --from ceo@target.com --server mx.target.com \
      --h 'Subject: Urgent' --body 'test' --timeout 15
```

Test against the **operator's own domain and their own test mailbox**. Record whether the mail
lands, lands in spam, and how the receiving client presents the sender.

## Malicious attachment and link delivery

| Lure | Test |
|---|---|
| Malicious Attachment | a benign-but-flagged attachment (a harmless script, a PDF with an embedded URL) delivered to the operator's own mailbox; measure the detonation controls |
| Malicious Link | a link to an operator-controlled page, measuring the mail gateway's rewriting and the client's warnings |
| Macro-Based Malware Delivery | a macro-enabled document that is inert, delivered to the operator's own test user, to measure the macro policy |
| HTML Smuggling | HTML that reconstructs a different DOM in the mail client — delivered to the operator's own test mailbox |
| Email Bombing / Mail Flooding | send volume against the **operator's own** mail server to measure rate limits; keep the volume small |

## Phishing in mail

Calendar Invitation Phishing, Shared Document Phishing, QR Code Phishing, Instant Messaging
Phishing — see `social-engineering.md`. All delivered to operator-controlled targets.

## Messaging & token attacks

| Attack | Test |
|---|---|
| Messaging Account Takeover | the operator's own messaging account; test the session/recovery controls |
| Session Token Theft | the token's storage and lifetime in the operator's own client |
| Messaging Backup Theft | the backup/sync path of the operator's own account |
| Contact List Exfiltration | what an attacker with a stolen session could enumerate — test on the operator's own account |
| Fake Support Message | the message content, delivered to the operator's own support team |
| Message Replay | a captured message replayed to the operator's own endpoint |

## SMS / RCS / voicemail

| Attack | Test |
|---|---|
| SMS Sender-ID Spoofing | operator's own SMS gateway / test number |
| Smishing | the SMS lure, to the operator's own test phone |
| RCS Phishing | rich-message lure, to the operator's own test phone |
| Voicemail Spoofing | the operator's own PBX, to their own test number |
| Caller ID Spoofing | the operator's own trunk |

## Deliverable

```
MAIL PATH:   <which component failed: SPF/DKIM/DMARC/relay/client/gateway>
EVIDENCE:    <the exact command + the receiving result>
IMPACT:      <spoofable / relayable / client-side rendering / token exposure>
FIX:         <the specific record or control to change>
```
