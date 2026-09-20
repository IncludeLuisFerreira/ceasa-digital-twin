import type { Event, EventType } from './types';

export const EVENT_DOT: Record<EventType, string> = {
  TRUCK_ARRIVED: 'bg-blue-500',
  WEIGHED: 'bg-blue-400',
  UNLOADING_STARTED: 'bg-red-500',
  UNLOADING_FINISHED: 'bg-red-400',
  DEPARTED: 'bg-slate-400',
  CLEANING_DONE: 'bg-emerald-500',
  CV_ANOMALY: 'bg-amber-500',
  CV_SIGNAL_LOST: 'bg-slate-500',
};

export function describeEvent(e: Event): string {
  const placa = e.meta?.placa ?? e.truckId?.replace(/-\d+$/, '') ?? '';
  const procedencia = e.meta?.procedencia ? ` (${e.meta.procedencia})` : '';
  switch (e.type) {
    case 'TRUCK_ARRIVED':
      return `Chegada do produtor ${placa}${e.meta?.produto ? ` · ${e.meta.produto}` : ''}${procedencia}`;
    case 'WEIGHED':
      return `Pesagem na balança · ${placa} · ${e.meta?.volumeTon ?? 0} t`;
    case 'UNLOADING_STARTED':
      return `Início da descarga · Box ${e.boxId}`;
    case 'UNLOADING_FINISHED':
      return `Oferta disponível para venda · Box ${e.boxId}`;
    case 'DEPARTED':
      return `Saída do produtor ${placa}`;
    case 'CLEANING_DONE':
      return `Box ${e.boxId} higienizado e disponível`;
    case 'CV_ANOMALY':
      return `Ocorrência CV${e.boxId ? ` · Box ${e.boxId}` : ''} · ${e.meta?.motivo ?? ''}`;
    case 'CV_SIGNAL_LOST':
      return e.meta?.online ? 'Sinal das câmeras CV restabelecido' : 'Sinal das câmeras CV perdido';
  }
}
