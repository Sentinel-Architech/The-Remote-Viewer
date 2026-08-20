import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addForumComment, createForumPost, flagNcii, listForum, listMyNfts } from "@/lib/trv/server";
import { followViewer, unlockPost } from "@/lib/trv/commons";
import { RATING_COPY, type ContentRating } from "@/lib/trv/content";
import type { ForumPost, NftRow } from "@/lib/trv/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FeedAdGate } from "@/components/feed-ad-gate";
import { Badge } from "@/components/ui/badge";
import { useViewer } from "@/components/viewer-context";

export const Route = createFileRoute("/hub/forum")({ component: ForumPage });

function ForumPage() {
  const { profile } = useViewer();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [nfts, setNfts] = useState<NftRow[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [nftId, setNftId] = useState<number | "">("");
  const [rating, setRating] = useState<ContentRating>("standard");
  const [price, setPrice] = useState(0);
  const [mediaKind, setMediaKind] = useState("text");

  async function refresh() {
    const [p, n] = await Promise.all([listForum(), listMyNfts()]);
    setPosts(p);
    setNfts(n);
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  return (
    <FeedAdGate>
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-3xl">Community forum</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Adult posts are blurred until a Viewer is handshake-verified and
          follows the author. Creators may charge TRV to unseal. Cannabis garden
          and civic / 2A education are allowed tags.
        </p>
      </div>
      <form
        className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await createForumPost({
              data: {
                title,
                body,
                nftId: nftId === "" ? null : nftId,
                rating,
                priceCredits: rating === "adult" ? price : 0,
                mediaKind,
              },
            });
            setTitle("");
            setBody("");
            setNftId("");
            await refresh();
            toast.success("Posted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Post failed");
          }
        }}
      >
        <div>
          <Label htmlFor="ft">Title</Label>
          <Input id="ft" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="fb">Body</Label>
          <Textarea id="fb" className="mt-1.5" value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="mt-1 text-[11px] text-muted-foreground">Audio, gif, or meme comments live on each post.</p>
        </div>
        <div>
          <Label htmlFor="mk">Post type</Label>
          <select
            id="mk"
            className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
            value={mediaKind}
            onChange={(e) => setMediaKind(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="gif">Gif</option>
            <option value="meme">Meme</option>
            <option value="video">Viewer clip (5–60s)</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fr">Tag</Label>
            <select
              id="fr"
              className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
              value={rating}
              onChange={(e) => setRating(e.target.value as ContentRating)}
            >
              {Object.entries(RATING_COPY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {rating === "adult" ? (
            <div>
              <Label htmlFor="fp">Unlock price (TRV)</Label>
              <Input
                id="fp"
                className="mt-1.5"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
              />
              {!profile?.verifiedAt ? (
                <p className="mt-1 text-[11px] text-warn">Handshake required to charge.</p>
              ) : null}
            </div>
          ) : (
            <div>
              <Label htmlFor="fn">Attach mint</Label>
              <select
                id="fn"
                className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
                value={nftId}
                onChange={(e) => setNftId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">None</option>
                {nfts.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <Button type="submit">Publish</Button>
      </form>
      <div className="space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">@{p.handle}</p>
              <Badge variant="muted">{p.rating}</Badge>
              {p.mediaKind && p.mediaKind !== "text" ? <Badge>{p.mediaKind}</Badge> : null}
              {p.priceCredits > 0 ? <Badge>{p.priceCredits} TRV</Badge> : null}
            </div>
            <h2 className="mt-1 font-display text-xl">{p.title}</h2>
            {p.sealed ? (
              <div className="relative mt-3">
                <p className="blur-md select-none text-sm leading-relaxed text-muted-foreground">
                  Sealed adult dispatch. Verify, follow the author, then unseal.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await followViewer({ data: p.handle });
                        toast.success("Following");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Follow failed");
                      }
                    }}
                  >
                    Follow @{p.handle}
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await unlockPost({ data: p.id });
                        await refresh();
                        toast.success("Unsealed");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Still sealed");
                      }
                    }}
                  >
                    Unseal{p.priceCredits ? ` · ${p.priceCredits} TRV` : ""}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                {p.nftImage && (
                  <img src={p.nftImage} alt="" className="mt-3 h-40 w-40 rounded-[var(--radius-md)] object-cover" />
                )}
              </>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={async () => {
                const bodyC = window.prompt("Comment (text, gif note, or audio note)");
                if (bodyC == null) return;
                try {
                  await addForumComment({ data: { postId: p.id, body: bodyC, mediaKind: "text" } });
                  toast.success("Comment sealed");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Comment failed");
                }
              }}
            >
              Comment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={async () => {
                const reason = window.prompt("NCII takedown — why should this post be sealed?");
                if (!reason) return;
                try {
                  await flagNcii({ data: { postId: p.id, reason } });
                  await refresh();
                  toast.success("Sealed under NCII request");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Flag failed");
                }
              }}
            >
              NCII takedown
            </Button>
          </article>
        ))}
      </div>
    </div>
    </FeedAdGate>
  );
}
