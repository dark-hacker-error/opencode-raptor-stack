#!/usr/bin/env bash
# Raptor toolchain installer - installs the missing offensive-security tooling.
# Usage: install-tools.sh [--all]        (no args = install whatever is missing)
# Log:   ~/.raptor/install.log

set -u
BASE="${HOME}/.raptor"
LOG="${BASE}/install.log"
mkdir -p "$BASE"
touch "$LOG"

log() { echo "[$(date -u +%H:%M:%S)] $*" >>"$LOG"; }

# tool -> install spec (apt|pip|go|cargo|git)
declare -A SPEC
spec() { SPEC["$1"]="$2"; }

spec amass "apt:amass"
spec assetfinder "go:github.com/tomnomnom/assetfinder@latest"
spec subfinder "go:github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest"
spec findomain "go:github.com/Findomain/Findomain@latest"
spec shuffledns "go:github.com/projectdiscovery/shuffledns@latest"
spec puredns "go:github.com/six2dez/puredns@latest"
spec dnsx "go:github.com/projectdiscovery/dnsx/cmd/dnsx@latest"
spec tlsx "go:github.com/projectdiscovery/tlsx/cmd/tlsx@latest"
spec httpx "go:github.com/projectdiscovery/httpx/cmd/httpx@latest"
spec naabu "go:github.com/projectdiscovery/naabu/v2/cmd/naabu@latest"
spec katana "go:github.com/projectdiscovery/katana/cmd/katana@latest"
spec gau "go:github.com/lc/gau/v2/cmd/gau@latest"
spec waybackurls "go:github.com/tomnomnom/waybackurls@latest"
spec urlfinder "go:github.com/projectdiscovery/urlfinder/cmd/urlfinder@latest"
spec ffuf "go:github.com/ffuf/ffuf/v2@latest"
spec nuclei "go:github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest"
spec dalfox "go:github.com/hahwul/dalfox/v2@latest"
spec gopherus "go:github.com/hatw/gopherus@latest"
spec trufflehog "go:github.com/trufflesecurity/trufflehog@latest"
spec gitleaks "go:github.com/gitleaks/gitleaks@latest"
spec bettercap "go:github.com/bettercap/bettercap@latest"
spec corscanner "go:github.com/OutOfLine/CorsScan@latest"
spec subjack "go:github.com/haccer/subjack@latest"
spec s3scanner "go:github.com/sa7mon/s3scanner@latest"
spec cloud_enum "go:github.com/initstring/cloud_enum@latest"
spec chisel "go:github.com/jpillora/chisel@latest"
spec ligolo-ng "go:github.com/nicocha30/ligolo-ng@latest"
spec gost "go:github.com/ginuerzh/gost@latest"
spec grype "go:github.com/anchore/grype@latest"
spec osv-scanner "go:github.com/google/osv-scanner/cmd/osv-scanner@latest"
spec kiterunner "go:github.com/assetnote/kiterunner@latest"
spec gqlscan "go:github.com/0xJazzy/gqlscan@latest"
spec x8 "go:github.com/Sh1Yo/x8@latest"
spec ROPgadget "pip:ROPgadget"
spec ropper "pip:ropper"
spec pwntools "pip:pwntools"
spec arjun "pip:arjun"
spec ghauri "pip:ghauri"
spec nosqlmap "pip:nosqlmap"
spec ssrfmap "git:https://github.com/0x727/ssrfmap"
spec lfimap "pip:lfimap"
spec commix "pip:commix"
spec oralyzer "pip:oralyzer"
spec sqlninja "apt:sqlninja"
spec wapiti "pip:wapiti3"
spec grafana-cop "pip:graphql-cop"
spec inql "pip:inql"
spec dirsearch "pip:dirsearch"
spec netexec "pip:netexec"
spec impacket "pip:impacket"
spec bloodhound "pip:sharphound"
spec responder "pip:responder"
spec pwncat "pip:pwncat"
spec capa "pip:flare-capa"
spec floss "pip:flare-floss"
spec binwalk "pip:binwalk"
spec unblob "pip:unblob"
spec semgrep "pip:semgrep"
spec yara-python "pip:yara-python"
spec frida "pip:frida-tools"
spec awscli "pip:awscli"
spec jwt_tool "git:https://github.com/ticarpi/jwt_tool"
spec ysoserial "git:https://github.com/frohoff/ysoserial"
spec marshalsec "git:https://github.com/marshalsec/marshalsec"
spec fenix "git:https://github.com/0x727/Fenix"
spec LinkFinder "git:https://github.com/GerbenJavado/LinkFinder"
spec SecretFinder "git:https://github.com/m4l4n/SecretFinder"
spec linpeas "git:https://github.com/peass-ng/PEASS-ng"
spec pspy "git:https://github.com/Dom97/PSPy"
spec winpeas "git:https://github.com/peass-ng/PEASS-ng"
spec one_gadget "git:https://github.com/david942j/one_gadget"
spec tplmap "git:https://github.com/volks73t/tplmap"
spec xsser "git:https://github.com/xsscout/xsser"
spec xxe "git:https://github.com/tonygao/xxe"
spec jwt_tool2 "git:https://github.com/ticarpi/jwt_tool"

# ---- OSINT / identity / people research ----------------------------------
spec sherlock "git:https://github.com/sherlock-project/sherlock"
spec maigret "pip:maigret"
spec holehe "pip:holehe"
spec h8mail "pip:h8mail"
spec phoneinfoga "go:github.com/sundowndev/phoneinfoga"
spec ghunt "pip:ghunt"
spec theHarvester "pip:theHarvester"
spec spiderfoot "pip:spiderfoot"
spec censys "pip:censys"
spec exiftool "apt:libimage-exiftool-perl"
spec swaks "apt:swaks"
spec smtp-user-enum "git:https://github.com/smtp-user-enum/smtp-user-enum"
spec netdiscover "apt:netdiscover"
spec dnsrecon "apt:dnsrecon"
spec fierce "pip:fierce"
spec dnstwist "pip:dnstwist"
spec cloud_enum2 "go:github.com/initstring/cloud_enum@latest"

have() { command -v "$1" >/dev/null 2>&1; }

log "=== install-tools start ==="

# ---- prerequisites -------------------------------------------------------
if ! have go;    then log "prereq go: apt-get install golang-go";    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq golang-go    >>"$LOG" 2>&1; fi
if ! have jq;    then log "prereq jq: apt-get install jq";            DEBIAN_FRONTEND=noninteractive apt-get install -y -qq jq            >>"$LOG" 2>&1; fi
if ! have git;   then log "prereq git: apt-get install git";          DEBIAN_FRONTEND=noninteractive apt-get install -y -qq git           >>"$LOG" 2>&1; fi
if ! have ruby;  then log "prereq ruby: apt-get install ruby";        DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ruby         >>"$LOG" 2>&1; fi
if ! have masscan; then log "prereq masscan"; DEBIAN_FRONTEND=noninteractive apt-get install -y -qq masscan >>"$LOG" 2>&1; fi

export PATH="$PATH:$(go env GOPATH 2>/dev/null)/bin:/root/go/bin:/usr/local/go/bin"
export DEBIAN_FRONTEND=noninteractive

# ---- install missing tools ----------------------------------------------
for t in "${!SPEC[@]}"; do
  have "$t" && continue
  s="${SPEC[$t]}"
  kind="${s%%:*}"; val="${s#*:}"
  case "$kind" in
    apt)
      log "apt install $val"
      apt-get install -y -qq "$val" >>"$LOG" 2>&1
      ;;
    pip)
      log "pip install $val"
      pip install --quiet --break-system-packages "$val" >>"$LOG" 2>&1 || pip install --quiet "$val" >>"$LOG" 2>&1
      ;;
    go)
      log "go install $val"
      go install "$val" >>"$LOG" 2>&1
      ;;
    git)
      log "git clone $val"
      d="${BASE}/tools/${t}"
      [ -d "$d" ] || git clone --depth 1 "$val" "$d" >>"$LOG" 2>&1
      # expose the entrypoint if it is an obvious script
      for cand in "$d"/*.py "$d"/*.sh "$d"/*.jar; do
        [ -f "$cand" ] || continue
        b="$(basename "$cand")"
        case "$b" in
          *test*|*setup*|*requirements*|*__init__*) continue ;;
        esac
        chmod +x "$cand" 2>/dev/null
        ln -sf "$cand" "/usr/local/bin/$b" 2>/dev/null
        break
      done
      ;;
  esac
done

# ---- SecLists wordlists (the standard Kali corpus) ------------------------
if [ ! -d /usr/share/seclists ]; then
  log "cloning SecLists into /usr/share/seclists"
  git clone --depth 1 https://github.com/danielmiessler/SecLists /usr/share/seclists >>"$LOG" 2>&1
fi

# ---- make go binaries reachable -----------------------------------------
GOBIN="$(go env GOPATH 2>/dev/null)/bin"
if [ -d "$GOBIN" ]; then
  mkdir -p /usr/local/bin
  for f in "$GOBIN"/*; do
    [ -f "$f" ] || continue
    ln -sf "$f" "/usr/local/bin/$(basename "$f")" 2>/dev/null
  done
  log "linked $(ls -1 "$GOBIN" | wc -l) go binaries into /usr/local/bin"
fi

log "=== install-tools done ==="
