# OpenCode Raptor Stack — full workspace, one command

Private, self-contained backup + one-click restore of the entire OpenCode workspace used on this box:

**206 agents · 107 commands · 196 skills · 2 plugins · 5 MCP servers · Raptor runtime**

Everything lives in this repo as plain files. No submodules, no symlinks, no external skill registry —
clone or pipe one command and the whole setup comes back.

```
opencode-raptor-stack/
├── install.sh                  # ← THE ONE COMMAND
├── opencode.json.template      # all MCP servers, no secrets
├── manifest.json               # exact inventory (names + counts)
├── agents/                     # 206 agent definitions (raptor, tiger, venon, modder + 202 specialists)
├── commands/                   # 107 slash commands
├── skills/                     # 196 skills, fully dereferenced (SKILL.md + references + scripts)
├── plugins/
│   ├── raptor.ts               # 10 tools: engage route kali state finding doctor report diff note attacks
│   └── privdata.ts             # 5 tools: apis key call search save
├── runtime/
│   ├── master-attacks.json     # 1,469 techniques × 45 categories
│   ├── master-attack-index.md  # readable index
│   ├── kali-catalog.json       # 62 classifier patterns
│   └── api-registry.template.json
├── scripts/
│   ├── install-tools.sh        # 224-tool installer (apt/go/pip/cargo/npm/snap/git/github-release)
│   ├── build_master_index.py
│   ├── segment_attacks.py
│   └── verify.sh
└── docs/ARCHITECTURE.md
```

## Setup — one command

The repo is **public** — nothing to clone, no token needed:

```bash
curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash
```

That single line downloads the whole stack, installs all 206 agents, 107 commands, 196 skills and
2 plugins, seeds `opencode.json` with the MCP servers, and sets up the Raptor runtime. Re-run the
same line to update.

Private fork (or authenticated access):

```bash
GITHUB_TOKEN=ghp_xxxxxxxx bash -c 'curl -fsSL -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.raw" https://api.github.com/repos/dark-hacker-error/opencode-raptor-stack/contents/install.sh | bash'
```

With the offensive toolchain (slow — apt/go/pip/cargo/npm):

```bash
curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash -s -- --tools
```

From a local checkout:

```bash
git clone https://github.com/dark-hacker-error/opencode-raptor-stack.git
cd opencode-raptor-stack
bash install.sh                # add --tools for the toolchain
```

Then:

```bash
opencode service restart
opencode            # select agent: raptor
/raptor https://target
```

### Flags

| Flag | Effect |
|---|---|
| `--tools` | run the 224-tool offensive installer after setup |
| `--github-token <pat>` | enable the GitHub MCP and store `~/.raptor/secrets.env` (0600) |
| `--dir <path>` | install into a non-default OpenCode config dir |
| `--no-config` | copy agents/commands/skills/plugins only, leave `opencode.json` untouched |
| `--no-runtime` | skip the `~/.raptor` runtime seed |

Environment: `GITHUB_PERSONAL_ACCESS_TOKEN` is honoured instead of `--github-token`.
`RAPTOR_REF` selects a branch other than `main`.

## What gets installed

### Agents (206)

`raptor` (the offensive-security brain), `tiger`, `venon`, `modder`, plus 202 specialist subagents
across every domain of the workspace (backend, cloud, k8s, data, LLM/RAG, finetuning, security,
reverse engineering, mobile, UI, docs, SEO, startup, blockchain, …).

### Commands (107)

Slash commands grouped by domain (`/raptor`, `/team-spawn`, `/full-review`, `/c4-architecture`,
`/refactor-clean`, `/doc-generate`, …). Each is a plain Markdown file in `commands/`.

### Skills (196)

Every skill from the live workspace, with its full reference tree dereferenced into this repo:

- **Offensive**: `raptor`, `redteam-{web,cloud,ad,binary,wireless,ai,ics}`, `mobile-rat`, `private-osint`, `toolsmith`
- **Engineering**: backend, frontend, cloud, kubernetes, data-engineering, databases, Python, TypeScript, Go, Rust, .NET, PHP, Ruby, Flutter, iOS/Android
- **AI/LLM**: RAG, embeddings, vector indexes, prompt engineering, evaluation, finetuning (LoRA/QLoRA/DPO/GRPO), DGX Spark ops
- **Product/ops**: docs, SEO, accessibility, incident response, CI/CD, payments, compliance, startup analysis, deck creation

### MCP servers (5)

Written into `opencode.json` by the installer, merged with whatever you already have:

| Server | Type | Notes |
|---|---|---|
| `rea` | local | `rea-agents@6.5.0 mcp`; needs `/opt/rea`, JDK 21, Ghidra for full features |
| `context7` | remote | `https://mcp.context7.com/mcp` |
| `playwright` | local | `npx -y @playwright/mcp@latest` |
| `chrome-devtools` | local | `npx -y chrome-devtools-mcp@latest` |
| `github` | local | disabled until `--github-token` is passed |

Existing user config is never clobbered: permissions are unioned, MCP blocks already present are kept,
and the old file is saved as `opencode.json.bak-raptor`.

## Secrets

**No secrets in this repo.** The GitHub token is only written when you pass `--github-token`, into
`~/.raptor/secrets.env` and the local `opencode.json` — both `0600`, both gitignored. API keys live
only in `~/.raptor/apis.json` and are added at runtime:

```
privdata_key(api="hikerapi", key="...")
```

If a token was ever committed or shared, rotate it — setup does not need a stored token to work.

## Runtime layout

```
~/.raptor/
├── engagements/<id>/   # state.json, findings.jsonl, report.md, evidence/, raw/
├── memory.md           # cross-engagement chains, traps, intel
├── apis.json           # private-data API registry + keys  (0600)
├── secrets.env         # optional GitHub token          (0600)
├── master-attacks.json # attack index
├── kali-catalog.json   # Kali classifier
├── install-tools.sh    # toolchain installer
└── toolsmith/          # install log + installed.tsv
```

## Updating

Re-run the same one command — it is idempotent and overwrites files in place while preserving your
config and API keys:

```bash
curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash
opencode service restart
```

Or from a checkout:

```bash
cd opencode-raptor-stack && git pull && bash install.sh && opencode service restart
```

## Requirements

- OpenCode V2 (`opencode` on PATH)
- `bash`, `curl` (or `wget`), `tar`, `python3`
- `node`/`npx` for the local MCP servers and plugins
- optional for `rea`: JDK 21, Ghidra, JADX jar, `tshark`

## Verify an install

```bash
cat ~/.config/opencode/manifest.json 2>/dev/null || jq . manifest.json
bash ~/.raptor/verify.sh
```
