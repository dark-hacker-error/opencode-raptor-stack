# GitHub-Release Installs

Most modern offensive tooling ships a prebuilt binary on GitHub Releases. That is the fastest and
most reliable path — no compiler, no dependency tree.

## The flow

```bash
# 1. find the newest release
curl -s https://api.github.com/repos/OWNER/REPO/releases/latest \
  | jq -r '.tag_name, (.assets[] | .name + "  " + .browser_download_url)'

# 2. pick the right asset for this machine
#    linux amd64 : linux_amd64 / linux-x86_64 / x86_64-unknown-linux-gnu
#    linux arm64 : linux_arm64 / aarch64
#    macos       : darwin_amd64 / macos
#    windows     : windows_amd64.exe
#  .tar.gz assets need unpacking and the inner binary copied out

# 3. download, verify, install
curl -fLO "https://github.com/OWNER/REPO/releases/download/TAG/ASSET"
sha256sum ASSET
chmod +x ASSET && mv ASSET /usr/local/bin/
```

`install_tool.sh` automates exactly this — including the asset-pattern match, the tarball case and
the checksum comparison.

## Version pinning

Pin by tag, not by `latest`:

```
https://github.com/OWNER/REPO/releases/download/v1.2.3/tool_linux_amd64
```

Why it matters:
- The engagement is reproducible — you can say exactly which build produced a finding.
- A later release cannot silently change behaviour mid-assessment.
- PoCs written against one version may not hold against another.

Use `--latest` only when the operator asks for it or when a pinned build is known-broken.

## Checksums

Most serious projects ship `checksums.txt` next to the assets. Verify before installing:

```bash
curl -fsSLO "https://github.com/OWNER/REPO/releases/download/v1.2.3/checksums.txt"
grep 'tool_linux_amd64' checksums.txt
sha256sum tool_linux_amd64
# the two must match
```

If a project ships a detached signature instead, verify with `gpg --verify`.

**A checksum mismatch is a hard stop.** Delete the file, report it, do not run it.

## Rate limits and mirrors

Unauthenticated GitHub API calls are limited to 60/hour per IP. When you hit it:

```bash
export GITHUB_TOKEN=ghp_xxx          # raises the limit to 5000/hour
# or use a mirror:
export GH_MIRROR=https://ghproxy.net/   # install_tool.sh --mirror <url>
# or fetch release metadata from the atom feed, which is not rate-limited:
curl -s https://github.com/OWNER/REPO/releases.atom | grep -o '<title>[^<]*'
```

## Installing from an archive asset

```bash
tar xzf tool_linux_amd64.tar.gz
find . -maxdepth 2 -type f -perm -u+x -name 'tool*' -exec cp {} /usr/local/bin/ \;
```

Strip and rewrite dynamic linkage when the binary is statically linked against a different libc:

```bash
file tool
ldd tool
strip --strip-all tool
```

## Self-update pattern

For tools that ship an `install.sh`, prefer the pinned release:

```bash
curl -fsSL https://raw.githubusercontent.com/OWNER/REPO/v1.2.3/install.sh | bash
```

Pin the raw URL to a tag. `curl ... | bash` off `main` is how supply-chain compromises land.

## Keeping the registry fresh

When you install something that was not in `references/catalog.md`, add a row to the registry inside
`scripts/install_tool.sh`:

```
toolname|category|method|source|version
```

`method` is one of `apt|pip|go|cargo|npm|snap|docker|git|github`. That way the next operator who
asks for the same tool gets a one-command install.
