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
      const novoTurno = deriveTurno(newNow);
      world = {
        ...world,
        precos,
        turno: novoTurno,
        volumeTurno: novoTurno === state.world.turno ? world.volumeTurno : 0,
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
