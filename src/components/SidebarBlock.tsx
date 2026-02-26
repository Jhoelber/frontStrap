// src/components/SidebarBlock.tsx
import { Carousel } from "./Carousel";

type CarouselItem = { url: string; seconds?: number };

type Props = {
  logoTopUrl: string;
  logoBottomUrl: string;
  carouselItems: CarouselItem[];
};

export function SidebarBlock({ logoTopUrl, logoBottomUrl, carouselItems }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
      <div className="flex flex-col items-center space-y-4">
        {logoTopUrl ? <img src={logoTopUrl} alt="Logo topo" className="w-48 pb-2" draggable={false} /> : null}

        <Carousel items={carouselItems} defaultIntervalMs={4000} />

        {logoBottomUrl ? <img src={logoBottomUrl} alt="Logo rodapé" className="w-48 pb-2" draggable={false} /> : null}
      </div>
    </div>
  );
}