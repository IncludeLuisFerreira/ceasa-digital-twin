import { formatTempo } from '../domain/engine';
import type { Bay } from '../domain/types';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

const CORES: Record<Bay['status'], string> = {
  livre: 'bg-[#10B981] hover:bg-emerald-600',
  ocupado: 'bg-[#EF4444] hover:bg-red-600',
  alerta: 'bg-[#F59E0B] hover:bg-amber-600',
};

const LABEL: Record<Bay['status'], string> = {
  livre: 'Box disponível',
  ocupado: 'Em comercialização',
  alerta: 'Ocorrência CV',
};

export default function BayBox({ bay }: { bay: Bay }) {
  const dispatch = useTwinDispatch();
  const { world } = useTwin();
  const truck = bay.truckId ? world.trucks[bay.truckId] : undefined;
  return (
    <div className="group relative">
      <button
        onClick={() => dispatch({ type: 'SELECT_BAY', bayId: bay.id })}
        className={`flex h-14 w-full flex-col items-center justify-center rounded-md leading-none text-white transition-colors ${CORES[bay.status]}`}
        aria-label={`Box ${bay.id} ${LABEL[bay.status]}`}
      >
        <span className="text-[11px] font-extrabold">{bay.id}</span>
        <span className="mt-1 text-[9px] font-semibold opacity-95">
          {bay.status === 'livre'
            ? 'Vago'
            : bay.status === 'alerta'
              ? 'Ocorrência'
              : formatTempo(bay.tempoOcupacaoMin ?? 0)}
        </span>
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-44 -translate-x-1/2 rounded-md bg-[#0F172A] p-2 text-left text-[10px] leading-snug text-white shadow-lg group-hover:block">
        <div className="font-bold">
          Box {bay.id} · {LABEL[bay.status]}
        </div>
        {bay.produto && <div className="text-slate-300">Produto: {bay.produto}</div>}
        {truck && <div className="text-slate-300">Produtor: {truck.produtor}</div>}
        {truck && <div className="text-slate-300">Procedência: {truck.procedencia}</div>}
        {bay.status !== 'livre' && (
          <div className="text-amber-300">
            Em comercialização: {formatTempo(bay.tempoOcupacaoMin ?? 0)}
          </div>
        )}
        {bay.alertaMotivo && <div className="text-amber-300">⚠ {bay.alertaMotivo}</div>}
        <div className="mt-1 text-[9px] text-slate-400">Clique para ver a linha do tempo</div>
      </div>
    </div>
  );
}
