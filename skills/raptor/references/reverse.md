# Reverse Engineering & Exploit Development

The REA MCP server is the primary instrument here — it provides Ghidra, Rizin, JADX, Hopper, Unblob, TShark and the managed-code engines. Use it instead of shelling out to `strings` when a decompiler is available.

## 0. REA capability map

| Goal | REA tools |
|---|---|
| Open a target | `open_binary` (ELF/PE/Mach-O/JS/APK/.NET/WASM/firmware) |
| Session info | `binary_session`, `close_binary` (also exports an analysis snapshot) |
| Overview | `binary_overview`, `list_segments`, `list_names`, `list_procedures` |
| Function dossiers | `analyze_function` (pseudocode+asm+refs+strings), `procedure_pseudo_code`, `procedure_assembly`, `procedure_info`, `procedure_callees`, `procedure_callers`, `procedure_references` |
| Cross-references | `xrefs`, `search_bytes` (masked patterns), `list_names` |
| Layout & mitigations | `inspect_binary_layout` (NX/PIE/RELRO/canary inference), `inspect_analysis_view` |
| Language specifics | `inspect_go_binary`, `inspect_rust_binary`, `inspect_managed_artifact`, `inspect_managed_members`, `inspect_android_package`, `inspect_android_method` |
| JS / WASM / EVM / Mach-O | `inspect_artifact`, `inventory_artifact`, `inspect_wasm_artifact`, `inspect_macho`, `inspect_electron_fuses`, `decode_interface_builder`, `inspect_evm_interface` |
| Dynamic | `start_rizin_debug_session`, `rizin_debug_command`, `start_gdb_session`, `gdb_console`, `rizin_debug_session_status` |
| Runtime | Frida sessions, `resume_frida_session`, `unload_frida_script` |
| Firmware | `extract_firmware` (Unblob), then `open_binary` on the extracted blobs |
| Traffic | `inspect_web_network_capture`, `inspect_packet_fields`, `inspect_signal_decoders` |
| Evidence export | `export_evidence_bundle`, `import_evidence_bundle` |

## 1. Static triage order (do not skip)

```
1. file + sha256sum + inspect_binary_layout     -> format, arch, mitigations, sections
2. binary_overview / binary_session             -> procedure count, strings count, image base
3. inspect_go_binary / inspect_rust_binary      -> dependency versions (CVE mapping for free)
4. list_segments + strings sweep                -> packer/obfuscator hints, language runtime
5. list_procedures                               -> entrypoints, imports, interesting names
6. search_bytes for hardcoded material          -> keys, URLs, credentials, format strings
7. analyze_function on the top candidates        -> pseudocode + call graph + referenced strings
```

**Vulnerability candidate heuristics** — grep pseudocode/asm for:
- `strcpy`, `strcat`, `sprintf`, `gets`, `memcpy` with attacker length → overflow
- `system`, `popen`, `execl` with tainted args → command injection
- `printf` family with user format string → format string
- `mktemp`, `tmpnam` → race
- `rand`/`srand(seed)` for security tokens → predictable
- `strcmp`/`memcmp` on auth values → logic flaw
- integer overflow before `malloc`/`alloca` → heap/stack corruption
- `setuid`/`chroot`/`seteuid` without privilege drop → priv esc
- deserialisers: `ObjectInputStream`, `pickle.loads`, `yaml.load`, `unserialize`, `eval` → RCE

For each candidate: prove the sink is reachable from untrusted input (trace callers back), then build the PoC.

## 2. Dynamic analysis

```bash
# REA flow
start_rizin_debug_session(path=/path/to/bin, inferior_tty=/tmp/opencode/tty)
rizin_debug_command('dc')         # continue
rizin_debug_command('dr rax')     # inspect registers
rizin_debug_session_status()      # recent output
close_rizin_debug_session()

# GDB flow
start_gdb_session(inferior_tty=/tmp/opencode/tty)
gdb_console('break *main')
gdb_console('run')
gdb_console('x/32gx $rsp')
close_gdb_session()
```

**Anti-debug detection to look for**:
```
ptrace(PTRACE_TRACEME) == -1       -> self-anti-debug
getppid() == 1 / TracerPid != 0    -> debugger presence
/proc/self/status TracerPid
RDTSC timing deltas                 -> timing check
signal handler tricks, int3 traps
CPUID VMX leaf                       -> VM detection
IsDebuggerPresent (Windows)
```

Bypass tactics: `ptrace(PTRACE_TRACEME,0,0,0)` in the parent before exec, patch the conditional branch, LD_PRELOAD an `ptrace` stub returning 0, use `gdb` with `set disable-randomization off` and hardware breakpoints only, Frida to hook the check function.

**Anti-tamper**: checksum of own code, integrity checks on `.text`, signature verification, self-hashing.

## 3. Managed code

### Android

```
inspect_android_package(path=app.apk)      -> manifest, permissions, components
inspect_android_method(path=app.apk, item_address=..., overload_index=...)
```

Look for: exported components, `android:debuggable=true`, cleartext traffic, weak crypto, hardcoded API keys, WebView `addJavascriptInterface`, exported ContentProviders with no permission, intent redirection, Deeplinks.

### .NET / managed

```
inspect_managed_artifact(path=app.dll)     -> identity, frameworks, MVID
inspect_managed_members(path=app.dll)      -> types, fields, methods, user strings
```

Taint path: user string → method → dangerous call (`Process.Start`, `Assembly.Load`, `XmlDocument.LoadXml`, `BinaryFormatter.Deserialize`).

### Electron

```
inspect_electron_fuses(path=app)           -> runAsNode, nodeOptions, asar integrity
```

Electron-specific bugs: `nodeIntegration: true` + `contextIsolation: false`, exposed IPC handlers, `ELECTRON_RUN_AS_NODE` enabling arbitrary code execution, disabled ASAR integrity, `webSecurity: false`.

### WebAssembly

```
inspect_wasm_artifact(path=module.wasm)    -> imports, exports, memory, candidate host functions
```

WASM bugs: host functions that trust JS-side data, memory safety at the boundary, missing bounds checks on imported memory.

## 4. Firmware / IoT

```
extract_firmware(path=fw.bin, output_dir=/tmp/opencode/fw)   -> Unblob, verified children + gaps
open_binary(path=/tmp/opencode/fw/<extracted>)               -> per-blob analysis
```

Then hunt: hardcoded credentials in strings, `/etc/passwd`/`shadow` in the extracted rootfs, default web admin panels, telnet/SSH enabled, debug interfaces, update-signing flaws, `busybox` applets, and web admin JS endpoints.

## 5. Exploit development

### Mitigation triage first

```
inspect_binary_layout(path=bin)  ->  NX, PIE, RELRO, stack canary, FORTIFY, seccomp
```

| NX | No exec on stack → ROP |
|---|---|
| PIE | ASLR on → need an info leak to defeat |
| RELRO | Full RELRO → GOT is read-only → overwrite other targets |
| Canary | Stack smash → need leak or byte-by-byte brute |
| No canary + NX off | Classic shellcode |

### Tooling

```python
from pwn import *
elf = ELF('./bin')
rop = ROP(elf)
rop.call('execve', ['/bin/sh', 0, 0])
print(rop.chain())
```

```bash
ROPgadget --binary bin --ropchain
ropper --file bin --search "pop rdi"
one_gadget ./bin          # for libc targets
checksec --file=bin
```

### Reliability checklist

- ASLR: leak (puts/printf on a GOT entry, or a stack pointer) before building the ROP chain.
- Canary: leak it or avoid smashing it.
- Stack alignment: `ret` sled before `system` when the ABI requires 16-byte alignment.
- Environment: provide `PATH`, `LD_PRELOAD` if the shell is not found.
- PIE base: `elf.address` + leak.
- Re-exec: `execve` keeps the same PID; use `fork` semantics if the program re-initialises.

### Patch diffing

```
# compare two builds
diff <(objdump -d old | sed 's/^[0-9a-f]*//') <(objdump -d new | sed 's/^[0-9a-f]*//')
capa -d new -C diff
```

Locate the security check, understand it, and design a bypass that survives the patched build.

## 6. Protocol / artefact recovery

- **PCAP**: `inspect_web_network_capture` for HAR/SAZ/qlog/mitmproxy; `inspect_packet_fields` for field dictionaries; `tshark` for raw decoding.
- **Certificates / keys**: `openssl x509 -text`, `openssl rsa -text`, `openssl pkcs8`.
- **Config files**: `strings` + pattern hunt for `password|passwd|pwd|secret|token|key|apikey`.
- **Crypto**: recognise AES/ChaCha/RC4 by constant tables (S-box 0x63, 0x7c, ...) and key schedule patterns.

## 7. Evidence standards for RE findings

- Artifact SHA-256 (REA returns it — use it, never guess).
- The exact disassembly/pseudocode that proves the flaw.
- The reachability argument (caller chain from untrusted input to the sink).
- The PoC input and its observed effect.
- Mitigation state at the time (so the reader knows what a patch must restore).

## 8. Red-team use of RE

RE output is not the deliverable — the **decoded secret, the bypass, or the recovered key** is. If RE yields credentials, feed them straight back into the attack graph (`raptor_state`) and continue the chain. Recovering a signing key from a binary and using it to mint tokens on the target is the classic full-chain outcome; treat it as a high-severity finding with full proof.
