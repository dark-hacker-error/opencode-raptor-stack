#!/usr/bin/env bash
# Build + verify an Android assessment-agent APK.
# Usage: build_verify.sh [project-dir]
set -euo pipefail

PROJ="${1:-.}"
cd "$PROJ"

echo "==> toolchain"
echo "  ANDROID_HOME=${ANDROID_HOME:-unset}"
echo "  gradle     $(gradle --version 2>/dev/null | grep -m1 Gradle || echo missing)"
echo "  java       $(java -version 2>&1 | head -1)"

echo "==> building"
gradle --no-daemon assembleDebug

APK="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "!! build produced no APK at $APK" >&2
  exit 1
fi

echo "==> manifest"
AAPT2="$(ls -1 "${ANDROID_HOME:-/opt/sdk}"/build-tools/*/aapt2 2>/dev/null | tail -1)"
if [ -n "$AAPT2" ]; then
  "$AAPT2" dump badging "$APK" | head -25
  echo "-- declared permissions --"
  "$AAPT2" dump permissions "$APK"
else
  echo "  aapt2 not found, skipping badging dump"
fi

echo "==> artifact"
ls -la "$APK"
sha256sum "$APK"
echo "  dex entries: $(unzip -l "$APK" | grep -c '\.dex')"

echo "==> done"
echo "  install : adb install -r $APK"
echo "  launch  : adb shell am start -n <pkg>/.MainActivity"
