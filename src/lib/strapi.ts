// src/lib/strapi.ts
export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export type MediaFile = {
  url: string;
  mime?: string | null;
};

export type MediaAsset = {
  id: number;
  title: string;
  type: "image" | "video";
  durationSeconds?: number | null;
  file?: MediaFile | null;
};

export type PlaylistItem = {
  id: number;
  order?: number | null;
  durationOverrideSeconds?: number | null;
  // no seu JSON veio array, então aceitamos os dois:
  media: MediaAsset | MediaAsset[] | null;
};

export type Playlist = {
  id: number;
  name: string;
  isActive: boolean;
  items: PlaylistItem[];
};

export type Device = {
  id: number;
  name: string;
  deviceCode: string;
  layoutPreset: "fullscreen" | "split" | "ticker";
  version: number;
  playlist: Playlist | null;
};

function qs(params: Record<string, string>) {
  const u = new URLSearchParams(params);
  return u.toString();
}

export async function fetchDeviceByCode(deviceCode: string): Promise<Device | null> {
  const query = qs({
    "filters[deviceCode][$eq]": deviceCode,
    "populate[playlist][populate][items][populate]": "media.file",
  });

  const res = await fetch(`${STRAPI_URL}/api/devices?${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);

  const json = await res.json();
  const device = json?.data?.[0] ?? null;
  return device;
}

export function normalizeMedia(item: PlaylistItem): MediaAsset | null {
  if (!item.media) return null;
  return Array.isArray(item.media) ? item.media[0] ?? null : item.media;
}

export function normalizeItems(items: PlaylistItem[]): Array<PlaylistItem & { mediaOne: MediaAsset | null }> {
  return (items || [])
    .map((it) => ({ ...it, mediaOne: normalizeMedia(it) }))
    .filter((it) => !!it.mediaOne?.file?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}