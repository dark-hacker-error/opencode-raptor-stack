# Troubleshooting

## Installer-level

| Symptom | Cause | Fix |
|---|---|---|
| `[x] apt install X failed` | package not in the configured repos | `apt-cache search X` → find the real package name, or switch the method (`--method git`) |
| `[x] go install X failed` | Go < 1.21 and the module needs a newer toolchain | `apt-get install golang-go` then `go version`; or use the release binary instead |
| `[x] pip install X failed` + `No matching distribution` | the package is not on PyPI | it is a GitHub project → `--method git` with the repo URL |
| `externally-managed-environment` | PEP 668 | `--break-system-packages` (the script tries this) or use `pipx` |
| `no release found for owner/repo` | repo has no GitHub Releases | use `--method git` and build from source |
| `no matching asset in repo TAG` | asset naming does not match the pattern | check the asset list manually, then install it by hand |
| `checksum mismatch` | corrupt download or tampered artifact | delete, re-download, **do not run it** |
| `not found on PATH after install` | binary landed elsewhere | check `go env GOPATH/bin`, `~/.cargo/bin`, `~/.local/bin`; the script links the first two |
| `dpkg was interrupted` | a previous apt run died | `apt-get -f install && dpkg --configure -a` |
| apt `Could not get lock /var/lib/dpkg/lock-frontend` | another installer is running | wait, or kill the stale process |

## Tool-level

| Symptom | Cause | Fix |
|---|---|---|
| `tool: command not found` after install | not linked | `export PATH=$PATH:/usr/local/bin`; `opencode service restart` |
| `tool: Permission denied` | lost the executable bit | `chmod +x /usr/local/bin/tool` |
| `error while loading shared libraries: libfoo.so` | runtime lib missing | `ldd /usr/local/bin/tool \| grep "not found"` → install the matching `-dev`/runtime package |
| `Segmentation fault` on start | arch mismatch (arm binary on x86) | `file /usr/local/bin/tool` → reinstall the right asset |
| `Illegal instruction` | CPU-feature mismatch (AVX-512 build) | use a generic `x86_64` build |
| runs but prints usage on `--version` | tool uses `-v` or `-h` only | the verify script already tries several flags; treat `present-no-version` as present |
| `docker: permission denied` | user not in the docker group | `usermod -aG docker $USER` then re-login |
| `snap: command not found` | snapd absent | `apt-get install snapd` |

## Version drift

```bash
tool --version          # what is actually on PATH
which -a tool           # several copies? the first wins
dpkg -l | grep tool     # a distro package may shadow your build
```

When the distro package and your build disagree, the `/usr/local/bin` copy usually wins — check with
`which -a`.

## Registry hygiene

- `--list` shows the registry; `--list-all` counts it.
- `--search <term>` finds tools by name, category or source.
- A tool in the registry with the wrong method gets installed the wrong way — fix the row when you
  discover it.
- Duplicate rows (same tool twice with different methods) resolve to the **first** match. Keep the
  registry de-duplicated.

## Keeping the session aware

New binaries are not visible to a long-running OpenCode session until the PATH is re-read:

```bash
opencode service restart
```

Or export the path inside the session's shell. `raptor_doctor()` re-scans the PATH on every call,
so it picks the new tools up immediately.
