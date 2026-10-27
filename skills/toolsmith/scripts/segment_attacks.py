#!/usr/bin/env python3
"""
Segment the run-together technical attack list in references1.md into individual
attack names.

The source file has no delimiter between names ("SQL Injection (SQLi) Blind SQL
Injection" is one line), so we segment with a longest-match over a curated
vocabulary of standard attack-name phrases, then fall back to emitting any
leftover words as their own entries so nothing is silently lost.
"""
import re, sys

# Standard attack-name vocabulary. Multi-word entries are matched first.
PHRASES = """
Active Reconnaissance
Passive Reconnaissance
Information Gathering
Google Dorking
WHOIS Reconnaissance
DNS Reconnaissance
Subdomain Enumeration
Virtual Host Discovery
Port Scanning
Service Enumeration
Banner Grabbing
Web Crawling
Directory Enumeration
Technology Fingerprinting
Operating System Fingerprinting
Network Mapping
Attack Surface Discovery
Email Harvesting
Username Enumeration
Metadata Analysis
Certificate Transparency
Recon
ASN Enumeration
IP Range Enumeration
Cloud Asset Discovery
Credential Exposure Discovery
Leak and Paste-Site Monitoring
Denial of Service (DoS)
Distributed Denial of Service (DDoS)
TCP SYN Flood
UDP Flood
ICMP Flood
HTTP Flood
Slowloris Attack
Ping of Death
IP Fragmentation Attack
IP Spoofing
TCP Session Hijacking
TCP Reset Attack
TCP Sequence Prediction
IP Fragmentation Overlap
Man-in-the-Middle (MITM)
On-Path Attack
Replay Attack
Packet Sniffing
ARP Spoofing
ARP Poisoning
MAC Flooding
MAC Spoofing
VLAN Hopping
VLAN Double Tagging
STP Manipulation
DHCP Starvation
Rogue DHCP
DHCP Spoofing
DNS Spoofing
DNS Cache Poisoning
DNS Tunneling
DNS Rebinding
DNS Hijacking
LLMNR Poisoning
NBT-NS Poisoning
mDNS Spoofing
WINS Spoofing
Routing Protocol Attack
BGP Hijacking
Route Poisoning
IPsec Downgrade
Network Segmentation Bypass
Firewall Evasion
Network Access Control Bypass
SQL Injection (SQLi)
Blind SQL Injection
Time-Based SQL Injection
Union-Based SQL Injection
Error-Based SQL Injection
Stacked Query Injection
NoSQL Injection
LDAP Injection
XPath Injection
OS Command Injection
Code Injection
Cross-Site Scripting (XSS)
Reflected XSS
Stored XSS
DOM-Based XSS
Cross-Site Request Forgery (CSRF)
Server-Side Request Forgery (SSRF)
Local File Inclusion (LFI)
Remote File Inclusion (RFI)
Directory Traversal
Path Traversal
Arbitrary File Read
Arbitrary File Write
Unrestricted File Upload
File Extension Bypass
XML External Entity (XXE)
XML Injection
HTTP Request Smuggling
HTTP Response Splitting
Host Header Injection
CRLF Injection
Open Redirect
Clickjacking
CORS Misconfiguration Exploitation
CSP Bypass
Web Cache Poisoning
Web Cache Deception
WebSocket Attacks
Server-Side Template Injection (SSTI)
Server-Side Template Injection
Client-Side Template Injection
Prototype Pollution
DOM Clobbering
DOM-Based Open Redirect
Insecure Deserialization
Race Condition
Business Logic Abuse
Parameter Tampering
Mass Assignment
IDOR
Broken Object-Level Authorization
Broken Function-Level Authorization
Authentication Bypass
Authorization Bypass
Path Confusion
Unicode Normalization Attack
ReDoS
Regex Injection
SSI Injection
GraphQL Injection
GraphQL Introspection Abuse
GraphQL Denial of Service
WebDAV Misconfiguration Abuse
Subdomain Takeover
Dangling DNS Exploitation
Cache Key Injection
Request Validation Bypass
File Parser Exploitation
Web Shell Placement
Session Fixation
Session Hijacking
JWT Vulnerabilities
OAuth Misconfiguration Abuse
SAML Vulnerabilities
Password Reset Poisoning
Account Enumeration
Rate-Limit Bypass
CAPTCHA Bypass
API Key Exposure
REST API Abuse
GraphQL API Abuse
SOAP API Attacks
gRPC Attack Surface Abuse
BOLA / IDOR
BFLA
Broken Authentication
Broken Object Property-Level Authorization
Excessive Data Exposure
API Parameter Tampering
API Rate-Limit Abuse
API Resource Exhaustion
API Key Theft
Bearer Token Theft
JWT Algorithm Confusion
JWT Signature Validation Bypass
OAuth Token Abuse
OAuth Redirect URI Abuse
OAuth Consent Phishing
API Version Downgrade
Improper Inventory Management
Unsafe API Consumption
Webhook Spoofing
Webhook Replay
Webhook SSRF
API Schema Abuse
API Business Logic Abuse
API Gateway Misconfiguration
GraphQL Alias Abuse
GraphQL Batching Abuse
GraphQL Circular Query Abuse
Brute-Force Attack
Dictionary Attack
Password Spraying
Credential Stuffing
Credential Stuffing via Proxies
Password Reuse Attack
Rainbow Table Attack
Offline Password Cracking
Online Password Guessing
Default Credential Abuse
Weak Password Exploitation
Credential Dumping
Credential Harvesting
Password Hash Theft
Pass-the-Hash
Pass-the-Ticket
Overpass-the-Hash
Kerberoasting
AS-REP Roasting
NTLM Relay
NTLM Downgrade
LDAP Credential Abuse
Golden Ticket Attack
Silver Ticket Attack
Diamond Ticket Attack
Skeleton Key Attack
DCSync Attack
DCShadow Attack
LSASS Credential Dumping
SAM Database Extraction
Cached Credential Theft
Browser Password Theft
Cookie Theft
Session Token Theft
OAuth Token Theft
Refresh Token Abuse
MFA Bypass
MFA Fatigue
OTP Interception
SIM Swap
Authentication Replay
Password Reset Abuse
Account Recovery Abuse
Username Enumeration
Login CSRF
Pass-the-Cookie
Device Code Phishing
Adversary-in-the-Middle Phishing
Computer Virus
Network Worm
Trojan Horse
Remote Access Trojan (RAT)
Banking Trojan
Infostealer
Spyware
Adware
Ransomware
Wiper Malware
Rootkit
Bootkit
Keylogger
Screenlogger
Clipboard Hijacker
Form Grabber
Credential Stealer
Password Stealer
Botnet Malware
Cryptojacker
Fileless Malware
Memory-Resident Malware
Polymorphic Malware
Metamorphic Malware
Dropper
Downloader
Loader
Backdoor
Web Shell
Logic Bomb
Time Bomb
Firmware Malware
UEFI Malware
MBR Bootkit
Browser Hijacker
Mobile Banking Malware
SMS Trojan
Mobile Spyware
Stalkerware
Rogue Security Software
Scareware
Malicious Browser Extension
Malicious Macro
Malicious Script
Supply Chain Malware
Wormable Malware
Destructive Malware
Data Exfiltration Malware
Ad Fraud Malware
Click Fraud Malware
Malware-as-a-Service Operations
Phishing
Spear Phishing
Whaling
Clone Phishing
Angler Phishing
Smishing
Vishing
Quishing
Business Email Compromise
CEO Fraud
Vendor Email Compromise
Invoice Fraud
Payment Redirection Fraud
Pretexting
Impersonation
Baiting
Quid Pro Quo
Tailgating
Piggybacking
Shoulder Surfing
Dumpster Diving
Eavesdropping
Honey Trap
Reverse Social Engineering
OTP Scam
Fake Login Page
Credential Harvesting
Tech Support Scam
Help Desk Impersonation
Fake IT Support
Fake Recruiter Scam
Fake Job Offer Scam
Fake Software Update
Fake CAPTCHA Scam
Fake Browser Warning
Fake OAuth Consent
Fake Document Sharing
Fake Cloud Storage Invitation
Fake Payment Confirmation
Fake Refund Scam
Fake Delivery Scam
Fake KYC Scam
Fake Banking Alert
Fake Government Official
Fake Police Officer
Fake Charity Scam
Romance Scam
Catfishing
Pig Butchering Scam
Advance-Fee Fraud
Investment Scam
Lottery Scam
Gift Card Scam
Deepfake Voice Scam
Deepfake Video Scam
AI-Generated Phishing
Synthetic Identity Fraud
Fake Social Media Profile
Family Emergency Scam
Insider Recruitment
Emotional Manipulation
Authority Manipulation
Urgency Manipulation
Secrecy Pressure
Information Elicitation
Multi-Channel Impersonation
Evil Twin Attack
Rogue Access Point
Wi-Fi Deauthentication
Wi-Fi Disassociation
WEP Cracking
WPA/WPA2 Handshake Capture
WPA Password Guessing
WPS PIN Attack
KRACK
PMKID Attack
Wireless Replay Attack
Wireless Jamming
RF Interference Attack
Beacon Flooding
Probe Request Analysis
SSID Spoofing
Captive Portal Phishing
Wi-Fi Downgrade Attack
Bluetooth Bluejacking
Bluetooth Bluesnarfing
Bluetooth Bluebugging
Bluetooth Impersonation
BLE Tracking Abuse
BLE Replay Attack
BLE Spoofing
KNOB Attack
BIAS Attack
Bluetooth Pairing Downgrade
NFC Relay Attack
NFC Tag Tampering
RFID Cloning
RFID Skimming
Zigbee Replay Attack
Zigbee Key Theft
Z-Wave Protocol Attacks
Wireless Sensor Network Attacks
Rogue Hotspot Attack
Android Malware Attack
iOS Malware Attack
Mobile Phishing
SMS Spoofing
SIM Swapping
SIM Cloning
SIM Toolkit Abuse
SS7 Exploitation
Cellular Downgrade Attack
Fake Base Station Attack
IMSI Catcher Attack
Mobile App Repackaging
Malicious APK Distribution
Sideloading Abuse
Android Accessibility Abuse
Overlay Attack
Tapjacking
Intent Redirection
Exported Component Abuse
Insecure Deep Link
WebView Exploitation
Mobile Certificate Validation Bypass
Certificate Pinning Bypass
Mobile API Abuse
Insecure Local Storage
Backup Data Exposure
Mobile Session Theft
Mobile Token Theft
Clipboard Data Theft
Notification Data Theft
Mobile Ransomware
Fake App Update
Malicious QR Code
MDM Profile Abuse
Rogue Configuration Profile
Mobile Zero-Click Exploit
Mobile One-Click Exploit
Baseband Exploitation
Mobile Supply Chain Attack
Local Privilege Escalation
Remote Privilege Escalation
Kernel Exploitation
Driver Exploitation
DLL Injection
DLL Hijacking
DLL Side-Loading
Process Injection
Process Hollowing
Thread Execution Hijacking
Reflective Code Loading
Token Impersonation
Access Token Theft
UAC Bypass
Sudo Misconfiguration Abuse
SUID/SGID Abuse
Linux Capabilities Abuse
PATH Hijacking
Library Hijacking
Environment Variable Hijacking
Cron Job Abuse
Scheduled Task Abuse
Service Misconfiguration Abuse
Unquoted Service Path
Registry Persistence
Startup Folder Persistence
Bootloader Exploitation
Secure Boot Bypass
UEFI Exploitation
Kernel Module Abuse
eBPF Abuse
Container Escape
Sandbox Escape
Browser Sandbox Escape
Hypervisor Escape
DLL Search Order Hijacking
COM Hijacking
WMI Abuse
PowerShell Abuse
Windows Management Instrumentation Abuse
Linux PAM Abuse
Pluggable Authentication Module Abuse
Credential Guard Bypass
Endpoint Security Evasion
EDR Evasion
Antivirus Evasion
Tampering with Security Controls
Log Tampering
Event Log Clearing
Defense Impairment
Persistence Mechanism Abuse
Kerberoasting
AS-REP Roasting
DCSync
DCShadow
Golden Ticket
Silver Ticket
Diamond Ticket
Skeleton Key
Pass-the-Hash
Pass-the-Ticket
NTLM Relay
LLMNR Poisoning
NBT-NS Poisoning
ADCS Misconfiguration Abuse
Certificate Template Abuse
ESC1-ESC8
Certificate Abuse Families
Unconstrained Delegation Abuse
Constrained Delegation Abuse
Resource-Based Constrained Delegation Abuse
SID History Abuse
AdminSDHolder Abuse
GPO Abuse
Group Membership Abuse
ACL Abuse
DACL Misconfiguration Abuse
Replication Privilege Abuse
Trust Relationship Abuse
Forest Trust Abuse
Domain Trust Abuse
SID Spoofing
Machine Account Quota Abuse
Shadow Credentials
Overpass-the-Hash
Credential Dumping
LSASS Dumping
NTDS.dit Theft
Cached Domain Credential Theft
Local Administrator Password Reuse
Lateral Movement
Remote Service Abuse
PsExec-Based Movement
WMI-Based Movement
WinRM Abuse
RDP Abuse
SMB Relay
SMB Signing Weakness Abuse
Remote Credential Guard Misconfiguration
Identity Federation Abuse
SAML Token Forgery
Federated Identity Compromise
Cloud Account Takeover
Cloud Credential Theft
Cloud IAM Misconfiguration Abuse
Excessive Cloud Permissions
Cloud Privilege Escalation
Public Storage Bucket Exposure
Object Storage Data Theft
Cloud Metadata Service Abuse
SSRF-to-Cloud Credential Exposure
Cloud API Abuse
Exposed Cloud Access Keys
Serverless Function Abuse
Cloud Function Injection
Container Escape
Docker Socket Abuse
Privileged Container Abuse
Kubernetes API Abuse
Kubernetes RBAC Abuse
Kubernetes Secret Theft
Kubernetes Dashboard Exposure
Kubernetes Admission Controller Abuse
Container Image Poisoning
Malicious Container Image Registry Credential Theft
Image Supply Chain Attack
Pod-to-Node Escape
Kubelet Exposure
Etcd Data Exposure
Service Account Token Theft
Cloud Cryptomining
Cloud Resource Hijacking
Cloud Data Exfiltration
Cloud Ransomware
Cross-Account Access Abuse
Federated Role Abuse
Cloud Logging Tampering
Cloud Security Control Evasion
SaaS Account Takeover
SaaS OAuth Abuse
Shadow IT Exploitation
Cloud Tenant Misconfiguration
CI/CD Pipeline Compromise
Second-Order SQL Injection
Stored Procedure Abuse
Database Privilege Escalation
Database Credential Theft
Database Misconfiguration Exploitation
Exposed Database Access
Database Enumeration
Database Dumping
Unauthorized Data Export
Database Link Abuse
Oracle TNS Poisoning
MySQL Privilege Abuse
PostgreSQL Extension Abuse
MongoDB Misconfiguration Abuse
Redis Unauthorized Access
Redis Replication Abuse
Elasticsearch Exposure
CouchDB Misconfiguration Abuse
Database Backup Theft
Backup File Exposure
Data-at-Rest Exposure
Encryption Key Theft
Database Ransomware
Database Destruction
Log-Based Data Leakage
Excessive Query Resource Consumption
Second-Order Injection
ORM Injection
CSV Formula Injection
Data Integrity Tampering
Brute-Force Cryptanalysis
Dictionary-Based Cryptanalysis
Birthday Attack
Collision Attack
Chosen-Plaintext Attack
Chosen-Ciphertext Attack
Known-Plaintext Attack
Ciphertext-Only Attack
Padding Oracle Attack
Padding Downgrade Attack
Downgrade Attack
Key Substitution Attack
Weak Key Exploitation
Nonce Reuse Attack
IV Reuse Attack
Side-Channel Attack
Timing Attack
Power Analysis Attack
Cache-Timing Attack
Fault Injection Attack
Differential Cryptanalysis
Linear Cryptanalysis
Meet-in-the-Middle Attack
Length Extension Attack
Hash Collision Exploitation
Certificate Spoofing
Certificate Misissuance Abuse
TLS Downgrade
SSL Stripping
TLS Certificate Validation Bypass
Insecure Randomness Exploitation
DNSSEC Misconfiguration Abuse
Kerberos Protocol Abuse
NTLM Protocol Abuse
OAuth Protocol Misconfiguration
SAML Protocol Abuse
Token Replay
Cryptographic Key Leakage
Physical Device Tampering
Hardware Implant Attack
Firmware Modification
Firmware Downgrade
UEFI Implant
Evil Maid Attack
Cold Boot Attack
DMA Attack
Rowhammer
Voltage Glitching
Clock Glitching
Electromagnetic Fault Injection
JTAG Exploitation
UART Console Abuse
Debug Interface Abuse
TPM Misconfiguration Abuse
Spectre
Meltdown
Foreshadow
MDS Attacks
Cache Timing Attack
Microarchitectural Data Sampling
USB HID Injection
Malicious USB Device
BadUSB
USB Firmware Reprogramming
USB Data Exfiltration
Peripheral Firmware Attack
BIOS Password Bypass
Physical Port Abuse
Lock Picking
Badge Cloning
Access Card Cloning
Hardware Keylogger
Software Supply Chain Attack
Dependency Confusion
Typosquatting
Package Name Squatting
Malicious Package Injection
Compromised Dependency
Dependency Hijacking
Maintainer Account Takeover
Build Pipeline Compromise
CI/CD Pipeline Injection
Build System Poisoning
Artifact Repository Compromise
Compromised Software Update
Malicious Update Distribution
Code Signing Key Theft
Certificate Theft
Source Code Repository Compromise
Git Secret Exposure
GitHub Token Theft
GitLab Runner Abuse
Jenkins Misconfiguration Abuse
Pipeline Secret Exfiltration
Package Registry Compromise
Open-Source Package Backdoor
Malicious Compiler Attack
Compiler Backdoor
Build Reproducibility Attack
Infrastructure-as-Code Misconfiguration
Terraform State Exposure
Container Registry Poisoning
SBOM Tampering
Third-Party Vendor Compromise
Managed Service Provider Compromise
Watering Hole Attack
Update Server Compromise
Developer Workstation Compromise
Secret Dependency Injection
Prompt Injection
Indirect Prompt Injection
Jailbreak Attack
System Prompt Extraction
Sensitive Information Disclosure
Training Data Extraction
Data Poisoning
Backdoor Training Attack
Model Poisoning
Adversarial Example Attack
Model Evasion
Membership Inference
Model Inversion
Model Extraction
Model Stealing
Model Replication
Embedding Inversion
Vector Database Poisoning
RAG Data Poisoning
Retrieval Manipulation
Malicious Tool Invocation
Excessive Agency Abuse
Agent Hijacking
Tool-Output Injection
Cross-Tenant Data Leakage
AI Supply Chain Attack
Malicious Model Artifact
Unsafe Model Deserialization
AI Plugin Abuse
AI Connector Abuse
LLM Denial of Service
Token Exhaustion Attack
Multimodal Prompt Injection
Image-Based Prompt Injection
Audio Prompt Injection
Model API Key Theft
Inference Endpoint Abuse
Training Pipeline Compromise
AI Data Exfiltration
ICS Network Intrusion
SCADA Compromise
PLC Manipulation
RTU Compromise
HMI Compromise
Modbus Protocol Abuse
DNP3 Protocol Abuse
OPC UA Misconfiguration Abuse
Industrial Protocol Spoofing
Industrial Command Injection
PLC Logic Tampering
Firmware Manipulation
Historian Data Tampering
Engineering Workstation Compromise
Safety System Manipulation
Industrial Denial of Service
OT Network Segmentation Bypass
IoT Device Takeover
Default Credential Abuse
IoT Botnet Recruitment
Firmware Extraction
Firmware Backdoor
IoT MQTT Misconfiguration
CoAP Protocol Abuse
Zigbee Device Takeover
BLE Device Abuse
Smart Home Hub Compromise
Router Firmware Exploitation
UPnP Abuse
TR-069 Misconfiguration Abuse
Exposed Debug Interface
Device Identity Spoofing
Sensor Data Manipulation
Actuator Command Manipulation
GPS Spoofing
GNSS Jamming
CAN Bus Injection
Automotive ECU Exploitation
Vehicle Diagnostic Interface Abuse
Medical Device Compromise
Building Automation Compromise
Industrial Ransomware
OT Supply Chain Attack
Email Spoofing
Email Header Injection
Email Account Takeover
Mailbox Rule Abuse
Email Forwarding Abuse
Thread Hijacking
Reply-Chain Hijacking
Malicious Attachment
Malicious Link
Macro-Based Malware Delivery
HTML Smuggling
Email Bombing
Mail Flooding
SMTP Relay Abuse
Open Mail Relay Abuse
SPF Misconfiguration Abuse
DKIM Misconfiguration Abuse
DMARC Misconfiguration Abuse
Calendar Invitation Phishing
Shared Document Phishing
Messaging Account Takeover
Messaging Backup Theft
Contact List Exfiltration
Fake Support Message
Message Replay
Voicemail Spoofing
Caller ID Spoofing
SMS Sender-ID Spoofing
RCS Phishing
Instant Messaging Phishing
Data Exfiltration
Bulk Data Theft
Credential Exfiltration
DNS-Based Exfiltration
HTTPS-Based Exfiltration
ICMP-Based Exfiltration
Cloud Storage Exfiltration
Removable Media Exfiltration
Steganographic Exfiltration
Covert Channel Exfiltration
Screen Capture Theft
Clipboard Data Theft
Keystroke Logging
Database Dumping
Backup Theft
Source Code Theft
Intellectual Property Theft
Session Data Theft
Browser Data Theft
Email Archive Theft
Cloud Token Theft
Ransomware Encryption
Double Extortion
Triple Extortion
Data Leak Extortion
Wiper Attack
Disk Wiping
Master Boot Record Destruction
Firmware Destruction
Database Destruction
Backup Destruction
Shadow Copy Deletion
Service Disruption
Resource Hijacking
Unauthorized Configuration Change
Data Integrity Manipulation
Sabotage
Activation
Destructive Supply Chain Attack
Registry Run-Key Persistence
Cron Persistence
Systemd Service Persistence
Windows Service Persistence
WMI Event Subscription
COM Hijacking
Browser Extension Persistence
Account Manipulation
SSH Authorized-Key Persistence
Web Shell Persistence
Bootkit Persistence
Firmware Persistence
Golden Ticket Persistence
Cloud Role Persistence
OAuth Application Persistence
Token Theft
Living-off-the-Land Binaries (LOLBins)
Living-off-the-Land Scripts
Masquerading
Fileless Execution
Obfuscated Files or Information
Indicator Removal
Timestomping
Proxy-Based Evasion
Domain Fronting
Encrypted Command and Control
DNS-Based Command and Control
Dead-Drop Resolver
Peer-to-Peer Command and Control
Fast Flux DNS
SMB-Based Movement
SSH-Based Movement
WMI-Based Movement
WinRM-Based Movement
Defense Evasion
Virtual Machine Detection
Anti-Debugging
Anti-Analysis
Security Tool Tampering
Zero-Day Exploitation
N-Day Exploitation
Remote Code Execution (RCE)
Local Code Execution
Arbitrary Code Execution
Privilege Escalation
Buffer Overflow
Stack Overflow
Heap Overflow
Integer Overflow
Integer Underflow
Use-After-Free
Double Free
Type Confusion
Format String Vulnerability
Out-of-Bounds Read
Out-of-Bounds Write
Memory Corruption
Time-of-Check to Time-of-Use (TOCTOU)
Null Pointer Dereference
Uninitialized Memory
Use Dangling Pointer Exploitation
Return-Oriented Programming (ROP)
Jump-Oriented Programming (JOP)
Return-to-libc
Code-Reuse Attack
Control-Flow Hijacking
Control-Flow Integrity Bypass
Kernel Exploit
Driver Exploit
JIT Spraying
Heap Spraying
Deserialization Exploitation
Parser Differential Attack
Protocol State Machine Abuse
Integer Truncation
Sign Conversion Error
Path Canonicalization Bypass
Unicode Parsing Confusion
Memory Disclosure
Information Disclosure
Type Juggling
Algorithmic Complexity Attack
Resource Exhaustion
Zip Slip
Archive Extraction Traversal
Symlink Attack
Hardlink Attack
TOCTOU File Race
Race-Based Authorization Bypass
Broken Access Control
Horizontal Privilege Escalation
Vertical Privilege Escalation
Account Takeover
Weak Recovery Questions
Cookie Replay
Forced Browsing
Price Manipulation
Quantity Manipulation
Coupon Abuse
Discount Abuse
Referral Fraud
Loyalty Point Abuse
Payment Logic Abuse
Refund Logic Abuse
Race Condition in Payments
Double-Spending
Transaction Replay
Workflow Bypass
Approval Workflow Bypass
Quota Abuse
Trial Abuse
Subscription Abuse
Multi-Tenant Isolation Bypass
Tenant ID Manipulation
Privilege Boundary Confusion
Payment Gateway Callback Spoofing
Webhook Signature Validation Bypass
Payment Card Skimming
Magecart Attack
Card-Not-Present Fraud
ATM Malware Attack
ATM Jackpotting
POS Malware
POS Memory Scraping
Card Cloning
Card Shimming
Card Skimming
Contactless Payment Relay
Online Banking Account Takeover
Invoice Manipulation
Payroll Diversion
Wire Transfer Fraud
Refund Fraud
Chargeback Fraud
Synthetic Identity Fraud
Loan Application Fraud
Cryptocurrency Wallet Theft
Private Key Theft
Seed Phrase Theft
Wallet Drainer Scam
Crypto Exchange Compromise
Smart Contract Exploit
Reentrancy Attack
Flash Loan Attack
Oracle Manipulation
Bridge Exploit
Cross-Chain Replay
Governance Attack
Sybil Attack
51% Attack
Double-Spending Attack
Rug Pull
Phishing-Based Wallet Compromise
DNS Hijacking of Crypto Services
Blockchain Front-Running
MEV Exploitation
Smart Contract Access-Control Abuse
Signature Replay
Wallet Approval Abuse
Exposed Secrets
Hardcoded Credentials
Leaked API Tokens
CI/CD Secret Theft
Runner Compromise
Build Artifact Tampering
Pipeline Configuration Injection
Infrastructure-as-Code Injection
Terraform State Leakage
Exposed Kubernetes Dashboard
Kubernetes Secret Exposure
Kubernetes Admission Abuse
Docker Socket Exposure
Container Privilege Abuse
Registry Poisoning
Malicious Helm Chart
Compromised Operator
Serverless Permission Abuse
Function Event Injection
Cloud Metadata SSRF
IAM Role Chaining Abuse
Cloud Federation Abuse
Cross-Account Role Abuse
Public Snapshot Exposure
Public Backup Exposure
Misconfigured Object Storage
Cloud Logging Evasion
Cloud Workload Identity Theft
Cloud Control Plane Abuse
Secrets Manager Misconfiguration
Vault Token Theft
Service Mesh Misconfiguration
Kubernetes Network Policy Bypass
GitOps Repository Compromise
Infrastructure Drift Exploitation
Artifact Signing Bypass
Software Provenance Tampering
Adversary-in-the-Middle (AiTM)
Browser-in-the-Browser Attack
ClickFix Attack
QR Code Abuse
Homograph Attack
Unicode Domain Spoofing
Lookalike Domain Attack
Domain Shadowing
Domain Hijacking
Watering Hole Attack
Drive-by Compromise
Malvertising
Search Engine Poisoning
SEO Poisoning
Click Fraud
Ad Fraud
Credential Phishing Kits
Ransomware-as-a-Service
Initial Access Broker Operations
Botnet-Based Attacks
Distributed Credential Attacks
Automated Account Creation
Fake Engagement Manipulation
Scraping Abuse
Web Scraping Evasion
API Resource Abuse
CAPTCHA Farming
Browser Automation Abuse
Account Farming
Spam Campaign
Scam Infrastructure Abuse
Fake App Store Listing
Malicious Package Publication
Privacy Leakage Attack
De-Anonymization Attack
Traffic Correlation Attack
Metadata Analysis Attack
Location Spoofing
GNSS Spoofing
Replay-Based Device Attack
Cross-Protocol Attack
Protocol Confusion Attack
Confused Deputy Attack
Deputy Abuse
Trust Boundary Violation
Cross-Tenant Attack
Cross-Origin Attack
Cross-Site Leak
Side-Channel Attack
Supply Chain Compromise
Insider Threat
Nation-State Espionage Operations
Cyber Espionage
Cyber Sabotage
Hack-and-Leak Operation
Hacktivist Attack
Destructive Cyberattack
"""

# words that should never START a new name (continuation markers)
CONT = {
    "and", "of", "the", "a", "in", "to", "for", "via", "with", "or", "by",
    "attack", "attacks", "abuse", "abused", "bypass", "bypassing", "injection",
    "exploitation", "exploit", "vulnerability", "scanning", "discovery",
    "enumeration", "fraud", "scam", "impersonation", "poisoning", "hijacking",
    "spoofing", "cloning", "theft", "leakage", "exposure", "tampering",
    "compromise", "misconfiguration", "manipulation", "evasion", "harvesting",
    "extraction", "injection", "overflow", "injection", "abuse", "escalation",
    "misuse", "traversal", "inclusion", "request", "response", "code",
    "based", "level", "service", "access", "protection", "chain", "layer",
}


def segment(line: str):
    """Longest-match segmentation of a run-together attack list."""
    words = line.split()
    phrases = sorted((p.split() for p in PHRASES.split("\n") if p.strip()),
                     key=lambda ws: -len(ws))
    maxlen = max(len(p) for p in phrases)
    out, i = [], 0
    while i < len(words):
        matched = None
        for n in range(min(maxlen, len(words) - i), 0, -1):
            cand = " ".join(words[i:i + n])
            if any(cand.lower() == " ".join(p).lower() for p in phrases):
                matched = n
                break
        if matched:
            out.append(" ".join(words[i:i + matched]))
            i += matched
        else:
            # attach unknown words to the previous entry if it looks incomplete
            if out and words[i].lower() in CONT:
                out[-1] = out[-1] + " " + words[i]
            else:
                out.append(words[i])
            i += 1
    return out


if __name__ == "__main__":
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    src = open("/hacking/references/references1.md", encoding="utf-8").read()
    total = 0
    for line in src.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        names = segment(line)
        total += len(names)
        print(f"--- {len(names)} names")
        print(" | ".join(names))
    print("TOTAL", total)
