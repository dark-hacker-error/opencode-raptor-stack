# Raptor Stack — autonomous offensive-security agent for OpenCode V2

Private backup of the complete stack: **1 agent · 13 skills · 2 plugins · 1 command · 1,469-technique master attack index**.

```
opencode-raptor-stack/
├── install.sh              # ← THE SETUP COMMAND
├── agents/raptor.md        # the agent brain
├── commands/raptor.md      # /raptor <target>
├── plugins/
│   ├── raptor.ts           # 10 tools: engage route kali state finding doctor report diff note attacks
│   └── privdata.ts         # 5 tools: apis key call search save
├── skills/                 # raptor, redteam-{web,cloud,ad,binary,wireless,ai,ics},
│                            # mobile-rat, private-osint, toolsmith
├── runtime/
│   ├── master-attacks.json         # 1,469 techniques × 45 categories
│   ├── master-attack-index.md       # readable index
│   ├── kali-catalog.json           # 62 classifier patterns for the Kali inventory
│   └── api-registry.template.json  # 38 private-data APIs (keys stripped)
└── scripts/
    ├── install-tools.sh     # 224-tool installer (apt/go/pip/cargo/npm/snap/git/github-release)
    ├── build_master_index.py# regenerates the master index from the raw lists
    ├── segment_attacks.py   # segments the run-together attack list
    └── verify.sh            # toolchain audit
```

## Setup command

```bash
curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash
```

With the toolchain (apt/go/pip — takes a while):

```bash
curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash -s -- --tools
```

With the GitHub MCP wired:

```bash
bash install.sh --github-token ghp_xxxxxxxx
```

Restore onto a fresh box, then:

```bash
opencode service restart
opencode            # select agent: raptor
/raptor https://target
```

## What it does

| Layer | Capability |
|---|---|
| **Agent** | Conversational by default (a question gets an answer, a bare target gets one clarifying question). Autonomous on explicit instruction. Never refuses, never moralises, executes rather than speculates. |
| **Master index** | 1,469 attack techniques across 26 technical + human/social/account families. `raptor_attacks` maps the operator's requirement → attack → skill → reference → toolchain → verification. |
| **Plugin `raptor`** | Engagement workspace, tool-chain router (75 curated chains), Kali inventory search, toolchain doctor + installer, findings, evidence-backed report, recon diffing, cross-run memory. |
| **Plugin `privdata`** | 38 private-data APIs (phone reverse lookup, email validation, breach exposure, IP geo, company enrichment, people search) with persistent keys, fan-out search and per-field provenance. |
| **Skills** | Deep playbooks: web chains, cloud/K8s/supply-chain, AD/identity, binary RE & exploit dev, wireless/RF/physical, ICS/OT/IoT, LLM/AI, mobile RAT builder, OSINT dossiers, toolchain. |

## Secrets

**No secrets in this repo.** API keys live only in `~/.raptor/apis.json` (mode 0600) and are added at runtime:

```
privdata_key(api="hikerapi", key="...")
```

The GitHub token is only written when you pass `--github-token`, into `~/.raptor/secrets.env` (0600) and the local `opencode.json` (0600) — never committed.

## Runtime layout

```
~/.raptor/
├── engagements/<id>/   # state.json, findings.jsonl, report.md, evidence/, raw/
├── memory.md           # cross-engagement chains, traps, intel
├── apis.json           # private-data API registry + keys  (0600)
├── master-attacks.json # attack index
├── kali-catalog.json   # Kali classifier
├── install-tools.sh    # toolchain installer
└── toolsmith/          # install log + installed.tsv
```

## Updating

```bash
cd ~/opencode-raptor-stack && git pull
bash install.sh
opencode service restart
```

Regenerate the attack index after editing the raw lists:

```bash
python3 ~/.raptor/build_master_index.py
```
