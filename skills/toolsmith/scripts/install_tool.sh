#!/usr/bin/env bash
# ============================================================================
#  TOOLSMITH — offensive-security toolchain installer
#  Sources: Kali apt | GitHub releases | go install | PyPI | crates.io | npm
#           | git+build | snap | Docker
#  Usage:
#    install_tool.sh <tool> [tool...] [options]
#    install_tool.sh --category web [--only a,b] [--skip c] [--dry-run]
#    install_tool.sh --list | --list-all | --search <term>
#
#  Options:
#    --latest          newest release instead of the pinned version
#    --upgrade         reinstall even if already present
#    --method <m>      force apt|pip|go|cargo|npm|github|git|snap|docker
#    --mirror <url>    GitHub mirror base (default: https://github.com)
#    --jobs N          parallel workers (default 4)
#    --no-verify       skip post-install version check
#    --dry-run         print the plan, change nothing
#    --category <c>    install a whole category
#    --only <a,b>      restrict a category install
#    --skip <a,b>      exclude tools
# ============================================================================
set -uo pipefail

BIN_DIR="/usr/local/bin"
LOG_DIR="${HOME}/.raptor/toolsmith"
LOG="${LOG_DIR}/install.log"
STATE="${LOG_DIR}/installed.tsv"
mkdir -p "$LOG_DIR" "${BIN_DIR}"

GREEN=$'\033[32m'; YEL=$'\033[33m'; RED=$'\033[31m'; DIM=$'\033[2m'; B=$'\033[1m'; R=$'\033[0m'
log()  { printf '%s\n' "$*" | tee -a "$LOG" >/dev/null; }
say()  { printf '%s\n' "$*"; }
ok()   { say "${GREEN}[+]${R} $*"; log "[OK] $*"; }
warn() { say "${YEL}[!]${R} $*"; log "[WARN] $*"; }
err()  { say "${RED}[x]${R} $*"; log "[ERR] $*"; }
dim()  { say "${DIM}    $*${R}"; log "    $*"; }

# ---------------------------------------------------------------- registry
# name | category | method | source(pkg/repo/crate/npm) | version
REG='
nmap|recon|apt|nmap|-
masscan|recon|apt|masscan|-
naabu|recon|go|github.com/projectdiscovery/naabu/v2/cmd/naabu@latest|-
httpx|recon|go|github.com/projectdiscovery/httpx/cmd/httpx@latest|-
tlsx|recon|go|github.com/projectdiscovery/tlsx/cmd/tlsx@latest|-
dnsx|recon|go|github.com/projectdiscovery/dnsx/cmd/dnsx@latest|-
amass|recon|apt|amass|-
nmap-scripts|recon|apt|nmap-scripts|-
rustscan|recon|cargo|rustscan|-
zmap|recon|git|https://github.com/zmap/zmap|-
unicornscan|recon|apt|unicornscan|-
netdiscover|recon|apt|netdiscover|-
arp-scan|recon|apt|arp-scan|-
hping3|recon|apt|hping3|-
ettercap|recon|apt|ettercap|-
bettercap|recon|go|github.com/bettercap/bettercap@latest|-
responder|recon|pip|responder|-
subfinder|subdomain|go|github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest|-
assetfinder|subdomain|go|github.com/tomnomnom/assetfinder@latest|-
findomain|subdomain|go|github.com/Findomain/Findomain@latest|-
shuffledns|subdomain|go|github.com/projectdiscovery/shuffledns@latest|-
puredns|subdomain|go|github.com/six2dez/puredns@latest|-
tlsx2|subdomain|go|github.com/projectdiscovery/tlsx/cmd/tlsx@latest|-
amass2|subdomain|apt|amass|-
github-subdomains|subdomain|go|github.com/gwen001/github-subdomains@latest|-
subjack|subdomain|go|github.com/haccer/subjack@latest|-
alterx|subdomain|go|github.com/projectdiscovery/alterx/cmd/alterx@latest|-
dnsx2|subdomain|go|github.com/projectdiscovery/dnsx/cmd/dnsx@latest|-
tlsx3|subdomain|go|github.com/projectdiscovery/tlsx/cmd/tlsx@latest|-
waybackurls|url|go|github.com/tomnomnom/waybackurls@latest|-
gau|url|go|github.com/lc/gau/v2/cmd/gau@latest|-
urlfinder|url|go|github.com/projectdiscovery/urlfinder/cmd/urlfinder@latest|-
katana|url|go|github.com/projectdiscovery/katana/cmd/katana@latest|-
gospider|url|go|github.com/jaeles-project/gospider@latest|-
hakrawler|url|go|github.com/hakluke/hakrawler@latest|-
gf|url|go|github.com/tomnomnom/gf@latest|-
unfurl|url|go|github.com/tomnomnom/unfurl@latest|-
xurl2curl|url|go|github.com/edoardottt/xurl2curl@latest|-
ffuf|web|go|github.com/ffuf/ffuf/v2@latest|-
feroxbuster|web|cargo|feroxbuster|-
gobuster|web|apt|gobuster|-
dirsearch|web|pip|dirsearch|-
katana2|web|go|github.com/projectdiscovery/katana/cmd/katana@latest|-
arjun|web|pip|arjun|-
x8|web|go|github.com/Sh1Yo/x8@latest|-
paramspider|web|pip|paramspider|-
qsreplace|web|pip|qsreplace|-
fuzzing-toolkit|web|pip|fuzzing-toolkit|-
nuclei|web|go|github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest|-
nikto|web|apt|nikto|-
whatweb|web|apt|whatweb|-
wafw00f|web|apt|wafw00f|-
wapiti|web|pip|wapiti3|-
zaproxy|web|apt|zaproxy|-
burpsuite|web|apt|burpsuite|-
droopescan|web|pip|droopescan|-
wpscan|web|apt|wpscan|-
joomscan|web|git|https://github.com/OWASP/joomscan|-
cmsmap|web|go|github.com/cmsmapproject/cmsmap@latest|-
corscanner|web|go|github.com/OutOfLine/CorsScan@latest|-
sqlmap|inject|apt|sqlmap|-
sqlninja|inject|apt|sqlninja|-
ghauri|inject|pip|ghauri|-
nosqlmap|inject|pip|nosqlmap|-
commix|inject|pip|commix|-
tplmap|inject|git|https://github.com/volks73t/tplmap|-
sstimap|inject|pip|sstimap|-
xxenum|inject|pip|xxenum|-
xxe|inject|git|https://github.com/tonygao/xxe|-
ssrfmap|inject|git|https://github.com/0x727/ssrfmap|-
gopherus|inject|go|github.com/hatw/gopherus@latest|-
dotdotdot|inject|pip|dotdotdot|-
dalfox|web|go|github.com/hahwul/dalfox/v2@latest|-
xsser|web|git|https://github.com/xsscout/xsser|-
jwt_tool|jwt|git|https://github.com/ticarpi/jwt_tool|-
jwt-cracker|jwt|go|github.com/lmammino/jwt-cracker@latest|-
hashcat|cred|apt|hashcat|-
john|cred|apt|john|-
hydra|cred|apt|hydra|-
medusa|cred|apt|medusa|-
patator|cred|apt|patator|
crackmapexec|cred|pip|crackmapexec|-
netexec|cred|pip|netexec|-
impacket|cred|pip|impacket|-
sharphound|ad|pip|sharphound|-
bloodhound-python|ad|pip|bloodhound-python|-
certipy|ad|pip|certipy|-
ldapdomaindump|ad|pip|ldapdomaindump|-
ldapsearch|ad|apt|ldap-utils|-
smbclient|ad|apt|smbclient|-
samba|ad|apt|samba|-
ntlmrelayx|ad|pip|impacket|-
responder2|ad|pip|responder|-
evil-winrm|ad|go|github.com/0x4D31/Evil-WinRM@latest|-
winpeas|ad|git|https://github.com/peass-ng/PEASS-ng|-
linpeas|privesc|git|https://github.com/peass-ng/PEASS-ng|-
pspy|privesc|git|https://github.com/Dom97/PSPy|-
sudo-killer|privesc|git|https://github.com/TH3xACE/SUDO_KILLER_V3|-
gtfobins|privesc|git|https://github.com/GTFOBins/GTFOBins.github.io|-
linux-smart-enumeration|privesc|pip|linux-smart-enumeration|-
checkcap|privesc|apt|libcap2-bin|-
docker|container|apt|docker.io|-
kubectl|container|apt|kubernetes-client|-
trivy|container|go|github.com/aquasecurity/trivy/cmd/trivy@latest|-
kube-bench|container|apt|kube-bench|-
kube-hunter|container|git|https://github.com/cyberark/KubeHunter|-
falco|container|apt|falco|-
grype|container|go|github.com/anchore/grype@latest|-
syft|container|go|github.com/anchore/syft/cmd/syft@latest|-
aws|cloud|pip|awscli|-
aws-vault|cloud|go|github.com/99designs/aws-vault@latest|-
s3scanner|cloud|go|github.com/sa7mon/s3scanner@latest|-
cloud_enum|cloud|go|github.com/initstring/cloud_enum@latest|-
cloudsploit|cloud|npm|cloudsploit|-
ziam|cloud|npm|ziam|-
prowler|cloud|pip|prowler|-
terrascan|cloud|go|github.com/tenable/terrascan/cmd/terrascan@latest|-
tfsec|cloud|go|github.com/aquasecurity/tfsec/cmd/tfsec@latest|-
checkov|cloud|pip|checkov|-
kube-score|cloud|go|github.com/zegl/kube-score/cmd/kube-score@latest|-
osv-scanner|cloud|go|github.com/google/osv-scanner/cmd/osv-scanner@latest|-
chisel|pivot|go|github.com/jpillora/chisel@latest|-
ligolo-ng|pivot|go|github.com/nicocha30/ligolo-ng@latest|-
gost|pivot|go|github.com/ginuerzh/gost@latest|-
pwncat|pivot|pip|pwncat|
proxychains|pivot|apt|proxychains4|-
iodine|pivot|apt|iodine|-
dnscat2|pivot|apt|dnscat2|
chisel2|pivot|go|github.com/jpillora/chisel@latest|-
reGeorg|pivot|git|https://github.com/socketdot/socket/reGeorg|-
bettercap2|proxy|go|github.com/bettercap/bettercap@latest|-
mitmproxy|proxy|pip|mitmproxy|-
zaproxy2|proxy|apt|zaproxy|-
responder3|proxy|pip|responder|-
gdb|re|apt|gdb|-
lldb|re|apt|lldb|-
radare2|re|apt|radare2|-
rizin|re|apt|rizin-bin|-
ghidra|re|apt|ghidra|-
cutter|re|snap|cutter-re|-
apktool|re|apt|apktool|-
jadx|re|apt|jadx|-
dex2jar|re|apt|dex2jar|-
baksmali|re|apt|smali|-
ilspycmd|re|apt|dotnet-sdk-8.0|-
pwntools|exploit|pip|pwntools|-
ROPgadget|exploit|pip|ROPgadget|-
ropper|exploit|pip|ropper|-
one_gadget|exploit|git|https://github.com/david942j/one_gadget|-
pwninit|exploit|git|https://github.com/pwninit/pwninit|-
gdbinit|exploit|git|https://github.com/pwndbg/pwndbg|-
checksec|exploit|pip|checksec|
angr|exploit|pip|angr|
z3|exploit|pip|z3-solver|
r2pipe|exploit|pip|r2pipe|-
msfconsole|exploit|apt|metasploit-framework|-
searchsploit|exploit|apt|exploitdb|-
ysoserial|exploit|git|https://github.com/frohoff/ysoserial|-
marshalsec|exploit|git|https://github.com/marshalsec/marshalsec|-
fenix|exploit|git|https://github.com/0x727/Fenix|-
ysoserial.net|exploit|go|github.com/evotec/ysoserial.net@latest|-
capa|malware|pip|flare-capa|-
floss|malware|pip|flare-floss|-
yara|malware|apt|yara|-
yara-python|malware|pip|yara-python|-
ssdeep|malware|apt|ssdeep|-
hashdeep|malware|apt|hashdeep|-
die|malware|snap|die|
unblob|malware|pip|unblob|-
binwalk|malware|pip|binwalk|-
malduck|malware|pip|malduck|-
peid|malware|apt|peid|-
trid|malware|apt|trid|-
volatility3|forensics|pip|volatility3|-
bulk_extractor|forensics|apt|bulk-extractor|-
foremost|forensics|apt|foremost|-
sleuthkit|forensics|apt|sleuthkit|-
photorec|forensics|apt|testdisk|-
sherlock|osint|git|https://github.com/sherlock-project/sherlock|-
maigret|osint|pip|maigret|-
holehe|osint|pip|holehe|-
h8mail|osint|pip|h8mail|-
theHarvester|osint|pip|theHarvester|-
spiderfoot|osint|pip|spiderfoot|-
ghunt|osint|pip|ghunt|-
phoneinfoga|osint|go|github.com/sundowndev/phoneinfoga@latest|-
recon-ng|osint|pip|recon-ng|-
censys|osint|pip|censys|-
shodan|osint|pip|shodan|-
dnsrecon|osint|pip|dnsrecon|-
dnstwist|osint|pip|dnstwist|-
fierce|osint|pip|fierce|-
trufflehog|osint|go|github.com/trufflesecurity/trufflehog@latest|-
gitleaks|osint|go|github.com/gitleaks/gitleaks@latest|-
semgrep|osint|pip|semgrep|-
aircrack-ng|wireless|apt|aircrack-ng|
airodump-ng|wireless|apt|aircrack-ng|-
aireplay-ng|wireless|apt|aircrack-ng|
wifite|wireless|pip|wifite|-
hcxdumptool|wireless|git|https://github.com/vanhoefm/krackattacks-scripts|-
pixiewps|wireless|git|https://github.com/routerkill/rtl-s exploitation|-
bettercap3|wireless|go|github.com/bettercap/bettercap@latest|-
kismet|wireless|apt|kismet|
reaver|wireless|apt|reaver|
bully|wireless|apt|bully|
bluez|wireless|apt|bluez|
nfc-tools|wireless|apt|nfc-tools|
rfkill|wireless|apt|rfkill|
can-utils|vehicle|apt|can-utils|
carla|vehicle|snap|carla-simulator|-
kal CAN|vehicle|apt|can-utils|-
carbkit|vehicle|git|https://github.com/CarB/toolkit/-
firmwalker|iot|git|https://github.com/advantech/FirmwareWalker|-
binwalk2|iot|pip|binwalk|-
firmware-mod-kit|iot|apt|firmware-mod-kit|-
qemu-system-arm|iot|apt|qemu-system-arm|
jtag|iot|apt|openocd|
openocd|iot|apt|openocd|
jaeles|web|github|github.com/jaeles-project/jaeles|-
croc|pivot|github|github.com/schollz/croc|-
gore|exploit|github|github.com/thebloodyswiper/gore|-
pplacer|exploit|github|github.com/0xdea/pplacer|-
bloodhound-python2|ad|github|github.com/SpecterOps/BloodHoundPython|-
jq|report|apt|jq|
yq|report|go|github.com/mikefarah/yq/v4@latest|-
pandoc|report|apt|pandoc|-
unisim|report|apt|unisim|
tomcat-nat|report|apt|tomcat9|
gs|report|apt|ghostscript|
'

# ------------------------------------------------------------------ helpers
have() { command -v "$1" >/dev/null 2>&1; }
pkg_installed() { dpkg -s "$1" >/dev/null 2>&1; }

reg_lookup() {
  # $1 = tool name -> prints "category|method|source|version"
  printf '%s\n' "$REG" | awk -F'|' -v t="$1" '$1==t {print $2"|"$3"|"$4"|"$5; exit}'
}
reg_category() {
  printf '%s\n' "$REG" | awk -F'|' -v c="$1" '$2==c {print $1}'
}
reg_search() {
  printf '%s\n' "$REG" | awk -F'|' -v q="$1" 'tolower($0) ~ tolower(q)'
}

cmd_for() {
  case "$1" in
    apt)    echo "apt-get install -y" ;;
    pip)    echo "pip install --break-system-packages" ;;
    go)     echo "go install" ;;
    cargo)  echo "cargo install" ;;
    npm)    echo "npm install -g" ;;
    snap)   echo "snap install" ;;
    docker) echo "docker pull" ;;
    git)    echo "git clone" ;;
    github) echo "gh-release" ;;
  esac
}

# ---- github release installer ---------------------------------------------
# repo like owner/name ; picks the linux amd64 (or arm64) asset
GH_TARGET=""
gh_install() {
  # $1 = owner/repo, $2 = desired binary name
  # result -> global GH_TARGET ; progress -> stderr (never stdout)
  local repo="$1" binname="$2"
  local api="https://api.github.com/repos/${repo}/releases/latest"
  local meta tag url asset tmp want_sum got_sum found

  GH_TARGET=""
  meta=$(curl -fsSL "$api" 2>/dev/null) || { echo "[x] release metadata fetch failed for $repo" >&2; return 1; }
  tag=$(printf '%s' "$meta" | jq -r '.tag_name // empty')
  [ -z "$tag" ] && { echo "[x] no release for $repo" >&2; return 1; }

  # host architecture awareness - never install a foreign-arch binary
  local HOST_ARCH PREFER ARCH_SKIP
  HOST_ARCH=$(uname -m)
  case "$HOST_ARCH" in
    x86_64)         PREFER="amd64 x86_64";  ARCH_SKIP="arm64 aarch64 armv mips ppc 386 i686 riscv64"; FILE_ARCH="x86-64" ;;
    aarch64|arm64)  PREFER="arm64 aarch64"; ARCH_SKIP="amd64 x86_64 386 i686 mips ppc riscv64"; FILE_ARCH="aarch64" ;;
    *)              PREFER="amd64 x86_64 arm64 aarch64"; ARCH_SKIP=""; FILE_ARCH="" ;;
  esac

  # score every asset and take the best fit
  local best_score=0 url="" best_name=""
  while IFS=$'\t' read -r aname aurl; do
    [ -z "$aname" ] && continue
    local low score
    low=$(printf '%s' "$aname" | tr 'A-Z' 'a-z')
    case "$low" in
      *darwin*|*macos*|*windows*|*win64*|*web*|*source*) continue ;;
    esac
    # skip foreign architectures entirely
    if [ -n "$ARCH_SKIP" ]; then
      local bad=0
      for tok in $ARCH_SKIP; do case "$low" in *"$tok"*) bad=1 ;; esac; done
      [ "$bad" = "1" ] && continue
    fi
    score=0
    case "$low" in *"${binname,,}"*) score=$((score+6)) ;; esac
    case "$low" in *amd64*|*x86_64*|*arm64*|*aarch64*) score=$((score+4)) ;; esac
    case "$low" in *linux*) score=$((score+2)) ;; esac
    case "$low" in *.deb) score=$((score+3)) ;; *.tar.gz|*.tgz) score=$((score+1)) ;; esac
    [ "$score" -eq 0 ] && continue
    if [ "$score" -gt "$best_score" ]; then
      best_score="$score"; url="$aurl"; best_name="$aname"
    fi
  done < <(printf '%s' "$meta" | jq -r '.assets[]? | .name + "\t" + .browser_download_url')

  [ -z "$url" ] && { echo "[x] no usable linux/amd64 asset in $repo $tag" >&2; return 1; }

  asset=$(basename "$url")
  echo "    release $tag -> $asset" >&2
  tmp=$(mktemp -d)

  curl -fsSL -o "$tmp/$asset" "$url" || { echo "[x] download failed: $url" >&2; rm -rf "$tmp"; return 1; }

  if curl -fsSL -o "$tmp/checksums.txt" "${url%/*}/checksums.txt" 2>/dev/null; then
    if grep -q "$asset" "$tmp/checksums.txt" 2>/dev/null; then
      want_sum=$(grep "$asset" "$tmp/checksums.txt" | awk '{print $1}' | head -1)
      got_sum=$(sha256sum "$tmp/$asset" | awk '{print $1}')
      if [ -n "$want_sum" ] && [ "$want_sum" != "$got_sum" ]; then
        echo "[x] checksum mismatch for $asset" >&2; rm -rf "$tmp"; return 1
      fi
      echo "    sha256 verified" >&2
    fi
  fi

  case "$asset" in
    *.tar.gz|*.tgz) tar xzf "$tmp/$asset" -C "$tmp" 2>>"$LOG" || { echo "[x] extract failed" >&2; rm -rf "$tmp"; return 1; } ;;
    *.zip)
      if command -v unzip >/dev/null 2>&1; then unzip -oq "$tmp/$asset" -d "$tmp" 2>>"$LOG"
      else python3 -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$tmp/$asset" "$tmp"; fi ;;
    *.tar.bz2) tar xjf "$tmp/$asset" -C "$tmp" 2>>"$LOG" ;;
    *.tar)      tar xf  "$tmp/$asset" -C "$tmp" 2>>"$LOG" ;;
    *.deb)      dpkg-deb -x "$tmp/$asset" "$tmp" 2>>"$LOG" ;;
  esac

  local is_archive=0
  case "$asset" in *.tar.gz|*.tgz|*.zip|*.tar.bz2|*.tar|*.deb) is_archive=1 ;; esac

  if [ "$is_archive" = "0" ] && [ -f "$tmp/$asset" ]; then
    found="$tmp/$asset"
  else
    # prefer a real executable named like the tool
    found=""
    while IFS= read -r f; do
      [ -n "$f" ] && file -b "$f" 2>/dev/null | grep -qE "ELF|Mach-O|PE32" \
        && { [ -z "$FILE_ARCH" ] || file -b "$f" 2>/dev/null | grep -q "$FILE_ARCH"; } \
        && { found="$f"; break; }
    done < <(find "$tmp" -type f -name "$binname*" 2>/dev/null | head -20)
    # then any real executable in the tree
    if [ -z "$found" ]; then
      while IFS= read -r f; do
        [ -n "$f" ] && file -b "$f" 2>/dev/null | grep -qE "ELF|Mach-O|PE32" \
          && { [ -z "$FILE_ARCH" ] || file -b "$f" 2>/dev/null | grep -q "$FILE_ARCH"; } \
          && { found="$f"; break; }
      done < <(find "$tmp" -type f -perm -u+x 2>/dev/null | head -40)
    fi
  fi
  [ -z "$found" ] && { echo "[x] no executable found in $asset" >&2; rm -rf "$tmp"; return 1; }

  install -m 755 "$found" "$BIN_DIR/$binname" || { echo "[x] install failed" >&2; rm -rf "$tmp"; return 1; }
  rm -rf "$tmp"
  GH_TARGET="$BIN_DIR/$binname"
  return 0
}

link_go_bins() {
  local gb; gb=$(go env GOPATH 2>/dev/null)/bin
  [ -d "$gb" ] || return 0
  for f in "$gb"/*; do [ -f "$f" ] && ln -sf "$f" "$BIN_DIR/$(basename "$f")"; done
  dim "linked $(ls -1 "$gb" 2>/dev/null | wc -l) go binaries into $BIN_DIR"
}

link_cargo_bins() {
  [ -d "$HOME/.cargo/bin" ] || return 0
  for f in "$HOME/.cargo/bin"/*; do [ -f "$f" ] && ln -sf "$f" "$BIN_DIR/$(basename "$f")"; done
}

verify_tool() {
  local t="$1"
  have "$t" || { echo "missing"; return 1; }
  # a binary for the wrong architecture is broken, not present
  local fa ha
  fa=$(file -b "$t" 2>/dev/null)
  ha=$(uname -m)
  case "$ha" in
    x86_64)        echo "$fa" | grep -q "x86-64" || { echo "broken: wrong architecture ($ha)"; return 1; } ;;
    aarch64|arm64) echo "$fa" | grep -q "aarch64\|ARM aarch64" || { echo "broken: wrong architecture ($ha)"; return 1; } ;;
  esac
  local out
  for flag in --version -version -V version; do
    out=$(timeout 12 "$t" "$flag" 2>&1 | head -1)
    [ -n "$out" ] && { echo "$out"; return 0; }
  done
  out=$(timeout 12 "$t" -h 2>&1 | head -1)
  [ -n "$out" ] && { echo "$out"; return 0; }
  echo "present-no-version"
  return 0
}

# ------------------------------------------------------------- install one
install_one() {
  local tool="$1" method_override="${2:-}"
  local entry cat method src ver
  entry=$(reg_lookup "$tool")
  if [ -z "$entry" ]; then
    err "$tool is not in the registry — resolving from GitHub/PyPI automatically"
    method_override="${method_override:-auto}"
  else
    IFS='|' read -r cat method src ver <<<"$entry"
    [ -n "$method_override" ] && [ "$method_override" != "auto" ] && method="$method_override"
  fi

  # already present?
  if have "$tool" && [ "$UPGRADE" != "1" ]; then
    ok "$tool already present ($(command -v "$tool"))"
    return 0
  fi

  say "${B}>> $tool${R} ${DIM}[$method ${src}]${R}"

  case "$method" in
    apt)
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -qq >>"$LOG" 2>&1
      apt-get install -y -qq "$src" >>"$LOG" 2>&1 || { err "apt install $src failed"; return 1; }
      ;;
    pip)
      pip install --break-system-packages --quiet "$src" >>"$LOG" 2>&1 \
        || pip install --quiet "$src" >>"$LOG" 2>&1 \
        || { err "pip install $src failed"; return 1; }
      ;;
    go)
      have go || { err "go toolchain missing — install golang-go first"; return 1; }
      go install "$src" >>"$LOG" 2>&1 || { err "go install $src failed"; return 1; }
      link_go_bins
      ;;
    cargo)
      have cargo || { err "cargo missing — install cargo first"; return 1; }
      cargo install "$src" >>"$LOG" 2>&1 || { err "cargo install $src failed"; return 1; }
      link_cargo_bins
      ;;
    npm)
      have npm || { err "npm missing"; return 1; }
      npm install -g "$src" >>"$LOG" 2>&1 || { err "npm install $src failed"; return 1; }
      ;;
    snap)
      have snap || { err "snap missing"; return 1; }
      snap install "$src" >>"$LOG" 2>&1 || { err "snap install $src failed"; return 1; }
      ;;
    docker)
      docker pull "$src" >>"$LOG" 2>&1 || { err "docker pull $src failed"; return 1; }
      return 0
      ;;
    git)
      d="$LOG_DIR/src/${tool}"
      [ -d "$d" ] || git clone --depth 1 "$src" "$d" >>"$LOG" 2>&1 || { err "clone failed: $src"; return 1; }
      if [ -f "$d/Makefile" ]; then make -C "$d" >>"$LOG" 2>&1
      elif [ -f "$d/setup.py" ]; then pip install --break-system-packages --quiet "$d" >>"$LOG" 2>&1
      elif [ -f "$d/pyproject.toml" ]; then pip install --break-system-packages --quiet "$d" >>"$LOG" 2>&1
      elif [ -f "$d/package.json" ]; then (cd "$d" && npm install >>"$LOG" 2>&1)
      fi
      # expose obvious entrypoints
      for cand in "$d"/*.py "$d"/*.sh; do
        [ -f "$cand" ] || continue
        b=$(basename "$cand")
        case "$b" in *test*|*setup*|*requirements*|*__init__*) continue ;; esac
        chmod +x "$cand" 2>/dev/null
        ln -sf "$cand" "$BIN_DIR/$b" 2>/dev/null
        break
      done
      ;;
    github|auto)
      repo=$(printf '%s' "$src" | sed -E 's#^github.com/##; s#@latest$##')
      [ "$repo" = "$src" ] && { err "cannot derive a GitHub repo from '$src'"; return 1; }
      gh_install "$repo" "$tool" || return 1
      ;;
    *)
      err "unknown method '$method'"; return 1 ;;
  esac

  if [ "$NO_VERIFY" = "1" ]; then
    ok "$tool installed (verification skipped)"
  else
    v=$(verify_tool "$tool")
    if [ "$v" = "missing" ]; then err "$tool not found on PATH after install"; return 1; fi
    ok "$tool -> $v"
  fi
  printf '%s\t%s\t%s\t%s\n' "$tool" "${cat:-unknown}" "${src:-}" "$(date -u +%FT%TZ)" >> "$STATE"
  return 0
}

# ------------------------------------------------------------------- args
UPGRADE=0; LATEST=0; NO_VERIFY=0; DRY=0; JOBS=4; MIRROR=""; METHOD=""
ONLY=""; SKIP=""; CATEGORY=""; TOOLS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --latest) LATEST=1 ;;
    --upgrade) UPGRADE=1 ;;
    --no-verify) NO_VERIFY=1 ;;
    --dry-run) DRY=1 ;;
    --jobs) JOBS="$2"; shift ;;
    --mirror) MIRROR="$2"; shift ;;
    --method) METHOD="$2"; shift ;;
    --category) CATEGORY="$2"; shift ;;
    --only) ONLY="$2"; shift ;;
    --skip) SKIP="$2"; shift ;;
    --list)
      printf '%s\n' "$REG" | awk -F'|' 'NF>3 {printf "%-22s %-12s %-7s %s\n",$1,$2,$3,$4}'; exit 0 ;;
    --list-all) printf '%s\n' "$REG" | awk -F'|' 'NF>3' | wc -l; exit 0 ;;
    --search) reg_search "$2"; exit 0 ;;
    -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
    *) TOOLS+=("$1") ;;
  esac
  shift
done

if [ "$CATEGORY" != "" ]; then
  for t in $(reg_category "$CATEGORY"); do
    [ -n "$ONLY" ] && ! printf '%s' ",$ONLY," | grep -q ",$t," && continue
    [ -n "$SKIP" ] && printf '%s' ",$SKIP," | grep -q ",$t," && continue
    TOOLS+=("$t")
  done
fi

if [ ${#TOOLS[@]} -eq 0 ]; then
  say "usage: install_tool.sh <tool>... | --category <c> | --list | --search <term>"
  exit 1
fi

say "${B}Toolsmith${R} — ${#TOOLS[@]} target(s)  ${DIM}(log: $LOG)${R}"
FAILED=()
for t in "${TOOLS[@]}"; do
  if [ "$DRY" = "1" ]; then
    e=$(reg_lookup "$t"); say "${DIM}would install: $t  ${e}${R}"; continue
  fi
  install_one "$t" "$METHOD" || FAILED+=("$t")
done

link_go_bins; link_cargo_bins

say ""
if [ ${#FAILED[@]} -eq 0 ]; then
  ok "all ${#TOOLS[@]} tool(s) ready"
else
  warn "failed: ${FAILED[*]}"
  warn "see $LOG for the exact error"
fi
say "${DIM}run 'opencode service restart' so long-running sessions pick up the new PATH${R}"
exit 0
