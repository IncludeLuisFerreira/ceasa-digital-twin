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
    placa?: string;
    procedencia?: string;
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
  placa: string;
  produto: string;
  procedencia: string;
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
  volumeTurno: number;
  cvOnline: boolean;
  cvPrecisao: number;
  cvUltimaSyncMin: number;
};

export type Kpis = {
  ocupacaoPct: number;
  alertas: number;
  volumeTon: number;
};
