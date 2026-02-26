// src/components/Carousel.tsx
import { useEffect, useMemo, useState } from "react";

type Item = { url: string; seconds?: number };

type Props = {
  items: Item[];
  defaultIntervalMs?: number; // fallback se item.seconds não vier
};

export function Carousel({ items, defaultIntervalMs = 4000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const intervalMs = useMemo(() => {
    const sec = items[currentIndex]?.seconds;
    const ms = (sec && sec > 0 ? sec * 1000 : defaultIntervalMs) | 0;
    return Math.max(500, ms);
  }, [items, currentIndex, defaultIntervalMs]);

  useEffect(() => {
    if (!items.length) return;
    const t = window.setInterval(() => {
      setCurrentIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [items.length, intervalMs]);

  if (!items.length) {
    return <div className="w-56 h-56 flex items-center justify-center text-white/70">Sem imagens (slot:carousel)</div>;
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="overflow-hidden relative">
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {items.map((it, index) => (
            <div key={index} className="shrink-0 w-full">
              <div className="flex items-center justify-center">
                <img src={it.url} className="w-56 object-contain" alt="" draggable={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}