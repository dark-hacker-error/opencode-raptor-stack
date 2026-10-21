---
name: RedTeam Binary — Deep Reverse Engineering & Exploit Development
description: Deep binary analysis and exploit development - REA-driven static and dynamic workflows, function triage, vulnerability-candidate hunting, anti-analysis bypass, protocol and firmware reverse engineering, fuzzing harnesses, ROP/heap/shellcode development, patch diffing and CVE weaponisation. Use when the target is a binary, library, firmware image, mobile app, kernel module or any compiled artifact.
---

# RedTeam Binary — Deep RE & Exploit Development

The deliverable is not "here is what the binary does" — it is **"here is the bug, here is the proof,
here is the exploit, and here is the reliability analysis"**.

> `references/re-workflow.md` — the full REA-driven analysis loop.
> `references/exploit-dev.md` — mitigations, ROP, heap, shellcode, fuzzing.
> `references/protocol-firmware.md` — protocol reverse engineering, firmware, embedded.
> `references/anti-analysis.md` — anti-debug, anti-tamper, obfuscation, patching.

## The loop

```
IDENTIFY   what the artifact is, what mitigations it has, what it links
TRIAGE     entrypoints -> interesting strings -> xrefs -> candidate functions
DEEP       decompile the candidates, trace taint from input to sink
DYNAMIC    run it, watch it, break at the right place
EXPLOIT    build the primitive, then the chain, then reliability
REPORT     primitive + reachability + PoC + mitigation map
```

## Non-negotiables

1. **Reachability, not just presence.** A `memcpy` in a function nobody calls is not a finding. Trace the path from untrusted input to the sink, or mark the finding as unreachable.
2. **Work the mitigation map first.** NX/PIE/RELRO/canary/seccomp decide what kind of exploit is even possible.
3. **Reliability is part of the finding.** A PoC that works 1 in 100 times is a different finding from a deterministic one. State the reliability and how to improve it.
4. **Prove in the target's own environment.** A crash in your own harness is not a vulnerability in the product.
5. **Never fabricate a PoC.** If you could not make it work, report the primitive and the difficulty honestly.
6. **Use the REA MCP first** — a decompiler beats `strings` every time.

## Tool order

| Need | Tool |
|---|---|
| Decompile / xrefs / callgraph | REA `analyze_function`, `procedure_pseudo_code`, `xrefs`, `procedure_callers` |
| Layout & mitigations | REA `inspect_binary_layout` |
| Language metadata | REA `inspect_go_binary`, `inspect_rust_binary` |
| Managed code | REA `inspect_managed_artifact`, `inspect_managed_members` |
| WASM / EVM / Mach-O | REA `inspect_wasm_artifact`, `inspect_evm_interface`, `inspect_macho` |
| Dynamic | REA `start_rizin_debug_session`, `start_gdb_session`, `gdb_console`, Frida |
| Firmware | REA `extract_firmware` (Unblob) |
| Exploit dev | pwntools, ROPgadget, ropper, one_gadget, angr, AFL++ |

## Finding categories to hunt

| Class | Sink |
|---|---|
| Stack overflow | `strcpy`, `sprintf`, `gets`, unchecked `memcpy` |
| Heap overflow | `malloc` size from user input, `realloc`, off-by-one in a chunk header |
| Integer issues | `int` size arithmetic feeding `malloc`/`alloca`, signed/unsigned confusion |
| Format string | `printf(user)` |
| Use-after-free | free then use, double free, stale pointer in a struct |
| Command injection | `system`, `popen`, `execl` with tainted args |
| Path traversal | `fopen`, `open` with tainted path |
| Unsafe deserialisation | `ObjectInputStream`, `pickle.loads`, `yaml.load`, `unserialize` |
| Crypto weakness | `rand`/`srand` for tokens, ECB, static IV, hardcoded keys, `memcmp` for auth |
| Race | check-then-act on files, TOCTOU on privileges |
| Logic | auth checks on the wrong comparison, `strcmp` on a user field, missing state machine |

## Deliverable shape

```
ARTIFACT:   sha256, format, arch, mitigations
VULN:       class + the exact function + file:line
REACHABLE:  the call path from untrusted input
PROOF:      the input that triggers it, and the observed effect
PRIMITIVE:  what you get (read / write / exec)
EXPLOIT:    the PoC (source) + reliability + how to make it deterministic
MITIGATIONS:which protection stands in the way and how it was defeated
FIX:        the specific change
```
