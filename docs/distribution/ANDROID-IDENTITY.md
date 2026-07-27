# Android package identity (frozen)

**Updated:** 2026-07-27  
**Status:** Locked for the public TRV Android lineage

---

## Locked values

| Field | Value |
|-------|--------|
| **applicationId** (package name) | `com.sentinelarchetecht.theremoteviewer` |
| **Display name** (launcher label) | `The Remote Viewer` |
| **Signing** | One production keystore for this applicationId for the life of the lineage — never commit the keystore |

These are the identifiers Obtainium, sideload updates, and any future store listing must use for **in-place updates**.

Changing `applicationId` later creates a **different app** (users must uninstall/reinstall; data lineage is not continuous).

Display name may be adjusted later without breaking updates.

---

## Expo / config mapping

When setting mobile config:

```json
{
  "expo": {
    "name": "The Remote Viewer",
    "slug": "the-remote-viewer",
    "android": {
      "package": "com.sentinelarchetecht.theremoteviewer"
    }
  }
}
```

---

## Related

- `docs/public/RELEASE-HYGIENE.md`
- `docs/distribution/obtainium-catalog.example.json`
- `docs/distribution/OBTAINIUM-CROWDSOURCE.md`
