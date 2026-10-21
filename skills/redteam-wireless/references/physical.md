# Physical Assessment Tradecraft

Physical work needs a site assessment and a written scope: which building, which areas, which
locks, who is in the building, and what you may not touch.

## Assessment model

```
PERIMETER   fences, walls, doors, gates, windows, roof
ACCESS      badges, keys, PINs, intercoms, turnstiles, tailgating
INTERIOR    locks, safes, cabinets, server rooms, wiring closets
SURVEILLANCE cameras, microphones, NVRs, displays
UTILITY     power, HVAC, water, network jacks, fire systems
PROCESS     people, visitors, contractors, deliveries
```

## Perimeter

```bash
# wireless cameras / NVRs on the network
nmap -sn 192.168.1.0/24
# look for camera signatures
nmap -sV -p 80,443,554,8000,8080 192.168.1.0/24 | grep -iE "hikvision|dahua|axis|avtech|uniview|reolink"
# RTSP
ffprobe -rtsp_transport tcp rtsp://192.168.1.50:554/Streaming/Channels/101
```

Default credentials on cameras and NVRs are one of the most common physical-assessment findings:
`admin:admin`, `admin:12345`, `admin:` (empty), `root:xc3511`.

```bash
# check for a default credential
nmap -sV --script http-default-accounts -p 80,8080,554 192.168.1.50
```

## Access control

| Element | Test |
|---|---|
| Badge reader | clone frequency (125 kHz HID / 13.56 MHz MIFARE) vs the technology |
| PIN pad | shoulder-surf, 4-digit default codes, worn keys |
| Turnstile | tailgating, bypass via the emergency door |
| Intercom | call-back to a desk, "test" bypass |
| Key cylinder | worn keys, bump, shim, master key |
| Maglock | power loss behaviour, door gap, tamper switch |
| Secure door | frame, hinges, closer, glazing |

### Badge cloning

```bash
# read a 125 kHz HID badge
python3 proxmark3 -c "hf search"
# read a 13.56 MHz MIFARE Classic
python3 proxmark3 -c "hf search"      # then "hf mf dump"
# NFC
nfc-scan -a
```

Clone to a blank card and present it at the **authorised** reader with the operator watching.

### Lock assessment

```bash
# what is the lock?
# door-level: the gap around the leaf, the hinge side, the strike plate
```

- **Bump key**: a technique that opens many cylinders. Assess the cylinder type and whether it is
  bump-resistant; do not go beyond a single authorised door.
- **Shim**: bypasses a latch, not a deadbolt.
- **Key control**: are keys copied without a record? Can a returned key still open a door?
- **Master key**: a key that opens many doors — try the documented emergency key against a normal door.

### Lock bypass by the frame, not the lock

Often easier than picking: the door leaf gap, the hinge pins, the strike plate screws, the closer
arms, the glass, the ceiling. Photograph and document; do not damage.

## Server rooms & comms closets

```bash
# what is plugged into the wall
for p in $(seq 1 30); do for i in 1 2 3 4; do echo -n "."; done; echo " port $p"; done | nc -z -w1 192.168.10.5 1-30
# or
nmap -Pn -p- 192.168.10.5
```

Finding an **unmonitored network jack** in a meeting room is a classic finding: plug in, get DHCP,
reach the corporate network.

```bash
# rogue DHCP test
dhclient -v eth0
```

## Cameras & recording

| Check | Why |
|---|---|
| Default credentials | full camera control |
| RTSP/ONVIF unauthenticated | live video + PTZ |
| Firmware version / EOL | known CVEs |
| Export/import of config | config tampering |
| Log retention | how long the recording survives |
| Admin network separation | camera on the corporate VLAN |

## People & process

Physical security is a process as much as a lock.

- Tailgating: how far behind an authorised person can you get?
- Visitors: are they badged, escorted, and are the badges visibly different?
- Deliveries: are they checked, and are they left unattended?
- Clean desk / screen lock: are there unlocked workstations with sessions open?
- Shredding and whiteboards: residual information in the recycling.
- Access to the building at night and at weekends.

## Locked-down offices

Do **not** defeat a lock you have not been explicitly authorised to open, and never leave a
mechanism disabled. If you find an unlocked door, document it, report it, and close it again. If
you must test a physical control, have someone inside who can open the door from the other side —
that removes the risk of stranding anyone.

## Deliverables

```
PERIMETER:  <fence/door/window findings>
ACCESS:     <badge, key, PIN, tailgating findings>
INTERIOR:   <locks, safes, closets, server rooms>
SURVEILLANCE:<cameras, NVRs, defaults, network placement>
UTILITY:    <power, HVAC, jacks, fire systems>
PROCESS:    <people, visitors, deliveries, desk hygiene>
CHAIN:      <the composite path: badge clone -> door -> comms closet -> network>
```
