#!/usr/bin/env bash
# =============================================================================
#  OPENCODE RAPTOR STACK — one-command setup / restore
#
#  Installs the complete OpenCode workspace:
#    agents · commands · skills · plugins · MCP servers · Raptor runtime
#
#  One command (fresh box, nothing cloned):
#    curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash
#
#  With the offensive toolchain (apt/go/pip/cargo/npm — slow):
#    curl -fsSL .../install.sh | bash -s -- --tools
#
#  Local checkout:
#    bash install.sh [--tools] [--github-token <pat>] [--dir <config-dir>]
# =============================================================================
set -uo pipefail

REPO="dark-hacker-error/opencode-raptor-stack"
BRANCH="${RAPTOR_REF:-main}"
RAW_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}"
TARBALL_URL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}"

GREEN=$'\033[32m'; YEL=$'\033[33m'; RED=$'\033[31m'; DIM=$'\033[2m'; B=$'\033[1m'; R=$'\033[0m'
say()  { printf '%s\n' "$*"; }
ok()   { say "${GREEN}[+]${R} $*"; }
warn() { say "${YEL}[!]${R} $*"; }
err()  { say "${RED}[x]${R} $*"; }
dim()  { say "${DIM}    $*${R}"; }
die()  { err "$*"; exit 1; }

# --------------------------------------------------------------- bootstrap
# When this script arrives through a pipe there is no checkout next to it.
# Download the repo tarball, then re-run the real installer from the extract.
SELF="${BASH_SOURCE[0]:-}"
if [ -n "$SELF" ] && [ -f "$SELF" ]; then
  HERE="$(cd "$(dirname "$SELF")" && pwd)"
else
  HERE=""
fi

if [ -z "$HERE" ] || [ ! -f "$HERE/.stack-version" ] || [ ! -d "$HERE/skills" ]; then
  say "${B}OpenCode Raptor Stack — bootstrap${R}"
  dim "fetching ${REPO}@${BRANCH}"
  TMP="$(mktemp -d "${TMPDIR:-/tmp}/raptor-stack.XXXXXX")" || die "mktemp failed"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL --retry 3 "$TARBALL_URL" -o "$TMP/stack.tar.gz" || die "download failed: $TARBALL_URL"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$TMP/stack.tar.gz" "$TARBALL_URL" || die "download failed: $TARBALL_URL"
  else
    die "need curl or wget"
  fi
  tar -xzf "$TMP/stack.tar.gz" -C "$TMP" || die "extract failed"
  SRC="$(find "$TMP" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  [ -n "$SRC" ] && [ -f "$SRC/.stack-version" ] || die "unexpected archive layout"
  bash "$SRC/install.sh" "$@" ; rc=$?
  rm -rf "$TMP"
  exit $rc
fi

# --------------------------------------------------------------- args
CFG="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
RUN="${HOME}/.raptor"
WITH_TOOLS=0
WITH_CONFIG=1
WITH_RUNTIME=1
GH_TOKEN_ARG="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"

while [ $# -gt 0 ]; do
  case "$1" in
    --tools)          WITH_TOOLS=1; shift ;;
    --github-token)   GH_TOKEN_ARG="${2:-}"; shift 2 ;;
    --dir)            CFG="${2:-}"; shift 2 ;;
    --no-config)      WITH_CONFIG=0; shift ;;
    --no-runtime)     WITH_RUNTIME=0; shift ;;
    -h|--help)        sed -n '2,22p' "$0"; exit 0 ;;
    *)                warn "unknown flag: $1"; shift ;;
  esac
done

STACK_VERSION="$(cat "$HERE/.stack-version" 2>/dev/null || echo unknown)"

say ""
say "${B}OpenCode Raptor Stack${R}  ${DIM}v${STACK_VERSION}${R}"
dim "source: $HERE"
dim "target: $CFG"
say ""

# --------------------------------------------------------------- 1. layout
ok "creating layout"
mkdir -p "$CFG"/{agents,commands,plugins,skills} || die "cannot create $CFG"
[ "$WITH_RUNTIME" = "1" ] && mkdir -p "$RUN"/{engagements,toolsmith} && chmod 700 "$RUN"

# --------------------------------------------------------------- 2. agents
if [ -d "$HERE/agents" ]; then
  cp -a "$HERE/agents/." "$CFG/agents/" || warn "some agents failed to copy"
  ok "agents     : $(find "$HERE/agents" -type f -name '*.md' | wc -l | tr -d ' ')"
fi

# --------------------------------------------------------------- 3. commands
if [ -d "$HERE/commands" ]; then
  cp -a "$HERE/commands/." "$CFG/commands/" || warn "some commands failed to copy"
  ok "commands   : $(find "$HERE/commands" -type f -name '*.md' | wc -l | tr -d ' ')"
fi

# --------------------------------------------------------------- 4. skills
if [ -d "$HERE/skills" ]; then
  cp -a "$HERE/skills/." "$CFG/skills/" || warn "some skills failed to copy"
  ok "skills     : $(find "$HERE/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
fi

# --------------------------------------------------------------- 5. plugins
if [ -d "$HERE/plugins" ]; then
  cp -a "$HERE/plugins/." "$CFG/plugins/" || warn "some plugins failed to copy"
  ok "plugins    : $(find "$HERE/plugins" -maxdepth 1 -type f | wc -l | tr -d ' ')"
fi

# --------------------------------------------------------------- 6. runtime
if [ "$WITH_RUNTIME" = "1" ]; then
  for f in master-attacks.json master-attack-index.md kali-catalog.json; do
    [ -f "$HERE/runtime/$f" ] && cp "$HERE/runtime/$f" "$RUN/$f" && dim "runtime: $f"
  done
  [ -f "$HERE/runtime/api-registry.template.json" ] && cp "$HERE/runtime/api-registry.template.json" "$RUN/api-registry.template.json"
  [ -f "$HERE/scripts/install-tools.sh" ] && cp "$HERE/scripts/install-tools.sh" "$RUN/install-tools.sh" && chmod +x "$RUN/install-tools.sh"
  for f in verify.sh build_master_index.py segment_attacks.py; do
    [ -f "$HERE/scripts/$f" ] && cp "$HERE/scripts/$f" "$RUN/$f" && chmod +x "$RUN/$f" 2>/dev/null
  done

  # API keys: keep the ones already on this box, otherwise start from the template
  if [ -f "$RUN/apis.json" ]; then
    dim "api registry: existing keys preserved"
  else
    cp "$RUN/api-registry.template.json" "$RUN/apis.json" 2>/dev/null
    chmod 600 "$RUN/apis.json" 2>/dev/null
    dim "api registry: created from template (add keys with privdata_key)"
  fi
  ok "runtime    : $RUN"
fi

# --------------------------------------------------------------- 7. config
if [ "$WITH_CONFIG" = "1" ]; then
  CFGJSON="$CFG/opencode.json"
  if [ -f "$CFGJSON" ]; then
    cp "$CFGJSON" "$CFG/opencode.json.bak-raptor" 2>/dev/null
    dim "config backed up: opencode.json.bak-raptor"
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    warn "python3 not found — skipping config merge (copy opencode.json.template manually)"
  else
    python3 - "$CFGJSON" "$HERE/opencode.json.template" "$GH_TOKEN_ARG" <<'PY'
import json, os, sys

path, tpl_path, token = sys.argv[1], sys.argv[2], sys.argv[3]

def load(p):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return {}

cfg = load(path)
tpl = load(tpl_path)
if not isinstance(cfg, dict):
    cfg = {}

cfg.setdefault("$schema", tpl.get("$schema", "https://opencode.ai/config.json"))

# permissions: union, never remove an existing rule
perms = cfg.setdefault("permissions", [])
if not isinstance(perms, list):
    perms = cfg["permissions"] = []
have = {(p.get("action"), p.get("resource")) for p in perms if isinstance(p, dict)}
for p in tpl.get("permissions", []):
    if (p.get("action"), p.get("resource")) not in have:
        perms.append(p)

# mcp: template servers are defaults; an existing block always wins
tpl_mcp = dict(tpl.get("mcp", {}))
tpl_mcp.pop("github", None)

def merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            merge(dst[k], v)
        else:
            dst.setdefault(k, v)

mcp = cfg.setdefault("mcp", {})
if not isinstance(mcp, dict):
    mcp = cfg["mcp"] = {}
merge(mcp, tpl_mcp)

if token and token != "<YOUR_GITHUB_PAT>":
    mcp["github"] = {
        "type": "local",
        "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
        "environment": {"GITHUB_PERSONAL_ACCESS_TOKEN": token},
        "enabled": True,
    }
    print("    mcp: github enabled (token set)")
elif "github" in mcp:
    print("    mcp: github left as configured")
else:
    print("    mcp: github skipped (pass --github-token to enable)")

def server_names(d):
    names = [k for k in d if k != "servers"]
    if isinstance(d.get("servers"), dict):
        names += list(d["servers"].keys())
    return names

print("    mcp: " + ", ".join(sorted(server_names(mcp))))

os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
with open(path, "w") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
os.chmod(path, 0o600)
PY
    [ $? -eq 0 ] && ok "config     : $CFGJSON" || warn "config merge failed"
  fi
fi

# --------------------------------------------------------------- 8. secrets
if [ -n "$GH_TOKEN_ARG" ] && [ "$GH_TOKEN_ARG" != "<YOUR_GITHUB_PAT>" ]; then
  umask 077
  mkdir -p "$RUN"
  { echo "# Raptor stack secrets — chmod 600, never commit"; echo "GITHUB_TOKEN=$GH_TOKEN_ARG"; } > "$RUN/secrets.env"
  chmod 600 "$RUN/secrets.env"
  ok "secrets    : $RUN/secrets.env"
fi

# --------------------------------------------------------------- 9. tools
if [ "$WITH_TOOLS" = "1" ]; then
  warn "installing offensive toolchain (this takes a while)"
  bash "$RUN/install-tools.sh" || warn "installer returned non-zero, see $RUN/toolsmith/install.log"
  ok "toolchain pass complete"
else
  dim "skipping toolchain install (pass --tools to include it)"
fi

# --------------------------------------------------------------- 10. verify
AGENTS_N=$(find "$CFG/agents" -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
SKILLS_N=$(find "$CFG/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
CMDS_N=$(find "$CFG/commands" -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
PLUG_N=$(find "$CFG/plugins" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
MCP_N=$(python3 -c "
import json
d = json.load(open('$CFG/opencode.json')).get('mcp', {})
n = len([k for k in d if k != 'servers'])
n += len(d.get('servers', {}) or {})
print(n)
" 2>/dev/null || echo '?')

say ""
say "${B}${GREEN}OpenCode Raptor Stack installed${R}"
say ""
say "  agents     : ${B}${AGENTS_N}${R}   (incl. raptor, tiger, venon, modder)"
say "  commands   : ${B}${CMDS_N}${R}"
say "  skills     : ${B}${SKILLS_N}${R}"
say "  plugins    : ${B}${PLUG_N}${R}   (raptor, privdata)"
say "  mcp groups : ${B}${MCP_N}${R}   (rea, context7, playwright, chrome-devtools$([ -n "$GH_TOKEN_ARG" ] && echo ', github' || echo ''))"
[ "$WITH_RUNTIME" = "1" ] && say "  runtime    : ${B}${RUN}${R}"
say ""
say "  next:"
say "    1. ${B}opencode service restart${R}   # pick up the new plugins + MCP"
say "    2. ${B}opencode${R}  ->  select agent ${B}raptor${R}"
say "    3. ${B}/raptor https://target${R}"
say ""
dim "add API keys later : privdata_key(api='hikerapi', key='...')"
dim "install tools later: bash $RUN/install-tools.sh"
dim "update later       : re-run this same command"
say ""
