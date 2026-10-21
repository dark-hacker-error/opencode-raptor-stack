#!/usr/bin/env bash
# =============================================================================
#  RAPTOR STACK — setup / restore
#  Installs the Raptor autonomous offensive-security stack into OpenCode V2.
#
#  Usage:
#    curl -fsSL https://raw.githubusercontent.com/dark-hacker-error/opencode-raptor-stack/main/install.sh | bash
#    bash install.sh [--tools] [--github-token <t>] [--dir <opencode-config-dir>]
# =============================================================================
set -uo pipefail

GREEN=$'\033[32m'; YEL=$'\033[33m'; RED=$'\033[31m'; DIM=$'\033[2m'; B=$'\033[1m'; R=$'\033[0m'
say()  { printf '%s\n' "$*"; }
ok()   { say "${GREEN}[+]${R} $*"; }
warn() { say "${YEL}[!]${R} $*"; }
err()  { say "${RED}[x]${R} $*"; }
dim()  { say "${DIM}    $*${R}"; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="${HOME}/.config/opencode"
RUN="${HOME}/.raptor"
WITH_TOOLS=0
GH_TOKEN_ARG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --tools) WITH_TOOLS=1; shift ;;
    --github-token) GH_TOKEN_ARG="$2"; shift 2 ;;
    --dir) CFG="$2"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) shift ;;
  esac
done

say "${B}Raptor stack setup${R}"
dim "source: $HERE"
dim "target: $CFG"
say ""

# ---------------------------------------------------------------- 1. layout
ok "creating layout"
mkdir -p "$CFG"/{agents,commands,plugins,skills} "$RUN"/{engagements,toolsmith}
chmod 700 "$RUN"

# ---------------------------------------------------------------- 2. agents
if [ -d "$HERE/agents" ]; then
  cp -rv "$HERE/agents/." "$CFG/agents/" 2>/dev/null | sed 's/^/    /'
  ok "agents installed"
fi

# ---------------------------------------------------------------- 3. commands
if [ -d "$HERE/commands" ]; then
  cp -rv "$HERE/commands/." "$CFG/commands/" 2>/dev/null | sed 's/^/    /'
  ok "commands installed"
fi

# ---------------------------------------------------------------- 4. plugins
if [ -d "$HERE/plugins" ]; then
  cp -rv "$HERE/plugins/." "$CFG/plugins/" 2>/dev/null | sed 's/^/    /'
  ok "plugins installed"
fi

# ---------------------------------------------------------------- 5. skills
if [ -d "$HERE/skills" ]; then
  for s in "$HERE/skills"/*/; do
    [ -d "$s" ] || continue
    name="$(basename "$s")"
    mkdir -p "$CFG/skills/$name"
    cp -r "$s." "$CFG/skills/$name/" 2>/dev/null
    dim "skill: $name"
  done
  ok "skills installed ($(ls -1 "$HERE/skills" | wc -l))"
fi

# ---------------------------------------------------------------- 6. runtime
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
ok "runtime installed"

# ---------------------------------------------------------------- 7. config
CFGJSON="$CFG/opencode.json"
if [ -f "$CFGJSON" ]; then
  cp "$CFGJSON" "$CFG/opencode.json.bak-raptor"
  dim "config backed up"
fi
python3 - "$CFGJSON" "$GH_TOKEN_ARG" <<'PY'
import json, os, sys
path, tok = sys.argv[1], sys.argv[2]
cfg = {}
if os.path.exists(path):
    try: cfg = json.load(open(path))
    except Exception: cfg = {}
cfg.setdefault("$schema", "https://opencode.ai/config.json")

perms = cfg.setdefault("permissions", [])
have = {p.get("action") for p in perms if isinstance(p, dict)}
for act, res, eff in [("skill","*","allow"), ("webfetch","*","allow"), ("websearch","*","allow")]:
    if act not in have:
        perms.append({"action": act, "resource": res, "effect": eff})

mcp = cfg.setdefault("mcp", {})
if tok:
    mcp["github"] = {
        "type": "local",
        "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
        "environment": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": tok,
            "GITHUB_PERSONAL_ACCESS_TOKEN": tok,
        },
        "enabled": True,
    }
    print("    mcp: github (token set)")
json.dump(cfg, open(path, "w"), indent=2)
os.chmod(path, 0o600)
PY
ok "config written"

# ---------------------------------------------------------------- 8. secrets
if [ -n "$GH_TOKEN_ARG" ]; then
  umask 077
  { echo "# Raptor stack secrets — chmod 600, never commit"; echo "GITHUB_TOKEN=$GH_TOKEN_ARG"; } > "$RUN/secrets.env"
  chmod 600 "$RUN/secrets.env"
  ok "secrets stored ($RUN/secrets.env)"
fi

# ---------------------------------------------------------------- 9. tools
if [ "$WITH_TOOLS" = "1" ]; then
  warn "installing offensive toolchain (this takes a while)"
  bash "$RUN/install-tools.sh" || warn "installer returned non-zero, see $RUN/toolsmith/install.log"
  ok "toolchain pass complete"
else
  dim "skipping toolchain install (pass --tools to include it)"
fi

# ---------------------------------------------------------------- 10. verify
say ""
ok "${B}Raptor stack installed${R}"
say ""
say "  agent     : ${B}raptor${R}   (select it in opencode, or /raptor <target>)"
say "  skills    : $(ls -1 "$CFG/skills" 2>/dev/null | wc -l)"
say "  plugins   : $(ls -1 "$CFG/plugins" 2>/dev/null | wc -l)  (raptor, privdata)"
say "  runtime   : $RUN"
say "  index     : $(python3 -c "import json;print(json.load(open('$RUN/master-attacks.json'))['total'])" 2>/dev/null || echo '?') attack techniques"
say ""
say "  next:"
say "    1. ${B}opencode service restart${R}   # pick up the new plugins + MCP"
say "    2. opencode  ->  select agent ${B}raptor${R}"
say "    3. ${B}/raptor https://target${R}"
say ""
dim "add API keys later:  privdata_key(api='hikerapi', key='...')"
dim "install tools later: bash $RUN/install-tools.sh"
say ""
