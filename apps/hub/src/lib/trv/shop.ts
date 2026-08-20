export type ShopSlot = "frame" | "title" | "chrome";

export type ShopItem = {
  id: string;
  slot: ShopSlot;
  name: string;
  price: number;
  tag: string;
};

/** Native TRV shop — TRV credits only. Convert USD-backed funds in Billing first. */
export const SHOP_ITEMS: ShopItem[] = [
  { id: "frame-abyss", slot: "frame", name: "Abyss ring", price: 80, tag: "Deep rim on the public node" },
  { id: "frame-vortex", slot: "frame", name: "Vortex ring", price: 140, tag: "Swirl on the QR card" },
  { id: "frame-sentinel", slot: "frame", name: "Sentinel iris", price: 260, tag: "Watchful gold rim" },
  { id: "title-initiate", slot: "title", name: "Title · Initiate", price: 40, tag: "Shown under the handle" },
  { id: "title-watchful", slot: "title", name: "Title · Watchful", price: 120, tag: "Neuron-field honorific" },
  { id: "title-node", slot: "title", name: "Title · Remote Node", price: 220, tag: "Localized galaxy mark" },
  { id: "chrome-stone", slot: "chrome", name: "Stone chrome", price: 90, tag: "Quiet profile surface" },
  { id: "chrome-knight", slot: "chrome", name: "Knight chrome", price: 180, tag: "Armor grain on the card" },
  { id: "chrome-mesh", slot: "chrome", name: "Mesh chrome", price: 240, tag: "Globe-wire overlay" },
];

export function shopById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
