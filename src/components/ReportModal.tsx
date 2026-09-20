import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PRODUTOS } from '../domain/catalog';
import { formatClock, formatTempo } from '../domain/engine';
import type { Bay, WorldState } from '../domain/types';
import { useTwin, useTwinDispatch } from '../state/TwinContext';
import ExportButtons, { type ReportRow } from './ExportButtons';

function buildRow(b: Bay, world: WorldState): ReportRow {
  const produto = b.produto ?? '—';
  const item = PRODUTOS.find((p) => p.nome === produto);
  const base = item?.precoBase ?? 0;
  const procedencia = item?.procedencia ?? '—';
  const preco = world.precos[produto] ?? base;
  const variacao = base > 0 ? ((preco - base) / base) * 100 : 0;
  return { box: b.id, produto, procedencia, preco, variacao, tempoMin: b.tempoOcupacaoMin ?? 0 };
}

export default function ReportModal() {
  const { world, reportOpen } = useTwin();
  const dispatch = useTwinDispatch();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'TOGGLE_REPORT', open: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reportOpen, dispatch]);

  useEffect(() => {
    if (!reportOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => prev?.focus();
  }, [reportOpen]);

  if (!reportOpen) return null;
  const rows = Object.values(world.bays)
    .filter((b) => b.status !== 'livre')
    .map((b) => buildRow(b, world));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-3 print:static print:block print:p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Relatório de cotações e ocupação"
    >
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => dispatch({ type: 'TOGGLE_REPORT', open: false })}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl outline-none print:static print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none"
      >
        <div className="print-area">
          <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-extrabold">Relatório de Cotações e Ocupação</h3>
              <p className="text-xs text-ink-soft">
                CEASA · {world.turno} · {formatClock(world.now)} · gerado pelo gêmeo digital
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_REPORT', open: false })}
              className="rounded-md p-1.5 text-ink-soft hover:bg-slate-100 print:hidden"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[55vh] overflow-auto px-4 py-4 print:max-h-none print:overflow-visible sm:px-6">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-wide text-ink-soft">
                  <th className="py-2">Box</th>
                  <th className="py-2">Produto Principal</th>
                  <th className="py-2">Procedência</th>
                  <th className="py-2 text-right">Preço Médio/kg</th>
                  <th className="py-2 text-right">Variação vs. Ontem</th>
                  <th className="py-2 text-right">Tempo de Ocupação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.box} className="border-b border-slate-100">
                    <td className="py-2 font-bold">{r.box}</td>
                    <td className="py-2">{r.produto}</td>
                    <td className="py-2 text-ink-soft">{r.procedencia}</td>
                    <td className="py-2 text-right tabular-nums">R$ {r.preco.toFixed(2)}</td>
                    <td
                      className={`py-2 text-right font-bold tabular-nums ${
                        r.variacao >= 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {r.variacao >= 0 ? '▲' : '▼'} {Math.abs(r.variacao).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatTempo(r.tempoMin)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-soft">
                      Nenhum box ocupado no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-4 print:hidden sm:px-6">
            <span className="text-[11px] text-ink-soft">
              {rows.length} boxes ocupados · dados simulados
            </span>
            <ExportButtons rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
}
