import { BAY_IDS, PRODUTOS } from './catalog';
import { nextRandom } from './rng';
import type { Bay, Event, Kpis, Turno, WorldState } from './types';

export const TURNO_LIMITE_MIN = 180;
export const TURNO_DURACAO_MIN = 360;

export function deriveTurno(now: number): Turno {
  const h = Math.floor((((now % 1440) + 1440) % 1440) / 60);
  if (h < 6) return 'Madrugada';
  if (h < 12) return 'Manhã';
  if (h < 18) return 'Tarde';
  return 'Noite';
}

export function formatClock(now: number): string {
  const total = ((now % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTempo(min: number): string {
  const safe = Math.max(0, Math.floor(min));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

export function createInitialState(): WorldState {
  const bays: Record<string, Bay> = {};
  BAY_IDS.forEach((id) => {
    bays[id] = {
      id,
      setor: id.startsWith('A') ? 'A' : 'B',
      status: 'livre',
      rotatividade: [0, 0, 0, 0, 0, 0],
    };
  });
  const precos: Record<string, number> = {};
  PRODUTOS.forEach((p) => {
    precos[p.nome] = p.precoBase;
  });
  return {
    now: 4 * 60 + 30,
    turno: 'Madrugada',
    speed: 1,
    paused: false,
    bays,
    trucks: {},
    events: [],
    precos,
    cvOnline: true,
    cvPrecisao: 0.98,
    cvUltimaSyncMin: 2,
  };
}

function pushSample(arr: number[], value: number): number[] {
  return [...arr.slice(1), value];
}

export function applyEvent(state: WorldState, event: Event): WorldState {
  const bays = { ...state.bays };
  const trucks = { ...state.trucks };
  let applied: Event = event;

  switch (event.type) {
    case 'TRUCK_ARRIVED': {
      if (event.truckId) {
        trucks[event.truckId] = {
          id: event.truckId,
          placa: event.meta?.placa ?? event.truckId,
          produto: event.meta?.produto ?? 'Tomate',
          estado: 'chegou',
          volumeTon: 0,
        };
      }
      break;
    }
    case 'WEIGHED': {
      const t = event.truckId ? trucks[event.truckId] : undefined;
      if (t) {
        trucks[t.id] = {
          ...t,
          estado: 'pesando',
          volumeTon: event.meta?.volumeTon ?? t.volumeTon,
        };
      }
      break;
    }
    case 'UNLOADING_STARTED': {
      const t = event.truckId ? trucks[event.truckId] : undefined;
      let target = event.boxId;
      if (!target || !bays[target] || bays[target].status !== 'livre') {
        target = Object.keys(bays).find((id) => bays[id].status === 'livre');
      }
      if (!target) {
        if (t) trucks[t.id] = { ...t, estado: 'descarregando' };
        break;
      }
      applied = { ...event, boxId: target };
      if (t) trucks[t.id] = { ...t, estado: 'descarregando', boxId: target };
      bays[target] = {
        ...bays[target],
        status: 'ocupado',
        produto: event.meta?.produto ?? bays[target].produto,
        truckId: event.truckId,
        ocupacaoInicio: event.simTime,
        alertaMotivo: undefined,
      };
      break;
    }
    case 'UNLOADING_FINISHED': {
      const t = event.truckId ? trucks[event.truckId] : undefined;
      if (t) trucks[t.id] = { ...t, estado: 'saindo' };
      const target =
        (event.truckId ? trucks[event.truckId]?.boxId : undefined) ?? event.boxId;
      if (target && bays[target]) {
        applied = { ...event, boxId: target };
        const b = bays[target];
        const dur = event.simTime - (b.ocupacaoInicio ?? event.simTime);
        bays[target] = { ...b, rotatividade: pushSample(b.rotatividade, dur) };
      }
      break;
    }
    case 'DEPARTED': {
      const t = event.truckId ? trucks[event.truckId] : undefined;
      if (t) trucks[t.id] = { ...t, estado: 'saindo' };
      break;
    }
    case 'CLEANING_DONE': {
      const truckBox = event.truckId ? trucks[event.truckId]?.boxId : undefined;
      const target = truckBox ?? event.boxId;
      if (target && bays[target]) {
        applied = { ...event, boxId: target };
        bays[target] = {
          ...bays[target],
          status: 'livre',
          produto: undefined,
          truckId: undefined,
          ocupacaoInicio: undefined,
          tempoOcupacaoMin: undefined,
          alertaMotivo: undefined,
        };
      }
      if (event.truckId && trucks[event.truckId]) {
        const rest = { ...trucks };
        delete rest[event.truckId];
        return finish(state, rest, bays, applied);
      }
      break;
    }
    case 'CV_ANOMALY': {
      if (event.boxId && bays[event.boxId] && bays[event.boxId].status !== 'livre') {
        bays[event.boxId] = {
          ...bays[event.boxId],
          status: 'alerta',
          alertaMotivo: event.meta?.motivo ?? 'Anomalia detectada',
        };
      }
      break;
    }
    case 'CV_SIGNAL_LOST':
      break;
  }

  return finish(state, trucks, bays, applied);
}

function finish(
  state: WorldState,
  trucks: WorldState['trucks'],
  bays: WorldState['bays'],
  event: Event,
): WorldState {
  const cvOnline =
    event.type === 'CV_SIGNAL_LOST' ? Boolean(event.meta?.online) : state.cvOnline;
  return {
    ...state,
    trucks,
    bays,
    events: [event, ...state.events],
    cvOnline,
    cvUltimaSyncMin: event.type === 'CV_SIGNAL_LOST' && cvOnline ? 0 : state.cvUltimaSyncMin,
  };
}

export function applyEvents(state: WorldState, events: Event[]): WorldState {
  return events.reduce((acc, e) => applyEvent(acc, e), state);
}

export function updateTempos(state: WorldState): WorldState {
  const bays: Record<string, Bay> = {};
  for (const id of Object.keys(state.bays)) {
    const b = state.bays[id];
    bays[id] =
      b.ocupacaoInicio !== undefined
        ? { ...b, tempoOcupacaoMin: Math.max(0, state.now - b.ocupacaoInicio) }
        : b;
  }
  return { ...state, bays };
}

export function enforceLimits(state: WorldState): [WorldState, Event[]] {
  let next = state;
  const novos: Event[] = [];
  for (const id of Object.keys(state.bays)) {
    const b = state.bays[id];
    if (
      b.status === 'ocupado' &&
      b.ocupacaoInicio !== undefined &&
      state.now - b.ocupacaoInicio > TURNO_LIMITE_MIN
    ) {
      const ev: Event = {
        id: `CV_ANOMALY-limite-${id}-${state.now}`,
        simTime: state.now,
        type: 'CV_ANOMALY',
        boxId: id,
        meta: { motivo: 'Tempo de ocupação excedido (limite do turno)' },
      };
      next = applyEvent(next, ev);
      novos.push(ev);
    }
  }
  return [next, novos];
}

export function deriveKpis(state: WorldState): Kpis {
  const bays = Object.values(state.bays);
  const total = bays.length;
  const ocupados = bays.filter((b) => b.status === 'ocupado' || b.status === 'alerta').length;
  const alertas = bays.filter((b) => b.status === 'alerta').length;
  const volumeTon = state.events
    .filter((e) => e.type === 'WEIGHED' && e.meta?.volumeTon)
    .reduce((sum, e) => sum + (e.meta?.volumeTon ?? 0), 0);
  return {
    ocupacaoPct: total > 0 ? Math.round((ocupados / total) * 100) : 0,
    alertas,
    volumeTon: Math.round(volumeTon),
  };
}

export function driftPrecos(
  state: WorldState,
  rng: number,
): [Record<string, number>, number] {
  const precos = { ...state.precos };
  let r = rng;
  for (const p of PRODUTOS) {
    const [v, nr] = nextRandom(r);
    r = nr;
    const delta = (v - 0.5) * 0.04;
    const atual = precos[p.nome] ?? p.precoBase;
    const min = p.precoBase * 0.85;
    const max = p.precoBase * 1.15;
    precos[p.nome] = Math.min(max, Math.max(min, atual * (1 + delta)));
  }
  return [precos, r];
}
