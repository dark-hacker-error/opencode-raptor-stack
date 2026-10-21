# Protocol & Firmware Reverse Engineering

## Protocol reverse engineering

### 1. Find the parser

```bash
rea.list_procedures()
rea.procedure_callers(symbol="recv")     # or read, SSL_read, BIO_read
rea.search_bytes(pattern="HTTP/1.")       # a protocol literal
```

Look for the function that consumes network bytes: `recv`, `SSL_read`, `read`, `WSARecv`, or a custom
`parse_*` / `handle_*`.

### 2. Map the message structure

```
rea.procedure_pseudo_code(symbol="parse_header")
rea.procedure_assembly(symbol="parse_header")   # when the pseudo-code hides the layout
```

Identify: magic bytes, version field, length field, type/opcode field, flags, payload offset.

```bash
# find the length check
rea.search_bytes(pattern="?? ?? 00 00")   # a 4-byte length field
```

### 3. Reconstruct the state machine

Which message types exist, which are legal in which state, and what the server does with each.

### 4. Build a client

```python
import struct
def build(op, payload=b""):
    return struct.pack("<HHI", 0xBEEF, op, len(payload)) + payload
```

### 5. Find the bug

| Class | Where |
|---|---|
| Integer overflow in a length field | `len = field + 8` into an `int`, then `malloc(len)` |
| Missing bounds check | `memcpy(buf, data + offset, length)` without validating `offset + length` |
| Type confusion | an opcode handled by the wrong parser |
| Auth bypass | an opcode that skips the session check |
| Desync | the length field and the actual body disagree |
| Command injection | the payload goes to a shell |

### 6. Fuzz the parser

```bash
# replay captured traffic with mutations
python3 mutate.py captured.bin -n 5000 -o corpus/
python3 harness.py corpus/          # harness calls the parser in-process
```

---

## Firmware

### Extract

```
rea.extract_firmware(path="fw.bin", output_dir="/tmp/opencode/fw")
```

Unblob reports verified children, extraction gaps, missing extractors and a continuation id. Use
the gap report — an unextracted region is an unexplored region.

```bash
binwalk -e -C out/ fw.bin
unblob -e out2/ fw.bin
```

### Triage the rootfs

```bash
find /tmp/opencode/fw -name "passwd" -o -name "shadow" -o -name "*.conf" | head
cat /tmp/opencode/fw/*/etc/passwd
cat /tmp/opencode/fw/*/etc/shadow        # if readable -> critical
grep -rilE "password|passwd|secret|api[_-]?key" /tmp/opencode/fw | head -30
```

Look for: default credentials, the web admin panel, the init script that enables telnet/SSH, the
update mechanism and its signature check, hardcoded API endpoints.

### The web admin surface

```bash
grep -roE '"/[a-zA-Z0-9_./-]+"' /tmp/opencode/fw | sort -u | head -50
# find the JS bundle of the admin panel
find /tmp/opencode/fw -name "*.js" | head
```

Then treat the admin panel as a web target: fingerprint it, look for auth bypass, command injection
in the ping/diagnostic features (classic in router firmware), and file upload.

### The update mechanism

The update path is usually the best bug: an unsigned update, a path traversal in the filename, or a
command injection in the "check for update" URL.

```bash
grep -rn "http://\|https://" /tmp/opencode/fw | grep -iE "update|firmware|download|version"
```

### Boot chain

```bash
strings -n 8 bootloader.bin | grep -iE "boot|verify|sign|key|fallback|recovery"
rea.open_binary(path="bootloader.bin")     # then look at the verification routine
```

Look for: a fallback that boots without verification, a hardcoded key, a length check that can be
bypassed, an unsigned secondary loader.

---

## Embedded targets

| Target | Tools |
|---|---|
| MIPS/ARM routers | `binwalk` + `qemu-system-mips` + Ghidra with the right processor module |
| RISC-V | `riscv64-linux-gnu-objdump`, Ghidra |
| Kernel modules | `.ko` → treat as an ELF, look for `init_module`/`fops` |
| UEFI | `uefi-firmware-parser`, `chipsec`, `uefitool` |
| PLC / SCADA | `scada-datasets`, protocol-specific decoders, Modbus/Profinet analysis |
| Automotive ECU | `candump`, `UDS` tooling, `python-can` |
| Smart cards | `python-scapy`, `apdu` tooling, `smartcard` |

### Emulating the target

```bash
# MIPS userland in qemu
qemu-mips-static -L /usr/mips-linux-gnu ./target
qemu-system-mips -M malta -kernel vmlinux -initrd initrd.gz

# gdb into it
qemu-mips-static -g 1234 -L /usr/mips-linux-gnu ./target
gdb -ex 'target remote :1234' -ex 'b *0x400000' ./target
```

Emulation lets you reach code that would need real hardware, and it makes the dynamic phase fast.

---

## Certificate & crypto material in firmware

```bash
grep -rn "BEGIN RSA\|BEGIN PRIVATE\|BEGIN CERTIFICATE" /tmp/opencode/fw
openssl x509 -in cert.pem -noout -text
openssl rsa -in key.pem -noout -text
```

A private key embedded in firmware is a finding on its own: it may sign firmware updates, decrypt
stored secrets, or authenticate to a cloud backend.

---

## Reporting

```
ARTIFACT:   sha256 of the firmware / blob
EXTRACTION: <what was extracted, what was skipped>
COMPONENTS: <each file, its purpose>
FINDINGS:   <hardcoded creds / key / command injection / unsigned update ...>
PROTOCOL:   <reconstructed message format>
CHAIN:      <firmware flaw -> device control -> what it unlocks>
```
