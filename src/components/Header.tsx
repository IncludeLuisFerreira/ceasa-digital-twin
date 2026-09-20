import { CalendarClock, Radio } from 'lucide-react';
import { formatClock } from '../domain/engine';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

function ReportButton() {
  const dispatch = useTwinDispatch();
  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_REPORT', open: true })}
      className="w-full rounded-md bg-[#0F172A] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1E293B] lg:w-auto"
    >
      <span className="lg:hidden">📊 Relatório</span>
      <span className="hidden lg:inline">📊 Gerar Relatório de Cotações e Ocupação</span>
    </button>
  );
}

export default function Header() {
  const { world } = useTwin();
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#0F172A] text-sm font-extrabold text-white">
            CE
          </div>
          <div>
            <div className="text-[13px] font-extrabold tracking-tight sm:text-sm">
              CEASA <span className="text-[#2563EB]">| Sistema de Inteligência Logística</span>
            </div>
            <div className="text-[11px] text-ink-soft">
              Gêmeo digital · Monitoramento por visão computacional
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
              world.cvOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <Radio size={13} />
            <span className="lg:hidden">
              {world.cvOnline ? 'CV: Online' : 'CV: sinal perdido'}
            </span>
            <span className="hidden lg:inline">
              {world.cvOnline
                ? `Câmeras CV: Online (${Math.round(world.cvPrecisao * 100)}% de precisão) · Última sync: ${world.cvUltimaSyncMin} min atrás`
                : 'Câmeras CV: Sinal perdido'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink">
            <CalendarClock size={13} className="text-ink-soft" />
            {world.turno} · {formatClock(world.now)}
          </div>
          <ReportButton />
        </div>
      </div>
    </header>
  );
}
