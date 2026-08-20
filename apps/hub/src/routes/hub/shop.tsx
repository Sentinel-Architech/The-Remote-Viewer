import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { buyShopItem, equipShopItem, listMyShop } from "@/lib/trv/commons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hub/shop")({ component: ShopPage });

function ShopPage() {
  const { profile, setProfile } = useViewer();
  const [items, setItems] = useState<Awaited<ReturnType<typeof listMyShop>>>([]);

  async function refresh() {
    setItems(await listMyShop());
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Rewards</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          TRV is the reward for standing daily watch. Defend The Sentinel, claim
          credits, spend them here. USD never spends in this shop — convert in
          Billing only if you need more than the watch pays.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="native">{profile?.credits ?? 0} TRV</Badge>
          {profile?.citizenAt ? <Badge variant="native">15% citizen discount</Badge> : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/hub/citizen">Unlock citizen prices</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="secondary">
            <Link to="/hub/billing">Convert USD → TRV</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const equipped =
            profile?.shopFrame === item.id ||
            profile?.shopTitle === item.id ||
            profile?.shopChrome === item.id;
          return (
            <article key={item.id} className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.slot}</p>
              <h2 className="mt-1 font-display text-xl">{item.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.tag}</p>
              <p className="mt-3 font-mono text-sm tabular-nums">
                {item.price} TRV
                {item.listPrice && item.listPrice !== item.price ? (
                  <span className="ml-2 text-xs text-muted-foreground line-through">{item.listPrice}</span>
                ) : null}
              </p>
              {item.owned ? (
                <Button
                  className="mt-3"
                  variant={equipped ? "secondary" : "default"}
                  onClick={async () => {
                    try {
                      const p = await equipShopItem({ data: item.id });
                      if (p) setProfile(p);
                      toast.success("Equipped");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  {equipped ? "Equipped" : "Equip"}
                </Button>
              ) : (
                <Button
                  className="mt-3"
                  onClick={async () => {
                    try {
                      const p = await buyShopItem({ data: item.id });
                      if (p) setProfile(p);
                      await refresh();
                      toast.success("Purchased with native TRV");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                  }}
                >
                  Buy
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
