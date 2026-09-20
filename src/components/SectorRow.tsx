import { BAY_IDS } from '../domain/catalog';
import type { Sector } from '../domain/types';
import { useTwin } from '../state/TwinContext';
import BayBox from './BayBox';

export default function SectorRow({ setor }: { setor: Sector }) {
  const { world } = useTwin();
  const ids = BAY_IDS.filter((id) => id.startsWith(setor));
  const ocupados = ids.filter((id) => world.bays[id].status !== 'livre').length;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <span>Setor {setor}</span>
        <span>
          {ocupados}/{ids.length} ocupados
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {ids.map((id) => (
          <BayBox key={id} bay={world.bays[id]} />
        ))}
      </div>
    </div>
  );
}
