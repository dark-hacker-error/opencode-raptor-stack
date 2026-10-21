# Bluetooth / BLE, NFC & RFID

## Bluetooth & BLE

### Enumerate

```bash
bluetoothctl
> power on
> scan on
> devices
> info <MAC>
```

```bash
# classic + BLE from the terminal
bluetoothctl --timeout 30 scan on
# LE only
bleak scan
# with names and RSSI
bleak scan --duration 15
```

### Attack classes

| Class | Notes |
|---|---|
| **BLUEBANG** style pairing | Classic BT devices that accept any PIN (`0000`, `1234`) |
| **KNOB** | entropy down to 1 byte in legacy pairing |
| **BIAS** | impersonation + MITM in legacy pairing |
| **BLURtooth** | cross-transport relay between BLE and BR/EDR |
| **Sweyntooth** | DoS crashes in BLE SoC firmware (2.0-6.0) |
| **Bleed** | memory disclosure in BLE stacks |
| **Passive BLE sniffing** | broadcast device info, no connection needed |
| **BLE advertising injection** | inject a beacon to trigger an app action |
| **GATT abuse** | a device that exposes write characteristics without auth |

### Test pairing

```bash
# try common PINs on an authorised target
bluetoothctl pair <MAC>
```

If it pairs with no challenge, that is the finding: the device accepts any PIN.

### BLE advertisement capture

```bash
# capture with a BLE sniffer or the adapter
bleak scan --duration 30 --save out.json
# MAC randomisation: look for a rotating address pattern for the same device
```

Device-tracking via rotating MACs is a genuine privacy finding: the address changes every ~15 min but
the payload (service UUIDs, manufacturer data, TX power) is stable.

### GATT inspection

```python
import asyncio
from bleak import BleakClient

async def main():
    async with BleakClient("AA:BB:CC:DD:EE:FF") as c:
        for svc in c.services:
            print(svc.uuid, svc.description)
            for ch in svc.characteristics:
                print("  ", ch.uuid, ch.properties)
asyncio.run(main())
```

Write-capable characteristics without authentication = unauthenticated control.

### Sweyntooth-style DoS (report, do not run)

Some BLE SoCs crash on malformed L2CAP or SMP packets. **Do not transmit malformed packets** — the
whole point is that the target becomes unusable. Test in a lab, report the firmware version as
vulnerable, and let the vendor confirm.

## NFC

### Read

```bash
nfc-list
nfc-list -l
nfc-scan -a
```

### Relay

NFC relay is the serious one: relay a card tap to a remote reader (payment terminals, door readers).

```bash
# nfc-mfultralight relay toolchain
python3 nfc_relay.py --source <A> --target <B>
```

Relay is prohibited by most payment and transit operators, and it is a serious crime in most
jurisdictions. Test it only against hardware you own or have explicit written authorisation for, and
prefer the safer assessment: **does the reader require a dynamic cryptogram or an LRF (length-field
randomisation) check?** A reader that accepts a static UID clone is the finding.

### NTAG / MIFARE static UID clone

```bash
# read a card
mfoc -d out.mfd carddump.txt
# dump and restore to a blank card
mfoc -f carddump.txt -d restored.mfd
```

A card with a predictable/static UID that a reader accepts without a challenge is a cloneable
credential.

## RFID

### UHF (EPC Gen2)

```bash
# read tags
cat900 | head
# or
python3 -m pythonRFID read
```

### LF (125/134 kHz)

```bash
# brute a HID Prox card
python3 proxmark3 -c "hf search"      # in a client session
```

### Attack classes

| Class | Finding |
|---|---|
| Weak/no authentication | any tag can be written with the right password |
| Predictable keys | factory or vendor keys that are public |
| Clonable credential | static ID accepted by the reader |
| Replay | no challenge-response, so a capture replays |
| Range abuse | long read range extends the attack window |
| Reader-to-backend trust | the backend trusts the reader's EPC without re-validating |

### Practical assessment

1. Capture the tag's memory and any access keys.
2. Clone to a blank tag.
3. Present the clone to the authorised reader — in scope, with the operator watching.
4. Report whether the reader accepted it.

Proving a clone on a reader that gates real access is a state change. Ask first.

## UWB and other modern radios

| Radio | Assessment |
|---|---|
| UWB | ranging security (relay, distance-bounding bypass) |
| Zigbee / Z-Wave | join the mesh, sniff the frames |
| LoRa | decode the uplink with `rtl_sdr` + `lora_pkt` |
| SDR-wideband | `rtl_sdr`, `gnuradio`, `universal-radio-hacker` for TV/remote/keyfob analysis |

Keyfob and remote-control analysis is a common physical assessment: capture the rolling code,
determine the model, and report whether the code is replayable.

## Tools

```bash
apt-get install -y bluetooth bluez bluez-tools nfc-tools rfkill
pip install bleak
```

## Reporting

```
RADIO:     <BT/BLE/NFC/RFID/UHF, the identifier>
ISSUE:     <what is wrong - static UID, no auth, weak PIN, sensitive broadcast>
EVIDENCE:  <capture, clone test result, or configuration>
IMPACT:    <what the attacker gets physically>
BOUNDARY:  <what you transmitted and whether you cloned anything>
```
