# Vehicle CAN Bus, UDS & Automotive

Automotive assessment is a physical-access engagement: you need the vehicle, and the scope must be
in writing (VIN, which systems, which sessions).

## Setup

```bash
# OBD-II adapter (CANtact, CANable, cheap USB-CAN)
sudo ip link set can0 up type can bitrate 500000
candump can0
candump -l can0 > capture.log
cansend can0 7DF#0101        # tester present
```

```bash
# the reference toolchain
apt-get install -y can-utils python3-can
pip3 install uds can-isotp python-can
```

## Bus discovery

```bash
# find the buses the adapter can reach
ifconfig can0 can1
# bitrate sweep on a new bus
for br in 500000 250000 125000; do ip link set can0 down; ip link set can0 up type can bitrate $br; candump -T 1000 can0 | head -5; done
```

## What to look for in the capture

```bash
# find diagnostic traffic (0x7DF/0x7E0 are the OBD broadcast IDs)
candump can0 | grep -E "7DF|7E[0-9]"
# find a periodic message (sensor data)
candump -t a:1000 can0
```

| PIDs | Meaning |
|---|---|
| `0x7DF` | OBD-II broadcast request |
| `0x7E0` / `0x7E8` | OBD-II response (tester / ECU) |
| `0x7C0`/`0x7C8` | UDS on CAN (VW/Audi) |
| `0x18DAF110` | UDS on CAN (BMW) |
| `0x18DAF1` | generic UDS request |
| `0x0C0`/`0x0C8` | Honda UDS |

## UDS (Unified Diagnostic Services)

```bash
# session control
cansend can0 7E0#02 10 03     -> extended session
# read data by identifier
cansend can0 7E0#03 22 F1 90
# security access
cansend can0 7E0#05 27 01 00 00 00 00 00
# routine control
cansend can0 7E0#04 31 01 FF
```

### Service catalogue

| SID | Service | Risk |
|---|---|---|
| `0x10` | Diagnostic Session Control | switches the ECU into an unlocked state |
| `0x11` | ECU Reset | resets modules (disruptive) |
| `0x14` | Clear Diagnostic Information | erases stored DTCs and evidence — destructive |
| `0x19` | Read DTC Information | leaks stored fault data |
| `0x22` | Read Data By Identifier | reads VIN, calibration, keys |
| `0x23` | Read Memory By Address | reads arbitrary ECU memory |
| `0x27` | Security Access | the seed/key algorithm |
| `0x28` | Communication Control | disables a communication channel |
| `0x2E` | Write Data By Identifier | writes a value into the ECU |
| `0x2F` | Read Memory By Identifier | |
| `0x30` | Routine Control | runs a routine (relearn, reset, test) |
| `0x31` | Request Download / Upload | **flashes firmware** — do not run |
| `0x34` | Request Download | |
| `0x35` | Request Upload | |
| `0x36` | Transfer Data | |
| `0x37` | Request Transfer Exit | |
| `0x3E` | Tester Present | keeps the session alive |
| `0x85` | Control DTC Setting | disables fault reporting — **detection evasion** |

### High-value identifiers

| DID | Content |
|---|---|
| `0xF190` | VIN |
| `0xF186` | Active Diagnostic Session |
| `0xF1xx` | Vehicle manufacturer data |
| `0xF1xx` (BMW) | Key data, rollout state |
| `0xFDxx` | Calibration / software version |
| `0x0100`–`0x01FF` | Manufacturer-specific |

### Security access (seed/key)

```bash
# ask for a seed
cansend can0 7E0#05 27 01 00 00 00 00 00
# the ECU returns a seed; compute the key and send it
cansend can0 7E0#05 27 02 <key...>
```

Many implementations use a weak algorithm (XOR, ADD, DES with a fixed key). Recover it from the
firmware (find the `SecurityAccess` routine) or by capturing seed/key pairs and inferring the
algorithm — then the diagnostic unlock is trivial.

## Classes of finding

| Finding | Why it matters |
|---|---|
| Unlocked extended session | fast service access to many ECUs |
| Default/well-known seed-key | any technician-level attacker unlocks the ECU |
| VIN readable without access | vehicle identity leak |
| Arbitrary memory read (`0x23`) | secrets, keys, calibration |
| DTC write / erase | evidence destruction, warranty fraud |
| DTC setting disable (`0x85`) | safety and detection evasion |
| Unauthenticated key write (`0x2E` on key DID) | immobiliser defeat, key cloning |
| Firmware flash without signature check | persistent compromise |
| CAN gateway isolation missing | one node reaches every other node |

## Gateway / bus isolation

The critical modern question: a vehicle has several CAN buses (Powertrain, Chassis, Body, Infotainment).
The **gateway** should filter which IDs cross. A missing filter means a low-security bus (e.g.
infotainment or a tire-pressure sensor) can message the powertrain bus.

```bash
# try sending a benign diagnostic ID from one bus and watch it on the other
# use only IDs that are safe (e.g. a status request), never a control ID
```

## Reporting

```
VEHICLE:  <make/model/year, VIN if readable>
BUS:      <bus id, bitrate, which ECUs answered>
ACCESS:   <sessions you reached, and which SIDs were allowed>
FINDINGS: <seed/key weakness, memory read, DTC control>
SAFETY:   <what an attacker could affect - braking, steering, immobiliser>
CLEANUP:  <anything you changed - DTCs cleared, session state>
```

**Never** write to safety-critical identifiers, flash firmware, or clear diagnostic information
without explicit written authorisation. State clearly in the report what you did not touch.
