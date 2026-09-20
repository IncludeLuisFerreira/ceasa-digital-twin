import { useEffect } from 'react';
import { X } from 'lucide-react';
import { formatClock, formatTempo } from '../domain/engine';
import { EVENT_DOT, describeEvent } from '../domain/descriptions';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

const LABEL = { livre: 'Livre', ocupado: 'Ocupado', alerta: 'Alerta CV' } as const;

export default function BayDrawer() {
  const { world, selectedBayId } = useTwin();
  const dispatch = useTwinDispatch();

  useEffect(() => {
    if (!selectedBayId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SELECT_BAY', bayId: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedBayId, dispatch]);

  if (!selectedBayId) return null;
  const bay = world.bays[selectedBayId];
  const timeline = world.events.filter((e) => e.boxId === selectedBayId).slice().reverse();

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={`Detalhes do box ${bay.id}`}>
      <div
        className="absolute inset-0 bg-slate-900/30"
        onClick={() => dispatch({ type: 'SELECT_BAY', bayId: null })}
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-extrabold">Box {bay.id}</h3>
            <p className="text-xs text-ink-soft">
              {LABEL[bay.status]}
              {bay.produto ? ` · ${bay.produto}` : ''}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELECT_BAY', bayId: null })}
            className="rounded-md p-1.5 text-ink-soft hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 border-b border-line px-5 py-4 text-xs">
          <Info
            label="Veículo"
            value={bay.truckId ? (world.trucks[bay.truckId]?.placa ?? bay.truckId) : '—'}
          />
          <Info
            label="Tempo de ocupação"
            value={bay.status === 'livre' ? '—' : formatTempo(bay.tempoOcupacaoMin ?? 0)}
          />
          <Info
            label="Início da ocupação"
            value={bay.ocupacaoInicio !== undefined ? formatClock(bay.ocupacaoInicio) : '—'}
          />
          <Info label="Alerta" value={bay.alertaMotivo ?? '—'} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            Linha do tempo
          </h4>
          {timeline.length === 0 && (
            <p className="text-xs text-ink-soft">Sem eventos para este box.</p>
          )}
          <ol className="space-y-3">
            {timeline.map((e) => (
              <li key={e.id} className="flex gap-3 text-xs">
                <span className="w-10 shrink-0 font-bold tabular-nums text-ink-soft">
                  {formatClock(e.simTime)}
                </span>
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[e.type]}`} />
                <span className="text-ink">{describeEvent(e)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="font-semibold text-ink">{value}</div>
    </div>
  );
}
