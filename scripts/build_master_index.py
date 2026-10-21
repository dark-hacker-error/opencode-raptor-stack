#!/usr/bin/env python3
"""
Build the MASTER ATTACK INDEX from the raw reference lists.

Inputs (the user's own lists, names used verbatim):
  /hacking/references/references1.md        -> 26 technical categories
  /hacking/references/reference-human.md   -> human / social / account attacks
  /hacking/references/reference-account.md -> additional account attacks

Outputs:
  /hacking/references/master-attacks.json  -> structured data (plugin serves it)
  /hacking/references/master-attack-index.md -> human/agent readable index

Every attack name keeps its original spelling. Each entry gains:
  category, source, skill, reference, route (raptor_route intent), tools,
  verify, aliases (requirement keywords incl. Hinglish), playbook line.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segment_attacks import segment

REF_DIR = "/hacking/references"
SRC_TECH = os.path.join(REF_DIR, "references1.md")
SRC_HUMAN = os.path.join(REF_DIR, "reference-human.md")
SRC_ACCOUNT = os.path.join(REF_DIR, "reference-account.md")
OUT_JSON = os.path.join(REF_DIR, "master-attacks.json")
OUT_MD = os.path.join(REF_DIR, "master-attack-index.md")

# ---------------------------------------------------------------- parsing
def parse_tech(path):
    """references1.md -> [(category_title, [attack names])]"""
    cats, cur = [], None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            m = re.match(r"^###\s*\d+\\\.\s*(.+)$", line)
            if m:
                cur = (m.group(1).strip(), [])
                cats.append(cur)
                continue
            if cur is None:
                continue
            # the body is a run-together list with no delimiter -> segment it
            for name in segment(line):
                if name:
                    cur[1].append(name)
    return cats

def parse_flat(path):
    """reference-*.md -> [(section_title, [attack names])]"""
    cats, cur = [], None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            if line.isupper() and not line[0].isdigit() and len(line) > 4:
                cur = (line.title(), [])
                cats.append(cur)
                continue
            if cur is None:
                continue
            if ";" in line:
                for name in line.split(";"):
                    name = name.strip()
                    if name.endswith(".") and not re.search(r"\b[A-Z]\.$", name):
                        name = name[:-1]
                    name = name.strip()
                    if name:
                        cur[1].append(name)
            else:
                name = line.strip()
                if name.endswith(".") and not re.search(r"\b[A-Z]\.$", name):
                    name = name[:-1]
                if name:
                    cur[1].append(name)
    return cats

# ------------------------------------------------------------- enrichment
# rule table: regex on attack name -> routing hints
RULES = [
    # (regex, skill, reference, route_intent, extra_tools, verify)
    (r"(sql ?injection|sqli|no ?sql injection|second-order sql)", "raptor", "raptor/references/web.md", "sqli", ["sqlmap", "ghauri"], "manual quote/boolean delta then one decoded row"),
    (r"(ldap injection|xpath injection|orm injection)", "raptor", "raptor/references/web.md", "sqli", ["sqlmap"], "filtered-input differential"),
    (r"(command injection|code injection|shellshock)", "raptor", "raptor/references/web.md", "command-injection", ["commix"], "benign marker like `id` echoed back"),
    (r"(ssti|template injection)", "raptor", "raptor/references/web.md", "ssti", ["tplmap"], "arithmetic evaluation in the sink"),
    (r"(xxe|xml injection|external entity)", "raptor", "raptor/references/web.md", "xxe", ["xxenum"], "file content returned in the response"),
    (r"(ssrf)", "raptor", "raptor/references/web.md", "ssrf", ["ssrfmap"], "internal response or metadata token returned"),
    (r"(cross-site scripting|xss|dom-based|dom clobber)", "raptor", "raptor/references/web.md", "xss", ["dalfox"], "payload reflected in the sink context"),
    (r"(csrf|forced browsing|cross-site request forgery)", "redteam-web", "redteam-web/references/race-business.md", "auth-bypass", [], "request succeeds without the token"),
    (r"(open redirect)", "raptor", "raptor/references/web.md", "auth-bypass", [], "302 to the external host"),
    (r"(clickjacking)", "redteam-web", "redteam-web/references/race-business.md", "web-fingerprint", [], "missing frame-ancestors/X-Frame-Options"),
    (r"(cors misconfig|domain fronting)", "redteam-web", "redteam-web/references/smuggling-cache.md", "cors-misconfig", [], "foreign Origin reflected with credentials"),
    (r"(smuggling|request smuggling|response splitting|host header|crlf|cache poison|cache deception|cache key)", "redteam-web", "redteam-web/references/smuggling-cache.md", "web-fingerprint", [], "crafted response splits or the marker persists for a clean request"),
    (r"(jwt|oauth|saml|oidc|openid|magic-link|passwordless|device code)", "redteam-web", "redteam-web/references/oauth-oidc-saml.md", "jwt-audit", ["jwt_tool"], "token accepted in the role it should not have"),
    (r"(session hijack|session fixation|cookie theft|cookie replay|pass-the-cookie|session token theft)", "redteam-web", "redteam-web/references/oauth-oidc-saml.md", "session-analysis", [], "session accepted from a different client"),
    (r"(password reset|account recovery|magic link|recovery factor|recovery email)", "redteam-web", "redteam-web/references/oauth-oidc-saml.md", "auth-bypass", [], "reset lands on an attacker-controlled channel"),
    (r"(mfa|otp|2fa)", "redteam-web", "redteam-web/references/oauth-oidc-saml.md", "mfa-bypass", [], "second factor skipped or reused"),
    (r"(credential stuffing|password spray|brute.?force|online password guess|default credential|weak password|password reuse|rainbow table|offline password|combo)", "raptor", "raptor/references/web.md", "credential-stuffing", ["hydra", "medusa", "patator", "hashcat"], "one successful authentication"),
    (r"(idor|insecure direct object|bola|broken object|bfla|broken function|horizontal privilege|vertical privilege|multi-tenant isolation|tenant id)", "redteam-web", "redteam-web/references/chain-orchestration.md", "api-map", [], "another user's object returned with equal length"),
    (r"(mass assignment|parameter tampering|property-level|forced browsing|account enumeration|username enumeration|api key exposure)", "redteam-web", "redteam-web/references/race-business.md", "api-map", [], "server accepts a client-set field"),
    (r"(race condition|toctou|double-spend|double-spending|transaction replay|workflow bypass|approval workflow|business logic|payment logic|refund logic|price manipulation|quantity manipulation|coupon|discount abuse|quota abuse|trial abuse)", "redteam-web", "redteam-web/references/race-business.md", "vuln-scan", [], "the end state shows the abuse"),
    (r"(graphql)", "redteam-web", "redteam-web/references/api-modern.md", "graphql-enum", ["graphql-cop"], "schema or unauthorized resolver reachable"),
    (r"(grpc|web ?socket|api gateway|soap api|rest api|webhook)", "redteam-web", "redteam-web/references/api-modern.md", "api-map", [], "operation reachable without the expected authorisation"),
    (r"(deserializ|insecure deserial|yaml.load|pickle)", "raptor", "raptor/references/web.md", "deserialization", ["ysoserial"], "callback reaches the operator-controlled endpoint"),
    (r"(file upload|unrestricted file|extension bypass|web shell placement)", "raptor", "raptor/references/web.md", "file-upload", [], "uploaded file is served back and executable"),
    (r"(lfi|rfi|directory traversal|path traversal|arbitrary file read|path canonicalization)", "raptor", "raptor/references/web.md", "path-traversal", ["lfimap"], "target file content returned"),
    (r"(xxe|prototype pollution|csrf)", "raptor", "raptor/references/web.md", "vuln-scan", [], "polluted property takes effect"),
    (r"(subdomain takeover|dangling dns|domain hijack)", "raptor", "raptor/references/recon.md", "takeover-check", ["subjack"], "provider's own claim endpoint returns the target"),
    (r"(recon|subdomain enum|port scan|service enum|banner|web crawl|directory enum|fingerprint|attack surface|network mapping|virtual host|certificate transparency|asn|ip range|cloud asset discovery|email harvest|metadata analysis|leak and paste)", "raptor", "raptor/references/recon.md", "subdomain-enum", ["subfinder", "httpx", "nmap"], "the asset exists and is reachable"),
    (r"(osint|dorking|whois|username enum|personal data|information aggregation|deanonymiz|privacy|data disclosure)", "private-osint", "private-osint/references/method.md", "osint-person", ["sherlock", "maigret", "holehe", "blackbird"], "the identifier resolves to the subject"),
    (r"(phishing|spear phish|whaling|smishing|vishing|quishing|credential harvest|fake login|social engineer|pretext|impersonat|scam|baiting|quid pro quo|tailgating|piggyback|shoulder surf|dumpster|eavesdrop|honey trap|reverse social)", "redteam-web", "redteam-web/references/social-engineering.md", "osint-person", ["hound", "blackbird", "setoolkit"], "the social path is walked and recorded"),
    (r"(fake (support|recruiter|job|software|captcha|browser|document|cloud|payment|refund|delivery|kyc|banking|alert|government|police|charity|romance|catfishing|advance.fee|investment|lottery|gift card|deepfake|ai.generated|synthetic)|information elicitation|emotional manipulation|authority manipulation|urgency manipulation|secrecy pressure|multi.channel impersonation)", "redteam-web", "redteam-web/references/social-engineering.md", "osint-person", ["hound", "blackbird", "setoolkit"], "the social path is walked and recorded"),
    (r"(sim swap|sim port|imsi catcher|fake base station|ss7|cellular downgrade)", "redteam-wireless", "redteam-wireless/references/ble-nfc-rfid.md", "osint-person", [], "the SIM or cell identity is observed to change"),
    (r"(nfc relay|rfid|rfid clon|skimm)", "redteam-wireless", "redteam-wireless/references/ble-nfc-rfid.md", "osint-person", ["nfc-scan", "python3"], "the reader accepts a clone"),
    (r"(evil twin|rogue access point|deauth|disassoc|wep|wpa|handshake|pmkid|wps pin|krack|wireless replay|jamming|beacon flood|probe request|captive portal|wifi downgrade)", "redteam-wireless", "redteam-wireless/references/wifi.md", "wifi-audit", ["airmon-ng", "aircrack-ng", "hcxpumptool", "wifite"], "the PSK or the association is obtained"),
    (r"(bluetooth|bluejack|bluesnarf|bluebug|ble |knob|bias)", "redteam-wireless", "redteam-wireless/references/ble-nfc-rfid.md", "wifi-audit", ["bluetoothctl", "bleak"], "the device pairs or leaks"),
    (r"(zigbee|z-wave|zwave)", "redteam-wireless", "redteam-wireless/references/ble-nfc-rfid.md", "wifi-audit", [], "the frame is captured and decoded"),
    (r"(badge clon|access card clon|hardware keylog|skimming|lock picking|tailgating|physical|evil maid|usb hid|badusb|keylogger|uhid)", "redteam-wireless", "redteam-wireless/references/physical.md", "osint-person", [], "the badge/credential is accepted by the reader"),
    (r"(can bus|ecu|vehicle diagnostic|gnss|gps spoof)", "redteam-wireless", "redteam-wireless/references/vehicle.md", "osint-person", ["candump", "cansend"], "the diagnostic session is reached"),
    (r"(firmware|uefi|bootkit|bootloader|mbr|secure boot|dma attack|rowhammer|jtag|uart|debug interface|tpm |spectre|meltdown|foreshadow|cold boot|voltage glitch|clock glitch)", "redteam-binary", "redteam-binary/references/protocol-firmware.md", "re-firmware", ["binwalk", "unblob"], "the extracted component shows the weakness"),
    (r"(android|ios |mobile |apk|sms trojan|mobile spy|stalkerware|overlay attack|tapjacking|intent redirection|exported component|deep link|webview|certificate pinning|mdm profile|rogue configuration|one-click|zero-click|baseband|mobile supply chain|sim cloning|sim toolkit)", "mobile-rat", "mobile-rat/references/features.md", "malware-triage", ["jadx", "apktool"], "the capability is present in the built artifact"),
    (r"(rat |remote access trojan|trojan|spyware|infostealer|keylogger|screenlogger|clipboard hijack|form grabber|credential stealer|botnet|cryptojacker|rootkit|ransomware|wiper |fileless|polymorphic|metamorphic|dropper|downloader|loader |backdoor|logic bomb|time bomb|web shell|browser hijack|malicious macro|malicious script|living-off-the-land)", "raptor", "raptor/references/malware.md", "malware-triage", ["capa", "floss", "yara"], "the capability is confirmed by capa/yara plus behaviour"),
    (r"(data exfil|bulk data theft|credential exfil|dns-based exfil|https-based exfil|icmp-based|cloud storage exfil|removable media|steganographic|covert channel|screen capture theft|clipboard data theft|keystroke logging|database dumping|backup theft|source code theft|intellectual property|session data theft|browser data theft|email archive theft|cloud token theft)", "raptor", "raptor/references/infra.md", "pcap-analysis", [], "the data path is observed"),
    (r"(ransomware encryption|double extortion|triple extortion|data leak extortion|wiper attack|disk wiping|mbr destruction|firmware destruction|database destruction|backup destruction|shadow copy deletion|sabotage|destruction)", "raptor", "raptor/references/infra.md", "pcap-analysis", [], "the pre-action is verified, not executed"),
    (r"(kerberoast|as-rep|dcsync|dcshadow|golden ticket|silver ticket|diamond ticket|skeleton key|pass-the-hash|pass-the-ticket|overpass|ntlm relay|llmnr|nbt-ns|adcs|esc[1-8]|certificate template|delegation|rbcd|sid history|adminsdholder|gpo abuse|group membership|acl abuse|dacl|replication privilege|trust relationship|forest trust|domain trust|sid spoof|machine account quota|shadow credential|lsass|ntds)", "redteam-ad", "redteam-ad/references/kerberos.md", "ad-enum", ["netexec", "impacket", "bloodhound-python", "certipy"], "the right is demonstrated (not the escalation executed)"),
    (r"(lateral movement|remote service abuse|psexec|wmi-based|winrm|rdp abuse|smb-based|ssh-based|remote desktop|pass-the-ticket)", "redteam-ad", "redteam-ad/references/relay-acl.md", "lateral-movement", ["netexec", "impacket", "evil-winrm"], "the next hop is reachable"),
    (r"(relay|coercion|shadow credentials|delegat)", "redteam-ad", "redteam-ad/references/relay-acl.md", "ad-enum", ["ntlmrelayx", "responder", "coercer"], "the authentication is captured"),
    (r"(entra|azure ad|federat|saml token forgery|identity federation)", "redteam-ad", "redteam-ad/references/hybrid.md", "ad-enum", ["az", "netexec"], "the cross-boundary identity is reached"),
    (r"(bloodhound|attack path|graph)", "redteam-ad", "redteam-ad/references/graph.md", "ad-enum", ["bloodhound-python"], "the shortest path is printed"),
    (r"(cloud |aws|azure|gcp|kubernetes|k8s|docker|container|serverless|terraform|iac |ci/cd|pipeline|artifact|registry|helm|sbom|istio|service mesh|argocd|flux|gitops|vault)", "redteam-cloud", "redteam-cloud/references/iam-paths.md", "cloud-asset-discovery", ["aws", "kubectl", "trivy", "checkov", "trufflehog"], "one resource is actually readable"),
    (r"(privilege escalation|local privilege|remote privilege|kernel exploit|driver exploit|dll injection|dll hijack|dll side-load|process injection|process hollow|thread execution hijack|reflective code|token impersonat|access token theft|uac bypass|sudo misconfig|suid|sgid|capabilities abuse|path hijack|library hijack|env var hijack|cron job|scheduled task|service misconfig|unquoted service path|registry persist|startup folder|kernel module|ebpf|sandbox escape|hypervisor escape|dll search order|com hijack|wmi abuse|powershell abuse|pam abuse|credential guard bypass|edr evasion|antivirus evasion|log tampering|event log clearing)", "redteam-binary", "redteam-binary/references/exploit-dev.md", "linux-privesc", ["linpeas", "pspy"], "the primitive is demonstrated in the lab"),
    (r"(stack overflow|heap overflow|integer overflow|integer underflow|use-after-free|double free|type confusion|format string|out-of-bounds|memory corruption|null pointer|uninitialized memory|dangling pointer|rop|jop|return-to-libc|code-reuse|control-flow|jit spray|heap spray|integer truncation|sign conversion|unicode parsing|type juggl|algorithmic complexity|redos|zip slip|symlink attack|hardlink attack)", "redteam-binary", "redteam-binary/references/exploit-dev.md", "exploit-dev", ["pwntools", "ROPgadget", "ropper", "angr"], "the crash or code execution is reproduced"),
    (r"(zero-day|n-day|remote code execution|rce|local code execution|arbitrary code execution|buffer overflow|race condition)", "redteam-binary", "redteam-binary/references/exploit-dev.md", "exploit-dev", ["pwntools"], "the exploit runs against the target build"),
    (r"(anti-debug|anti-analysis|sandbox evasion|virtual machine detection|security tool tampering|obfuscat|indicator removal|timestomp|masquerad)", "redteam-binary", "redteam-binary/references/anti-analysis.md", "re-dynamic", ["gdb", "strace"], "the detection is identified and the bypass is proven"),
    (r"(prompt injection|jailbreak|system prompt extraction|training data extraction|data poisoning|backdoor training|model poisoning|adversarial example|membership inference|model inversion|model stealing|model replication|embedding inversion|vector database poisoning|rag data|retrieval manipulation|excessive agency|agent hijack|tool-output injection|cross-tenant data|llm denial|token exhaustion|multimodal prompt|image-based prompt|audio prompt|model api key|inference endpoint)", "redteam-ai", "redteam-ai/references/llm-attacks.md", "web-search-intel", ["promptfoo", "garak"], "the model behaviour changes in the expected way"),
    (r"(ics |scada|plc |rtu|hmi |modbus|dnp3|opc ua|industrial|historian|engineering workstation|ot |iot |mqtt|coap|tr-069|upnp)", "redteam-ics", "redteam-ics/references/ics-ot.md", "web-search-intel", [], "the protocol interaction is observed without impact"),
    (r"(payment card|skimm|magecart|card-not-present|atm |atm malware|jackpotting|pos malware|memory scraping|card clon|card shim|contactless payment|banking trojan|payment redirection|invoice manipulation|payroll diversion|wire transfer|refund fraud|chargeback|loan application|crypto|wallet|smart contract|reentrancy|flash loan|oracle manipulation|bridge exploit|cross-chain|front-running|mev|sudo|rug pull|phishing-based wallet|blockchain)", "redteam-web", "redteam-web/references/financial-fraud.md", "vuln-scan", [], "the payment or wallet flow is shown to be manipulable"),
    (r"(sextortion|non-consensual intimate|revenge porn|harassment|cyberbullying|cyberstalk|doxx)", "private-osint", "private-osint/references/exposure.md", "osint-person", [], "the exposure is documented for the operator"),
    (r"(supply chain attack|dependency confusion|typosquat|package name squat|malicious package|compromised dependency|dependency hijack|maintainer account|build pipeline|build system poison|artifact repository|compromised software update|malicious update|code signing key|certificate theft|source code repository|git secret|github token|gitlab runner|jenkins misconfig|pipeline secret|package registry|open-source backdoor|malicious compiler|compiler backdoor|terraform state|container registry poison|third-party vendor|managed service provider|watering hole|update server|developer workstation)", "redteam-cloud", "redteam-cloud/references/supply-chain.md", "secret-hunt", ["trufflehog", "gitleaks", "semgrep", "osv-scanner"], "the poisoned element is located"),
    (r"(email spoofing|header injection|mailbox rule|email forwarding|thread hijack|reply-chain|malicious attachment|html smuggling|email bomb|mail flooding|smtp relay|open mail relay|spf misconfig|dkim misconfig|dmarc misconfig|calendar invitation|shared document|messaging account|backup theft|contact list exfil|fake support message|message replay|voicemail spoof|caller id|sms sender-id|rcs phishing|instant messaging)", "redteam-web", "redteam-web/references/email-messaging.md", "osint-email", ["swaks", "smtp-user-enum"], "the crafted message is accepted by the target relay"),
    (r"(exposed secret|hardcoded credential|leaked api token|secret theft|runner compromise|build artifact|terraform state|exposed dashboard|secret exposure|admission abuse|docker socket|registry poison|metadata ssrf|iam role chaining|federation abuse|cross-account role|public snapshot|public backup|logging evasion|workload identity|control plane abuse|secrets manager|vault token|network policy)", "redteam-cloud", "redteam-cloud/references/credentials.md", "secret-hunt", ["trufflehog", "gitleaks"], "the credential is retrieved from its location"),
    (r"(rbac|service account token|etcd|kubelet|admission controller|malicious container image|image supply chain|pod-to-node|cloud account takeover|cloud credential theft|iam misconfig|excessive cloud permission|public storage|object storage data theft|cloud metadata service|exposed cloud access key|cloud function injection|container image poisoning|image registry credential)", "redteam-cloud", "redteam-cloud/references/k8s-attack.md", "cloud-asset-discovery", ["kubectl", "aws", "s3scanner"], "one resource is actually readable"),
    (r"(botnet|cryptojacking|ransomware-as-a-service|malware-as-a-service|initial access broker|automated account creation|account farming|spam campaign|scraping|web scraping evasion|captcha farming|browser automation|fake app store|malicious package publication|data poisoning|privacy leakage|de-anonymization|traffic correlation|location spoofing|gps spoofing|gnss spoofing|replay-based device|cross-protocol|protocol confusion|confused deputy|trust boundary|cross-origin|cross-site leak|insider threat|nation-state|cyber espionage|cyber sabotage|hack-and-leak|hacktivist|destructive cyberattack|initial access)", "raptor", "raptor/references/recon.md", "vuln-scan", [], "the behaviour is reproduced in the lab"),
]

# category-level defaults (used when no rule matches)
CAT_DEFAULT = {
    "Reconnaissance": ("raptor", "raptor/references/recon.md", "subdomain-enum"),
    "Web Application": ("redteam-web", "redteam-web/references/api-modern.md", "vuln-scan"),
    "Api": ("redteam-web", "redteam-web/references/api-modern.md", "api-map"),
    "Password": ("raptor", "raptor/references/web.md", "credential-stuffing"),
    "Malware": ("raptor", "raptor/references/malware.md", "malware-triage"),
    "Social": ("redteam-web", "redteam-web/references/social-engineering.md", "osint-person"),
    "Wireless": ("redteam-wireless", "redteam-wireless/references/wifi.md", "wifi-audit"),
    "Mobile": ("mobile-rat", "mobile-rat/references/features.md", "malware-triage"),
    "Operating": ("redteam-binary", "redteam-binary/references/exploit-dev.md", "linux-privesc"),
    "Active": ("redteam-ad", "redteam-ad/references/kerberos.md", "ad-enum"),
    "Cloud": ("redteam-cloud", "redteam-cloud/references/iam-paths.md", "cloud-asset-discovery"),
    "Database": ("raptor", "raptor/references/web.md", "sqli"),
    "Cryptography": ("redteam-binary", "redteam-binary/references/exploit-dev.md", "exploit-dev"),
    "Hardware": ("redteam-wireless", "redteam-wireless/references/physical.md", "osint-person"),
    "Supply": ("redteam-cloud", "redteam-cloud/references/supply-chain.md", "secret-hunt"),
    "Ai": ("redteam-ai", "redteam-ai/references/llm-attacks.md", "web-search-intel"),
    "Industrial": ("redteam-ics", "redteam-ics/references/ics-ot.md", "web-search-intel"),
    "Email": ("redteam-web", "redteam-web/references/email-messaging.md", "osint-email"),
    "Data": ("raptor", "raptor/references/infra.md", "pcap-analysis"),
    "Persistence": ("raptor", "raptor/references/infra.md", "persistence-mech"),
    "Advanced": ("redteam-binary", "redteam-binary/references/exploit-dev.md", "exploit-dev"),
    "Authentication": ("redteam-web", "redteam-web/references/chain-orchestration.md", "auth-bypass"),
    "Financial": ("redteam-web", "redteam-web/references/financial-fraud.md", "vuln-scan"),
    "Cloud-Native": ("redteam-cloud", "redteam-cloud/references/credentials.md", "secret-hunt"),
    "Emerging": ("raptor", "raptor/references/recon.md", "vuln-scan"),
}

# Hinglish / colloquial requirement keywords -> extra alias
ALIASES = {
    "wifi": ["wifi password", "wifi hack", "wi-fi password", "network password", "wifi todna", "wifi ka password"],
    "sql injection": ["sql inject", "sqli karna", "database hack", "sql panda", "sql magic"],
    "xss": ["xss", "script inject", "javascript hack"],
    "phishing": ["phish", "fishing page", "fake login page", "login page banao", "credential page"],
    "osint": ["osint", "background check", "kisse ke baare me batao", "person ki info", "dossier"],
    "ad": ["active directory", "windows domain", "domain hack", "domain controller", "krbtgt", "ad attack"],
    "cloud": ["aws hack", "azure hack", "gcp hack", "cloud hack", "s3 bucket", "cloud credentials"],
    "k8s": ["kubernetes", "k8s", "eks", "gke", "aks", "kubectl"],
    "reverse": ["reverse engineering", "binary analyse", "apk analyse", "firmware analyse", "decompile", "binary ko dekhna"],
    "privesc": ["privilege escalation", "root banana", "admin banana", "privesc", "root escalate", "sudo exploit"],
    "malware": ["malware analyse", "virus analyse", "malware check", "sample analyse", "rat banao", "malware bana"],
    "rat": ["rat banao", "remote access", "phone control", "android rat", "spy app", "phone spy"],
    "c2": ["c2 server", "command and control", "telegram c2", "telegram se control"],
    "lateral": ["lateral movement", "pivot", "move sideways", "andar jao", "network me aage badho"],
    "ransomware": ["ransomware", "encrypt files", "wiper"],
    "exploit": ["exploit banao", "poc banao", "payload banao", "shellcode"],
    "wifi hack": ["wifi hack", "wifi password crack"],
    "mitm": ["man in the middle", "mitm", "beech me baith ke"],
    "dns": ["dns hijack", "dns poisoning", "domain hijack"],
    "supply chain": ["supply chain", "pipeline hack", "ci cd hack", "dependency attack"],
    "physical": ["physical entry", "door open", "badge clone", "tailgate"],
    "car": ["car hack", "can bus", "ecu hack", "vehicle hack"],
    "rfid": ["rfid clone", "card clone", "badge clone", "nfc relay"],
    "crypto wallet": ["wallet drain", "crypto steal", "seed phrase", "private key steal"],
    "prompt injection": ["prompt injection", "llm hack", "ai hack", "jailbreak"],
    "scada": ["scada", "ics attack", "plc hack", "ot attack"],
    "web shell": ["web shell", "webshell"],
    "sqli": ["sql injection", "sql inject"],
    "brute force": ["brute force", "password crack", "password todna", "credential stuff"],
    "session": ["session hijack", "cookie steal", "token steal"],
    "mfa": ["mfa bypass", "2fa bypass", "otp bypass"],
    "ssti": ["ssti", "template inject"],
    "ssrf": ["ssrf", "server side request"],
    "xxe": ["xxe", "xml inject"],
    "jwt": ["jwt attack", "jwt crack", "token forge"],
    "oauth": ["oauth attack", "redirect uri", "saml attack", "sso hack"],
    "race": ["race condition", "double spend", "double spend karo"],
    "email spoof": ["email spoof", "fake mail", "sender id spoof", "smtp spoof"],
    "deepfake": ["deepfake", "voice clone", "ai voice"],
    "id card": ["id card forge", "document forge", "aadhaar", "pan card forge"],
}

def slugify(name):
    s = name.lower()
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

def enrich(name, category, source):
    for rx, skill, ref, intent, tools, verify in RULES:
        if re.search(rx, name, re.I):
            return dict(skill=skill, reference=ref, route=intent, tools=tools, verify=verify)
    for key, val in CAT_DEFAULT.items():
        if category.lower().startswith(key.lower()):
            return dict(skill=val[0], reference=val[1], route=val[2], tools=[], verify="observed behaviour with evidence")
    return dict(skill="raptor", reference="raptor/references/recon.md", route="vuln-scan", tools=[], verify="observed behaviour with evidence")

def build():
    entries = []
    seen = set()
    for title, names in parse_tech(SRC_TECH):
        for n in names:
            key = slugify(n)
            if not key or key in seen:
                continue
            seen.add(key)
            e = enrich(n, title, "references1.md")
            e.update(id=key, name=n, category=title, source="references1.md")
            entries.append(e)
    for src in (SRC_HUMAN, SRC_ACCOUNT):
        for title, names in parse_flat(src):
            cat = "Human, Social & Account Attacks"
            for n in names:
                key = slugify(n)
                if not key or key in seen:
                    continue
                seen.add(key)
                e = enrich(n, cat, os.path.basename(src))
                e.update(id=key, name=n, category=title, source=os.path.basename(src))
                entries.append(e)

    # aliases
    for e in entries:
        al = set()
        low = e["name"].lower()
        for kw, words in ALIASES.items():
            if kw in low:
                al.update(words)
        # split multi-word names for phrase matching
        e["aliases"] = sorted(al)
        e["keywords"] = [w for w in re.split(r"[^a-z0-9]+", low) if len(w) > 3]
    return entries

def write_json(entries):
    data = {
        "generated": "toolsmith master index builder",
        "sources": [os.path.basename(SRC_TECH), os.path.basename(SRC_HUMAN), os.path.basename(SRC_ACCOUNT)],
        "total": len(entries),
        "categories": {},
        "attacks": entries,
    }
    for e in entries:
        data["categories"].setdefault(e["category"], 0)
        data["categories"][e["category"]] += 1
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

def write_md(entries):
    by_cat = {}
    for e in entries:
        by_cat.setdefault(e["category"], []).append(e)
    L = []
    L.append("# MASTER ATTACK INDEX")
    L.append("")
    L.append(f"**{len(entries)} attack techniques** across **{len(by_cat)} categories**, built from the raw lists in")
    L.append("`references1.md`, `reference-human.md` and `reference-account.md`. Attack names are used verbatim.")
    L.append("")
    L.append("This file is the agent's decision layer: when the operator describes a goal, match it here,")
    L.append("then load the named reference, then route the toolchain, then execute and verify.")
    L.append("")
    L.append("## How to use it")
    L.append("")
    L.append("```")
    L.append("1. operator requirement  ->  2. raptor_attacks(query=...)  ->  3. load the reference")
    L.append("4. raptor_route(intent=...)  ->  5. execute  ->  6. raptor_finding + raptor_report")
    L.append("```")
    L.append("")
    L.append("`raptor_attacks` searches this index by name, alias or keyword and returns the reference,")
    L.append("the toolchain and the verification for every match. Use it before writing any tool command.")
    L.append("")
    L.append("## Requirement vocabulary (Hinglish / colloquial)")
    L.append("")
    L.append("| What they say | Attack family |")
    L.append("|---|---|")
    for kw, words in ALIASES.items():
        L.append(f"| `{words[0]}` | {kw} |")
    L.append("")
    L.append("## Category map")
    L.append("")
    L.append("| Category | Attacks | Skill | Reference | Default route |")
    L.append("|---|---|---|---|---|")
    for cat in sorted(by_cat):
        sample = by_cat[cat][0]
        L.append(f"| {cat} | {len(by_cat[cat])} | `{sample['skill']}` | `{sample['reference']}` | `{sample['route']}` |")
    L.append("")
    L.append("---")
    L.append("")
    for cat in sorted(by_cat):
        L.append(f"## {cat}")
        L.append("")
        L.append("| Attack | Skill | Reference | Route | Verify |")
        L.append("|---|---|---|---|---|")
        for e in by_cat[cat]:
            L.append(f"| {e['name']} | `{e['skill']}` | `{e['reference']}` | `{e['route']}` | {e['verify']} |")
        L.append("")
    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

if __name__ == "__main__":
    entries = build()
    write_json(entries)
    write_md(entries)
    print(f"[+] {len(entries)} attacks -> {OUT_JSON}")
    print(f"[+] {len(entries)} attacks -> {OUT_MD}")
    cats = {}
    for e in entries:
        cats[e["category"]] = cats.get(e["category"], 0) + 1
    for c in sorted(cats):
        print(f"    {cats[c]:4d}  {c}")
