# ICS, OT & IoT Attack Catalogue

## Asset discovery

```bash
# ICS-specific ports
nmap -p 502,102,1911,20000,44818,4840,67,68,69,47808,9600 10.10.10.0/24
# identify controllers
nmap -sV -p 102,502,2404,44818,4840 10.10.10.0/24
```

| Port | Device |
|---|---|
| 502 | Modbus/TCP |
| 102 | ISO-TSAP (Siemens S7) |
| 2404 | IEC 60870-5-104 |
| 44818 | EtherNet/IP (Allen-Bradley) |
| 4840 | OPC UA |
| 1911 | Fox/Niagara |
| 20000 | DNP3 |
| 47808 | BACnet |
| 9600 | Omron FINS |

## Protocol abuse

### Modbus/TCP

```bash
# read a holding register (read-only, safe)
modpoll -m tcp -a 1 -r 40001 -t 0x03 -c 1 10.10.10.5
# function codes
#  0x01 read coils          0x02 read discrete inputs
#  0x03 read holding regs   0x04 read input regs
#  0x05 write single coil  0x06 write single reg   <- ACTUATION, do not use
#  0x0F write multiple coils                     <- ACTUATION, do not use
```

Test points: unauthenticated read access; register discovery; unit-ID sweep; a controller that
accepts writes without a safety interlock; engineering software with no authorisation.

### IEC 104 / DNP3

Function codes like `WRITE_SINGLE_POINT` and `SELECT_AND_OPERATE` are actuation. Only decode and
enumerate.

### OPC UA

```bash
# anonymous session
python3 opcua-client.py --url opc.tcp://10.10.10.5:4840 --user anon --password anon
opcua-client -u opc.tcp://host:4840
```

Check: anonymous session allowed; no encryption (no `SecurityPolicy`); no node authentication;
certificates unvalidated.

## Network segmentation

| Attack | Test |
|---|---|
| OT Network Segmentation Bypass | can a jump from the IT zone reach the OT zone? Trace the conduit (a firewall, a one-way gateway, a router ACL) |
| Industrial Network Topology Discovery | passive capture reveals the topology and the polling pattern |
| Protocol Translation / Gateway Abuse | a protocol gateway that bridges zones without inspection |
| Historian Data Tampering | write to the historian (read-only is the safe test) |
| Safety System Manipulation | can the SIS be reached from the supervisory network? Report the reachability |
| Engineering Workstation Compromise | the EWS is the usual softest target: patching, projects, recipes, credentials |

## Device & firmware

| Attack | Test |
|---|---|
| Default Credential Abuse | the vendor defaults on the device, or on its web/SNMP/FTP interface |
| Exposed Debug Interface | serial console, JTAG, the SD card slot, the web debug page |
| Firmware Extraction | `extract_firmware` via REA, or `binwalk` — read-only, no flashing |
| Firmware Backdoor | a backdoor account or SSH key in the firmware image |
| Firmware Modification | report only; do not flash |
| IoT Device Takeover | default credentials, then a benign read to prove control |
| Router Firmware Exploitation | the classic command-injection in the admin panel (`ping`/`traceroute` fields) |
| UPnP Abuse | `upnp` on the OT network; the SOAP action surface |
| TR-069 Misconfiguration Abuse | `CWMP` — the ACS/TR-069 client that can reconfigure CPE; check the client-initiated flow |
| MQTT Misconfiguration Abuse | anonymous broker, no ACL on the topic tree, retained messages carrying credentials |
| CoAP Protocol Abuse | unauthenticated CoAP resources on the device |
| Zigbee Device Takeover | network key, joining, the trust centre |
| Smart Home Hub Compromise | the hub's local API, its cloud token, its update channel |

```bash
# check for open UPnP / MQTT / CoAP
nmap -sV -p 1900,1883,5683 10.10.10.0/24
# zigbee
apt-get install -y zigbee2mqtt  # or use a coordinator in sniffing mode
```

## GPS / GNSS

| Attack | Test |
|---|---|
| GPS Spoofing | the operator's own receiver or test track; the exposure (an unprotected receiver on the plant) is the finding either way |
| GNSS Jamming | on the operator's test range or with their own receiver; on shared GNSS, measure coverage instead of transmitting |
| Sensor Data Manipulation | the path from sensor to historian to operator display |
| Actuator Command Manipulation | report the reachability; do not actuate |

## Techniques that prove impact

| Technique | Why it proves the impact |
|---|---|
| Read a register that maps to a physical value | proves read access without changing state |
| Enumerate the unit IDs | proves device discovery without actuation |
| Decode the polling pattern | proves situational awareness of the process |
| Read the historian | proves data access |
| Read the engineering project file | proves the logic of the cell |
| Authenticate with default credentials | proves credential weakness — but do not change anything |

## Reporting

```
ZONE:        <IT / OT / DMZ crossing>
ASSET:       <device, model, firmware, protocol>
OBSERVED:    <the exact capture or command>
GAP:         <the missing control>
CONSEQUENCE: <the physical outcome - specify the process effect>
RECOMMENDED: <the compensating control - monitoring, segmentation, credential hygiene>
NOT TOUCHED: <what you deliberately did not do>
```
