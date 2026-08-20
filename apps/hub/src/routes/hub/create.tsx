import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PixelStudio } from "@/components/pixel-studio";
import { MemeStudio } from "@/components/meme-studio";
import { MediaStudio, type StudioExport } from "@/components/media-studio";
import { useViewer } from "@/components/viewer-context";
import { mintNft } from "@/lib/trv/server";
import { platformFeeRate, TIER_LABEL } from "@/lib/trv/tiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/hub/create")({ component: CreatePage });

function CreatePage() {
  const { profile } = useViewer();
  const [art, setArt] = useState<{
    data: string;
    title: string;
    kind: "pixel" | "meme" | "photo" | "gif" | "video";
    inspiration?: string;
    mediaRef?: string;
    durationSec?: number;
  } | null>(null);
  const [price, setPrice] = useState(40);
  const [bundle, setBundle] = useState(0);
  const [list, setList] = useState(true);
  const [ownWork, setOwnWork] = useState(false);
  const [busy, setBusy] = useState(false);
  const fee = profile ? Math.round(platformFeeRate(profile.tier) * 100) : 8;

  async function mint() {
    if (!art) return;
    if (!ownWork) {
      toast.error("Copyright attestation required.");
      return;
    }
    setBusy(true);
    try {
      await mintNft({
        data: {
          title: art.title,
          kind: art.kind,
          imageData: art.data,
          priceCredits: price,
          list,
          inspiration: art.inspiration,
          bundlePrice: bundle,
          mediaRef: art.mediaRef,
          durationSec: art.durationSec,
        },
      });
      toast.success(
        fee === 0
          ? "Minted free at Sentinel tier."
          : `Minted. Sales take a ${fee}% TRV platform fee.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mint failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Studio</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Pixel marks and memes mint as TRV-native NFTs on this ledger — not a
          public chain. Highest tier (Sentinel) mints and sells at 0% fee.
          {profile ? ` You are ${TIER_LABEL[profile.tier as keyof typeof TIER_LABEL] ?? profile.tier} (${fee}%).` : ""}
        </p>
      </div>
      <Tabs defaultValue="pixel">
        <TabsList>
          <TabsTrigger value="pixel">Pixel</TabsTrigger>
          <TabsTrigger value="meme">Meme</TabsTrigger>
          <TabsTrigger value="media">Photo / clip</TabsTrigger>
        </TabsList>
        <TabsContent value="pixel">
          <PixelStudio onExport={(data, title) => setArt({ data, title, kind: "pixel" })} />
        </TabsContent>
        <TabsContent value="meme">
          <MemeStudio
            baseImage={art?.kind === "pixel" ? art.data : null}
            onExport={(data, title) => setArt({ data, title, kind: "meme" })}
          />
        </TabsContent>
        <TabsContent value="media">
          <MediaStudio
            onExport={(e: StudioExport) =>
              setArt({
                data: e.poster,
                title: e.title,
                kind: e.kind,
                inspiration: e.inspiration,
                mediaRef: e.mediaRef,
                durationSec: e.durationSec,
              })
            }
          />
        </TabsContent>
      </Tabs>
      {art && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Ready to mint · {art.title}</p>
          <img src={art.data} alt="" className="mt-3 h-32 w-32 rounded-[var(--radius-md)] object-cover" />
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="price">List price (credits)</Label>
              <Input
                id="price"
                type="number"
                className="mt-1.5 w-32"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="bundle">Inspiration bundle (TRV)</Label>
              <Input
                id="bundle"
                type="number"
                className="mt-1.5 w-32"
                value={bundle}
                onChange={(e) => setBundle(Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={list} onCheckedChange={setList} /> List in market / forum
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={ownWork} onCheckedChange={setOwnWork} /> I made this / I hold the rights
            </label>
            <Button onClick={() => void mint()} disabled={busy || !ownWork}>
              Native mint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
