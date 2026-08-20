/**
 * Operating ledger — not a law firm, not a claim that every EO since 2023
 * applies to a browser hub. Most orders (tariffs, personnel, energy) do not.
 * These are the ones that actually constrain a US social / AI / credits node.
 */
export const EO_LEDGER = [
  {
    id: "14149",
    date: "2025-01-20",
    title: "EO 14149 — Restoring Freedom of Speech and Ending Federal Censorship",
    does: "No viewpoint-secret bans. No government-directed takedown channel. Adult blur is age/consent gating, not a politics filter. Hidden faith/identity bans are refused because they would be a backdoor in source.",
    cannot: "This hub is not a federal agency. The EO binds the government, not private speech codes. We still remove CSAM and NCII because statute requires it — that is not censorship of protected speech.",
  },
  {
    id: "14179",
    date: "2025-01-23",
    title: "EO 14179 — Removing Barriers to American Leadership in Artificial Intelligence",
    does: "The personal Sentinel is not compelled to alter truthful outputs for ideology. AI replies are labeled. Use is Viewer-initiated.",
    cannot: "We cannot certify a federal AI procurement. Sentinel is a Viewer knight, not a government model.",
  },
  {
    id: "ai-framework",
    date: "2025-12-11",
    title: "EO — Ensuring a National Policy Framework for Artificial Intelligence",
    does: "Child safety (18+ hub, no under-age accounts). No compelled model-lying. Copyright attestation on native mints. Communities: Hydra for harm against innocents.",
    cannot: "A uniform federal AI statute is Congress’s job. We do not watermark speech to please a state disclosure law that would force the knight to lie.",
  },
  {
    id: "14117",
    date: "2024-02-28",
    title: "EO 14117 — Bulk sensitive personal data and countries of concern",
    does: "Government ID images and M-o-E stay on-device. Citizen lock stores a one-way hash, not the card. No Onfido/Persona/Jumio (that would ship US PII to a vendor). No foreign-adversary KYC.",
    cannot: "We cannot police every CDN hop on the public internet. Shield is in-hub TLS, not a classified enclave.",
  },
  {
    id: "pafaca",
    date: "2025-01 → 2026-01",
    title: "PAFACA / TikTok EOs — foreign-adversary controlled applications",
    does: "TRV is a US-native hub. No ByteDance SDK. TikTok migration is copy-paste of the Viewer’s own words, not embedding their app.",
    cannot: "We are not TikTok USDS. We do not load adversary-controlled binaries.",
  },
  {
    id: "fintech-2026",
    date: "2026-05-19",
    title: "EO — Integrating Financial Technology Innovation into Regulatory Frameworks",
    does: "Stripe is a settlement rail. TRV credits are in-hub points, not an FDIC deposit and not a claimed bank. Wallets stay on-device. OFAC attestation is required.",
    cannot: "This preview is not a licensed money transmitter or a Federal Reserve master account. Live USD movement needs Stripe (or another licensed rail) at publish.",
  },
  {
    id: "ai-security-2026",
    date: "2026-06-02",
    title: "EO — Promoting Advanced AI Innovation and Security",
    does: "Criminal misuse is refused: no CSAM generation, no NCII. Hydra + NCMEC CyberTipline. Sentinel will not help commit a crime.",
    cannot: "We cannot place a 911 call or file a CyberTip as a federal ESP until this node is a real deployed service with a registered contact.",
  },
  {
    id: "14110-revoked",
    date: "2023-10-30 (revoked 2025)",
    title: "EO 14110 — Safe, Secure, Trustworthy AI (revoked by 14179)",
    does: "We keep what still maps to statute: AI labeling, child safety, no deceptive deepfakes of a Viewer without consent.",
    cannot: "We do not implement the revoked order’s compelled-speech / watermark-as-politics pieces. Following a revoked EO against 14179 would be the contradiction.",
  },
] as const;

export const STATUTE_GAPS = [
  {
    id: "coppa",
    title: "COPPA / 18+ hub",
    body: "The Remote Viewer is 18 or older. Under-13 collection is refused. Adult, cannabis, and live camera are adult-only. This is an attestation, not a credit-bureau age API.",
  },
  {
    id: "csam",
    title: "18 U.S.C. 2258A / CSAM",
    body: "Do not upload, generate, or store child sexual abuse material. Report at NCMEC CyberTipline. Originals never belong on this server — Hydra hashes and censors outbound copies.",
  },
  {
    id: "ncii",
    title: "NCII / TAKE IT DOWN",
    body: "Non-consensual intimate imagery can be flagged. The post is sealed from the commons. That is a victim takedown path, not a politics filter.",
  },
  {
    id: "ofac",
    title: "OFAC / sanctions",
    body: "Viewers attest they are not on the SDN list and not otherwise prohibited from US commerce. We do not silently phone a screening vendor (that would be a backdoor). Repeat fraud burns the citizen hash.",
  },
] as const;

export const NCMEC_TIP = "https://report.cybertip.org/";
export const NCMEC_NAME = "NCMEC CyberTipline";
