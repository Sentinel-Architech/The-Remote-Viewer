export type GatewayDoc = {
  id: string;
  title: string;
  kind: "document" | "source" | "method";
  summary: string;
  body: string;
  locked: boolean;
};

export const GATEWAY_DOCS: GatewayDoc[] = [
  {
    id: "analysis-1983",
    title: "Analysis and Assessment of Gateway Process",
    kind: "document",
    summary: "Declassified U.S. Army Intelligence paper, 9 June 1983.",
    locked: false,
    body: `The Gateway Process is a training system developed by the Monroe Institute to induce altered states of consciousness through hemispheric synchronization (Hemi-Sync). In 1983, LTC Wayne M. McDonnell of U.S. Army Intelligence wrote an assessment of the program for the Commander of the U.S. Army Operational Group.

The paper is a public historical document. It is not a medical protocol, not a weapon, and not a promise of extrasensory results. The Remote Viewer hosts it as source material so every Viewer can read what the archive actually says.

McDonnell frames Gateway as an attempt to bring the two cerebral hemispheres into coherent phase, then use that coherence to move awareness through a sequence of Focus levels. The document mixes physics metaphors (holographic universe, energy fields) with practical notes from the Institute's residential program.

TRV's position: the document is free. The history is free. The sources are free. Step-by-step methods — the actual how of each exercise — stay sealed until a Viewer completes the robot handshake and upgrades off Initiate. That split is deliberate: knowledge is public; trained procedure is verified.`,
  },
  {
    id: "hemi-sync",
    title: "Hemi-Sync — what the document claims",
    kind: "document",
    summary: "Binaural-beat method described in the 1983 assessment.",
    locked: false,
    body: `Hemi-Sync presents slightly different frequencies to each ear. The brain is said to supply a third, difference frequency (the binaural beat) and, with training, to bring left and right hemispheres into a shared electrical pattern.

The 1983 paper treats this as a mechanical aid, not magic: a way to quiet the left-hemisphere running commentary long enough for a more holistic, right-hemisphere mode to participate. Gateway then uses that state as a launch point for Focus work.

Publicly described Focus labels (from the Institute and the assessment):

• Focus 10 — mind awake, body asleep
• Focus 12 — expanded awareness
• Focus 15 — no-time
• Focus 21 — edge of time-space

These names are historical vocabulary. They are listed here so a Viewer can read the document without a glossary. They are not instructions.`,
  },
  {
    id: "focus-map",
    title: "Focus map (names only)",
    kind: "document",
    summary: "The publicly named Focus states, without procedure.",
    locked: false,
    body: `Focus 1 — ordinary waking baseline.
Focus 10 — body sleep / mind awake. The Gateway entry state.
Focus 12 — expanded awareness; the document discusses remote viewing from this band.
Focus 15 — “no-time,” described as a state where linear sequence loosens.
Focus 21 — the far edge of the time-space overlay, as the Institute named it.

Later Institute catalogs add further Focus numbers. TRV does not invent them. This page only restates names that already appear in the public record.

Hover a method in the ledger to see that a procedure exists. Opening the procedure requires Verified Viewer.`,
  },
  {
    id: "cia-reading-room",
    title: "CIA Reading Room — primary source",
    kind: "source",
    summary: "Where the declassified PDF lives.",
    locked: false,
    body: `Primary source: CIA Freedom of Information Act Electronic Reading Room, document commonly titled “Analysis and Assessment of Gateway Process,” dated 9 June 1983.

Related public sources:
• Monroe Institute public descriptions of Hemi-Sync and Focus labels
• U.S. Army Intelligence / INSCOM historical context for the assessment
• Later FOIA releases that cite the same paper

TRV does not host a scanned PDF here (copyright and file size). We paraphrase the declassified paper in plain language and point at the Reading Room so you can read the original pages yourself. That is the free layer.`,
  },
  {
    id: "what-trv-is-not",
    title: "What The Remote Viewer is not",
    kind: "source",
    summary: "Doctrine, so the DApp does not contradict itself.",
    locked: false,
    body: `The Remote Viewer is a sovereign hub: identity, creation, mesh defense drill, and a native ledger. It is not a medical device. It is not a claim that consciousness leaves the body on command. It is not a government program.

The neuron / galaxy / mesh simulation is a training field. Attacks you intercept there are simulated. The Sentinel OS “learns” by recording your defenses and increasing its autonomy inside this hub — not by silently running on other people's machines.

Sentinel Shield is an in-hub encrypted browsing tunnel. A browser cannot install a kernel VPN. We do not pretend otherwise. The Shield does encrypt hub fetches, strip trackers, and keep Means of Evidence on your device.

Means of Evidence (M-o-E) is yours. Camera, microphone, and telemetry are sealed locally unless you file a summary. Corporate identity bridges (Google, X) are optional and discouraged. Native TRV email + password is the lock we recommend.`,
  },
  {
    id: "method-focus-10",
    title: "Method: Focus 10 entry",
    kind: "method",
    summary: "Step-by-step entry. Sealed until Verified Viewer.",
    locked: true,
    body: `1. Sit or lie where you will not be interrupted. Native TRV Shield on; notifications off.
2. Run a slow physical inventory from the feet upward, naming release rather than tension.
3. Establish a binaural bed (Hemi-Sync or a verified 4–7 Hz difference). Do not chase volume.
4. On the out-breath, repeat the Gateway cue for body-sleep / mind-awake until the body is unresponsive and the count remains crisp.
5. Hold the state without narration. If the left hemisphere starts a story, return to breath count.
6. Exit on a count of five, move the body, and log the session in M-o-E as a private note.

This is training language from the public Gateway frame, written as procedure. It is not a medical claim.`,
  },
  {
    id: "method-focus-12",
    title: "Method: Focus 12 expansion",
    kind: "method",
    summary: "Expanded awareness drill. Sealed until Verified Viewer.",
    locked: true,
    body: `1. Enter and stabilize Focus 10 first. Do not skip the body-asleep lock.
2. Widen the attentional field as if peripheral vision were opening behind the eyes.
3. Place a single target (a place, a question, a mesh node) at the edge of that field — not in the center.
4. Receive; do not interrogate. Note raw impressions in the order they arrive.
5. After the window, write the impressions before you interpret them.
6. Compare later against a known control. The Sentinel drill uses this same receive-then-log pattern on simulated attacks.`,
  },
  {
    id: "method-focus-15",
    title: "Method: Focus 15 no-time",
    kind: "method",
    summary: "No-time overlay. Sealed until Verified Viewer.",
    locked: true,
    body: `1. Only from a clean Focus 12. If the body is restless, stop.
2. Release sequence: drop the clock, then the calendar, then the need for a next step.
3. Hold a still point. If narrative time reasserts, return to breath and re-enter 12.
4. Do not perform tasks in 15. The method is presence without sequence.
5. Exit through 12 then 10. Never snap out.
6. Log: duration felt vs. duration measured. That delta is the only metric TRV cares about.`,
  },
  {
    id: "method-rv-target",
    title: "Method: remote-viewing target session",
    kind: "method",
    summary: "A single target pass. Sealed until Verified Viewer.",
    locked: true,
    body: `1. Native lock on. M-o-E ready for a written log, not a live stream.
2. Blind target: a handle or coordinate you did not choose. A second Viewer may assign it.
3. Enter Focus 12. Take the target as a felt shape, not a guessed noun.
4. Sketch or list sensory fragments only (temperature, motion, edge, color).
5. Close the session before you look at feedback.
6. File the log locally. Optional: post a redacted sketch as a TRV-native NFT, never the raw target id.`,
  },
  {
    id: "method-sentinel-watch",
    title: "Method: Watchful Neuron posture",
    kind: "method",
    summary: "How TRV maps Gateway posture onto mesh defense. Sealed.",
    locked: true,
    body: `1. Treat the Watchful Neuron sim as a Focus-10 body: still core, mobile attention.
2. Pointer = awareness. Pulse = a named intercept, not panic.
3. After each wave, open R&D and spend XP on Sentinel autonomy — the OS only learns what you actually intercept.
4. When God's eye unlocks, switch to the globe and practice the same receive-then-act loop at planetary scale.
5. Never automate a defense you have not personally landed at least once. The Sentinel will copy your habits, including the bad ones.
6. Log breaches in M-o-E. Healing the Sentinel is an R&D spend, not a refresh.`,
  },
];

export function docsForTier(verified: boolean): GatewayDoc[] {
  return GATEWAY_DOCS.map((d) =>
    d.kind === "method" && !verified ? { ...d, body: "" } : d,
  );
}
