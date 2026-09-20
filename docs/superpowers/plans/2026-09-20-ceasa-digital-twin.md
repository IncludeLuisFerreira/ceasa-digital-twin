# CEASA · Gêmeo Digital Logístico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um dashboard frontend de gêmeo digital que simula a operação de boxes do CEASA, orientado a eventos e com tempo acelerado.

**Architecture:** Vite + React + TypeScript. Um motor de simulação puro (`domain/`) gera e aplica eventos; um `TwinContext` (Context + `useReducer`) mantém o `WorldState`, a fila de eventos futuros, o RNG com seed e o relógio simulado. Os componentes renderizam o estado derivado e disparam ações de controle. Sem backend, sem testes automatizados.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v4, Lucide React, Inter (Google Fonts).

---

## File Structure

- `vite.config.ts` — Vite + React + Tailwind plugin.
- `src/index.css` — tokens de design (`@theme`) e reset.
- `src/styles/print.css` — regras de impressão para exportar PDF.
- `src/domain/types.ts` — tipos do domínio.
- `src/domain/catalog.ts` — produtos, placas, IDs de boxes.
- `src/domain/rng.ts` — RNG com seed (mulberry32 puro).
- `src/domain/engine.ts` — estado inicial, aplicação de eventos, KPIs, limites, formatação.
- `src/domain/scheduler.ts` — criação de jornadas de caminhão e reabastecimento da fila.
- `src/domain/descriptions.ts` — textos e cores por tipo de evento.
- `src/state/TwinContext.tsx` — provider, reducer, relógio, hooks.
- `src/components/Header.tsx` — cabeçalho institucional + badge CV + relógio + botão de relatório.
- `src/components/KpiRow.tsx` — três KPIs.
- `src/components/FloorPlan.tsx` — planta espacial (espinha central).
- `src/components/SectorRow.tsx` — faixa de 12 boxes de um setor.
- `src/components/BayBox.tsx` — box interativo com tooltip.
- `src/components/TruckChip.tsx` — chip de caminhão na rua central.
- `src/components/EventFeed.tsx` — feed de eventos ao vivo.
- `src/components/TimeControls.tsx` — velocidade, pausa e progresso do turno.
- `src/components/BayDrawer.tsx` — drawer lateral com linha do tempo do box.
- `src/components/ReportModal.tsx` — modal central do relatório.
- `src/components/ExportButtons.tsx` — exportação CSV e PDF.
- `src/App.tsx` — composição da tela.

---

### Task 1: Scaffold do projeto

**Files:**
- Create: projeto Vite em `./`
- Modify: `vite.config.ts`, `src/index.css`, `src/App.tsx`
- Delete: `src/App.css`, `src/assets/react.svg`
- Create: `.gitignore` (adicionar `.superpowers/`)

- [ ] **Step 1: Scaffold do Vite em pasta temporária e mover para a raiz**

```bash
npm create vite@latest ceasa-app -- --template react-ts
cp -r ceasa-app/. .
rm -rf ceasa-app
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install lucide-react
```

- [ ] **Step 3: Configurar o Vite**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 4: Definir tokens de design**

Replace `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-canvas: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-ink: #1F2937;
  --color-ink-soft: #6B7280;
  --color-line: #E5E7EB;
  --color-status-free: #10B981;
  --color-status-busy: #EF4444;
  --color-status-alert: #F59E0B;
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  background: var(--color-canvas);
  font-family: var(--font-sans);
}
```

- [ ] **Step 5: Limpar arquivos padrão e criar App mínimo**

Delete `src/App.css`, `src/assets/react.svg`.

Replace `src/App.tsx`:

```tsx
export default function App() {
  return <div className="p-8 text-ink">CEASA · Gêmeo Digital</div>;
}
```

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/print.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/styles/print.css`:

```css
@media print {
  body * {
    visibility: hidden;
  }
  .print-area,
  .print-area * {
    visibility: visible;
  }
  .print-area {
    position: absolute;
    inset: 0;
    width: 100%;
  }
  .print-area::before {
    content: "CEASA · Sistema de Inteligência Logística";
    display: block;
    font-weight: 800;
    font-size: 14px;
    margin-bottom: 8px;
  }
}
```

- [ ] **Step 6: Adicionar `.superpowers/` ao gitignore**

Append to `.gitignore`:

```
.superpowers/
```

- [ ] **Step 7: Verificar que sobe**

Run: `npm run dev`
Expected: servidor Vite sobe sem erro e a página mostra "CEASA · Gêmeo Digital".

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite react ts + tailwind"
```

---

### Task 2: Tipos do domínio

**Files:**
- Create: `src/domain/types.ts`

- [ ] **Step 1: Criar os tipos**

Create `src/domain/types.ts`:

```ts
export type Sector = 'A' | 'B';

export type BayStatus = 'livre' | 'ocupado' | 'alerta';

export type EventType =
  | 'TRUCK_ARRIVED'
  | 'WEIGHED'
  | 'UNLOADING_STARTED'
  | 'UNLOADING_FINISHED'
  | 'CLEANING_DONE'
  | 'CV_ANOMALY'
  | 'CV_SIGNAL_LOST'
  | 'DEPARTED';

export type Turno = 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite';

export type Event = {
  id: string;
  simTime: number;
  type: EventType;
  boxId?: string;
  truckId?: string;
  meta?: {
    produto?: string;
    precoKg?: number;
    motivo?: string;
    volumeTon?: number;
    online?: boolean;
  };
};

export type Bay = {
  id: string;
  setor: Sector;
  status: BayStatus;
  produto?: string;
  truckId?: string;
  ocupacaoInicio?: number;
  tempoOcupacaoMin?: number;
  alertaMotivo?: string;
  rotatividade: number[];
};

export type TruckState = 'chegou' | 'pesando' | 'descarregando' | 'saindo';

export type Truck = {
  id: string;
  produto: string;
  estado: TruckState;
  boxId?: string;
  volumeTon: number;
};

export type WorldState = {
  now: number;
  turno: Turno;
  speed: 1 | 4 | 16;
  paused: boolean;
  bays: Record<string, Bay>;
  trucks: Record<string, Truck>;
  events: Event[];
  precos: Record<string, number>;
  cvOnline: boolean;
  cvPrecisao: number;
  cvUltimaSyncMin: number;
};

export type Kpis = {
  ocupacaoPct: number;
  alertas: number;
  volumeTon: number;
};
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat: add domain types"
```

---

### Task 3: Catálogo e RNG

**Files:**
- Create: `src/domain/catalog.ts`
- Create: `src/domain/rng.ts`

- [ ] **Step 1: Criar o catálogo**

Create `src/domain/catalog.ts`:

```ts
export type Produto = { nome: string; precoBase: number };

export const PRODUTOS: Produto[] = [
  { nome: 'Tomate', precoBase: 4.8 },
  { nome: 'Batata', precoBase: 3.1 },
  { nome: 'Cebola', precoBase: 5.25 },
  { nome: 'Cenoura', precoBase: 2.95 },
  { nome: 'Mandioca', precoBase: 3.6 },
  { nome: 'Banana', precoBase: 3.9 },
  { nome: 'Laranja', precoBase: 2.4 },
  { nome: 'Repolho', precoBase: 2.1 },
  { nome: 'Alface', precoBase: 1.8 },
  { nome: 'Pimentão', precoBase: 6.2 },
  { nome: 'Chuchu', precoBase: 2.3 },
  { nome: 'Abobrinha', precoBase: 3.4 },
];

export const SECTOR_BAY_COUNT = 12;

export const BAY_IDS: string[] = (['A', 'B'] as const).flatMap((setor) =>
  Array.from({ length: SECTOR_BAY_COUNT }, (_, i) => `${setor}${String(i + 1).padStart(2, '0')}`),
);

export const PLACAS = [
  'PXR-2A41',
  'QWE-1B22',
  'JKL-9C88',
  'MNO-4D77',
  'TUV-7E15',
  'GHI-3F90',
  'ABC-5G33',
  'DEF-8H62',
];

export function produtoForBay(bayId: string): Produto {
  const idx = BAY_IDS.indexOf(bayId);
  return PRODUTOS[((idx % PRODUTOS.length) + PRODUTOS.length) % PRODUTOS.length];
}
```

- [ ] **Step 2: Criar o RNG puro**

Create `src/domain/rng.ts`:

```ts
export function nextRandom(state: number): [number, number] {
  const a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, a];
}

export function randomInt(rng: number, min: number, max: number): [number, number] {
  const [v, next] = nextRandom(rng);
  return [min + Math.floor(v * (max - min + 1)), next];
}

export function pick<T>(rng: number, arr: T[]): [T, number] {
  const [v, next] = nextRandom(rng);
  return [arr[Math.floor(v * arr.length)], next];
}
```

- [ ] **Step 3: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/domain/catalog.ts src/domain/rng.ts
git commit -m "feat: add catalog and seeded rng"
```

---

### Task 4: Motor de simulação

**Files:**
- Create: `src/domain/engine.ts`

- [ ] **Step 1: Implementar o motor**

Create `src/domain/engine.ts`:

```ts
import { BAY_IDS, PRODUTOS } from './catalog';
import { nextRandom } from './rng';
import type { Bay, Event, Kpis, Turno, WorldState } from './types';

export const TURNO_LIMITE_MIN = 360;
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
      if (event.boxId && bays[event.boxId]) {
        const b = bays[event.boxId];
        const dur = event.simTime - (b.ocupacaoInicio ?? event.simTime);
        bays[event.boxId] = { ...b, rotatividade: pushSample(b.rotatividade, dur) };
      }
      break;
    }
    case 'DEPARTED': {
      if (event.truckId && trucks[event.truckId]) {
        const rest = { ...trucks };
        delete rest[event.truckId];
        return finish(state, rest, bays, event);
      }
      break;
    }
    case 'CLEANING_DONE': {
      if (event.boxId && bays[event.boxId]) {
        bays[event.boxId] = {
          ...bays[event.boxId],
          status: 'livre',
          produto: undefined,
          truckId: undefined,
          ocupacaoInicio: undefined,
          tempoOcupacaoMin: undefined,
          alertaMotivo: undefined,
        };
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
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/domain/engine.ts
git commit -m "feat: add event-sourced simulation engine"
```

---

### Task 5: Scheduler de jornadas

**Files:**
- Create: `src/domain/scheduler.ts`

- [ ] **Step 1: Implementar o scheduler**

Create `src/domain/scheduler.ts`:

```ts
import { BAY_IDS, PLACAS, PRODUTOS } from './catalog';
import { pick, randomInt, nextRandom } from './rng';
import type { Event, WorldState } from './types';

export function createJourney(
  state: WorldState,
  rng: number,
  startTime: number,
  reserved: Set<string>,
): [Event[], number] {
  let r = rng;

  const [produto, r1] = pick(r, PRODUTOS);
  r = r1;
  const [placa, r2] = pick(r, PLACAS);
  r = r2;

  const livres = BAY_IDS.filter(
    (id) => state.bays[id].status === 'livre' && !reserved.has(id),
  );
  const fallback = BAY_IDS.filter((id) => !reserved.has(id));
  const candidatos = livres.length > 0 ? livres : fallback.length > 0 ? fallback : BAY_IDS;
  const [bayId, r3] = pick(r, candidatos);
  r = r3;

  const [volume, r4] = randomInt(r, 5, 25);
  r = r4;
  const [g1, r5] = randomInt(r, 3, 6);
  r = r5;
  const [g2, r6] = randomInt(r, 8, 15);
  r = r6;
  const [dur, r7] = randomInt(r, 30, 90);
  r = r7;
  const [g3, r8] = randomInt(r, 5, 10);
  r = r8;
  const [g4, r9] = randomInt(r, 10, 20);
  r = r9;

  const tArrive = startTime;
  const tWeigh = tArrive + g1;
  const tStart = tWeigh + g2;
  const tFinish = tStart + dur;
  const tDepart = tFinish + g3;
  const tClean = tDepart + g4;

  const mk = (type: Event['type'], simTime: number, extra: Partial<Event> = {}): Event => ({
    id: `${type}-${placa}-${simTime}`,
    simTime,
    type,
    truckId: placa,
    boxId: bayId,
    ...extra,
  });

  const events: Event[] = [
    mk('TRUCK_ARRIVED', tArrive, { meta: { produto: produto.nome } }),
    mk('WEIGHED', tWeigh, { meta: { produto: produto.nome, volumeTon: volume } }),
    mk('UNLOADING_STARTED', tStart, { meta: { produto: produto.nome } }),
    mk('UNLOADING_FINISHED', tFinish),
    mk('DEPARTED', tDepart),
    mk('CLEANING_DONE', tClean),
  ];

  return [events, r];
}

export function refillQueue(
  state: WorldState,
  queue: Event[],
  rng: number,
): [Event[], number] {
  let q = queue;
  let r = rng;

  const reserved = new Set(
    q.filter((e) => e.type === 'UNLOADING_STARTED' && e.boxId).map((e) => e.boxId as string),
  );
  let lastTime = q.length > 0 ? Math.max(...q.map((e) => e.simTime)) : state.now;

  while (q.filter((e) => e.type === 'TRUCK_ARRIVED').length < 4) {
    const [gap, r1] = randomInt(r, 4, 18);
    r = r1;
    const startTime = lastTime + gap;
    const [journey, r2] = createJourney(state, r, startTime, reserved);
    r = r2;
    journey.forEach((e) => {
      if (e.boxId) reserved.add(e.boxId);
    });
    q = [...q, ...journey];
    lastTime = Math.max(...journey.map((e) => e.simTime));

    const [chance, r3] = nextRandom(r);
    r = r3;
    if (chance < 0.2) {
      const [durLost, r4] = randomInt(r, 3, 8);
      r = r4;
      const tLost = lastTime + 2;
      q = [
        ...q,
        {
          id: `CV_SIGNAL_LOST-off-${tLost}`,
          simTime: tLost,
          type: 'CV_SIGNAL_LOST',
          meta: { online: false, motivo: 'Sinal de vídeo perdido' },
        },
        {
          id: `CV_SIGNAL_LOST-on-${tLost + durLost}`,
          simTime: tLost + durLost,
          type: 'CV_SIGNAL_LOST',
          meta: { online: true },
        },
      ];
      lastTime = tLost + durLost;
    }

    const [anomalia, r5] = nextRandom(r);
    r = r5;
    if (anomalia < 0.25) {
      const tAnom = lastTime + 3;
      q = [
        ...q,
        {
          id: `CV_ANOMALY-giro-${tAnom}`,
          simTime: tAnom,
          type: 'CV_ANOMALY',
          meta: { motivo: 'Veículo parado em área de giro' },
        },
      ];
      lastTime = tAnom;
    }
  }

  return [q.slice().sort((a, b) => a.simTime - b.simTime), r];
}
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/domain/scheduler.ts
git commit -m "feat: add journey scheduler and queue refill"
```

---

### Task 6: Descrições de eventos

**Files:**
- Create: `src/domain/descriptions.ts`

- [ ] **Step 1: Implementar descrições e cores**

Create `src/domain/descriptions.ts`:

```ts
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
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/domain/descriptions.ts
git commit -m "feat: add event descriptions"
```

---

### Task 7: Estado global e relógio

**Files:**
- Create: `src/state/TwinContext.tsx`

- [ ] **Step 1: Implementar o contexto**

Create `src/state/TwinContext.tsx`:

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import {
  applyEvents,
  createInitialState,
  deriveKpis,
  deriveTurno,
  driftPrecos,
  enforceLimits,
  updateTempos,
} from '../domain/engine';
import { refillQueue } from '../domain/scheduler';
import type { Event, Kpis, WorldState } from '../domain/types';

export type TwinState = {
  world: WorldState;
  queue: Event[];
  rng: number;
  selectedBayId: string | null;
  reportOpen: boolean;
};

type Action =
  | { type: 'TICK' }
  | { type: 'SET_SPEED'; speed: 1 | 4 | 16 }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SELECT_BAY'; bayId: string | null }
  | { type: 'TOGGLE_REPORT'; open?: boolean };

function init(): TwinState {
  const world = createInitialState();
  const [queue, rng] = refillQueue(world, [], 42);
  return { world, queue, rng, selectedBayId: null, reportOpen: false };
}

function reducer(state: TwinState, action: Action): TwinState {
  switch (action.type) {
    case 'TICK': {
      if (state.world.paused) return state;
      const newNow = state.world.now + state.world.speed;
      const due = state.queue.filter((e) => e.simTime <= newNow);
      const remaining = state.queue.filter((e) => e.simTime > newNow);

      let world = applyEvents(state.world, due);
      world = { ...world, now: newNow };
      world = updateTempos(world);
      const [limited] = enforceLimits(world);
      world = limited;

      let rng = state.rng;
      const [precos, r1] = driftPrecos(world, rng);
      rng = r1;
      world = {
        ...world,
        precos,
        turno: deriveTurno(newNow),
        cvUltimaSyncMin: Math.min(9, world.cvUltimaSyncMin + (world.cvOnline ? world.speed : 1)),
      };

      const [queue, r2] = refillQueue(world, remaining, rng);
      rng = r2;
      return { ...state, world, queue, rng };
    }
    case 'SET_SPEED':
      return { ...state, world: { ...state.world, speed: action.speed } };
    case 'TOGGLE_PAUSE':
      return { ...state, world: { ...state.world, paused: !state.world.paused } };
    case 'SELECT_BAY':
      return { ...state, selectedBayId: action.bayId };
    case 'TOGGLE_REPORT':
      return { ...state, reportOpen: action.open ?? !state.reportOpen };
    default:
      return state;
  }
}

const StateContext = createContext<TwinState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function TwinProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useTwin(): TwinState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useTwin must be used within TwinProvider');
  return ctx;
}

export function useTwinDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useTwinDispatch must be used within TwinProvider');
  return ctx;
}

export function useKpis(): Kpis {
  const { world } = useTwin();
  return useMemo(() => deriveKpis(world), [world]);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/state/TwinContext.tsx
git commit -m "feat: add twin context, clock and reducer"
```

---

### Task 8: Cabeçalho e KPIs

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/KpiRow.tsx`

- [ ] **Step 1: Implementar o Header**

Create `src/components/Header.tsx`:

```tsx
import { CalendarClock, Radio } from 'lucide-react';
import { formatClock } from '../domain/engine';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

function ReportButton() {
  const dispatch = useTwinDispatch();
  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_REPORT', open: true })}
      className="rounded-md bg-[#0F172A] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1E293B]"
    >
      📊 Gerar Relatório de Cotações e Ocupação
    </button>
  );
}

export default function Header() {
  const { world } = useTwin();
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[#0F172A] text-sm font-extrabold text-white">
            CE
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight">
              CEASA <span className="text-[#2563EB]">| Sistema de Inteligência Logística</span>
            </div>
            <div className="text-[11px] text-ink-soft">
              Gêmeo digital · Monitoramento por visão computacional
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
              world.cvOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <Radio size={13} />
            {world.cvOnline
              ? `Câmeras CV: Online (${Math.round(world.cvPrecisao * 100)}% de precisão) · Última sync: ${world.cvUltimaSyncMin} min atrás`
              : 'Câmeras CV: Sinal perdido'}
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
```

- [ ] **Step 2: Implementar os KPIs**

Create `src/components/KpiRow.tsx`:

```tsx
import { AlertTriangle, Gauge, Truck } from 'lucide-react';
import { useKpis } from '../state/TwinContext';

export default function KpiRow() {
  const kpis = useKpis();
  const cards = [
    {
      label: 'Taxa de Ocupação Geral',
      value: `${kpis.ocupacaoPct}%`,
      icon: Gauge,
      tone: 'text-[#2563EB]',
    },
    {
      label: 'Boxes com Alerta de Permanência',
      value: String(kpis.alertas),
      icon: AlertTriangle,
      tone: 'text-[#F59E0B]',
    },
    {
      label: 'Volume Estimado de Descarga (ton)',
      value: String(kpis.volumeTon),
      icon: Truck,
      tone: 'text-[#10B981]',
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-line/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {c.label}
            </span>
            <c.icon size={16} className={c.tone} />
          </div>
          <div className="mt-2 text-3xl font-extrabold tabular-nums">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Montar no App**

Replace `src/App.tsx`:

```tsx
import { TwinProvider } from './state/TwinContext';
import Header from './components/Header';
import KpiRow from './components/KpiRow';

export default function App() {
  return (
    <TwinProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Header />
        <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-5">
          <KpiRow />
        </main>
      </div>
    </TwinProvider>
  );
}
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: header com badge CV verde, relógio avançando a cada segundo e 3 KPIs (ocupação começa em 0%).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/KpiRow.tsx src/App.tsx
git commit -m "feat: add header, cv badge and kpi row"
```

---

### Task 9: Planta espacial e boxes

**Files:**
- Create: `src/components/TruckChip.tsx`
- Create: `src/components/BayBox.tsx`
- Create: `src/components/SectorRow.tsx`
- Create: `src/components/FloorPlan.tsx`

- [ ] **Step 1: Implementar o TruckChip**

Create `src/components/TruckChip.tsx`:

```tsx
import type { Truck } from '../domain/types';

const TONE: Record<Truck['estado'], string> = {
  chegou: 'bg-slate-700',
  pesando: 'bg-amber-700',
  descarregando: 'bg-blue-700',
  saindo: 'bg-slate-500',
};

const LABEL: Record<Truck['estado'], string> = {
  chegou: 'chegou',
  pesando: 'na balança',
  descarregando: 'descarregando',
  saindo: 'saindo',
};

export default function TruckChip({ truck }: { truck: Truck }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold text-white ${TONE[truck.estado]}`}
    >
      🚚 {truck.id} · {LABEL[truck.estado]}
      {truck.boxId ? ` → ${truck.boxId}` : ''}
    </span>
  );
}
```

- [ ] **Step 2: Implementar o BayBox com tooltip**

Create `src/components/BayBox.tsx`:

```tsx
import { formatTempo } from '../domain/engine';
import type { Bay } from '../domain/types';
import { useTwinDispatch } from '../state/TwinContext';

const CORES: Record<Bay['status'], string> = {
  livre: 'bg-[#10B981] hover:bg-emerald-600',
  ocupado: 'bg-[#EF4444] hover:bg-red-600',
  alerta: 'bg-[#F59E0B] hover:bg-amber-600',
};

const LABEL: Record<Bay['status'], string> = {
  livre: 'Livre',
  ocupado: 'Ocupado',
  alerta: 'Alerta CV',
};

export default function BayBox({ bay }: { bay: Bay }) {
  const dispatch = useTwinDispatch();
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
            ? 'Livre'
            : bay.status === 'alerta'
              ? 'Alerta'
              : formatTempo(bay.tempoOcupacaoMin ?? 0)}
        </span>
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-44 -translate-x-1/2 rounded-md bg-[#0F172A] p-2 text-left text-[10px] leading-snug text-white shadow-lg group-hover:block">
        <div className="font-bold">
          Box {bay.id} · {LABEL[bay.status]}
        </div>
        {bay.produto && <div className="text-slate-300">Produto: {bay.produto}</div>}
        {bay.truckId && <div className="text-slate-300">Veículo: {bay.truckId}</div>}
        {bay.status !== 'livre' && (
          <div className="text-amber-300">
            Ocupação: {formatTempo(bay.tempoOcupacaoMin ?? 0)}
          </div>
        )}
        {bay.alertaMotivo && <div className="text-amber-300">⚠ {bay.alertaMotivo}</div>}
        <div className="mt-1 text-[9px] text-slate-400">Clique para ver a linha do tempo</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implementar o SectorRow**

Create `src/components/SectorRow.tsx`:

```tsx
import { BAY_IDS } from '../domain/catalog';
import { useTwin } from '../state/TwinContext';
import BayBox from './BayBox';

export default function SectorRow({ setor }: { setor: 'A' | 'B' }) {
  const { world } = useTwin();
  const ids = BAY_IDS.filter((id) => id.startsWith(setor));
  const ocupados = ids.filter((id) => world.bays[id].status !== 'livre').length;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <span>Setor {setor}</span>
        <span>
          {ocupados}/{ids.length} ocupados
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1.5">
        {ids.map((id) => (
          <BayBox key={id} bay={world.bays[id]} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implementar o FloorPlan**

Create `src/components/FloorPlan.tsx`:

```tsx
import { useTwin } from '../state/TwinContext';
import SectorRow from './SectorRow';
import TruckChip from './TruckChip';

export default function FloorPlan() {
  const { world } = useTwin();
  const trucks = Object.values(world.trucks);
  return (
    <section className="rounded-lg border border-line/70 bg-white p-4 shadow-sm">
      <div className="mb-3 grid grid-cols-3 gap-2 text-[11px] font-bold">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700">
          Portaria 1 · Balança
        </div>
        <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-amber-700">
          Área de giro
        </div>
        <div className="rounded-md border border-line bg-slate-50 px-3 py-1.5 text-right text-ink-soft">
          Portaria 2
        </div>
      </div>
      <div className="rounded-md bg-[#F1F5F9] p-3">
        <SectorRow setor="A" />
        <div className="my-3 flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border-y border-dashed border-slate-300 bg-slate-200/70 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Rua central de circulação
          </span>
          {trucks.length === 0 && (
            <span className="text-[11px] text-slate-400">sem veículos no pátio</span>
          )}
          {trucks.map((t) => (
            <TruckChip key={t.id} truck={t} />
          ))}
        </div>
        <SectorRow setor="B" />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Montar no App**

Replace `src/App.tsx`:

```tsx
import { TwinProvider } from './state/TwinContext';
import Header from './components/Header';
import KpiRow from './components/KpiRow';
import FloorPlan from './components/FloorPlan';

export default function App() {
  return (
    <TwinProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Header />
        <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-5">
          <KpiRow />
          <FloorPlan />
        </main>
      </div>
    </TwinProvider>
  );
}
```

- [ ] **Step 6: Verificar no navegador**

Run: `npm run dev`
Expected: 24 boxes em duas faixas; com o tempo rodando, boxes ficam vermelhos e caminhões aparecem na rua central. Hover mostra tooltip.

- [ ] **Step 7: Commit**

```bash
git add src/components/TruckChip.tsx src/components/BayBox.tsx src/components/SectorRow.tsx src/components/FloorPlan.tsx src/App.tsx
git commit -m "feat: add spatial floor plan with interactive bays"
```

---

### Task 10: Feed de eventos e controles de tempo

**Files:**
- Create: `src/components/EventFeed.tsx`
- Create: `src/components/TimeControls.tsx`

- [ ] **Step 1: Implementar o EventFeed**

Create `src/components/EventFeed.tsx`:

```tsx
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
```

- [ ] **Step 2: Implementar o TimeControls**

Create `src/components/TimeControls.tsx`:

```tsx
import { Pause, Play } from 'lucide-react';
import { TURNO_DURACAO_MIN, formatClock } from '../domain/engine';
import { useTwin, useTwinDispatch } from '../state/TwinContext';

const SPEEDS: Array<1 | 4 | 16> = [1, 4, 16];

export default function TimeControls() {
  const { world } = useTwin();
  const dispatch = useTwinDispatch();
  const progresso = ((world.now % TURNO_DURACAO_MIN) / TURNO_DURACAO_MIN) * 100;
  return (
    <section className="flex items-center gap-3 rounded-lg border border-line/70 bg-white px-4 py-3 shadow-sm">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
        className="grid h-8 w-8 place-items-center rounded-md bg-[#0F172A] text-white"
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
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${progresso}%` }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums text-ink">
        {formatClock(world.now)} · Turno {world.turno}
      </span>
    </section>
  );
}
```

- [ ] **Step 3: Montar no App em layout de duas colunas**

Replace `src/App.tsx`:

```tsx
import { TwinProvider } from './state/TwinContext';
import Header from './components/Header';
import KpiRow from './components/KpiRow';
import FloorPlan from './components/FloorPlan';
import EventFeed from './components/EventFeed';
import TimeControls from './components/TimeControls';

export default function App() {
  return (
    <TwinProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Header />
        <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-5">
          <KpiRow />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <FloorPlan />
              <TimeControls />
            </div>
            <EventFeed />
          </div>
        </main>
      </div>
    </TwinProvider>
  );
}
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: feed à direita com eventos surgindo; botões 1x/4x/16x mudam o ritmo; pausar congela relógio e feed; barra de progresso do turno avança.

- [ ] **Step 5: Commit**

```bash
git add src/components/EventFeed.tsx src/components/TimeControls.tsx src/App.tsx
git commit -m "feat: add live event feed and time controls"
```

---

### Task 11: Drawer do box com linha do tempo

**Files:**
- Create: `src/components/BayDrawer.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implementar o BayDrawer**

Create `src/components/BayDrawer.tsx`:

```tsx
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
          <Info label="Veículo" value={bay.truckId ?? '—'} />
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
```

- [ ] **Step 2: Montar no App**

Add the import and element in `src/App.tsx`:

```tsx
import BayDrawer from './components/BayDrawer';
```

Inside the root `div`, after `</main>`, add:

```tsx
        <BayDrawer />
```

- [ ] **Step 3: Verificar no navegador**

Run: `npm run dev`
Expected: clicar em um box abre o drawer à direita com dados e linha do tempo; `Esc` e clique no overlay fecham.

- [ ] **Step 4: Commit**

```bash
git add src/components/BayDrawer.tsx src/App.tsx
git commit -m "feat: add bay drawer with event timeline"
```

---

### Task 12: Relatório e exportação

**Files:**
- Create: `src/components/ExportButtons.tsx`
- Create: `src/components/ReportModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implementar o ExportButtons**

Create `src/components/ExportButtons.tsx`:

```tsx
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
```

- [ ] **Step 2: Implementar o ReportModal**

Create `src/components/ReportModal.tsx`:

```tsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { PRODUTOS } from '../domain/catalog';
import { formatClock, formatTempo } from '../domain/engine';
import type { Bay, WorldState } from '../domain/types';
import { useTwin, useTwinDispatch } from '../state/TwinContext';
import ExportButtons, { type ReportRow } from './ExportButtons';

function buildRow(b: Bay, world: WorldState): ReportRow {
  const produto = b.produto ?? '—';
  const base = PRODUTOS.find((p) => p.nome === produto)?.precoBase ?? 0;
  const preco = world.precos[produto] ?? base;
  const variacao = base > 0 ? ((preco - base) / base) * 100 : 0;
  return { box: b.id, produto, preco, variacao, tempoMin: b.tempoOcupacaoMin ?? 0 };
}

export default function ReportModal() {
  const { world, reportOpen } = useTwin();
  const dispatch = useTwinDispatch();

  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'TOGGLE_REPORT', open: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reportOpen, dispatch]);

  if (!reportOpen) return null;
  const rows = Object.values(world.bays)
    .filter((b) => b.status !== 'livre')
    .map((b) => buildRow(b, world));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Relatório de cotações e ocupação"
    >
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => dispatch({ type: 'TOGGLE_REPORT', open: false })}
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl print:max-h-none print:overflow-visible">
        <div className="print-area">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
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
          <div className="max-h-[55vh] overflow-y-auto px-6 py-4 print:max-h-none print:overflow-visible">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-wide text-ink-soft">
                  <th className="py-2">Box</th>
                  <th className="py-2">Produto Principal</th>
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
                    <td colSpan={5} className="py-8 text-center text-ink-soft">
                      Nenhum box ocupado no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-6 py-4 print:hidden">
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
```

- [ ] **Step 3: Montar no App**

Add the import and element in `src/App.tsx`:

```tsx
import ReportModal from './components/ReportModal';
```

After `<BayDrawer />`, add:

```tsx
        <ReportModal />
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: botão do header abre o modal com a tabela; "Exportar CSV" baixa um `.csv` com `;` e BOM; "Exportar PDF" abre o diálogo de impressão com apenas a tabela visível e o cabeçalho institucional.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportButtons.tsx src/components/ReportModal.tsx src/App.tsx
git commit -m "feat: add report modal with csv and pdf export"
```

---

### Task 13: Verificação final

**Files:**
- Nenhum arquivo novo.

- [ ] **Step 1: Rodar o build de produção**

Run: `npm run build`
Expected: build conclui sem erros de TypeScript.

- [ ] **Step 2: Checar critérios de aceite no navegador**

Run: `npm run dev` e confirmar:

1. 24 boxes renderizam nos Setores A e B.
2. Eventos aparecem no feed e mudam boxes sem intervenção.
3. 1x/4x/16x alteram o ritmo; pausar congela relógio e feed.
4. Hover mostra tooltip com tempo de ocupação; clique abre o drawer com a linha do tempo.
5. Um box que excede 6h de ocupação fica amarelo (alerta) e conta no KPI de alertas.
6. O modal abre preenchido; CSV baixa; PDF isola a tabela.
7. O badge CV muda para "Sinal perdido" quando ocorre `CV_SIGNAL_LOST`.
8. A paleta e a tipografia seguem o spec.

- [ ] **Step 3: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore: final polish for demo"
```
