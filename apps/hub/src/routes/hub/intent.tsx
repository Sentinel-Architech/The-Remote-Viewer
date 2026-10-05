import { createFileRoute } from "@tanstack/react-router";
import { IntentBar } from "@/components/intent-bar";
import { PasskeyPanel } from "@/components/passkey-panel";
import { WakePhrase } from "@/components/wake-phrase";

type IntentSearch = { want: string };

export const Route = createFileRoute("/hub/intent")({
  validateSearch: (search: Record<string, unknown>): IntentSearch => ({
    want: typeof search.want === "string" ? search.want : "",
  }),
  component: IntentPage,
});

function IntentPage() {
  const { want } = Route.useSearch();
  return (
    <div className="p-5 md:p-8">
      <div className="space-y-6 pb-40">
        <IntentBar initialWant={want} />
        <PasskeyPanel />
        <WakePhrase />
      </div>
    </div>
  );
}
