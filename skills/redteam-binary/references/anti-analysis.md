# Anti-Analysis, Obfuscation & Patching

## Detecting it

| Technique | Signal |
|---|---|
| Packed (UPX/custom) | entrypoint outside the standard sections, tiny import table, high-entropy sections, `UPX!` magic |
| Anti-debug (ptrace) | `ptrace(PTRACE_TRACEME)` in the entry path |
| Anti-debug (TracerPid) | reads `/proc/self/status` |
| Anti-debug (timing) | `rdtsc`/`clock_gettime` compared before and after a block |
| Anti-debug (int3) | SIGTRAP handler, scattered `0xCC` |
| VM detection | `cpuid` leaf 1/0x40000000, checks for VMware/VBox/QEMU strings, MAC OUI, timing |
| Anti-tamper | self-hash of `.text`, CRC over its own code, signature check |
| String encryption | high-entropy strings, a decrypt routine called from many places |
| Control-flow flattening | one dispatcher with a state variable, flattened CFG |
| Opaque predicates | conditions that are always true/false |
| Dynamic resolution | `dlsym`/`GetProcAddress` instead of a static import table |
| Self-modifying code | writes into `.text` at runtime |
| Signal-based anti-debug | installs a handler for SIGTRAP/SIGINT and exits |

```bash
file ./bin; readelf -S ./bin | head -30
readelf -d ./bin | grep -i needed
strings ./bin | grep -iE "ptrace|TracerPid|/proc/self|vmware|virtualbox|qemu|sandboxie|wine"
readelf -l ./bin | grep -i stack        # NX
```

## Bypassing

### ptrace self-anti-debug

```c
// LD_PRELOAD stub
int ptrace(int request, ...) { return 0; }
```

```bash
gcc -shared -fPIC -o no_ptrace.so no_ptrace.c -ldl
LD_PRELOAD=./no_ptrace.so ./target
```

### TracerPid

```bash
# patch the read of /proc/self/status, or bind-mount a fake
mount --bind /tmp/fake_status /proc/self/status
```

### Timing checks

```bash
# gdb: skip the rdtsc pair
gdb -ex 'b *0x401234' -ex 'c'
# or set a breakpoint on clock_gettime and return 0
```

### VM detection

Bypass by patching the comparison, by hooking `cpuid`, or by using a physical machine. In a
purple-team exercise, *not* bypassing it is the point: report that the sample detects analysis.

### Packed binaries

```bash
# UPX
upx -d ./packed -o ./unpacked
# generic: dump from memory
rea.start_gdb_session(inferior_tty="/tmp/opencode/tty")
gdb -ex 'b *entry' -ex run -ex 'dump binary memory /tmp/dump.bin 0x400000 0x500000'
```

Better: let it unpack itself — break at the OEP after the unpacking stub runs and dump the process
image, then analyse the dump.

### String encryption

Find the decryption routine (a function called from many places that takes a pointer and returns a
string), then:

```python
# decrypt statically
for s in encrypted_strings:
    print(decrypt(s))
```

Or run it: break at the decrypt function and read the return value.

### Control-flow flattening

Use the CFG (`rea.analyze_function` returns blocks) and rebuild the state machine, or use a
decompiler with a flattening plugin. If the structure defeats the decompiler, switch to dynamic
tracing: run it, log the executed blocks, map the transitions.

### Anti-tamper

```bash
# find the self-check
rea.search_bytes(pattern="...")   # the hash constant
rea.procedure_callers(symbol="crc32")   # or sha256_update
```

Patch the branch that triggers the abort, or re-compute the expected hash after the patch.

## Patching

```bash
# locate the instruction
objdump -d ./bin | grep -A3 "call.*check"
# patch in place
printf '\x90\x90' | dd of=./bin bs=1 seek=$((0x1234)) conv=notrunc
# verify
objdump -d ./bin | grep -A3 "1234:"
```

For a whole function: NOP it out and fix the control flow.

```bash
# keep the original
cp ./bin ./bin.patched
# find the file offset of a virtual address
python3 -c "
import sys
from elftools.elf.elffile import ELFFile
e=ELFFile(open('bin','rb'))
for s in e.iter_sections():
    if s['sh_addr'] <= 0x401234 < s['sh_addr']+s['sh_size']:
        print(hex(s['sh_offset'] + 0x401234 - s['sh_addr']))
"
```

`lief` does this directly:

```python
import lief
b = lief.parse("bin")
seg = next(s for s in b.segments if s.virtual_address <= 0x401234 < s.virtual_address + s.virtual_size)
off = seg.file_offset + (0x401234 - seg.virtual_address)
print(hex(off))
```

## Anti-analysis as a finding

Anti-analysis is a legitimate software-protection control, and defeating it is legitimate assessment
work. But it is also a **detection gap**: if the sample can tell it is being analysed, then the
defender cannot either. Report it as a double-edged finding:

```
CONTROL:      <the technique, where it lives>
PURPOSE:      anti-analysis / licensing / tamper protection
BYPASS:       <how it was defeated>
DETECTION GAP:an EDR/sandbox using the same signal would also be defeated
IMPACT:       <what the protection was actually protecting>
```

## Patching a binary to change behaviour

Legitimate uses: removing a phone-home, changing a hardcoded endpoint for a lab build, disabling a
crash reporter, making a toolchain-consistent build for research.

```bash
# change a hardcoded URL (equal length or shorter)
python3 - <<'EOF'
data = bytearray(open("bin","rb").read())
old = b"http://telemetry.vendor.com/collect"
new = b"http://127.0.0.1:8080/collect"
assert len(old) == len(new)
i = data.find(old)
data[i:i+len(old)] = new
open("bin.patched","wb").write(data)
print("patched at", hex(i))
EOF
```

Keep the original, document the offset and the original bytes, and report the patch in the findings
so the operator knows the artifact differs from the shipped one.
