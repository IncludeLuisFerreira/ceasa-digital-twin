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
