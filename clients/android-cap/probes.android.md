# Native Android probes (Kotlin checklist)

Implement in the Android shell; feed results into `potential.ts` → `mapTier()`.

## API level

```kotlin
val apiLevel = Build.VERSION.SDK_INT
```

## Camera

```kotlin
val hasCamera = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
val camPerm = ContextCompat.checkSelfPermission(ctx, Manifest.permission.CAMERA)
// granted | denied → map to ProbeResult.cameraPermission
```

Request `CAMERA` only when Viewer opens sight / verify — not on cold start.

## Microphone

```kotlin
val hasMic = packageManager.hasSystemFeature(PackageManager.FEATURE_MICROPHONE)
val micPerm = ContextCompat.checkSelfPermission(ctx, Manifest.permission.RECORD_AUDIO)
```

Request `RECORD_AUDIO` only on first voice / wake use.

## Keystore class

1. Try AndroidKeyStore AES key with `setIsStrongBoxBacked(true)` when API ≥ 28.  
2. On failure, try hardware-backed without StrongBox.  
3. On failure, software / none.

Map to: `strongbox` | `hardware` | `software` | `none`.

## Biometric

```kotlin
val bm = BiometricManager.from(ctx)
when (bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)) {
  BiometricManager.BIOMETRIC_SUCCESS -> "strong"
  else -> check WEAK or "none"
}
```

## Local runtime (T2 hint)

Heuristic only — never require:

- Termux / user-installed terminal with documented TRV paths, **or**  
- Explicit Viewer toggle: “This device runs local Sentinel tools”

Set `localRuntime = true` only when one of those is true.

## Node host opt-in

Separate toggle + on-chain registration. `nodeHostOptIn` does **not** grant unlimited comms by itself.

## Permissions style

| Permission | When to ask |
|------------|-------------|
| CAMERA | First sight / verify action |
| RECORD_AUDIO | First voice / wake |
| POST_NOTIFICATIONS (33+) | First alert subscription |
| Body sensors / location | **Do not** request for tier detection |

## Honesty rule

If probe says `denied` or `none`, UI feature is **off** and copy says so. No spinner that implies Graphene-only magic on stock.
