# Android capability detection

**Locked with** [`CLIENT-SURFACE.md`](CLIENT-SURFACE.md).  
Goal: **any capable Android phone** reports what it can do; the client enables only that — no fake “on.”

## Tier mapping

| Check | T0 | T1 | T2 (Graphene+) |
|-------|----|----|----------------|
| Network / WebView or browser | required | required | required |
| Secure storage (Keystore / EncryptedSharedPreferences) | best-effort | required for keys | required |
| Microphone | optional | for STT / wake | same + local pipelines |
| Camera | optional | for sight / verify | same + depth if present |
| Biometrics | optional | optional | optional |
| Install unknown apps / sideload | n/a | preferred channel | common |
| Local runtime (Termux-class) | no | no | yes |

Signal strength follows product rule: **lower tier → weaker signal**, never a silent lie.

## Runtime probes (must be real)

1. **Package / API level** — `Build.VERSION.SDK_INT`  
2. **Camera** — `PackageManager.hasSystemFeature(FEATURE_CAMERA_ANY)` + permission state  
3. **Mic** — `FEATURE_MICROPHONE` + `RECORD_AUDIO` granted?  
4. **Keystore** — try generate/load AES key in AndroidKeystore; catch strongbox absence  
5. **Biometric** — `BiometricManager.canAuthenticate(...)`  
6. **Internet** — active network, not “permission only”  
7. **Notifications** — POST_NOTIFICATIONS on 13+  
8. **Background** — battery optimization ignored? (informational)  

Never mark a feature available if the probe failed.

## Permission UX

- Request **only when the Viewer invokes** that feature (not a dump on first launch).  
- Denied → feature off + one clear line of copy (“Mic blocked — voice off”).  
- No dark patterns to force Graphene.

## Output shape (client)

```ts
type DevicePotential = {
  tier: 0 | 1 | 2 | 3;
  apiLevel: number;
  camera: "none" | "denied" | "ready";
  mic: "none" | "denied" | "ready";
  keystore: "none" | "software" | "hardware" | "strongbox";
  biometric: "none" | "weak" | "strong";
  localRuntime: boolean; // Termux-class / user-marked
  signalHint: "weak" | "standard" | "strong";
};
```

`tier` is derived, not user-picked vanity.

## Engineering home

- Spec: this file  
- Scaffold: `clients/android-cap/` (detection module + pure JS/TS mirror for PWA)  
- Chain entitlement stays Solana — device tier does not replace subscription/node
