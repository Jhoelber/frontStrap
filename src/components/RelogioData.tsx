// src/components/RelogioData.tsx
import { useEffect, useState } from "react";

export function RelogioData() {
  const [horaAtual, setHoraAtual] = useState(new Date());

  useEffect(() => {
    const t = window.setInterval(() => setHoraAtual(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const formatarData = (d: Date) => {
    const texto = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const formatarHora = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-full flex justify-between bg-white/20 px-3 py-4 rounded-b-md text-white">
      <div className="text-2xl">{formatarHora(horaAtual)}</div>
      <div className="text-xl">{formatarData(horaAtual)}</div>
    </div>
  );
}