import { formatClock } from '../domain/engine';
import { EVENT_DOT, describeEvent } from '../domain/descriptions';
import { useTwin } from '../state/TwinContext';

export default function EventFeed() {
  const { world } = useTwin();
  return (
    <aside className="flex max-h-[720px] flex-col rounded-lg border border-line/70 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-extrabold">Eventos ao vivo</h2>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE
        </span>
      </div>
      <div className="overflow-y-auto pr-1">
        {world.events.length === 0 && (
          <p className="py-8 text-center text-xs text-ink-soft">Aguardando eventos...</p>
        )}
        {world.events.slice(0, 40).map((e) => (
          <div
            key={e.id}
            className="flex items-start gap-2 border-b border-slate-100 py-2 text-[11px]"
          >
            <span className="w-10 shrink-0 font-bold tabular-nums text-slate-400">
              {formatClock(e.simTime)}
            </span>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[e.type]}`} />
            <span className="text-ink">{describeEvent(e)}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
