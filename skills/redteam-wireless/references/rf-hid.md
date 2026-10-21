# RF, HID/USB & Hardware Implants

## Sub-GHz / UHF RF

### SDR setup

```bash
# cheap dongle
rtl_sdr
# check what is around
rtl_sdr -R 0 -f 433.92M -s 2M -g 40 out.cf32
# or the dedicated tools
universal-radio-hacker          # URH - GUI, excellent for rolling codes
rfcapture
```

```bash
# inspect a captured signal
python3 -m rfcapture rtl_sdr -f 433.92M -M 100
```

### Analysis workflow

1. Capture a baseline (press the remote, observe).
2. Identify the modulation: ASK/OOK (short, bursty) or FSK (clean, continuous).
3. Decode: `urh` (ASK/FSK), `rfcapture`, `flipper` (sub-GHz), `rfcat`.
4. Determine whether the code is **static** (replayable) or **rolling** (needs a capture while the
   victim presses the button, i.e. a relay/jamming scenario).
5. Test the replay against the authorised receiver.

### Replay

```bash
# Flipper Zero: capture to file, then replay
flipper subghz save raw _data/subghz_test
flipper subghz send raw _data/subghz_test
```

A static-code garage door, parking barrier or access fob is a real finding: no proximity required.

### Relay (the harder version)

Relay lets you trigger the receiver from far away by forwarding the signal in real time.

```bash
# two SDRs + a script
python3 relay.py --rx 0 --tx 1 --freq 433.92M
```

Relay against a vehicle, a garage or a badge reader is a serious physical-access finding — but it
involves transmitting on a band shared with others. Get the scope in writing and keep the test
short.

### Jamming — out of scope

Jamming and flooding run on the operator's test range or isolated spectrum — the technique is
identical and the collateral is not. On a shared public band, answer "could the radio be jammed?"
with a coverage analysis instead of a transmitter.

## HID / USB hardware

### Keyloggers

A USB HID keyboard that also logs keystrokes. In an authorised assessment, a hardware keylogger is
the **defensive detection** exercise:

- USB device forensics: `lsusb`, `usbmon`, `usbhid-dump`, `hidrd`.
- Look for devices claiming to be a keyboard with an extra HID interface, an odd VID/PID, or an
  unbranded generic device.
- Compare the device list against the approved inventory.

```bash
lsusb -v
usbhid-dump
cat /sys/kernel/debug/usb/devices
```

Findings: no USB device control policy, approved-hardware inventory not enforced, HID allowed on
locked workstations.

### BadUSB / Rubber Ducky

```bash
# what would the payload do?
# 1. never execute it against a production machine
# 2. review it as code
```

```bash
# generate a payload
pip3 install duck2root
# or review a public payload safely
cat payload.txt
```

Assessment angles (defensive):
- Is USB HID allowed at all on locked or restricted hosts?
- Are keyboards with an additional HID interface blocked (a GPO on `DeviceInstall_Restrictions` or a
  device allowlist)?
- Is there host-based USB monitoring?

### HID injection into the OS

Some devices inject keystrokes at a level the OS cannot distinguish from a real keyboard — the
classic "Rubber Ducky" and the "USB Rubber Ducky" family. Defensive controls: device class filtering,
`USBSTOR`/`HID` policy, application-level attestation, and keyboard firmware signing.

### PoC (physical access) hardware

```bash
# USB PoC
python3 -m pocsuite3 -s <server>
# lock picking (assessment only, with the site)
```

## Hardware implants

| Class | Where |
|---|---|
| Network implant | a device on the LAN (Pi, rogue AP, prebuilt "rubber ducky" network tools) |
| Audio implant | a conference device, smart speaker, headset |
| Video implant | a camera in a meeting room, a screen-capture device |
| Charging implant | USB-C charger with a data tap |
| Badge implant | an RFID badge overlay |

The assessment question is always: **how would someone discover this device?** The answers are
physical inspection, network anomaly detection, and device inventory.

## Physical-layer detection aids

```bash
# find unknown network devices
arp-scan -I eth0 -l
nmap -sn 192.168.1.0/24
# find rogue APs
airmon-ng wlan0mon
# USB inventory
lsusb -t
```

## Reporting

```
DEVICE:    <what it is, how it was found>
TRAFFIC:   <what it transmits/receives, captured evidence>
ACCESS:    <what it grants>
DETECTION: <how the defender could find it - and whether they can>
SCOPE:     <what you physically installed, cloned, or transmitted>
```
