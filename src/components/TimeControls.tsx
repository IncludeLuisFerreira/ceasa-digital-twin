import { Pause, Play } from 'lucide-react';
import { TURNO_DURACAO_MIN, formatClock } from '../domain/engine';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

const SPEEDS: Array<1 | 4 | 16> = [1, 4, 16];

export default function TimeControls() {
  const { world } = useTwin();
  const dispatch = useTwinDispatch();
  const progresso = ((world.now % TURNO_DURACAO_MIN) / TURNO_DURACAO_MIN) * 100;
  return (
    <section className="flex flex-wrap items-center gap-3 rounded-lg border border-line/70 bg-white px-3 py-3 shadow-sm sm:px-4">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#0F172A] text-white"
        aria-label={world.paused ? 'Retomar simulação' : 'Pausar simulação'}
      >
        {world.paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => dispatch({ type: 'SET_SPEED', speed: s })}
            className={`rounded-md border px-2.5 py-1 text-[11px] font-bold ${
              world.speed === s
                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                : 'border-line text-ink-soft hover:bg-slate-50'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <div className="h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${progresso}%` }} />
      </div>
      <span className="whitespace-nowrap text-[11px] font-bold tabular-nums text-ink">
        {formatClock(world.now)} · Turno {world.turno}
      </span>
    </section>
  );
}
