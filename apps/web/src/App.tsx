import { LOCKED_DOCS, SCAFFOLD_NON_GOALS } from "@trv/shared";

/**
 * Web client entry — SCAFFOLD ONLY.
 * No identity, no credentials, no Vault, no security claims.
 */
export default function App() {
  return (
    <div className="shell">
      <header className="header">
        <h1>The Remote Viewer</h1>
        <p className="badge">Web Client — Scaffold Only</p>
      </header>

      <main className="main">
        <section className="notice">
          <h2>Not production. Not secure yet.</h2>
          <p>
            This application is a structural foundation only. It does not
            implement DIDs, Verifiable Credentials, selective disclosure,
            key management, or Destroy = Restart.
          </p>
          <p>
            All security requirements are defined in the locked documents
            under <code>docs/locked/</code>. Implementation must follow the
            roadmap before any security claim is made.
          </p>
        </section>

        <section>
          <h3>Scaffold non-goals</h3>
          <ul>
            {SCAFFOLD_NON_GOALS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Locked design references</h3>
          <ul className="docs">
            {Object.entries(LOCKED_DOCS).map(([key, path]) => (
              <li key={key}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="phases">
          <h3>Intended next phases (see roadmap)</h3>
          <ol>
            <li>Phase 0 — Foundation &amp; guardrails</li>
            <li>Phase 1 — Core identity primitives (DID, VC, OpenID4VCI/VP)</li>
            <li>Phase 2 — Privacy &amp; selective disclosure (SD-JWT, BBS+)</li>
            <li>Phase 3+ — Keys, EUDI, offline, hardening</li>
          </ol>
        </section>
      </main>

      <footer className="footer">
        <p>YOU CHOOSE TO BURN FOR YOUR PROTECTION</p>
        <p className="sub">Destroy = Restart from Square One</p>
      </footer>
    </div>
  );
}
