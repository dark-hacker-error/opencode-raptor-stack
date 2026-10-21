---
name: RedTeam AI — LLM & AI-System Attacks
description: Security assessment of LLM and AI systems - prompt injection (direct and indirect), jailbreaks, system-prompt extraction, training-data extraction, model poisoning, RAG and vector-store attacks, tool-calling abuse, agent hijacking, excessive agency, data exfiltration through the model, multimodal injection and MCP/connector abuse. Use when the target is an LLM application, a RAG pipeline, an AI agent, or an MCP server.
---

# RedTeam AI — LLM & AI-System Attacks

An LLM application is an interpreter that the attacker can try to program. The attack surface is the
**context**, the **tools**, and the **data path** — not the model weights.

> `references/llm-attacks.md` — the full catalogue with concrete techniques.
> The master attack index lists the names: use `raptor_attacks(query=...)` to resolve them.

## The mental model

```
user input ──► pre-processing ──► context assembly ──► model ──► tool calls ──► actions
                     │                    │                     │            │
              filters/sanitizers   RAG documents /         system prompt   external
                                   tool descriptions                     systems
```

Each arrow is a trust boundary. Ask for each one:
- What does the filter actually remove?
- What untrusted text reaches the context? (RAG docs, tool output, web content, other users' data)
- What does the system prompt leak through the output?
- What can the model call, with what arguments, and who authorises it?
- Where does the answer go?

## Method

1. **Map the surface** — the model, the system prompt, the tools, the data sources, the output sinks.
2. **Baseline the behaviour** — what does it refuse, what does it reveal, what does it call?
3. **Test the boundaries** — in order: direct injection → indirect injection → tool abuse → data path.
4. **Prove the impact** — not "it said something odd", but "it read the file", "it called the API",
   "it sent the data out".
5. **Report the chain** — injection → tool → impact.

## Non-negotiables

1. **Test the operator's own systems only.** Injection tests on a third party's production LLM are
   abuse, not assessment.
2. **Use benign markers.** Prove the read/exfiltration with a planted canary token, not with real
   customer data.
3. **Do not exfiltrate bulk data.** Prove the path; do not run it at scale.
4. **Never trigger destructive tool calls.** Use a tool whose only effect is to echo a marker.
5. **Keep a canary.** Plant a unique string in the protected context; if it comes back, the finding
   is airtight.

## Deliverable

```
SURFACE:   model / prompt / tools / data sources / sinks
TEST:      the exact input or poisoned document
EFFECT:    what the model did (revealed, called, read, sent)
CANARY:    the marker that proves it
CHAIN:     injection -> tool -> impact
FIX:       the specific control (input separation, tool scoping, output filtering, allowlist)
```
