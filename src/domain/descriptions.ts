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
  switch (e.type) {
    case 'TRUCK_ARRIVED':
      return `Entrada ${e.truckId}${e.meta?.produto ? ` · ${e.meta.produto}` : ''}`;
    case 'WEIGHED':
      return `Pesagem ${e.truckId} · ${e.meta?.volumeTon ?? 0} t`;
    case 'UNLOADING_STARTED':
      return `Descarga iniciada · Box ${e.boxId}`;
    case 'UNLOADING_FINISHED':
      return `Descarga concluída · Box ${e.boxId}`;
    case 'DEPARTED':
      return `Saída ${e.truckId}`;
    case 'CLEANING_DONE':
      return `Box ${e.boxId} liberado · limpeza OK`;
    case 'CV_ANOMALY':
      return `Anomalia CV${e.boxId ? ` · Box ${e.boxId}` : ''} · ${e.meta?.motivo ?? ''}`;
    case 'CV_SIGNAL_LOST':
      return e.meta?.online ? 'Sinal CV restabelecido' : 'Sinal CV perdido';
  }
}
