// src/layouts/LayoutSplitTv.tsx
import type { ReactNode } from "react";
import { RelogioData } from "../components/RelogioData";
import { SidebarBlock } from "../components/SidebarBlock";

type CarouselItem = { url: string; seconds?: number };

type Props = {
  video: ReactNode;
  carouselItems: CarouselItem[];
  logoTopUrl: string;
  logoBottomUrl: string;
};

export function LayoutSplitTv({ video, carouselItems, logoTopUrl, logoBottomUrl }: Props) {
  return (
    <div className="bg-linear-to-tl from-blue-500 to-neutral-200 w-screen h-screen">
      <div className="grid grid-cols-[1fr_5fr] h-full">
        {/* ESQUERDA */}
        <div className="flex flex-col items-center justify-center h-full overflow-hidden">
          <div className="relative p-2 mx-2 rounded-md max-w-max font-semibold z-10">
            <SidebarBlock
              logoTopUrl={logoTopUrl}
              logoBottomUrl={logoBottomUrl}
              carouselItems={carouselItems}
            />
          </div>
        </div>

        {/* DIREITA */}
        <div className="h-full w-full flex flex-col">
          {/* wrapper com padding ÚNICO para alinhar vídeo e barra */}
          <div className="h-full w-full flex flex-col  px-3 pb-3 pt-3">
            <div className="flex-1 w-full overflow-hidden rounded-t-md">
              {video}
            </div>

            <div className="w-full">
              <RelogioData />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}