import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useViewer } from "@/components/viewer-context";
import { buyNft, creatorRevenue, listMarket, listMyNfts, setListing } from "@/lib/trv/server";
import { effectiveFeeRate } from "@/lib/trv/saas";
import type { NftRow, SaleRow } from "@/lib/trv/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedAdGate } from "@/components/feed-ad-gate";

export const Route = createFileRoute("/hub/market")({ component: MarketPage });

function MarketPage() {
  const { profile, reload } = useViewer();
  const [market, setMarket] = useState<NftRow[]>([]);
  const [mine, setMine] = useState<NftRow[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [totals, setTotals] = useState({ gross: 0, fees: 0, net: 0, count: 0 });

  async function refresh() {
    const [m, my, rev] = await Promise.all([listMarket(), listMyNfts(), creatorRevenue()]);
    setMarket(m);
    setMine(my);
    setSales(rev.sales);
    setTotals({ gross: rev.gross, fees: rev.fees, net: rev.net, count: rev.count });
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  const chart = sales
    .slice()
    .reverse()
    .map((s, i) => ({ i: i + 1, net: s.amount - s.fee }));

  return (
    <FeedAdGate>
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Native ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TRV-native mints. Platform fee{" "}
          {profile ? Math.round(effectiveFeeRate(profile.planId, profile.tier) * 100) : 8}%
          — zero at Sentinel / Sovereign.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gross</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl tabular-nums">{totals.gross}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fees paid</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl tabular-nums">{totals.fees}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl tabular-nums">{totals.net}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Creator revenue</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          {chart.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet. Mint in Studio.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <XAxis dataKey="i" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#12141a", border: "1px solid rgba(236,236,232,0.12)" }}
                />
                <Area type="monotone" dataKey="net" stroke="#c5cfc8" fill="rgba(197,207,200,0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Tabs defaultValue="market">
        <TabsList>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="mine">Your mints</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {market.map((n) => (
            <article key={n.id} className="rounded-[var(--radius-lg)] border border-border bg-card p-3">
              <img src={n.imageData} alt="" className="aspect-square w-full rounded-[var(--radius-sm)] object-cover" />
              <h3 className="mt-2 text-sm font-medium">{n.title}</h3>
              <p className="text-xs text-muted-foreground">@{n.handle} · {n.priceCredits} cr</p>
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={async () => {
                  try {
                    const r = await buyNft({ data: n.id });
                    toast.success(`Acquired · fee ${r.fee}`);
                    await reload();
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Buy failed");
                  }
                }}
              >
                Acquire
              </Button>
              {n.bundlePrice ? (
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const r = await buyNft({ data: { id: n.id, bundle: true } });
                      toast.success(`Bundle · ${r.price} TRV. Inspiration: ${r.inspiration || "sealed"}`);
                      await reload();
                      await refresh();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Bundle failed");
                    }
                  }}
                >
                  Bundle +{n.bundlePrice} TRV
                </Button>
              ) : null}
            </article>
          ))}
          {market.length === 0 && <p className="text-sm text-muted-foreground">No listings yet.</p>}
        </TabsContent>
        <TabsContent value="mine" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((n) => (
            <article key={n.id} className="rounded-[var(--radius-lg)] border border-border bg-card p-3">
              <img src={n.imageData} alt="" className="aspect-square w-full rounded-[var(--radius-sm)] object-cover" />
              <h3 className="mt-2 text-sm font-medium">{n.title}</h3>
              <p className="text-xs text-muted-foreground">{n.listed ? `Listed · ${n.priceCredits}` : "Held"}</p>
              <Button
                className="mt-3 w-full"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await setListing({ data: { id: n.id, listed: !n.listed, priceCredits: n.priceCredits || 40 } });
                  await refresh();
                }}
              >
                {n.listed ? "Unlist" : "List"}
              </Button>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </div>
    </FeedAdGate>
  );
}
