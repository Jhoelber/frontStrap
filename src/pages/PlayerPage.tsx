// src/pages/PlayerPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDeviceByCode, normalizeItems } from "../lib/strapi";
import { LayoutSplitTv } from "../layouts/LayoutSplitTv";
import { isSlot } from "../lib/tags";

const DEFAULT_IMAGE_SECONDS = 10;
const POLL_MS = 60_000;

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL as string;

function resolveUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

type MediaSlot = "image" | "video";

type MediaOne =
  | {
      type: MediaSlot;
      title?: string | null;
      tags?: string | null; // enum no Strapi
      file?: { url?: string | null } | null;
    }
  | null;

type NormItem = {
  durationOverrideSeconds?: number | null;
  mediaOne?: MediaOne;
};

function getUrl(m: MediaOne): string {
  return resolveUrl(m?.file?.url);
}

function isMedia(m: MediaOne): m is Exclude<MediaOne, null> {
  return m !== null;
}

export function PlayerPage() {
  const { deviceCode = "device" } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [layout, setLayout] = useState<string>("fullscreen");
  const [itemsRaw, setItemsRaw] = useState<any[]>([]);

  const items = useMemo(() => normalizeItems(itemsRaw as any) as NormItem[], [itemsRaw]);

  const [idx, setIdx] = useState(0);
  const imgTimer = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ evita chamadas sobrepostas no polling
  const inFlight = useRef(false);

  // ✅ guarda “assinaturas” pra saber quando recarregar playlist
  const last = useRef<{ deviceVersion: number; playlistKey: string }>({
    deviceVersion: -1,
    playlistKey: "",
  });

  function next() {
    setIdx((i) => (items.length === 0 ? 0 : (i + 1) % items.length));
  }

  async function load(initial = false) {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      if (initial) setLoading(true);
      setErr(null);

      const device: any = await fetchDeviceByCode(deviceCode);
      if (!device) {
        setErr(`Device "${deviceCode}" não encontrado (ou não publicado).`);
        setItemsRaw([]);
        return;
      }

      const nextLayout = device.layoutPreset || "fullscreen";
      setLayout((prev) => (prev !== nextLayout ? nextLayout : prev));

      const nextDeviceVersion = Number(device.version ?? 0);

      // ✅ chave da playlist: id + updatedAt (se mudar, recarrega)
      const playlistId = device.playlist?.id ?? "";
      const playlistUpdatedAt =
        device.playlist?.updatedAt ?? device.playlist?.publishedAt ?? device.playlist?.createdAt ?? "";
      const nextPlaylistKey = `${playlistId}:${playlistUpdatedAt}`;

      const changed =
        nextDeviceVersion !== last.current.deviceVersion || nextPlaylistKey !== last.current.playlistKey;

      if (changed || initial) {
        last.current = { deviceVersion: nextDeviceVersion, playlistKey: nextPlaylistKey };
        setItemsRaw(device.playlist?.items || []);
        setIdx(0);
      }
    } catch (e: any) {
      setErr(e?.message || "Erro ao carregar do Strapi");
    } finally {
      inFlight.current = false;
      if (initial) setLoading(false);
    }
  }

  // load inicial
  useEffect(() => {
    last.current = { deviceVersion: -1, playlistKey: "" };
    setIdx(0);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceCode]);

  // polling
  useEffect(() => {
    const t = window.setInterval(() => load(false), POLL_MS);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceCode]);

  // FULLSCREEN: alterna (no split não alterna)
  useEffect(() => {
    if (layout === "split") return;

    if (imgTimer.current) {
      window.clearTimeout(imgTimer.current);
      imgTimer.current = null;
    }

    const current = items[idx]?.mediaOne ?? null;
    if (!current) return;

    const nextItem = items[(idx + 1) % items.length]?.mediaOne ?? null;
    if (nextItem?.type === "image") {
      const url = getUrl(nextItem);
      if (url) {
        const pre = new Image();
        pre.src = url;
      }
    }

    if (current.type === "image") {
      const seconds = items[idx]?.durationOverrideSeconds ?? DEFAULT_IMAGE_SECONDS;
      imgTimer.current = window.setTimeout(next, Math.max(1, seconds) * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, items.length, layout]);

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center text-white">Carregando…</div>;
  }

  if (err) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
        <div className="text-xl font-semibold">Erro</div>
        <div className="opacity-80">{err}</div>
        <button className="mt-2 rounded bg-white/10 px-4 py-2 hover:bg-white/15" onClick={() => load(true)}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // ✅ SPLIT: tudo por tags
  if (layout === "split") {
    const medias = items.map((it) => it.mediaOne ?? null).filter(isMedia);

    const logoTopUrl =
      getUrl(medias.find((m) => m.type === "image" && isSlot(m.tags, "slot:logo_top")) ?? null) || "";

    const logoBottomUrl =
      getUrl(medias.find((m) => m.type === "image" && isSlot(m.tags, "slot:logo_bottom")) ?? null) || "";

    const videoUrl =
      getUrl(medias.find((m) => m.type === "video" && isSlot(m.tags, "slot:video")) ?? null) || "";

    const carouselItems = items
      .map((it) => {
        const m = it.mediaOne ?? null;
        if (!m || m.type !== "image" || !isSlot(m.tags, "slot:carousel")) return null;
        const url = getUrl(m);
        if (!url) return null;
        return { url, seconds: it.durationOverrideSeconds ?? DEFAULT_IMAGE_SECONDS };
      })
      .filter((x): x is { url: string; seconds: number } => !!x);

    return (
      <LayoutSplitTv
        logoTopUrl={logoTopUrl}
        logoBottomUrl={logoBottomUrl}
        carouselItems={carouselItems}
        video={
          videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              controls={false}
              loop
              onError={() => setTimeout(() => load(true), 3000)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white">
              Nenhum vídeo com tag <b>slot:video</b>
            </div>
          )
        }
      />
    );
  }

  // FULLSCREEN (fallback)
  const current = items[idx]?.mediaOne ?? null;
  const currentUrl = getUrl(current);

  if (!current || !currentUrl) {
    return <div className="h-full w-full flex items-center justify-center text-white">Sem itens na playlist.</div>;
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden cursor-none select-none">
      {current.type === "image" ? (
        <img src={currentUrl} className="h-full w-full object-cover" alt={current.title || ""} draggable={false} />
      ) : (
        <video
          src={currentUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          controls={false}
          onEnded={next}
          onError={() => window.setTimeout(next, 3000)}
        />
      )}
    </div>
  );
}