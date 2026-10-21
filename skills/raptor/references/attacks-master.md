# MASTER ATTACK INDEX

**1469 attack techniques** across **45 categories**, built from the raw lists in
`references1.md`, `reference-human.md` and `reference-account.md`. Attack names are used verbatim.

This file is the agent's decision layer: when the operator describes a goal, match it here,
then load the named reference, then route the toolchain, then execute and verify.

## How to use it

```
1. operator requirement  ->  2. raptor_attacks(query=...)  ->  3. load the reference
4. raptor_route(intent=...)  ->  5. execute  ->  6. raptor_finding + raptor_report
```

`raptor_attacks` searches this index by name, alias or keyword and returns the reference,
the toolchain and the verification for every match. Use it before writing any tool command.

## Requirement vocabulary (Hinglish / colloquial)

| What they say | Attack family |
|---|---|
| `wifi password` | wifi |
| `sql inject` | sql injection |
| `xss` | xss |
| `phish` | phishing |
| `osint` | osint |
| `active directory` | ad |
| `aws hack` | cloud |
| `kubernetes` | k8s |
| `reverse engineering` | reverse |
| `privilege escalation` | privesc |
| `malware analyse` | malware |
| `rat banao` | rat |
| `c2 server` | c2 |
| `lateral movement` | lateral |
| `ransomware` | ransomware |
| `exploit banao` | exploit |
| `wifi hack` | wifi hack |
| `man in the middle` | mitm |
| `dns hijack` | dns |
| `supply chain` | supply chain |
| `physical entry` | physical |
| `car hack` | car |
| `rfid clone` | rfid |
| `wallet drain` | crypto wallet |
| `prompt injection` | prompt injection |
| `scada` | scada |
| `web shell` | web shell |
| `sql injection` | sqli |
| `brute force` | brute force |
| `session hijack` | session |
| `mfa bypass` | mfa |
| `ssti` | ssti |
| `ssrf` | ssrf |
| `xxe` | xxe |
| `jwt attack` | jwt |
| `oauth attack` | oauth |
| `race condition` | race |
| `email spoof` | email spoof |
| `deepfake` | deepfake |
| `id card forge` | id card |

## Category map

| Category | Attacks | Skill | Reference | Default route |
|---|---|---|---|---|
| AI, Machine Learning & LLM Attacks | 48 | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` |
| API Attacks | 31 | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` |
| Account & Authentication | 20 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Account & Credential Attacks | 13 | `raptor` | `raptor/references/web.md` | `credential-stuffing` |
| Active Directory & Enterprise Identity Attacks | 42 | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` |
| Advanced Exploitation & Vulnerability Classes | 49 | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` |
| Ai & Deepfake | 12 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Ai & Synthetic Media | 20 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Authentication, Authorization & Business Logic | 33 | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` |
| Business & Financial | 20 | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` |
| Business & Workplace | 20 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Cloud & Container Attacks | 40 | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` |
| Cloud-Native, DevOps & Infrastructure-as-Code | 37 | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` |
| Cryptography & Protocol Attacks | 38 | `raptor` | `raptor/references/web.md` | `credential-stuffing` |
| Data Theft, Exfiltration & Destructive Attacks | 37 | `raptor` | `raptor/references/infra.md` | `pcap-analysis` |
| Database & Data Storage Attacks | 30 | `raptor` | `raptor/references/web.md` | `sqli` |
| Email, Messaging & Communication Attacks | 31 | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` |
| Emerging, Specialized & Other Attack Families | 56 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Financial, Payment & Digital Asset Attacks | 43 | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` |
| Hardware, Firmware & Physical Attacks | 40 | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` |
| Identity & Privacy | 14 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Identity & Verification | 20 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Impersonation & Pretexting | 26 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Industrial Control Systems (ICS), OT & IoT | 42 | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` |
| Insider & Organizational Trust | 20 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Insider & Trust | 10 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Malware & Malicious Software | 52 | `raptor` | `raptor/references/malware.md` | `malware-triage` |
| Marketplace & Consumer | 20 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Mobile & Smartphone Attacks | 40 | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` |
| Network & Infrastructure Attacks | 44 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Operating System, Kernel & Endpoint Attacks | 51 | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` |
| Password, Authentication & Credential Attacks | 47 | `raptor` | `raptor/references/web.md` | `credential-stuffing` |
| Persistence, Evasion & Lateral Movement | 43 | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` |
| Phishing & Messages | 18 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Phone & Telecom | 15 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Physical Social Engineering | 11 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Psychological Manipulation | 20 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Reconnaissance & Information Gathering | 27 | `raptor` | `raptor/references/recon.md` | `subdomain-enum` |
| Relationship & Emotional Exploitation | 24 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Social Engineering & Human-Targeted Attacks | 65 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Social Media & Community | 28 | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` |
| Social Media & Messaging | 19 | `raptor` | `raptor/references/recon.md` | `vuln-scan` |
| Supply Chain, Software Development & CI/CD Attacks | 37 | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` |
| Web Application Attacks | 79 | `raptor` | `raptor/references/web.md` | `sqli` |
| Wireless, Wi-Fi & Bluetooth Attacks | 37 | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` |

---

## AI, Machine Learning & LLM Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Prompt Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Indirect Prompt Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Jailbreak Attack | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| System Prompt Extraction | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Sensitive Information Disclosure | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Training Data Extraction | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Data Poisoning | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Backdoor Training Attack | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Model Poisoning | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Adversarial Example Attack | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Model Evasion | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Membership Inference | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Model Inversion | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Model Extraction | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Model Stealing | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Model Replication | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Embedding Inversion | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Vector Database Poisoning | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| RAG Data Poisoning | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Retrieval Manipulation | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Malicious Tool Invocation | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Excessive Agency Abuse | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Agent Hijacking | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Tool-Output Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Cross-Tenant Data Leakage | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| AI Supply Chain Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Malicious Model Artifact | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Unsafe Model Deserialization | `raptor` | `raptor/references/web.md` | `deserialization` | callback reaches the operator-controlled endpoint |
| AI Plugin Abuse | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| AI Connector Abuse | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| LLM Denial of Service | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Token Exhaustion Attack | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Resource Exhaustion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Multimodal Prompt Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Image-Based Prompt Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Audio Prompt Injection | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Deepfake | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Voice | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Video | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Synthetic | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Identity Attack | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| AI-Assisted | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Social | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Engineering | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | observed behaviour with evidence |
| Model API Key Theft | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Inference Endpoint Abuse | `redteam-ai` | `redteam-ai/references/llm-attacks.md` | `web-search-intel` | the model behaviour changes in the expected way |
| Training Pipeline Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| AI Data Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |

## API Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| REST API Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| GraphQL API Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| SOAP API Attacks | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| gRPC Attack Surface Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| BOLA / IDOR | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| BFLA | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Broken Authentication | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| Broken Object Property-Level Authorization | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Excessive Data Exposure | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| API Parameter Tampering | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |
| API Rate-Limit Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| API Resource Exhaustion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| API Key Theft | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| Bearer Token Theft | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| JWT Algorithm Confusion | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| JWT Signature Validation Bypass | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| OAuth Token Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| OAuth Redirect URI Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| OAuth Consent Phishing | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| API Version Downgrade | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| Improper Inventory Management | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Unsafe API Consumption | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| Webhook Spoofing | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| Webhook Replay | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| Webhook SSRF | `raptor` | `raptor/references/web.md` | `ssrf` | internal response or metadata token returned |
| API Schema Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | observed behaviour with evidence |
| API Business Logic Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| API Gateway Misconfiguration | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| GraphQL Alias Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| GraphQL Batching Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| GraphQL Circular Query Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |

## Account & Authentication

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Account Pre-Hijacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Authentication Downgrade Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Password Change Notification Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Email Account Recovery Chain Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| Federated Login Account Linking Abuse | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |
| Malicious OAuth Application Authorization | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Consent Grant Persistence | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Account Linking Confusion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Recovery Factor Substitution | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| SIM Reassignment Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Push Notification Authentication Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Authentication Relay Through Trusted Devices | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Session Revocation Evasion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Account Invitation Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Unauthorized Account Delegation | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Passwordless Authentication Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Magic-Link Interception | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Device Enrollment Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Trusted Device Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Account Migration Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Account & Credential Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Brute-Force Login | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Password Reuse Exploitation | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| MFA Fatigue Attack | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| OTP Theft | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| OTP Relay Attack | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| SIM Swap Fraud | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| SIM Port-Out Fraud | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| Recovery Email Compromise | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| Recovery Phone Number Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Backup Code Theft | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Authentication Relay | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Fake Login Page Attack | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Password Manager Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Active Directory & Enterprise Identity Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| DCSync | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| DCShadow | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Golden Ticket | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Silver Ticket | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Diamond Ticket | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Skeleton Key | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| ADCS Misconfiguration Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Certificate Template Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| ESC1–ESC8 | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Certificate Abuse Families | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | observed behaviour with evidence |
| Unconstrained Delegation Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Constrained Delegation Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Resource-Based Constrained Delegation Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| SID History Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| AdminSDHolder Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| GPO Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Group Membership Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| ACL Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| DACL Misconfiguration Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Replication Privilege Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Trust Relationship Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Forest Trust Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Domain Trust Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| SID Spoofing | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Machine Account Quota Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Shadow Credentials | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| LSASS Dumping | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| NTDS.dit Theft | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Cached Domain Credential Theft | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | observed behaviour with evidence |
| Local Administrator Password Reuse | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Lateral Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| Remote Service Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| PsExec-Based Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| WMI-Based Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| WinRM Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| RDP Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| SMB Relay | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| SMB Signing Weakness Abuse | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | observed behaviour with evidence |
| Remote Credential Guard Misconfiguration | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | observed behaviour with evidence |
| Identity Federation Abuse | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |
| SAML Token Forgery | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Federated Identity Compromise | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |

## Advanced Exploitation & Vulnerability Classes

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Zero-Day Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| N-Day Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Remote Code Execution (RCE) | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Local Code Execution | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Arbitrary Code Execution | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Privilege Escalation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Buffer Overflow | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Stack Overflow | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Heap Overflow | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Integer Overflow | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Integer Underflow | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Use-After-Free | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Double Free | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Type Confusion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Format String Vulnerability | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Out-of-Bounds Read | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Out-of-Bounds Write | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Memory Corruption | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Time-of-Check to Time-of-Use (TOCTOU) | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Null Pointer Dereference | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Uninitialized Memory | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Use Dangling Pointer Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Return-Oriented Programming (ROP) | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Jump-Oriented Programming (JOP) | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Return-to-libc | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Code-Reuse Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Control-Flow Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Control-Flow Integrity Bypass | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Kernel Exploit | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Driver Exploit | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| JIT Spraying | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Heap Spraying | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Deserialization Exploitation | `raptor` | `raptor/references/web.md` | `deserialization` | callback reaches the operator-controlled endpoint |
| Parser Differential Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Protocol State Machine Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Integer Truncation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Sign Conversion Error | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Path Canonicalization Bypass | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Unicode Parsing Confusion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Memory Disclosure | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Information Disclosure | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Type Juggling | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Algorithmic Complexity Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Zip Slip | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Archive Extraction Traversal | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Symlink Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Hardlink Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| TOCTOU File Race | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Race-Based Authorization Bypass | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |

## Ai & Deepfake

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Deepfake Video Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Voice Cloning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| AI Chatbot Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Video Call | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Executive Deepfake Fraud | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| AI-Assisted Romance Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI-Generated Fake Profile | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Identity Document Forgery | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Biometric Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Face-Swap Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Liveness Detection Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Synthetic Voice Authentication Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Ai & Synthetic Media

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Real-Time Voice Conversion Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI-Assisted Caller Personalization | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Deepfake Livestream Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Synthetic Persona Farming | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| AI-Generated Identity Document Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Multimodal Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI Agent Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake AI Customer Service Agent | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Voice Clone Callback Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Synthetic Employee Onboarding Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Deepfake Interview Candidate Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| AI-Generated Reference Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Automated Persona-Based Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI-Generated Fake Evidence | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Synthetic Social Proof Campaign | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| AI-Generated Reputation Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Voice Assistant Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI-Generated Support Conversation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Deepfake-Based Authorization Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Synthetic Identity Network Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Authentication, Authorization & Business Logic

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Broken Access Control | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Insecure | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Direct | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Object | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Reference | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Horizontal Privilege Escalation | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Vertical Privilege Escalation | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Account Takeover | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Weak Recovery Questions | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Cookie Replay | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| CSRF | `redteam-web` | `redteam-web/references/race-business.md` | `auth-bypass` | request succeeds without the token |
| Forced Browsing | `redteam-web` | `redteam-web/references/race-business.md` | `auth-bypass` | request succeeds without the token |
| Price Manipulation | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Quantity Manipulation | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Coupon Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Discount Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Referral Fraud | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Loyalty Point Abuse | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Payment Logic Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Refund Logic Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Race Condition in Payments | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Double-Spending | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Transaction Replay | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Workflow Bypass | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Approval Workflow Bypass | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Quota Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Trial Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Subscription Abuse | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Multi-Tenant Isolation Bypass | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Tenant ID Manipulation | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Privilege Boundary Confusion | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Payment Gateway Callback Spoofing | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `auth-bypass` | observed behaviour with evidence |
| Webhook Signature Validation Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |

## Business & Financial

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Payroll Diversion Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| CEO Gift Card Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Bank Transfer Receipt | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Ponzi Scheme | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Pyramid Scheme | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Recruitment Fee Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Freelancer Client Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Portfolio Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake NDA Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Document Signature Request | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Tax Refund Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Insurance Claim Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Loan Offer Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Scholarship Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Rental Listing Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Rental Deposit Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Marketplace Buyer Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Marketplace Seller Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Overpayment Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Escrow Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Business & Workplace

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Procurement Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Purchase Order Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Supplier Bank Detail Change Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Executive Travel Emergency Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Board Member Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Auditor Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Compliance Certification Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Data Protection Officer Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Recruitment Candidate Identity Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Employment Reference Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Background Check Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Payroll Record Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Employee Benefits Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Expense Reimbursement Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Internal Survey | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Confidential Meeting Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Unauthorized Approval Delegation | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Fake Merger or Acquisition Notice | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Corporate Gift Delivery Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Legal Settlement Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Cloud & Container Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Cloud Account Takeover | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Credential Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud IAM Misconfiguration Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Excessive Cloud Permissions | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Privilege Escalation | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Public Storage Bucket Exposure | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Object Storage Data Theft | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Metadata Service Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| SSRF-to-Cloud Credential Exposure | `raptor` | `raptor/references/web.md` | `ssrf` | internal response or metadata token returned |
| Cloud API Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Exposed Cloud Access Keys | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Serverless Function Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Function Injection | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Docker Socket Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Privileged Container Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes API Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes RBAC Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Secret Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Dashboard Exposure | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Admission Controller Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Container Image Poisoning | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Malicious Container Image Registry Credential Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Image Supply Chain Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Pod-to-Node Escape | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubelet Exposure | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Etcd Data Exposure | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Service Account Token Theft | `redteam-cloud` | `redteam-cloud/references/k8s-attack.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Cryptomining | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Resource Hijacking | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Data Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Cloud Ransomware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Cross-Account Access Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Federated Role Abuse | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |
| Cloud Logging Tampering | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Security Control Evasion | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| SaaS Account Takeover | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| SaaS OAuth Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Shadow IT Exploitation | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Cloud Tenant Misconfiguration | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| CI/CD Pipeline Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |

## Cloud-Native, DevOps & Infrastructure-as-Code

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Exposed Secrets | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Hardcoded Credentials | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Leaked API Tokens | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| CI/CD Secret Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Runner Compromise | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Build Artifact Tampering | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Pipeline Configuration Injection | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Infrastructure-as-Code Injection | `raptor` | `raptor/references/web.md` | `command-injection` | benign marker like `id` echoed back |
| Terraform State Leakage | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Exposed Kubernetes Dashboard | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Secret Exposure | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Admission Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Docker Socket Exposure | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Container Privilege Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Registry Poisoning | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Malicious Helm Chart | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Compromised Operator | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Serverless Permission Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Function Event Injection | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Cloud Metadata SSRF | `raptor` | `raptor/references/web.md` | `ssrf` | internal response or metadata token returned |
| IAM Role Chaining Abuse | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Cloud Federation Abuse | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |
| Cross-Account Role Abuse | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Public Snapshot Exposure | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Public Backup Exposure | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Misconfigured Object Storage | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Cloud Logging Evasion | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Workload Identity Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Cloud Control Plane Abuse | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Secrets Manager Misconfiguration | `redteam-cloud` | `redteam-cloud/references/credentials.md` | `secret-hunt` | the credential is retrieved from its location |
| Vault Token Theft | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Service Mesh Misconfiguration | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Kubernetes Network Policy Bypass | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| GitOps Repository Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Infrastructure Drift Exploitation | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |
| Artifact Signing Bypass | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Software Provenance Tampering | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | observed behaviour with evidence |

## Cryptography & Protocol Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Brute-Force Cryptanalysis | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Dictionary-Based Cryptanalysis | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Birthday Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Collision Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Chosen-Plaintext Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Chosen-Ciphertext Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Known-Plaintext Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Ciphertext-Only Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Padding Oracle Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Padding Downgrade Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Downgrade Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Key Substitution Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Weak Key Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Nonce Reuse Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| IV Reuse Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Side-Channel Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Timing Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Power Analysis Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Cache-Timing Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Fault Injection Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Differential Cryptanalysis | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Linear Cryptanalysis | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Meet-in-the-Middle Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Length Extension Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Hash Collision Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Certificate Spoofing | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Certificate Misissuance Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| TLS Downgrade | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| SSL Stripping | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| TLS Certificate Validation Bypass | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Insecure Randomness Exploitation | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| DNSSEC Misconfiguration Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Kerberos Protocol Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| NTLM Protocol Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| OAuth Protocol Misconfiguration | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| SAML Protocol Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Token Replay | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | observed behaviour with evidence |
| Cryptographic Key Leakage | `redteam-ad` | `redteam-ad/references/graph.md` | `ad-enum` | the shortest path is printed |

## Data Theft, Exfiltration & Destructive Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Data Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Bulk Data Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Credential Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| DNS-Based Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| HTTPS-Based Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| ICMP-Based Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Cloud Storage Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Removable Media Exfiltration | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Steganographic Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Covert Channel Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Screen Capture Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Keystroke Logging | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Backup Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Source Code Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Intellectual Property Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Session Data Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Browser Data Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Email Archive Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Cloud Token Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Ransomware Encryption | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Double Extortion | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Triple Extortion | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Data Leak Extortion | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Wiper Attack | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Disk Wiping | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Master Boot Record Destruction | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Firmware Destruction | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Backup Destruction | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Shadow Copy Deletion | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Service Disruption | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | observed behaviour with evidence |
| Resource Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Cryptojacking | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Unauthorized Configuration Change | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | observed behaviour with evidence |
| Data Integrity Manipulation | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | observed behaviour with evidence |
| Sabotage | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Activation | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | observed behaviour with evidence |
| Destructive Supply Chain Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |

## Database & Data Storage Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Second-Order SQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Stored Procedure Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Privilege Escalation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Database Credential Theft | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Misconfiguration Exploitation | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Exposed Database Access | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Enumeration | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Dumping | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Unauthorized Data Export | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Link Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Oracle TNS Poisoning | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| MySQL Privilege Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| PostgreSQL Extension Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| MongoDB Misconfiguration Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Redis Unauthorized Access | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Redis Replication Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Elasticsearch Exposure | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| CouchDB Misconfiguration Abuse | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Backup Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Backup File Exposure | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Data-at-Rest Exposure | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Encryption Key Theft | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Database Ransomware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Database Destruction | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Log-Based Data Leakage | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Excessive Query Resource Consumption | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Second-Order Injection | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| ORM Injection | `raptor` | `raptor/references/web.md` | `sqli` | filtered-input differential |
| CSV Formula Injection | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |
| Data Integrity Tampering | `raptor` | `raptor/references/web.md` | `sqli` | observed behaviour with evidence |

## Email, Messaging & Communication Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Email Spoofing | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Email Header Injection | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Email Account Takeover | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | observed behaviour with evidence |
| Mailbox Rule Abuse | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Email Forwarding Abuse | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Thread Hijacking | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Reply-Chain Hijacking | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Malicious Attachment | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Malicious Link | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | observed behaviour with evidence |
| Macro-Based Malware Delivery | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | observed behaviour with evidence |
| HTML Smuggling | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Email Bombing | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Mail Flooding | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| SMTP Relay Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Open Mail Relay Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| SPF Misconfiguration Abuse | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| DKIM Misconfiguration Abuse | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| DMARC Misconfiguration Abuse | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Calendar Invitation Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Shared Document Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Messaging Account Takeover | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| QR Code | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | observed behaviour with evidence |
| Messaging Backup Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Contact List Exfiltration | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Fake Support Message | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Message Replay | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Voicemail Spoofing | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Caller ID Spoofing | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| SMS Sender-ID Spoofing | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| RCS Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Instant Messaging Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Emerging, Specialized & Other Attack Families

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Adversary-in-the-Middle (AiTM) | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Browser-in-the-Browser Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| ClickFix Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| QR Code Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Homograph Attack | `redteam-ad` | `redteam-ad/references/graph.md` | `ad-enum` | the shortest path is printed |
| Unicode Domain Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Lookalike Domain Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Domain Shadowing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Domain Hijacking | `raptor` | `raptor/references/recon.md` | `takeover-check` | provider's own claim endpoint returns the target |
| Drive-by Compromise | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Malvertising | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Search Engine Poisoning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| SEO Poisoning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Click Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Ad Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Credential Phishing Kits | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Ransomware-as-a-Service | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Malware-as-a-Service | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Initial Access Broker Operations | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Botnet-Based Attacks | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Distributed Credential Attacks | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Automated Account Creation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Fake Engagement Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Scraping Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Web Scraping Evasion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| API Resource Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| CAPTCHA Farming | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Browser Automation Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Account Farming | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Spam Campaign | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Scam Infrastructure Abuse | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake App Store Listing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Malicious Package Publication | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Privacy Leakage Attack | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| De-Anonymization Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Traffic Correlation Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Metadata Analysis Attack | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Location Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| GNSS Spoofing | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Replay-Based Device Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Cross-Protocol Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Protocol Confusion Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Confused Deputy Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Deputy Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Trust Boundary Violation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Cross-Tenant Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Cross-Origin Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Cross-Site Leak | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Supply Chain Compromise | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Insider Threat | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Nation-State Espionage Operations | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Cyber Espionage | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Cyber Sabotage | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the pre-action is verified, not executed |
| Hack-and-Leak Operation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Hacktivist Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Destructive Cyberattack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |

## Financial, Payment & Digital Asset Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Payment Card Skimming | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the reader accepts a clone |
| Magecart Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Card-Not-Present Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| ATM Malware Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| ATM Jackpotting | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| POS Malware | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| POS Memory Scraping | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Card Cloning | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Card Shimming | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Card Skimming | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the reader accepts a clone |
| Contactless Payment Relay | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| NFC | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Relay | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Online Banking Account Takeover | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Invoice Manipulation | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Payroll Diversion | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Wire Transfer Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Refund Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Chargeback Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Loan Application Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Cryptocurrency Wallet Theft | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Private Key Theft | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Seed Phrase Theft | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Wallet Drainer Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Crypto Exchange Compromise | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Smart Contract Exploit | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Reentrancy Attack | `redteam-ad` | `redteam-ad/references/hybrid.md` | `ad-enum` | the cross-boundary identity is reached |
| Flash Loan Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Oracle Manipulation | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Bridge Exploit | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Cross-Chain Replay | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Governance Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Sybil Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| 51% Attack | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Double-Spending Attack | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Rug Pull | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Phishing-Based Wallet Compromise | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| DNS Hijacking of Crypto Services | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Blockchain Front-Running | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| MEV Exploitation | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Smart Contract Access-Control Abuse | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Signature Replay | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | observed behaviour with evidence |
| Wallet Approval Abuse | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |

## Hardware, Firmware & Physical Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Physical Device Tampering | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Hardware Implant Attack | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Firmware Modification | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Firmware Downgrade | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| UEFI Implant | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Evil Maid Attack | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Cold Boot Attack | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| DMA Attack | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Rowhammer | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Fault Injection | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Voltage Glitching | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Clock Glitching | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Electromagnetic Fault Injection | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| JTAG Exploitation | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| UART Console Abuse | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Debug Interface Abuse | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| TPM Misconfiguration Abuse | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Spectre | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Meltdown | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Foreshadow | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| MDS Attacks | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Microarchitectural Data Sampling | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Supply Chain | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Hardware | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Implant | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| USB HID Injection | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Malicious USB Device | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| BadUSB | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| USB Firmware Reprogramming | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| USB Data Exfiltration | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Peripheral Firmware Attack | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| BIOS Password Bypass | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Physical Port Abuse | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Lock Picking | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Badge Cloning | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Access Card Cloning | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Hardware Keylogger | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Skimming | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the reader accepts a clone |
| Device | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |
| Installation | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | observed behaviour with evidence |

## Identity & Privacy

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Identity Theft | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Personal Data Harvesting | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Deanonymization | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Personal Information Elicitation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Data Disclosure Manipulation | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Information Aggregation Attack | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Credential Exposure Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Privacy Setting Exploitation | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Security Question Guessing | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Knowledge-Based Authentication Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Identity Verification Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Account Linking Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Unauthorized Profile Access | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Personal Data Extortion | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |

## Identity & Verification

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Identity Proofing Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Document Verification Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Forged Proof-of-Address Submission | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Synthetic Document Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Biometric Replay Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Facial Liveness Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Voice Biometric Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Remote Identity Verification Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Deepfake Identity Verification | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Duplicate Identity Registration | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Identity Attribute Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Account Identity Mismatch Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Age Verification Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Address Verification Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| False Identity Association | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Stolen Identity Document Reuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Identity Recovery Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fraudulent Beneficiary Registration | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Mule Account Recruitment | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Identity Verification Social Engineering | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Impersonation & Pretexting

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Person Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Executive Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Employee Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| IT Support Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Bank Employee Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Government Official Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Police Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Legal Authority Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Customer Support Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Recruiter Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Employer Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Vendor Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Supplier Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Contractor Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Delivery Personnel Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Family Member Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Friend Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Moderator Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Community Administrator Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Influencer Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Brand Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Expert Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Journalist Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Security Researcher Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Identity Verification Agent | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Technical Interview | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Industrial Control Systems (ICS), OT & IoT

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| ICS Network Intrusion | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| SCADA Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| PLC Manipulation | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| RTU Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| HMI Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Modbus Protocol Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| DNP3 Protocol Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| OPC UA Misconfiguration Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Industrial Protocol Spoofing | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Industrial Command Injection | `raptor` | `raptor/references/web.md` | `command-injection` | benign marker like `id` echoed back |
| PLC Logic Tampering | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Firmware Manipulation | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Historian Data Tampering | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Engineering Workstation Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Safety System Manipulation | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Industrial Denial of Service | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| OT Network Segmentation Bypass | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| IoT Device Takeover | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| IoT Botnet Recruitment | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Firmware Extraction | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Firmware Backdoor | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| IoT MQTT Misconfiguration | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| CoAP Protocol Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Zigbee Device Takeover | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the frame is captured and decoded |
| BLE Device Abuse | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Smart Home Hub Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Router Firmware Exploitation | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| UPnP Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| TR-069 Misconfiguration Abuse | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Exposed Debug Interface | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Device Identity Spoofing | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Sensor Data Manipulation | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Actuator Command Manipulation | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| GPS Spoofing | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| GNSS Jamming | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| CAN Bus Injection | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Automotive ECU Exploitation | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Vehicle Diagnostic Interface Abuse | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Medical Device Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Building Automation Compromise | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | observed behaviour with evidence |
| Industrial Ransomware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| OT Supply Chain Attack | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |

## Insider & Organizational Trust

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Privileged Access Request Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Emergency Access Pretexting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Temporary Access Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Contractor Access Misrepresentation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Visitor Authorization Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Access Badge Lending | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Unauthorized Escort Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Help Desk Verification Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Employee Offboarding Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Orphaned Account Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Delegated Mailbox Abuse | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Shared Account Misuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Trusted Workflow Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Approval Chain Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Separation-of-Duties Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Insider Data Disclosure | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Confidentiality Boundary Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Organizational Trust Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Incident Response Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fraudulent Emergency Access Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Insider & Trust

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Malicious Insider Recruitment | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Insider Threat Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |
| Trusted Contact Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Privileged User Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Employee Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Third-Party Trust Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Unauthorized Information Solicitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Confidential Information Elicitation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Authority-Based Coercion | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `ad-enum` | the authentication is captured |
| Social Engineering-Based Access Abuse | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Malware & Malicious Software

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Computer Virus | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Network Worm | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Trojan Horse | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Remote Access Trojan (RAT) | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Banking Trojan | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Infostealer | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Spyware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Adware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Ransomware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Wiper Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Rootkit | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Bootkit | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Keylogger | `redteam-wireless` | `redteam-wireless/references/physical.md` | `osint-person` | the badge/credential is accepted by the reader |
| Screenlogger | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Clipboard Hijacker | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Form Grabber | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Credential Stealer | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Password Stealer | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Botnet Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Cryptojacker | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Fileless Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Memory-Resident Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Polymorphic Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Metamorphic Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Dropper | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Downloader | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Loader | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Backdoor | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Web Shell | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Logic Bomb | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Time Bomb | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Firmware Malware | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| UEFI Malware | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| MBR Bootkit | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Browser Hijacker | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Mobile Banking Malware | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| SMS Trojan | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Spyware | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Stalkerware | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Rogue Security Software | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Scareware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Malicious Browser Extension | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Malicious Macro | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Malicious Script | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Supply Chain Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Destructive Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Data Exfiltration Malware | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Ad Fraud Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Click Fraud Malware | `raptor` | `raptor/references/malware.md` | `malware-triage` | observed behaviour with evidence |
| Wormable Malware | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Living-off-the-Land Abuse | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Malware-as-a-Service Operations | `raptor` | `raptor/references/recon.md` | `vuln-scan` | the behaviour is reproduced in the lab |

## Marketplace & Consumer

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Fake Proof-of-Payment Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Buyer Protection Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Seller Protection Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Off-Platform Payment Diversion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Dispute Resolution Agent | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Return Shipping Label Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Product Recall Message | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Warranty Claim Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Technical Warranty Support | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Account Upgrade Fee | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Verification Deposit | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Delivery Insurance Fee | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Reshipping Job Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Parcel Mule Recruitment | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Fake Mystery Shopper Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Product Testing Offer | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Paid Review Job | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Task-Based Earnings Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Commission Payment Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Customer Refund Portal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Mobile & Smartphone Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Android Malware Attack | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| iOS Malware Attack | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| SMS Spoofing | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| SIM Swapping | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| SIM Cloning | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| SIM Toolkit Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| SS7 Exploitation | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| Cellular Downgrade Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| Fake Base Station Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| IMSI Catcher Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| Mobile App Repackaging | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Malicious APK Distribution | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Sideloading Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| Android Accessibility Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Overlay Attack | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Tapjacking | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Intent Redirection | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Exported Component Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Insecure Deep Link | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| WebView Exploitation | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Certificate Validation Bypass | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Certificate Pinning Bypass | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile API Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Insecure Local Storage | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Backup Data Exposure | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| Mobile Session Theft | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Token Theft | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Clipboard Data Theft | `raptor` | `raptor/references/infra.md` | `pcap-analysis` | the data path is observed |
| Notification Data Theft | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| Mobile Ransomware | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| Fake App Update | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| Malicious QR Code | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | observed behaviour with evidence |
| MDM Profile Abuse | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Rogue Configuration Profile | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Zero-Click Exploit | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile One-Click Exploit | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Baseband Exploitation | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |
| Mobile Supply Chain Attack | `mobile-rat` | `mobile-rat/references/features.md` | `malware-triage` | the capability is present in the built artifact |

## Network & Infrastructure Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Denial of Service (DoS) | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Distributed Denial of Service (DDoS) | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| TCP SYN Flood | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| UDP Flood | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| ICMP Flood | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| HTTP Flood | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Slowloris Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Ping of Death | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| IP Fragmentation Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| IP Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| TCP Session Hijacking | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| TCP Reset Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| TCP Sequence Prediction | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| IP Fragmentation Overlap | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Man-in-the-Middle (MITM) | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| On-Path Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Replay Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Packet Sniffing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| ARP Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| ARP Poisoning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| MAC Flooding | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| MAC Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| VLAN Hopping | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| VLAN Double Tagging | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| STP Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DHCP Starvation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Rogue DHCP | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DHCP Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DNS Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DNS Cache Poisoning | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| DNS Tunneling | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DNS Rebinding | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| DNS Hijacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| LLMNR Poisoning | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| NBT-NS Poisoning | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| mDNS Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| WINS Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Routing Protocol Attack | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| BGP Hijacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Route Poisoning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| IPsec Downgrade | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Network Segmentation Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Firewall Evasion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Network Access Control Bypass | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Operating System, Kernel & Endpoint Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Local Privilege Escalation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Remote Privilege Escalation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Kernel Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Driver Exploitation | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| DLL Injection | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| DLL Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| DLL Side-Loading | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Process Injection | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Process Hollowing | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Thread Execution Hijacking | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Reflective Code Loading | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Token Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Access Token Theft | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| UAC Bypass | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Sudo Misconfiguration Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| SUID/SGID Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Linux Capabilities Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| PATH Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Library Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Environment Variable Hijacking | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Cron Job Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Scheduled Task Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Service Misconfiguration Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Unquoted Service Path | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Registry Persistence | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Startup Folder Persistence | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Bootloader Exploitation | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Secure Boot Bypass | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| UEFI Exploitation | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Kernel Module Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| eBPF Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Container Escape | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Sandbox Escape | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Browser Sandbox Escape | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Hypervisor Escape | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| DLL Search Order Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| COM Hijacking | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| WMI Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| PowerShell Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Windows Management Instrumentation Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | observed behaviour with evidence |
| Linux PAM Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Pluggable Authentication Module Abuse | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Credential Guard Bypass | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Endpoint Security Evasion | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| EDR Evasion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Antivirus Evasion | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Tampering with Security Controls | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Log Tampering | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Event Log Clearing | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | the primitive is demonstrated in the lab |
| Defense Impairment | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | observed behaviour with evidence |
| Persistence Mechanism Abuse | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `linux-privesc` | observed behaviour with evidence |

## Password, Authentication & Credential Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Brute-Force Attack | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Dictionary Attack | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Password Spraying | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Credential Stuffing | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Password Reuse Attack | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Rainbow Table Attack | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Offline Password Cracking | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Online Password Guessing | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Default Credential Abuse | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Weak Password Exploitation | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Credential Dumping | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Credential Harvesting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Password Hash Theft | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Pass-the-Hash | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Pass-the-Ticket | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Overpass-the-Hash | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Kerberoasting | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| AS-REP Roasting | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| NTLM Relay | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| NTLM Downgrade | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| LDAP Credential Abuse | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Golden Ticket Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Silver Ticket Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Diamond Ticket Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Skeleton Key Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| DCSync Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| DCShadow Attack | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| LSASS Credential Dumping | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| SAM Database Extraction | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Cached Credential Theft | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Browser Password Theft | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Cookie Theft | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| Session Token Theft | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| OAuth Token Theft | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Refresh Token Abuse | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| MFA Bypass | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| MFA Fatigue | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| OTP Interception | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| SIM Swap | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the SIM or cell identity is observed to change |
| Authentication Replay | `raptor` | `raptor/references/web.md` | `credential-stuffing` | observed behaviour with evidence |
| Credential Stuffing via Proxies | `raptor` | `raptor/references/web.md` | `credential-stuffing` | one successful authentication |
| Password Reset Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| Account Recovery Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| Login CSRF | `redteam-web` | `redteam-web/references/race-business.md` | `auth-bypass` | request succeeds without the token |
| Pass-the-Cookie | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| Device Code Phishing | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Adversary-in-the-Middle Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Persistence, Evasion & Lateral Movement

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Registry Run-Key Persistence | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Scheduled | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Task | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Cron Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Systemd Service Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Windows Service Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| WMI Event Subscription | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Browser Extension Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Account Manipulation | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| SSH Authorized-Key Persistence | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Web Shell Persistence | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Bootkit Persistence | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Firmware Persistence | `redteam-binary` | `redteam-binary/references/protocol-firmware.md` | `re-firmware` | the extracted component shows the weakness |
| Golden Ticket Persistence | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Cloud Role Persistence | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| OAuth Application Persistence | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Token Theft | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Living-off-the-Land Binaries (LOLBins) | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Living-off-the-Land Scripts | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Masquerading | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Fileless Execution | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |
| Obfuscated Files or Information | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Indicator Removal | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Timestomping | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Proxy-Based Evasion | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Domain Fronting | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `cors-misconfig` | foreign Origin reflected with credentials |
| Encrypted Command and Control | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| DNS-Based Command and Control | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Dead-Drop Resolver | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Peer-to-Peer Command and Control | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Fast Flux DNS | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Remote | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Desktop Abuse | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| SMB-Based Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| SSH-Based Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| WinRM-Based Movement | `redteam-ad` | `redteam-ad/references/relay-acl.md` | `lateral-movement` | the next hop is reachable |
| Defense Evasion | `raptor` | `raptor/references/infra.md` | `persistence-mech` | observed behaviour with evidence |
| Sandbox Evasion | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Virtual Machine Detection | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Anti-Debugging | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Anti-Analysis | `redteam-binary` | `redteam-binary/references/anti-analysis.md` | `re-dynamic` | the detection is identified and the bypass is proven |
| Security Tool Tampering | `redteam-wireless` | `redteam-wireless/references/vehicle.md` | `osint-person` | the diagnostic session is reached |

## Phishing & Messages

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Search Engine Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Pop-up Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Calendar Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Voice-Mail Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Browser-in-the-Browser Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Multi-Stage Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Multi-Channel Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| QR Code Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| E-Signature Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AiTM Session Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| HTML Smuggling Lure | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Malicious Attachment Lure | `redteam-web` | `redteam-web/references/email-messaging.md` | `osint-email` | the crafted message is accepted by the target relay |
| Malicious Link Lure | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake CAPTCHA Lure | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| ClickFix Social Engineering | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Search Engine Poisoning Lure | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Malvertising Lure | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Browser Update Lure | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Phone & Telecom

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Automated Voice Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Robocall Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake KYC Verification | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake SIM Verification | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Telecom Support | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Device Repair Support | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Remote Access Support Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Refund Support Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Subscription Renewal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Delivery Message | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Parcel Customs Fee Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Package Tracking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Address Update Request | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Government Fine Message | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Legal Threat Call | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Physical Social Engineering

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Visual Hacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| USB Drop Attack | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Fake Visitor | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Contractor | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Delivery Worker | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Authority Inspection | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Physical Access Pretexting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Lost-and-Found Baiting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Rogue Help Desk | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Emergency Evacuation Instruction | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Social Engineering for Physical Access | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Psychological Manipulation

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Cognitive Overload Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Decision Fatigue Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Anchoring Bias Exploitation | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Confirmation Bias Exploitation | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Sunk-Cost Fallacy Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Reciprocity Norm Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Conformity Pressure | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Peer Pressure Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Groupthink Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Commitment Escalation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Learned Helplessness Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Authority Gradient Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Ambiguity Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Plausible Deniability Manipulation | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| False Consensus Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Social Validation Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Artificial Familiarity | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Information Overload Deception | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Manufactured Consensus | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Trust Transfer Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Reconnaissance & Information Gathering

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Passive Reconnaissance | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Active Reconnaissance | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| OSINT | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| Google Dorking | `private-osint` | `private-osint/references/method.md` | `osint-person` | the identifier resolves to the subject |
| WHOIS Reconnaissance | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| DNS Reconnaissance | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Subdomain Enumeration | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Virtual Host Discovery | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Port Scanning | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Service Enumeration | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Banner Grabbing | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Web Crawling | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Directory Enumeration | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Technology Fingerprinting | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Operating System Fingerprinting | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Network Mapping | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Attack Surface Discovery | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Email Harvesting | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Username Enumeration | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |
| Metadata Analysis | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Certificate Transparency | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Recon | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| ASN Enumeration | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| IP Range Enumeration | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Cloud Asset Discovery | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |
| Credential Exposure Discovery | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | observed behaviour with evidence |
| Leak and Paste-Site Monitoring | `raptor` | `raptor/references/recon.md` | `subdomain-enum` | the asset exists and is reachable |

## Relationship & Emotional Exploitation

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Love Bombing for Fraud | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Emotional Blackmail | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Guilt-Based Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Shame-Based Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fear-Based Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Flattery-Based Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Trust Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| False Familiarity | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Reciprocity Trap | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Commitment Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Isolation Tactic | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Scarcity Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| FOMO-Based Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Grandparent Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Friend-in-Need Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Missing-Person Appeal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Crisis Appeal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Charity Appeal | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Religious Donation Appeal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Disaster Relief Appeal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Sextortion | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |
| Image-Based Sexual Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Non-Consensual Intimate Image Threat | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |
| Reputation-Based Extortion | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |

## Social Engineering & Human-Targeted Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Spear Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Whaling | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Clone Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Angler Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Smishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Vishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Quishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Business Email Compromise | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| CEO Fraud | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Vendor Email Compromise | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Invoice Fraud | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Payment Redirection Fraud | `redteam-web` | `redteam-web/references/financial-fraud.md` | `vuln-scan` | the payment or wallet flow is shown to be manipulable |
| Pretexting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Baiting | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Quid Pro Quo | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Tailgating | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Piggybacking | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Shoulder Surfing | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Dumpster Diving | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Eavesdropping | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Honey Trap | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Reverse Social Engineering | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| OTP Scam | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `mfa-bypass` | second factor skipped or reused |
| Fake Login Page | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Tech Support Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Help Desk Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake IT Support | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Fake Recruiter Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Job Offer Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Software Update | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake CAPTCHA Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Browser Warning | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake OAuth Consent | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Fake Document Sharing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Cloud Storage Invitation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Payment Confirmation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Refund Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Delivery Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake KYC Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Banking Alert | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Government Official | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Police Officer | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Charity Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Romance Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Catfishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Pig Butchering Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Advance-Fee Fraud | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Investment Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Lottery Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Gift Card Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Deepfake Voice Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Deepfake Video Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| AI-Generated Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Synthetic Identity Fraud | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Fake Social Media Profile | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Family Emergency Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Insider Recruitment | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | observed behaviour with evidence |
| Emotional Manipulation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Authority Manipulation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Urgency Manipulation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Secrecy Pressure | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Information Elicitation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Multi-Channel Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Social Media & Community

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Impersonation Account | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Account Cloning | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Verified Badge Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Blue-Tick Offer | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Account Ban Appeal | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Copyright Strike | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Moderator Message | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Group Invitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Malicious Direct Message | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Social Media Account Hijacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Giveaway Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Contest Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Influencer Collaboration | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Brand Ambassador Offer | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Sponsorship Offer | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Affiliate Program | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Follower Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Engagement Manipulation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Review Campaign | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Review Bombing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Astroturfing | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Sockpuppet Account Operation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Coordinated Inauthentic Behavior | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Impersonation-Based Reputation Attack | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Doxxing | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |
| Online Harassment | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |
| Cyberbullying | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |
| Cyberstalking | `private-osint` | `private-osint/references/exposure.md` | `osint-person` | the exposure is documented for the operator |

## Social Media & Messaging

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Conversation Hijacking | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Group Chat Takeover | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Messaging Identity Spoofing | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Mutual-Friend Introduction | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Impersonation Through Compromised Contacts | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Social Graph Manipulation | `redteam-ad` | `redteam-ad/references/graph.md` | `ad-enum` | the shortest path is printed |
| Fake Endorsement Campaign | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Coordinated Reporting Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| False Flag Account Operation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Reputation Laundering | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Context Collapse Exploitation | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Private Group Infiltration | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Community Referral | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Malicious Contact Import | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Contact Synchronization Abuse | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Fake Relationship Verification | `raptor` | `raptor/references/recon.md` | `vuln-scan` | observed behaviour with evidence |
| Impersonation Through Archived Content | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Fake Screenshot Evidence | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
| Fabricated Conversation Scam | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |

## Supply Chain, Software Development & CI/CD Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Software Supply Chain Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Dependency Confusion | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Typosquatting | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Package Name Squatting | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Malicious Package Injection | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Compromised Dependency | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Dependency Hijacking | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Maintainer Account Takeover | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Build Pipeline Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| CI/CD Pipeline Injection | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Build System Poisoning | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Artifact Repository Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Compromised Software Update | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Malicious Update Distribution | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Code Signing Key Theft | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Certificate Theft | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Source Code Repository Compromise | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the exploit runs against the target build |
| Git Secret Exposure | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| GitHub Token Theft | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| GitLab Runner Abuse | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Jenkins Misconfiguration Abuse | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Pipeline Secret Exfiltration | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Package Registry Compromise | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Open-Source Package Backdoor | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Malicious Compiler Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Compiler Backdoor | `raptor` | `raptor/references/malware.md` | `malware-triage` | the capability is confirmed by capa/yara plus behaviour |
| Build Reproducibility Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | observed behaviour with evidence |
| Infrastructure-as-Code Misconfiguration | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | observed behaviour with evidence |
| Terraform State Exposure | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Container Registry Poisoning | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| SBOM Tampering | `redteam-cloud` | `redteam-cloud/references/iam-paths.md` | `cloud-asset-discovery` | one resource is actually readable |
| Third-Party Vendor Compromise | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Managed Service Provider Compromise | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Watering Hole Attack | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Update Server Compromise | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Developer Workstation Compromise | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | the poisoned element is located |
| Secret Dependency Injection | `redteam-cloud` | `redteam-cloud/references/supply-chain.md` | `secret-hunt` | observed behaviour with evidence |

## Web Application Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| SQL Injection (SQLi) | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Blind SQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Time-Based SQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Union-Based SQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Error-Based SQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| Stacked Query Injection | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| NoSQL Injection | `raptor` | `raptor/references/web.md` | `sqli` | manual quote/boolean delta then one decoded row |
| LDAP Injection | `raptor` | `raptor/references/web.md` | `sqli` | filtered-input differential |
| XPath Injection | `raptor` | `raptor/references/web.md` | `sqli` | filtered-input differential |
| OS Command Injection | `raptor` | `raptor/references/web.md` | `command-injection` | benign marker like `id` echoed back |
| Code Injection | `raptor` | `raptor/references/web.md` | `command-injection` | benign marker like `id` echoed back |
| Cross-Site Scripting (XSS) | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| Reflected XSS | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| Stored XSS | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| DOM-Based XSS | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| Cross-Site Request Forgery (CSRF) | `redteam-web` | `redteam-web/references/race-business.md` | `auth-bypass` | request succeeds without the token |
| Server-Side Request Forgery (SSRF) | `raptor` | `raptor/references/web.md` | `ssrf` | internal response or metadata token returned |
| Local File Inclusion (LFI) | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Remote File Inclusion (RFI) | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Directory Traversal | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Path Traversal | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Arbitrary File Read | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Arbitrary File Write | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Unrestricted File Upload | `raptor` | `raptor/references/web.md` | `file-upload` | uploaded file is served back and executable |
| File Extension Bypass | `raptor` | `raptor/references/web.md` | `file-upload` | uploaded file is served back and executable |
| XML External Entity (XXE) | `raptor` | `raptor/references/web.md` | `xxe` | file content returned in the response |
| XML Injection | `raptor` | `raptor/references/web.md` | `xxe` | file content returned in the response |
| HTTP Request Smuggling | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| HTTP Response Splitting | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Host Header Injection | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| CRLF Injection | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Open Redirect | `raptor` | `raptor/references/web.md` | `auth-bypass` | 302 to the external host |
| Clickjacking | `redteam-web` | `redteam-web/references/race-business.md` | `web-fingerprint` | missing frame-ancestors/X-Frame-Options |
| CORS Misconfiguration Exploitation | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `cors-misconfig` | foreign Origin reflected with credentials |
| CSP Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Web Cache Poisoning | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Web Cache Deception | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| WebSocket Attacks | `redteam-web` | `redteam-web/references/api-modern.md` | `api-map` | operation reachable without the expected authorisation |
| SSTI | `raptor` | `raptor/references/web.md` | `ssti` | arithmetic evaluation in the sink |
| Server-Side Template Injection | `raptor` | `raptor/references/web.md` | `ssti` | arithmetic evaluation in the sink |
| Client-Side Template Injection | `raptor` | `raptor/references/web.md` | `ssti` | arithmetic evaluation in the sink |
| Prototype Pollution | `raptor` | `raptor/references/web.md` | `vuln-scan` | polluted property takes effect |
| DOM Clobbering | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| DOM-Based Open Redirect | `raptor` | `raptor/references/web.md` | `xss` | payload reflected in the sink context |
| Insecure Deserialization | `raptor` | `raptor/references/web.md` | `deserialization` | callback reaches the operator-controlled endpoint |
| Race Condition | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Business Logic Abuse | `redteam-web` | `redteam-web/references/race-business.md` | `vuln-scan` | the end state shows the abuse |
| Parameter Tampering | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |
| Mass Assignment | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |
| IDOR | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Broken Object-Level Authorization | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Broken Function-Level Authorization | `redteam-web` | `redteam-web/references/chain-orchestration.md` | `api-map` | another user's object returned with equal length |
| Authentication Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Authorization Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Path Confusion | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Unicode Normalization Attack | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| ReDoS | `redteam-binary` | `redteam-binary/references/exploit-dev.md` | `exploit-dev` | the crash or code execution is reproduced |
| Regex Injection | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| SSI Injection | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| GraphQL Injection | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| GraphQL Introspection Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| GraphQL Denial of Service | `redteam-web` | `redteam-web/references/api-modern.md` | `graphql-enum` | schema or unauthorized resolver reachable |
| WebDAV Misconfiguration Abuse | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Subdomain Takeover | `raptor` | `raptor/references/recon.md` | `takeover-check` | provider's own claim endpoint returns the target |
| Dangling DNS Exploitation | `raptor` | `raptor/references/recon.md` | `takeover-check` | provider's own claim endpoint returns the target |
| Cache Key Injection | `redteam-web` | `redteam-web/references/smuggling-cache.md` | `web-fingerprint` | crafted response splits or the marker persists for a clean request |
| Request Validation Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| File Parser Exploitation | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| Web Shell Placement | `raptor` | `raptor/references/web.md` | `file-upload` | uploaded file is served back and executable |
| Session Fixation | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| Session Hijacking | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `session-analysis` | session accepted from a different client |
| JWT Vulnerabilities | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| OAuth Misconfiguration Abuse | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| SAML Vulnerabilities | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `jwt-audit` | token accepted in the role it should not have |
| Password Reset Poisoning | `redteam-web` | `redteam-web/references/oauth-oidc-saml.md` | `auth-bypass` | reset lands on an attacker-controlled channel |
| Account Enumeration | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |
| Rate-Limit Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| CAPTCHA Bypass | `redteam-web` | `redteam-web/references/api-modern.md` | `vuln-scan` | observed behaviour with evidence |
| API Key Exposure | `redteam-web` | `redteam-web/references/race-business.md` | `api-map` | server accepts a client-set field |

## Wireless, Wi-Fi & Bluetooth Attacks

| Attack | Skill | Reference | Route | Verify |
|---|---|---|---|---|
| Evil Twin Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Rogue Access Point | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Wi-Fi Deauthentication | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Wi-Fi Disassociation | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| WEP Cracking | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| WPA/WPA2 Handshake Capture | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| WPA Password Guessing | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| WPS PIN Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| KRACK | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| PMKID Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Wireless Replay Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Wireless Jamming | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| RF Interference Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | observed behaviour with evidence |
| Beacon Flooding | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| Probe Request Analysis | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | the PSK or the association is obtained |
| SSID Spoofing | `redteam-ad` | `redteam-ad/references/kerberos.md` | `ad-enum` | the right is demonstrated (not the escalation executed) |
| Captive Portal Phishing | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| Wi-Fi Downgrade Attack | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | observed behaviour with evidence |
| Bluetooth Bluejacking | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Bluetooth Bluesnarfing | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Bluetooth Bluebugging | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Bluetooth Impersonation | `redteam-web` | `redteam-web/references/social-engineering.md` | `osint-person` | the social path is walked and recorded |
| BLE Tracking Abuse | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| BLE Replay Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| BLE Spoofing | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| KNOB Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| BIAS Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| Bluetooth Pairing Downgrade | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the device pairs or leaks |
| NFC Relay Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `osint-person` | the reader accepts a clone |
| NFC Tag Tampering | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | observed behaviour with evidence |
| RFID Cloning | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| RFID Skimming | `raptor` | `raptor/references/web.md` | `path-traversal` | target file content returned |
| Zigbee Replay Attack | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the frame is captured and decoded |
| Zigbee Key Theft | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the frame is captured and decoded |
| Z-Wave Protocol Attacks | `redteam-wireless` | `redteam-wireless/references/ble-nfc-rfid.md` | `wifi-audit` | the frame is captured and decoded |
| Wireless Sensor Network Attacks | `redteam-wireless` | `redteam-wireless/references/wifi.md` | `wifi-audit` | observed behaviour with evidence |
| Rogue Hotspot Attack | `redteam-ics` | `redteam-ics/references/ics-ot.md` | `web-search-intel` | the protocol interaction is observed without impact |
