# REA-Driven Analysis Workflow

## Phase 0 — bind the target

```
rea.open_binary(path="/path/to/artifact", provider_id="auto")
rea.binary_session()          # capabilities available
rea.binary_overview()         # procedure + string counts, image base
rea.close_binary()            # when done (can export a snapshot)
```

Formats REA handles: ELF, PE, Mach-O, Java class/jar, APK, DEX, .NET assemblies, WASM, EVM
bytecode, JavaScript + source maps, Python bytecode, Objective-C/Swift, Rust, Go, plists, and
`format=dos-com` / `format=raw-binary` for the awkward ones.

## Phase 1 — identity and mitigations

```
rea.inspect_binary_layout(path=...)       # segments, symbols, REL/RELA, mitigation inference
rea.inspect_go_binary(path=...)           # module + dependency versions
rea.inspect_rust_binary(path=...)         # cargo-auditable deps
rea.inspect_analysis_view(source=..., view={kind:"layout", facet:"mitigations"})
```

Record: format, arch, endianness, entrypoint, image base, and the mitigation set (NX, PIE, RELRO,
stack canary, FORTIFY, seccomp). **This determines the exploit class** — check it before designing
anything.

## Phase 2 — triage

Order matters. Do not read every function.

```
rea.list_segments()                     # where the code is, what is data
rea.list_procedures()                   # names + addresses
rea.list_names()                        # every symbol and value
rea.search_bytes(pattern="...")         # masked search for keys, URLs, format strings
rea.xrefs(address=...)                  # who touches this data
rea.procedure_info(symbol=...)          # size, blocks, locals
```

### High-signal strings

```
"http://" "https://"        -> endpoints, callbacks
"%s" "%n" "%x"              -> format string sinks
"password" "passwd" "secret" "key" "token"  -> auth and crypto
"AES" "RSA" "RC4" "SHA"    -> crypto usage
"/bin/sh" "system" "exec"  -> command execution
"/etc/passwd" "/proc/"     -> file access
"HTTP/1." "Content-Length" -> a protocol implementation
```

`search_bytes` with a wildcard mask finds things `strings` misses (non-ASCII, obfuscated, split).

## Phase 3 — candidate functions

```
rea.analyze_function(symbol="...")       # full dossier: pseudo + asm + callees + callers + strings
rea.procedure_pseudo_code(symbol="...")
rea.procedure_assembly(symbol="...")     # when the pseudo-code loses instruction detail
rea.procedure_callees(symbol="...")
rea.procedure_callers(symbol="...")
rea.procedure_references(symbol="...")
```

`analyze_function` is the workhorse: one call gives you the pseudo-code, the CFG blocks, the
referenced strings and the resolved edges. Use it on every candidate.

## Phase 4 — reachability

The critical step that separates a real finding from a grep hit.

```
1. find the sink          -> procedure_pseudo_code(sink)
2. find its callers       -> procedure_callers(sink)
3. walk up until you hit an input source (read, recv, argv, env, file, network)
4. confirm the data is not validated in between
```

Input sources to look for: `read`, `recv`, `recvfrom`, `fread`, `gets`, `scanf`, `getenv`,
`argv`, `fopen`+`fgets`, `mmap` of a request buffer, HTTP header parsing, a deserialiser.

Validation to look for: `memcmp` against a constant, `strlen` check, a range check, a sanitizer
call, a whitelist.

**If the path cannot be established, the finding is "unreachable sink" — report it as such.**

## Phase 5 — dynamic confirmation

```
rea.start_rizin_debug_session(path=..., inferior_tty="/tmp/opencode/tty")
rea.rizin_debug_command("dc")       # continue
rea.rizin_debug_command("dr rax")   # registers
rea.rizin_debug_session_status()
rea.close_rizin_debug_session()
```

or GDB through REA:

```
rea.start_gdb_session(inferior_tty="/tmp/opencode/tty")
rea.gdb_console("break *0x1234")
rea.gdb_console("run <input>")
rea.gdb_console("x/32gx $rsp")
rea.close_gdb_session()
```

Dynamic confirmation answers: does the input actually reach the sink, and what happens when it
does? That is the difference between "there is a strcpy" and "there is an exploitable overflow".

## Phase 6 — managed code

```
rea.inspect_managed_artifact(path="app.dll")
rea.inspect_managed_members(path="app.dll")     # types, fields, methods, user strings
rea.decompile_jeb_item(item_address=...)
rea.inspect_android_package(path="app.apk")
rea.inspect_android_method(path="app.apk", item_address=..., overload_index=...)
rea.inspect_electron_fuses(path="app")
rea.inspect_wasm_artifact(path="module.wasm")
```

Taint hunt: user string → method → dangerous call.

| Platform | Dangerous sinks |
|---|---|
| .NET | `Process.Start`, `Assembly.Load`, `BinaryFormatter.Deserialize`, `XmlDocument.LoadXml`, `Type.GetMethod` + `Invoke` |
| Java/Android | `Runtime.exec`, `DexClassLoader`, `JavascriptInterface`, `WebView.loadUrl`, `Parcelable` reflection |
| Electron | `nodeIntegration`, `contextIsolation:false`, `webSecurity:false`, `ELECTRON_RUN_AS_NODE`, ASAR integrity disabled |
| WASM | host functions trusting JS-side pointers, missing bounds checks on imported memory |

## Phase 7 — evidence

```
rea.export_evidence_bundle(...)   # portable bundle of the analysis
rea.close_binary(...)              # can save an analysis snapshot to disk
```

The bundle plus the artifact SHA-256 is the evidence package. Attach it to the finding.

## Workflow variants

| Goal | Shorter path |
|---|---|
| "What does this binary do?" | overview → segments → entrypoint → main → interesting strings |
| "Is there a bug?" | triage → candidates → sinks → reachability |
| "How do I exploit it?" | layout → mitigations → primitive → reliability |
| "Is this the same build as X?" | build id, section hashes, compiler metadata, symbol diff |
| "What protocol does it speak?" | strings → `connect`/`send`/`recv` xrefs → decompile the parser |
| "Is it packed?" | entrypoint in a non-standard section, tiny imports, high-entropy sections, no symbols |

## Record everything

```
raptor_note(kind="chain", text="<artifact> — <technique> worked, <tool> gave <result>")
```

A technique that worked on one binary usually works on the next one. That note is what makes the
second engagement cheaper.
