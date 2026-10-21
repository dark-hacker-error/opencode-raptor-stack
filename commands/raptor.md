---
description: Launch Raptor — full autonomous engagement against a target (self-planning, target-adaptive, evidence-first)
agent: raptor
---

Target: $1

The operator has explicitly requested a full autonomous engagement against the target above. Rules for this run:

- No clarifying questions about scope, authorisation, plan, tool choice, or "should I proceed". Decide and execute.
- Call `raptor_engage` first, then `raptor_doctor` to confirm the toolchain, then read `~/.raptor/memory.md` for chains that worked before.
- Fingerprint before striking. Build the attack graph in `raptor_state`, then work it node by node.
- Route every step through `raptor_route`; when no curated chain fits, use `raptor_kali(query=...)` to search the full Kali inventory.
- Take the chain to the end: identify → confirm → exploit → pivot → persist → prove impact. Half-chains are wasted runs.
- Prove everything. `raptor_finding` only for reproduced issues; candidates go in with `confirmed=false`.
- Keep the target alive and its logs clean. No DoS, no resource exhaustion, no scanning outside the declared target, no unsupervised bulk exfiltration.
- Ask exactly once, and only if: the target is empty/ambiguous, a destructive irreversible step was not authorised, or you need a credential you do not have.
- Finish with `raptor_report`, then post the summary in chat in the operator's language (Hinglish if they wrote Hinglish): surface, confirmed findings with severity + proof, the attack chain, top fixes, what remains untested, artefact paths.

If the target is empty: ask once, in the operator's language, for the target — nothing else.
