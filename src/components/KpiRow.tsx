import { AlertTriangle, Gauge, Truck } from 'lucide-react';
import { useKpis } from '../state/TwinContext';

export default function KpiRow() {
  const kpis = useKpis();
  const cards = [
    {
      label: 'Taxa de Ocupação Geral',
      value: `${kpis.ocupacaoPct}%`,
      icon: Gauge,
      tone: 'text-[#2563EB]',
    },
    {
      label: 'Boxes com Alerta de Permanência',
      value: String(kpis.alertas),
      icon: AlertTriangle,
      tone: 'text-[#F59E0B]',
    },
    {
      label: 'Volume Estimado de Descarga (ton)',
      value: String(kpis.volumeTon),
      icon: Truck,
      tone: 'text-[#10B981]',
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-line/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {c.label}
            </span>
            <c.icon size={16} className={c.tone} />
          </div>
          <div className="mt-2 text-3xl font-extrabold tabular-nums">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
