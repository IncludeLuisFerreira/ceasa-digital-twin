import { useTwin } from '../state/TwinContext';
import SectorRow from './SectorRow';
import TruckChip from './TruckChip';

export default function FloorPlan() {
  const { world } = useTwin();
  const trucks = Object.values(world.trucks).filter((t) => t.estado !== 'saindo');
  return (
    <section className="rounded-lg border border-line/70 bg-white p-4 shadow-sm">
      <div className="mb-3 grid grid-cols-3 gap-2 text-[11px] font-bold">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700">
          Portaria 1 · Balança
        </div>
        <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-amber-700">
          Área de giro
        </div>
        <div className="rounded-md border border-line bg-slate-50 px-3 py-1.5 text-right text-ink-soft">
          Portaria 2
        </div>
      </div>
      <div className="rounded-md bg-[#F1F5F9] p-3">
        <SectorRow setor="A" />
        <div className="my-3 flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border-y border-dashed border-slate-300 bg-slate-200/70 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Rua central de circulação
          </span>
          {trucks.length === 0 && (
            <span className="text-[11px] text-slate-400">sem veículos no pátio</span>
          )}
          {trucks.map((t) => (
            <TruckChip key={t.id} truck={t} />
          ))}
        </div>
        <SectorRow setor="B" />
      </div>
    </section>
  );
}
