/**
 * Operator ping when a Remote Viewer account is created.
 * Never imported from client code.
 * No-ops unless OPERATOR_NOTIFY_EMAIL + RESEND_API_KEY are set.
 */
type CreatedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  createdAt?: Date | string | null;
};

const trim = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

export async function notifyOperatorNewViewer(user: CreatedUser): Promise<void> {
  const to = trim("OPERATOR_NOTIFY_EMAIL");
  const apiKey = trim("RESEND_API_KEY");
  if (!to || !apiKey) return;

  const from =
    trim("NOTIFY_FROM_EMAIL") ?? "Sentinel Hub <onboarding@resend.dev>";
  const created =
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : (user.createdAt ?? new Date().toISOString());

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New Remote Viewer: ${user.email ?? user.id}`,
      text: [
        "New Viewer account created.",
        `id: ${user.id}`,
        `email: ${user.email ?? "(none)"}`,
        `name: ${user.name ?? "(none)"}`,
        `createdAt: ${created}`,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("viewer-signup-notify failed", res.status, body);
  }
}
