// src/lib/tags.ts
export type SlotTag = "slot:video" | "slot:carousel" | "slot:logo_top" | "slot:logo_bottom";

export function normalizeTag(raw?: string | null) {
  const t = String(raw ?? "").trim().toLowerCase();
  if (!t) return "";

  // compatibilidade com valores antigos/sem ":"
  if (t === "slotcarousel") return "slot:carousel";
  if (t === "slotvideo") return "slot:video";
  if (t === "slotlogo_top") return "slot:logo_top";
  if (t === "slotlogo_bottom") return "slot:logo_bottom";

  return t;
}

// no seu schema o campo tags é ENUM (1 valor), não lista
export function isSlot(tags: string | null | undefined, slot: SlotTag | string) {
  return normalizeTag(tags) === normalizeTag(slot);
}