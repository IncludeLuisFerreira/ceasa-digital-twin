import type { Truck } from '../domain/types';

const TONE: Record<Truck['estado'], string> = {
  chegou: 'bg-slate-700',
  pesando: 'bg-amber-700',
  descarregando: 'bg-blue-700',
  saindo: 'bg-slate-500',
};

const LABEL: Record<Truck['estado'], string> = {
  chegou: 'na portaria',
  pesando: 'na balança',
  descarregando: 'descarregando',
  saindo: 'saindo',
};

export default function TruckChip({ truck }: { truck: Truck }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold text-white ${TONE[truck.estado]}`}
    >
      🚚 {truck.placa} · {LABEL[truck.estado]}
      {truck.boxId ? ` → ${truck.boxId}` : ''}
    </span>
  );
}
