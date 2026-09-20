export type ReportRow = {
  box: string;
  produto: string;
  preco: number;
  variacao: number;
  tempoMin: number;
};

export default function ExportButtons({ rows }: { rows: ReportRow[] }) {
  function exportCsv() {
    const header = [
      'Box',
      'Produto Principal',
      'Preco Medio/kg',
      'Variacao vs Ontem (%)',
      'Tempo de Ocupacao (min)',
    ];
    const lines = rows.map((r) =>
      [r.box, r.produto, r.preco.toFixed(2), r.variacao.toFixed(1), String(r.tempoMin)].join(';'),
    );
    const csv = [header.join(';'), ...lines].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ceasa-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        className="rounded-md border border-line px-3 py-1.5 text-[11px] font-bold text-ink hover:bg-slate-50"
      >
        Exportar CSV
      </button>
      <button
        onClick={() => window.print()}
        className="rounded-md bg-[#0F172A] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1E293B]"
      >
        Exportar PDF
      </button>
    </div>
  );
}
