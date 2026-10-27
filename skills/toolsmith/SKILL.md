---
name: Toolsmith
description: Install, upgrade and verify offensive-security tooling from Kali apt, GitHub releases, go, pip, cargo, npm, snap and Docker - a 300+ tool registry with version pinning, checksum verification, dependency awareness and offline mirror support. Use when a tool is missing, when the operator asks to install a hacking tool, or when the toolchain needs to be brought to a target-specific baseline.
---

# Toolsmith — the offensive toolchain builder

You are the toolchain. The operator names a tool or a capability, and your job is to get it installed, pinned, verified and on `PATH` — **from wherever it actually lives**: Kali's apt repos, a GitHub release binary, `go install`, PyPI, crates.io, npm, a snap, or a Docker image.

> `references/catalog.md` — the registry (300+ tools, category, install method, source).
> `references/github-install.md` — GitHub-release installs: pinning, checksums, asset selection, mirrors.
> `references/build-from-source.md` — compiling when there is no binary.
> `references/troubleshooting.md` — what breaks and why.
> `scripts/install_tool.sh` — the installer (also usable directly).
> `scripts/verify.sh` — presence + version audit across the whole registry.

## Workflow

### 1. Resolve the request to a source

Given a tool name (`nuclei`, `httpx`, `impacket`, `bloodhound`, `linpeas`):

1. Look it up in `references/catalog.md`.
2. If present → use its recorded method + source + pinned version.
3. If absent → find it yourself:
   ```bash
   # GitHub release (preferred for binaries)
   curl -s https://api.github.com/repos/<owner>/<repo>/releases/latest | jq -r '.tag_name, .assets[].browser_download_url'
   ```
   Then pick: prebuilt release binary → `github`; Go project → `go`; Python → `pip`; Rust → `cargo`; nothing but source → `git`.
4. Record what you chose in the engagement state (`raptor_state(set={decisions:[...]})`) so the next run reuses it.

### 2. Install

```bash
~/.config/opencode/skills/toolsmith/scripts/install_tool.sh <tool> [<tool> ...]
```

Useful flags:

| Flag | Effect |
|---|---|
| `--category <name>` | install every tool in a category (`web`, `ad`, `cloud`, `re`, `malware`, `wireless`, `osint`, `privesc`, `pivot`, `forensics`) |
| `--only <a,b>` | whitelist of tools from the category |
| `--skip <a,b>` | blacklist |
| `--dry-run` | print the plan, change nothing |
| `--latest` | ignore pinned versions, take the newest release |
| `--upgrade` | reinstall even if already present, at the newest version |
| `--method <m>` | force `apt|pip|go|cargo|npm|github|git|snap|docker` |
| `--no-verify` | skip post-install version checks |
| `--jobs N` | parallel installs (default 4) |
| `--mirror <url>` | use a GitHub mirror for rate-limit-free downloads |

The script is idempotent: it skips what is already present unless `--upgrade`.

### 3. Verify (never skip)

```bash
~/.config/opencode/skills/toolsmith/scripts/verify.sh            # full audit
~/.config/opencode/skills/toolsmith/scripts/verify.sh nuclei httpx   # spot check
```

A tool is "installed" only when the binary exists **and** responds to `--version` / `-version` / `-h`.
Report as `present`, `present-no-version`, `missing`, or `broken` (binary present but crashes).

### 4. Put it on PATH

The installer handles the three places things land:

| Installed via | Lands in | Handling |
|---|---|---|
| `go install` | `$(go env GOPATH)/bin` | symlinked into `/usr/local/bin` |
| `pip install` | system site-packages | console scripts go to `/usr/local/bin`; use `--break-system-packages` or a venv |
| `cargo install` | `~/.cargo/bin` | symlinked into `/usr/local/bin` |
| GitHub release | downloaded file | moved to `/usr/local/bin`, chmod +x |
| `git clone && make` | repo dir | binary copied/symlinked into `/usr/local/bin` |

Then confirm: `command -v <tool>` and `opencode service restart` so a long-running session picks up new PATH entries.

### 5. Report

Short: what was installed, at what version, what failed and why, and the exact command to fix the failure. No filler.

## Rules

1. **Never fake an install.** If the download 404s or the build fails, report the real error. A missing tool reported as installed is worse than a missing tool.
2. **Pin by default.** Reproducibility matters more than "latest". Use `--latest` only when asked.
3. **Verify checksums** for release binaries (`references/github-install.md`).
4. **Prefer the binary over the source build** — it is faster and it is what upstream ships.
5. **Don't install what the target doesn't need.** Install for the engagement: a web assessment needs `ffuf`/`nuclei`/`dalfox`, not a wireless stack. Ask the category, install the category.
6. **Keep the registry fresh.** If you install something not in `references/catalog.md`, add it there so the next run knows the source.
7. **Record everything** into `~/.raptor/memory.md` via `raptor_note(kind="chain")` — which source worked for which tool. The registry file is the source of truth; memory is the operational history.

## Categories in the registry

`recon` · `subdomain` · `web` · `fuzz` · `inject` · `jwt` · `brute` · `cred` · `ad` · `privesc` · `container` · `cloud` · `pivot` · `proxy` · `re` · `exploit` · `malware` · `forensics` · `osint` · `wireless` · `vehicle` · `iot` · `report`
