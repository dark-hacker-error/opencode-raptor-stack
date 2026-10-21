---
name: RedTeam Wireless — RF, Wireless, Hardware & Physical
description: Wireless, radio and physical-layer security assessment - WiFi (WPA2/WPA3, evil twin, PMKID, deauth), Bluetooth/BLE, NFC/RFID, UHF and sub-GHz RF, HID and BadUSB, vehicle CAN bus and UDS, IoT radio firmware, and physical attack tradecraft for authorised assessments. Use when the target is a wireless network, a radio device, a vehicle, or a physical installation.
---

# RedTeam Wireless — RF, Hardware & Physical

The layer below the IP. Everything here is about the assumption that "the thing in range is
legitimate" — and that the physical perimeter is trustworthy.

> `references/wifi.md` — WLAN assessment.
> `references/ble-nfc-rfid.md` — Bluetooth/BLE, NFC, RFID.
> `references/rf-hid.md` — UHF/sub-GHz RF, HID/USB, keyloggers, BadUSB.
> `references/vehicle.md` — CAN bus, UDS, automotive.
> `references/physical.md` — physical assessment tradecraft.

## Rules

1. **The radio in scope is the operator's declaration** — their test range, their APs, their
   devices, their SSIDs, their VIN. Inside it you have full capability: capture, crack, deauth,
   evil twin, relay, jam. Build it, run it, report it.
2. **Passive first because it is cheaper, not because it is safer.** A capture gives more than a
   deauth, and it leaves the target's users undisturbed.
3. **Jamming and flooding** run on the operator's test range or isolated spectrum. On a shared
   public band, use the test range — the technique is identical, the collateral is not.
4. **Capture the traffic in scope.** Read it. It is the operator's traffic and they asked for the
   assessment.
5. **Physical work needs the site walked with the operator's own facilities team.** Locks, panels,
   cameras, badges and the tailgating question are part of the brief, not improvisation.
6. **Leave the environment as you found it.** Reconnect what you disconnected, restore what you
   changed, and list every device you touched.

## Method

```
1. Scope the radio (bands, channels, SSIDs/BSSIDs, device identifiers)
2. Passive capture  ->  enumerate, fingerprint, find the weak link
3. Lab isolation    ->  reproduce the attack in your own lab before touching the target
4. Controlled test  ->  minimal transmission, minimal disruption
5. Physical layer   ->  badges, locks, cameras, cable, tailgating (with the site)
6. Evidence         ->  PCAP, spectrum traces, photos, logs
```

## Why wireless findings are different

- **Evidence is often ephemeral.** A PCAP of a handshake cannot be re-captured later. Capture and
  archive it during the test.
- **Some attacks are passive.** A weak WPA2 password is crackable from a handshake you captured
  without transmitting anything.
- **The attacker and the victim share a medium.** Your test traffic is visible to the target's
  defenders — a deauth storm looks exactly like an attack, which is useful in a purple team and
  destructive in production.
- **Physical findings are always a compound finding.** A badge clone plus an unlocked door plus an
  exposed network is one chain, not three findings.
