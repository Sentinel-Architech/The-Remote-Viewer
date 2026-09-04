import { createServerFn } from "@tanstack/react-start";

export const REPAIR_REPOS = [
  { id: "trv", owner: "Sentinel-Architech", name: "The-Remote-Viewer", label: "TRV" },
  { id: "df", owner: "Sentinel-Architech", name: "TheSentinel", label: "Front" },
] as const;

export type RepairRepoId = (typeof REPAIR_REPOS)[number]["id"];

export type GhIssue = {
  number: number;
  title: string;
  body: string;
  url: string;
  labels: string[];
  updated: string;
};

export type RepairVerdict = "bug" | "enhancement" | "needs-info" | "wontfix";
export type RepairSeverity = "snap" | "pulse" | "watch";

export type RepairRun = {
  repo: RepairRepoId;
  number: number;
  title: string;
  url: string;
  verdict: RepairVerdict;
  severity: RepairSeverity;
  summary: string;
  plan: string[];
  patch: string;
  files: string[];
  status: "diagnosed" | "cached";
};

const HOUR_CAP = 8;
const ARM_CAP = 2;
const BODY_CAP = 3500;
const TOKEN_CAP = 900;

const LAST_KNOWN: Record<RepairRepoId, GhIssue[]> = {
  trv: [
    {
      number: 55,
      title: "Live hub verification 2026-08-27 — first-win path + dark /hub/node",
      body: "/hub/node is dark on sentinelsecurityprotocol.grok.me. apps/hub route exists in git. Host publish is behind git. Track A stays in #49. Do not invent LIVE. First-win not independently proven.",
      url: "https://github.com/Sentinel-Architech/The-Remote-Viewer/issues/55",
      labels: [],
      updated: "2026-08-27T17:54:13Z",
    },
    {
      number: 49,
      title: "Track A remains scaffold — cannot promote from the hub sandbox",
      body: "trv_governance on Solana needs an Anchor build host. Ed25519 keys in the hub do not deploy a program. Parked: Android Keystore, Wear, entitlement RPC, integrity rails. Do not implement wallets or contracts from Command Deck.",
      url: "https://github.com/Sentinel-Architech/The-Remote-Viewer/issues/49",
      labels: [],
      updated: "2026-08-23T01:49:48Z",
    },
  ],
  df: [],
};

export type IssueList = { issues: GhIssue[]; source: "live" | "cache" };

function repoOf(id: unknown) {
  const found = REPAIR_REPOS.find((r) => r.id === id);
  if (!found) throw new Error("Repo rejected");
  return found;
}

function clampInt(n: unknown, min: number, max: number) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

type RawIssue = {
  number: number;
  title: string;
  body?: string | null;
  html_url: string;
  pull_request?: unknown;
  labels?: { name?: string }[] | string[];
  updated_at: string;
};

function mapIssue(raw: RawIssue): GhIssue | null {
  if (raw.pull_request) return null;
  const labels = (raw.labels ?? []).map((l) => (typeof l === "string" ? l : l.name ?? "")).filter(Boolean);
  return {
    number: raw.number,
    title: String(raw.title ?? "").slice(0, 180),
    body: String(raw.body ?? "").slice(0, BODY_CAP),
    url: raw.html_url,
    labels,
    updated: raw.updated_at,
  };
}

async function github<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TRV-Sentinel-Repair",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json() as Promise<T>;
}

type Sql = Awaited<ReturnType<typeof import("@/lib/db").getSql>>;

function rowToIssue(row: {
  number: number;
  title: string;
  body: string;
  url: string;
  labels: string;
  updated: string;
}): GhIssue {
  let labels: string[] = [];
  try {
    labels = parseFiles(JSON.parse(row.labels));
  } catch {
    labels = [];
  }
  return {
    number: row.number,
    title: row.title,
    body: row.body,
    url: row.url,
    labels,
    updated: row.updated,
  };
}

async function readIssueCache(sql: Sql, repo: RepairRepoId, freshOnly = false): Promise<GhIssue[]> {
  try {
    const rows = freshOnly
      ? await sql<{
          number: number;
          title: string;
          body: string;
          url: string;
          labels: string;
          updated: string;
        }>`
          select number, title, body, url, labels, updated
          from repair_issue
          where repo = ${repo} and fetched_at > now() - interval '10 minutes'
          order by updated desc
        `
      : await sql<{
          number: number;
          title: string;
          body: string;
          url: string;
          labels: string;
          updated: string;
        }>`
          select number, title, body, url, labels, updated
          from repair_issue
          where repo = ${repo}
          order by updated desc
        `;
    return rows.map(rowToIssue);
  } catch {
    return [];
  }
}

async function writeIssueCache(sql: Sql, repo: RepairRepoId, issues: GhIssue[]) {
  try {
    for (const issue of issues) {
      await sql`
        insert into repair_issue (repo, number, title, body, url, labels, updated, fetched_at)
        values (
          ${repo}, ${issue.number}, ${issue.title}, ${issue.body}, ${issue.url},
          ${JSON.stringify(issue.labels)}, ${issue.updated}, now()
        )
        on conflict (repo, number) do update set
          title = excluded.title,
          body = excluded.body,
          url = excluded.url,
          labels = excluded.labels,
          updated = excluded.updated,
          fetched_at = now()
      `;
    }
  } catch {
    /* cache is optional when the table is not applied yet */
  }
}

async function listFromGithub(id: RepairRepoId): Promise<IssueList> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const fresh = await readIssueCache(sql, id, true);
  if (fresh.length) return { issues: fresh, source: "cache" };
  const spec = repoOf(id);
  try {
    const rows = await github<RawIssue[]>(
      `/repos/${spec.owner}/${spec.name}/issues?state=open&per_page=20&sort=updated`,
    );
    const issues = rows.map(mapIssue).filter((x): x is GhIssue => Boolean(x));
    await writeIssueCache(sql, id, issues);
    return { issues, source: "live" };
  } catch {
    const stale = await readIssueCache(sql, id, false);
    const issues = stale.length ? stale : LAST_KNOWN[id];
    if (issues.length) await writeIssueCache(sql, id, issues);
    return { issues, source: "cache" };
  }
}

async function loadIssue(sql: Sql, repo: RepairRepoId, number: number): Promise<GhIssue | null> {
  try {
    const cached = await sql<{
      number: number;
      title: string;
      body: string;
      url: string;
      labels: string;
      updated: string;
    }>`
      select number, title, body, url, labels, updated
      from repair_issue
      where repo = ${repo} and number = ${number}
    `;
    if (cached[0]) return rowToIssue(cached[0]);
  } catch {
    /* table may not exist yet */
  }
  const spec = repoOf(repo);
  try {
    const raw = await github<RawIssue>(`/repos/${spec.owner}/${spec.name}/issues/${number}`);
    const issue = mapIssue(raw);
    if (issue) await writeIssueCache(sql, repo, [issue]);
    return issue;
  } catch {
    return LAST_KNOWN[repo].find((i) => i.number === number) ?? null;
  }
}

function parsePlan(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s).slice(0, 240)).filter(Boolean).slice(0, 8);
}

function parseFiles(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s).slice(0, 160)).filter(Boolean).slice(0, 12);
}

function parseVerdict(raw: unknown): RepairVerdict {
  const v = String(raw ?? "");
  if (v === "enhancement" || v === "needs-info" || v === "wontfix" || v === "bug") return v;
  return "needs-info";
}

function parseSeverity(raw: unknown): RepairSeverity {
  const v = String(raw ?? "");
  if (v === "snap" || v === "pulse" || v === "watch") return v;
  return "pulse";
}

function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function hourCount(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>, hour: string) {
  const rows = await sql<{ count: number }>`select count from repair_quota where hour_key = ${hour}`;
  return Number(rows[0]?.count) || 0;
}

async function bumpHour(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>, hour: string) {
  await sql`
    insert into repair_quota (hour_key, count) values (${hour}, 1)
    on conflict (hour_key) do update set count = repair_quota.count + 1
  `;
}

async function readRun(
  sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>,
  repo: RepairRepoId,
  number: number,
): Promise<RepairRun | null> {
  const rows = await sql<{
    repo: string;
    number: number;
    title: string;
    url: string;
    verdict: string;
    severity: string;
    summary: string;
    plan: string;
    patch: string;
    files: string;
  }>`
    select repo, number, title, url, verdict, severity, summary, plan, patch, files
    from repair_run
    where repo = ${repo} and number = ${number}
  `;
  const row = rows[0];
  if (!row) return null;
  let plan: string[] = [];
  let files: string[] = [];
  try {
    plan = parsePlan(JSON.parse(row.plan));
  } catch {
    plan = [];
  }
  try {
    files = parseFiles(JSON.parse(row.files));
  } catch {
    files = [];
  }
  return {
    repo,
    number: row.number,
    title: row.title,
    url: row.url,
    verdict: parseVerdict(row.verdict),
    severity: parseSeverity(row.severity),
    summary: row.summary,
    plan,
    patch: row.patch,
    files,
    status: "cached",
  };
}

async function writeRun(sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>, run: RepairRun) {
  await sql`
    insert into repair_run (repo, number, title, url, verdict, severity, summary, plan, patch, files, status, created_at)
    values (
      ${run.repo}, ${run.number}, ${run.title}, ${run.url}, ${run.verdict}, ${run.severity},
      ${run.summary}, ${JSON.stringify(run.plan)}, ${run.patch}, ${JSON.stringify(run.files)}, 'diagnosed', now()
    )
    on conflict (repo, number) do update set
      title = excluded.title,
      url = excluded.url,
      verdict = excluded.verdict,
      severity = excluded.severity,
      summary = excluded.summary,
      plan = excluded.plan,
      patch = excluded.patch,
      files = excluded.files,
      status = excluded.status,
      created_at = now()
  `;
}

async function diagnose(issue: GhIssue, repo: RepairRepoId): Promise<RepairRun> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return {
      repo,
      number: issue.number,
      title: issue.title,
      url: issue.url,
      verdict: "needs-info",
      severity: "watch",
      summary: "Repair AI is not available in this environment.",
      plan: ["Keep the issue open.", "Retry Repair when AI is live."],
      patch: "",
      files: [],
      status: "diagnosed",
    };
  }
  const spec = repoOf(repo);
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: TOKEN_CAP,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Sentinel Repair, the self-defense bot for The Remote Viewer DApp (Command Deck) and Defense Front. Native web stack A–Z. No wallets, no Google identity, no contracts/FHE/Stripe, no Solana/Anchor programs. Dual theaters: Neural Link + God's Eye orbit, never human bodies. Diagnose GitHub issues and return JSON only with keys verdict (bug|enhancement|needs-info|wontfix), severity (snap|pulse|watch), summary, plan (string array), files (paths), patch (unified diff or exact edits). If the issue is host republish, Track A, parked chain work, or needs a wallet, verdict needs-info or wontfix and leave patch empty. Do not invent LIVE.",
        },
        {
          role: "user",
          content: `Repo ${spec.owner}/${spec.name} issue #${issue.number}\nTitle: ${issue.title}\nLabels: ${issue.labels.join(", ") || "none"}\n\n${issue.body || "(no body)"}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Repair AI ${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const parsed = extractJson(body.choices?.[0]?.message?.content ?? "");
  if (!parsed) throw new Error("Repair AI returned no plan");
  const { boundRepairText } = await import("@/lib/affairs");
  const bound = boundRepairText(
    String(parsed.summary ?? ""),
    String(parsed.patch ?? ""),
    JSON.stringify(parsed.plan ?? []),
    JSON.stringify(parsed.files ?? []),
  );
  if (bound.held) {
    return {
      repo,
      number: issue.number,
      title: issue.title,
      url: issue.url,
      verdict: "wontfix",
      severity: "watch",
      summary: `Internal Affairs held this repair. ${bound.reason}`,
      plan: ["Leave the patch empty.", "Stay on the native stack."],
      patch: "",
      files: [],
      status: "diagnosed",
    };
  }
  return {
    repo,
    number: issue.number,
    title: issue.title,
    url: issue.url,
    verdict: parseVerdict(parsed.verdict),
    severity: parseSeverity(parsed.severity),
    summary: String(parsed.summary ?? "Diagnosed.").slice(0, 400),
    plan: parsePlan(parsed.plan),
    patch: String(parsed.patch ?? "").slice(0, 8000),
    files: parseFiles(parsed.files),
    status: "diagnosed",
  };
}

export const listIssues = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ repo: repoOf((input as { repo?: unknown })?.repo).id }))
  .handler(async ({ data }) => {
    return listFromGithub(data.repo);
  });

export const listRepairs = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ repo: repoOf((input as { repo?: unknown })?.repo).id }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    let rows: {
      repo: string;
      number: number;
      title: string;
      url: string;
      verdict: string;
      severity: string;
      summary: string;
      plan: string;
      patch: string;
      files: string;
    }[] = [];
    try {
      rows = await sql<{
        repo: string;
        number: number;
        title: string;
        url: string;
        verdict: string;
        severity: string;
        summary: string;
        plan: string;
        patch: string;
        files: string;
      }>`
        select repo, number, title, url, verdict, severity, summary, plan, patch, files
        from repair_run
        where repo = ${data.repo}
        order by created_at desc
        limit 24
      `;
    } catch {
      return [];
    }
    return rows.map((row) => {
      let plan: string[] = [];
      let files: string[] = [];
      try {
        plan = parsePlan(JSON.parse(row.plan));
      } catch {
        plan = [];
      }
      try {
        files = parseFiles(JSON.parse(row.files));
      } catch {
        files = [];
      }
      return {
        repo: data.repo,
        number: row.number,
        title: row.title,
        url: row.url,
        verdict: parseVerdict(row.verdict),
        severity: parseSeverity(row.severity),
        summary: row.summary,
        plan,
        patch: row.patch,
        files,
        status: "cached" as const,
      } satisfies RepairRun;
    });
  });

export const dispatchRepair = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { repo?: unknown; number?: unknown };
    return { repo: repoOf(raw.repo).id, number: clampInt(raw.number, 1, 1_000_000) };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const cached = await readRun(sql, data.repo, data.number);
    if (cached) return cached;
    const hour = new Date().toISOString().slice(0, 13);
    const used = await hourCount(sql, hour);
    if (used >= HOUR_CAP) throw new Error("Repair quota holds until the next hour.");
    const issue = await loadIssue(sql, data.repo, data.number);
    if (!issue) throw new Error("Issue rejected");
    await bumpHour(sql, hour);
    const run = await diagnose(issue, data.repo);
    await writeRun(sql, run);
    return run;
  });

export const armRepair = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ repo: repoOf((input as { repo?: unknown })?.repo).id }))
  .handler(async ({ data }) => {
    const listed = await listFromGithub(data.repo);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const done = await sql<{ number: number }>`select number from repair_run where repo = ${data.repo}`;
    const seen = new Set(done.map((r) => r.number));
    const pending = listed.issues.filter((i) => !seen.has(i.number)).slice(0, ARM_CAP);
    const runs: RepairRun[] = [];
    for (const issue of pending) {
      const hour = new Date().toISOString().slice(0, 13);
      const used = await hourCount(sql, hour);
      if (used >= HOUR_CAP) break;
      await bumpHour(sql, hour);
      const run = await diagnose(issue, data.repo);
      await writeRun(sql, run);
      runs.push(run);
    }
    return { armed: pending.length, runs };
  });
