# Recursive Loop Hooks

Minimal event schema for the on-device experts (Security / Protocol / Privacy / Coordinator):

```ts
interface OpticalEvent {
  type: "address_created" | "encrypt_ok" | "rdh_embed" | "lt_symbol" | "capture_frame" | "peel_progress" | "transfer_complete" | "transfer_fail";
  timestamp: number;
  metrics?: Record<string, number | string>;
  viewerId?: string;
}
```

Events stay inside the Vault. Experts propose policy changes (LT parameters, RDH strength, quality thresholds). Accepted policy is versioned, attested, and destroyed with Destroy = Restart.
