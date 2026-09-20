import { SETORES } from '../domain/catalog';
import SectorRow from './SectorRow';

const TOP = SETORES.slice(0, 3);
const BOTTOM = SETORES.slice(3);

export default function FloorPlan() {
  return (
    <section className="rounded-lg border border-line/70 bg-white p-3 shadow-sm sm:p-4">
      <div className="space-y-3 rounded-md bg-[#F1F5F9] p-2 sm:p-3">
        {TOP.map((setor) => (
          <SectorRow key={setor} setor={setor} />
        ))}
        <div className="border-t-2 border-dashed border-slate-300" aria-hidden="true" />
        {BOTTOM.map((setor) => (
          <SectorRow key={setor} setor={setor} />
        ))}
      </div>
    </section>
  );
}
