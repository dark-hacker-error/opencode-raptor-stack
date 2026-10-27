# Building From Source

Use this when there is no release binary, when you need a specific commit, or when the tool must be
patched.

## Generic build

```bash
git clone --depth 1 https://github.com/OWNER/REPO
cd REPO
# pick one
make && sudo make install          # C/C++
make PREFIX=/usr/local install     # honour a prefix
go build -o /usr/local/bin/tool .  # Go
cargo build --release && install -m755 target/release/tool /usr/local/bin/  # Rust
python3 setup.py install           # Python
pip install --break-system-packages .   # Python (modern)
```

Install into `/usr/local/bin`, not `/usr/bin` — the second is owned by the distro package manager.

## Build dependencies (Debian/Kali)

```bash
apt-get install -y build-essential cmake pkg-config git curl \
  libssl-dev libpcap-dev libnetfilter-queue-dev libevent-dev \
  libpcre2-dev zlib1g-dev libjansson-dev python3-dev python3-pip \
  golang-go cargo rustc
```

Common per-project requirements:

| Project | Needs |
|---|---|
| zmap | `libpcre3-dev libbpf-dev flex bison` |
| masscan | `libpcap-dev` |
| impacket | `python3-dev` |
| bettercap | `libpcap-dev` |
| aircrack-ng | `libpcap-dev libnl-3-dev libssl-dev` |
| metasploit | `ruby-dev git build-essential libpq-dev` |

## Go toolchain

```bash
apt-get install -y golang-go
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
go install github.com/OWNER/REPO/cmd/tool@latest     # pinned: @v1.2.3
go build -trimpath -ldflags="-s -w" -o /usr/local/bin/tool .
```

`-trimpath` removes local paths from the binary (better for reproducibility and for analysis).

## Python packaging conflicts (PEP 668)

Modern Debian/Kali mark the system Python as externally managed:

```
error: externally-managed-environment
```

Options, in order of preference:

```bash
pip install --break-system-packages <pkg>          # system-wide, simplest
pipx install <pkg>                                  # isolated, tool on PATH
python3 -m venv /opt/venvs/<pkg> && /opt/venvs/<pkg>/bin/pip install <pkg>
```

For a tool you will use constantly, `pipx` is the cleanest: isolated env, console script on PATH,
`pipx upgrade` for updates.

## Cross-compiling for other targets

```bash
# ARM
CC=arm-linux-gnueabihf-gcc GOOS=linux GOARCH=arm GOARM=7 make
# MIPS routers
CC=mips-linux-gnu-gcc make
# Windows from Linux
x86_64-w64-mingw32-gcc -o tool.exe tool.c
```

`apt-get install -y gcc-<arch>-linux-gnu binutils-<arch>-linux-gnu`

For MIPS/ARM firmware work, `binwalk` + `unblob` + the vendor SDK is usually the path — see the
`redteam-binary` skill.

## Vendored dependencies and submodules

```bash
git clone --recurse-submodules https://github.com/OWNER/REPO
# or after a plain clone
git submodule update --init --recursive
```

Missing submodules show up as `fatal: not a git repository` from a build script.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `configure: error: missing headers` | dev headers absent | install the `-dev` package |
| `undefined reference to 'pcap_...'` | `libpcap-dev` missing | `apt-get install libpcap-dev` |
| `go: cannot find module` | `GO111MODULE` / GOPATH confusion | run inside the module dir, `go mod download` |
| `cargo: command not found` | rust absent | `apt-get install cargo` or rustup |
| `fatal: unable to access ... SSL` | TLS/CA issue | `apt-get install ca-certificates` |
| Permission denied on `install` | not root | `sudo` or install to a user dir on PATH |
| Binary runs but `cannot open shared object` | runtime lib missing | `ldd ./tool` → install the missing `.so` |
| Build succeeds, binary crashes instantly | missing arch libs | static build or bundle the libs |

## Record it

After a source build, record the commit and the build flags — they are part of the evidence for
anything you find with that tool:

```bash
git -C /usr/local/src/REPO rev-parse HEAD
```
