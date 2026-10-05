import { INSTALL_TUTORIALS } from "@/lib/trv/install-tutorial";

/** Tutorials for this install. They stay on screen when the app is open. */
export function InstallTutorial() {
  return (
    <section className="border-b border-border bg-card px-4 py-4" aria-label="Install tutorial">
      <h2 className="font-display text-lg">Install tutorial</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        {INSTALL_TUTORIALS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
