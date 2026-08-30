import { createFileRoute } from "@tanstack/react-router";
import { Playground } from "@/components/playground/playground";

export const Route = createFileRoute("/")({ component: Home });

const HUB = "https://sentinelsecurityprotocol.grok.me";

function Home() {
  return (
    <>
      <nav
        aria-label="Hub"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
          padding: "0.45rem 0.7rem",
          background: "rgba(8,9,11,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          fontSize: 12,
        }}
      >
        <span style={{ opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Field inside Hub
        </span>
        <a href={`${HUB}/hub`} style={{ color: "#d7e0ea" }}>
          Command
        </a>
        <a href={`${HUB}/hub/shop`} style={{ color: "#d7e0ea" }}>
          TRV shop
        </a>
        <a href={`${HUB}/hub/market`} style={{ color: "#d7e0ea" }}>
          Market
        </a>
        <a href={`${HUB}/hub/friends`} style={{ color: "#d7e0ea" }}>
          Friends
        </a>
        <a href={`${HUB}/hub/live`} style={{ color: "#d7e0ea" }}>
          Live
        </a>
        <a href={`${HUB}/hub/forum`} style={{ color: "#d7e0ea" }}>
          Forum
        </a>
        <a href={`${HUB}/login`} style={{ color: "#d7e0ea" }}>
          Sign in
        </a>
      </nav>
      <Playground />
    </>
  );
}
