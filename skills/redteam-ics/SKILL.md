---
name: RedTeam ICS/OT — Industrial Control & IoT Assessment
description: Security assessment of industrial control systems, OT networks and IoT devices - SCADA/PLC/HMI compromise, industrial protocol abuse (Modbus, DNP3, OPC UA), network segmentation bypass, safety-system integrity, default credentials, firmware analysis, MQTT/CoAP/TR-069 abuse and device takeover. Use when the target is a plant, a PLC, an HMI, a historian, an ICS network, or an IoT/embedded device fleet.
---

# RedTeam ICS/OT — Industrial Control & IoT Assessment

OT is where a security mistake becomes a physical event. The method is deliberately different:
**observe and map, prove the control gap, do not move the process.**

> `references/ics-ot.md` — the full catalogue with protocol detail.

## Absolute rules

1. **Never actuate a process.** No coil energisation, no valve movement, no setpoint write, no
   firmware flash, no safety-instrumented-system interaction. Report the capability; do not use it.
2. **Passive first.** Network capture and protocol decode are safe. Writes are not.
3. **No interference with a live process.** No DoS, no flooding, no malformed frames against
   production controllers. Do not run protocol fuzzing on a production cell.
4. **Coordinate with the plant.** Any active test needs the operator's process engineer present and
   the safety system in a known state.
5. **Document the physical consequence** for every finding — that is the risk that matters.

## Method

1. **Asset map** — who talks to whom, at what cadence, over which protocol.
2. **Passive protocol analysis** — capture and decode. Learn the registers, the unit IDs, the
   polling pattern.
3. **Identity & segmentation analysis** — are the IT and OT zones actually separated? Where do the
   conduits cross?
4. **Engineering-workstation analysis** — the EWS is usually the softest target on the plant.
5. **Device analysis** — firmware, default credentials, exposed management interfaces, debug ports.
6. **Report** — with the physical consequence of each gap.

## Deliverable

```
ASSET:     <device, protocol, role>
OBSERVED:  <what the capture shows>
GAP:       <the control that is missing>
CONSEQUENCE:<the physical outcome if exploited - be specific>
FIX:       <the compensating control>
```

## Immediate priorities for the operator

- The OT network is reachable from IT — quantify it.
- Every PLC/HMI is on the same flat network.
- Default and shared credentials on engineering tools.
- Remote access paths into the plant network (vendor VPN, cellular router, jump host).
- Firmware and configuration not backed up or not change-controlled.
