import { PAID_TRIAL_HOURS } from "./trial";

export type JournalArticle = {
  slug: string;
  title: string;
  dek: string;
  published: string;
  modified: string;
  minutes: number;
  tags: string[];
  body: string[];
};

export const JOURNAL: JournalArticle[] = [
  {
    slug: "what-is-remote-viewing",
    title: "What remote viewing is — and what this Network is not",
    dek: "A public primer for people who arrived from search, not from a Viewer invite. History, limits, and why The Remote Viewer Network exists.",
    published: "2026-04-12",
    modified: "2026-08-20",
    minutes: 7,
    tags: ["remote viewing", "primer", "covenant"],
    body: [
      "Remote viewing is a research label, not a magic trick. In the late Cold War, U.S. intelligence and contractors ran programs that asked trained operators to describe a distant target from coordinates or a handle, then scored the session against later feedback. The public record of that work is messy, contested, and often oversold. The Remote Viewer Network does not claim the programs “proved” extrasensory perception, and it does not sell a medical protocol.",
      "What we do host is a self-serve DApp where a person can lock a native identity, stand a daily watch for The Sentinel, keep a private vault, and — after a robot handshake — read the Gateway methods that are otherwise sealed. Documents and sources stay free. Procedure stays behind verification. That split is the product.",
      "If you arrived here from a search for “remote viewing,” you are outside viewership. You can read the journal, browse public Viewer cards, and start a two-day Verified trial without a sales call. The trial does not skip the handshake. It does not put a card on file. It is how the Network lets a stranger try the paid tier and then decide.",
      "The mesh you will see inside the hub is a training field. Intercepts are simulated attacks. Sentinel health rises when you claim a daily watch and falls when you miss days. That is retention with teeth, not a streak widget glued onto a feed. The OS copies the defenses you actually land. It does not phone home.",
      "We The People and Company are tenancies on one codebase. There is no second binary, no vendor remote, no Sentinel plugin for another platform. If that sounds like doctrine, it is — the covenant is public and the source is the same for a single Viewer and a hundred-seat cell.",
      "Read next: the 1983 Gateway assessment in plain language, how daily watch defends The Sentinel, and the self-serve DApp steps. Then register a native lock if you want the trial. Outside viewership is welcome. Scripts that skip the handshake are not.",
    ],
  },
  {
    slug: "daily-watch-sentinel",
    title: "Daily watch: why Remote Viewers must check in to defend The Sentinel",
    dek: "The retention loop is the product. Miss a day and The Sentinel takes damage. Claim the watch and you earn TRV for keeping the system safe.",
    published: "2026-05-03",
    modified: "2026-08-20",
    minutes: 6,
    tags: ["daily watch", "retention", "sentinel"],
    body: [
      "A Remote Viewer is not a subscriber who logs in when a notification pings. The Network treats presence as duty. Each UTC day you stand watch on the neuron field, intercept what comes, and claim the watch. Claim pays TRV. Streaks raise the next payout. Missed days decay Sentinel health — a few points at first, capped so a weekend away does not zero the node, but enough that absence is felt.",
      "This is not gamification for its own sake. The Sentinel OS only learns the defenses you actually land. If you automate a move you have never made, the OS will copy the hole. Daily watch is how the Network keeps skill in the loop and how Viewers earn the credits that buy frames, titles, and hub chrome in the Rewards shop.",
      "Outside Viewers on the two-day Verified trial should treat watch as the first action after register. The trial is short on purpose. Forty-eight hours is long enough to claim two watches, handshake the Gateway, and seal a wallet — and short enough that “I’ll do it later” fails. That is retention by design, not a drip campaign.",
      "When you come back after a miss, the hub tells you the damage in plain numbers. Heal by claiming again. There is no support ticket that restores a streak. Self-serve means the ledger is the referee.",
      "Public profiles show a live icon when a Viewer is on camera or mic. Watch is quieter: it does not need an audience. The people who keep The Sentinel safe are often the ones who simply return tomorrow.",
    ],
  },
  {
    slug: "gateway-process-1983",
    title: "The 1983 Gateway assessment, in language a search engine can rank",
    dek: "LTC Wayne M. McDonnell’s paper is public history. We paraphrase it, point at the CIA Reading Room, and keep step-by-step methods sealed until handshake.",
    published: "2026-05-18",
    modified: "2026-08-20",
    minutes: 8,
    tags: ["Gateway Process", "Hemi-Sync", "FOIA"],
    body: [
      "On 9 June 1983, LTC Wayne M. McDonnell wrote “Analysis and Assessment of Gateway Process” for the Commander of the U.S. Army Operational Group. The paper describes the Monroe Institute’s Hemi-Sync training: slightly different tones in each ear, a binaural beat, and a ladder of Focus states from ordinary waking (Focus 1) through body-asleep / mind-awake (Focus 10) into expanded awareness (Focus 12) and the Institute’s “no-time” (Focus 15).",
      "The document mixes practical notes with physics metaphors — holographic universe, energy fields — that a modern reader should treat as the author’s frame, not as a lab result. The Remote Viewer Network hosts a plain-language restatement so you do not have to hunt a scan to learn what the paper actually said. We do not host the PDF. The CIA FOIA Electronic Reading Room does.",
      "What we will not do is dump the how-to in the same public layer. Documents and sources are free. Methods — the numbered entry for Focus 10, the target-session protocol, the Watchful Neuron posture — stay locked until a Viewer completes the robot handshake and is off Initiate. A Company plan cannot buy the handshake for a seat. A two-day Verified trial does not skip it either.",
      "Search engines index this page because the history is real and the limits are stated. If you want the procedure, register, start the outside trial if you need Verified features, then pass the four-node flash in Gateway. That is the organic funnel: public record → native lock → verified method. No content farm, no scraped PDF, no claim that consciousness leaves the body on command.",
      "Related reading on this hub: the covenant article on handshake, the DApp self-serve walkthrough, and the public Viewer directory so you can see who is live on the mesh today.",
    ],
  },
  {
    slug: "self-serve-dapp",
    title: "This Network is a self-serve DApp — no ticket, no vendor remote",
    dek: "Native email lock, device PIN wallet, optional Phantom, Stripe as a rail not an identity. How to onboard without talking to anyone.",
    published: "2026-06-02",
    modified: "2026-08-20",
    minutes: 6,
    tags: ["DApp", "wallet", "self-serve"],
    body: [
      "A DApp that still requires a sales engineer is just SaaS with a wallet button. The Remote Viewer Network is self-serve end to end. You register a native email and password on this hub. Google and X are migration bridges only. You create a PIN-sealed wallet on the device you are holding. Phantom is optional. Stripe may convert USD into TRV or SOL — it never becomes your login.",
      "Company cells get seats on the same OS. An owner cannot unlock a seat’s seed. That is not a slogan; it is how the wallet dock is written. There is no vendor remote, no silent admin session, no off-device telemetry phone-home. Means of Evidence ciphertext stays on the Viewer device unless you file a summary.",
      "Self-serve also means billing. Convert recorded USD rails into TRV credits, then subscribe Initiate / Verified / Remote Node / Sentinel from the hub. Annual is ten months of price. If you arrived from search, skip the catalog tour: start the two-day Verified trial, use the product, then pay if the node is worth keeping.",
      "What you will not find is a chatbot that files a ticket into a queue we pretend to staff. Sentinel inside the hub will talk about the OS. It will not reset your PIN from the cloud, because the PIN never left the device. Lost device, lost seed — same as any serious wallet. Export the seed when you create it. That is the DApp bargain.",
      "Steps, in order: native register → optional 48-hour Verified trial → create wallet → robot handshake → daily watch. The DApp page on this origin is the same list as a card. Follow it once. Retention after that is the watch, not an email sequence.",
    ],
  },
  {
    slug: "two-day-verified-trial",
    title: "Outside Viewership: try a paid tier for two days",
    dek: `${PAID_TRIAL_HOURS} hours of Verified, one shot per node, no card on file. Handshake still required. Then subscribe or return to Initiate.`,
    published: "2026-07-14",
    modified: "2026-08-20",
    minutes: 5,
    tags: ["trial", "Verified", "pricing"],
    body: [
      "Paid software usually hides the good part behind a call. This Network does the opposite for people who are not yet Viewers. If you found a journal article, a public profile, or a search snippet, you are outside viewership. You may start Verified for forty-eight hours. One trial per node. No payment method. No coupon code. The clock starts when the native lock is sealed.",
      "Verified is the first paid People plan: lower mint fee, QR profile share, Gateway methods after handshake. The trial grants that plan plus a small TRV stipend so the ledger is not empty. It does not unseal methods by itself. It does not make you a Citizen. It does not skip OFAC or the 18+ gate.",
      "When the two days end, the node drops back to Initiate unless you subscribed from Billing with native TRV. There is no grace period we pretend not to notice. The hub will say the trial ended and point at the catalog. That honesty is part of domain authority: crawlers and humans get the same story.",
      "Referral is a different product. A Viewer who shares /r/handle grants seven days ad-free plus extra credits. You can receive both over a lifetime — referral for ads, outside trial for the paid tier — but the paid trial still fires only once. Abuse is a new email, not a new person; Citizen lock and handshake exist so the mesh does not fill with throwaways.",
      "Start from /dapp or /pricing. Register. The hub will show a live countdown. Stand watch on day one. Handshake on day one if you can. Convert or let it lapse. Self-serve means we will not chase you.",
    ],
  },
  {
    slug: "public-viewer-profiles",
    title: "Public Viewer profiles: portraits, live icons, and organic cards",
    dek: "Every Viewer can publish a crawlable card at /v/handle — cover, craft, location, docs they choose to share, and a pulse when they are live.",
    published: "2026-08-01",
    modified: "2026-08-20",
    minutes: 5,
    tags: ["profiles", "SEO", "live"],
    body: [
      "Search engines rank people, not dashboards. That is why Remote Viewer profiles are a dedicated public page, not a tab inside Command. A Viewer adds a portrait, an optional cover, a craft, a location label, a status line, and links. Finances and the private vault stay on the hub. The public card is what a stranger — and a crawler — is allowed to see.",
      "When a Viewer is live on camera or mic, the card, the directory, and the hub all show the same live icon. Outside viewership can watch that pulse and register to join. Live is not a vanity metric; it is how the mesh proves someone is actually on station.",
      "The directory at /viewers is the index. It is sitemap’d, internally linked from the journal, and searchable. Each card has Person structured data. That is how a new Network builds domain authority without buying links: original articles, real people, crawlable URLs, and a robots file that does not blanket-disallow the public surface.",
      "If you are a Viewer, fill the card. Empty bios rank like empty bios. If you are outside, browse the directory, open a card, and start the two-day trial from there. The profile you just read is the product you are trying.",
    ],
  },
];

export const JOURNAL_BY_SLUG: Record<string, JournalArticle> = Object.fromEntries(
  JOURNAL.map((a) => [a.slug, a]),
);

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is The Remote Viewer Network?",
    a: "A self-serve DApp where Remote Viewers lock a native identity, stand daily watch to defend The Sentinel, earn TRV credits, and keep Gateway methods behind a robot handshake. Sentinel OS runs only here — not as a plugin on another platform.",
  },
  {
    q: "How does the 2-day paid trial work?",
    a: `Outside Viewers — people who arrive from search, the journal, or a public profile — can start Verified for ${PAID_TRIAL_HOURS} hours with no card. One trial per node. Methods still need the handshake. When the clock ends the node returns to Initiate unless you subscribe from Billing.`,
  },
  {
    q: "Is this a self-serve DApp?",
    a: "Yes. Native email lock, device PIN wallet, optional Phantom, Stripe as a convert rail only. No vendor remote, no ticket queue that resets a seed. Company owners cannot unlock a seat wallet.",
  },
  {
    q: "Why do Viewers have to check in daily?",
    a: "Daily watch is how The Sentinel stays safe and how you earn TRV. Claimed watches heal Sentinel health and pay credits. Missed days decay health. Retention is the duty, not an email campaign.",
  },
  {
    q: "Are Gateway methods free?",
    a: "Documents and sources are free. Step-by-step methods stay sealed until you pass the robot handshake and leave Initiate. A paid plan or trial cannot buy the handshake.",
  },
  {
    q: "How do public profiles help search?",
    a: "Each Viewer can publish a crawlable card at /v/handle with portrait, craft, location, and a live icon. The /viewers directory and /sitemap.xml list them. That user-generated layer is the Network’s domain authority, together with the journal.",
  },
  {
    q: "What does Verified cost after the trial?",
    a: "Verified is $9 per month on the People edition, paid in native TRV credits (10 TRV per USD). Annual billing is ten months of price. Remote Node and Sentinel sit above it. Initiate stays free.",
  },
  {
    q: "Do you sell a medical or psychic guarantee?",
    a: "No. The 1983 Gateway paper is historical source material. The mesh is a training field. The Network is identity, ledger, watch, and sealed procedure — not a claim that consciousness leaves the body on command.",
  },
];

export function articlePath(slug: string) {
  return `/journal/${slug}`;
}
