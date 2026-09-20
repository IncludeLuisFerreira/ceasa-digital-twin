# CEASA · Gêmeo Digital Logístico — Design

Data: 2026-09-20
Status: Aprovado para planejamento

## 1. Visão Geral

Aplicação frontend de simulação que funciona como um **gêmeo digital** da operação
de boxes do CEASA (Centrais de Abastecimento). Câmeras de Visão Computacional (CV)
monitoram a ocupação física dos boxes; o sistema reproduz essa operação em uma planta
espacial com um **fluxo de eventos rastreável**, em tempo acelerado, para que os
eventos reais (chegada, pesagem, descarga, ocupação, anomalia, limpeza e saída)
sejam visíveis acontecendo.

É um protótipo de hackathon: dados simulados, sem backend. O objetivo é impacto
visual e narrativa de demo, com austeridade e densidade de dados de um sistema
GovTech real.

### Vocabulário (baseado na operação real do CEASA)

- Quem vende é o **produtor rural** (com credencial), que chega pela **portaria**,
  passa pela **balança** e faz a **descarga** da mercadoria no box.
- O box é a unidade de **comercialização**: "disponível/vago" quando livre,
  "em comercialização" quando ocupado, e "ocorrência CV" em anomalia.
- Cada produto tem uma **procedência** (município/UF de origem).
- O relatório usa a linguagem de mercado: **Boletim de Cotações** (preço médio/kg
  e variação), **oferta** e **ocupação**.
- Fontes: CeasaMinas (Produtor Rural, Informações de Mercado, Regulamento de
  Mercado, Mapa Interno).

### Objetivos

- Exibir uma planta espacial fiel da operação (Setores A e B, rua de circulação,
  portaria/balança, área de giro) com o estado de cada box.
- Simular a operação de forma **orientada a eventos**: toda mudança de estado tem
  causa, hora e origem rastreáveis.
- Mostrar um feed de eventos ao vivo e a linha do tempo de cada box.
- Rodar em tempo acelerado (1x/4x/16x) com pausa, para a demo mostrar o ciclo
  completo rapidamente.
- Gerar um relatório de cotações e ocupação exportável (CSV real, PDF via impressão).

### Não-objetivos

- Backend, API, banco de dados ou ingestão real das câmeras.
- Autenticação, multiusuário, permissões.
- Simulação de física contínua de caminhões (trajetórias, colisão, filas com
  dinâmica de fluidos). O movimento é representado por eventos discretos.
- Testes automatizados (fora do escopo desta entrega).
- Responsividade mobile completa (foco em desktop/notebook de apresentação).

## 2. Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (paleta e tokens definidos abaixo)
- **Fonte Inter** (via Google Fonts)
- **Ícones Lucide React**
- Exportação: `Blob`/`URL.createObjectURL` para CSV; `window.print()` + `print.css`
  para PDF. Sem dependências extras de geração de PDF.
- Gerenciamento de estado: React Context + `useReducer` (sem biblioteca externa).

## 3. Arquitetura

O coração é uma simulação **orientada a eventos**. O `WorldState` exibido não
guarda status "solto" por box: ele é **derivado** de uma lista de eventos. O feed de
eventos e a linha do tempo do box são a mesma fonte de verdade.

```
src/
  main.tsx
  App.tsx
  domain/
    types.ts        # Event, EventType, Bay, Truck, WorldState, Turno, BayStatus
    catalog.ts      # produtos, preços base, mapeamento box→produto
    scheduler.ts    # gera e enfileira eventos futuros
    engine.ts       # aplica evento → novo estado; deriva status e KPIs
    rng.ts          # RNG com seed fixa (demo reproduzível)
  state/
    TwinContext.tsx # provider, reducer, relógio simulado, ações de controle
  components/
    Header.tsx
    KpiRow.tsx
    FloorPlan.tsx
    SectorRow.tsx
    BayBox.tsx
    TruckChip.tsx
    EventFeed.tsx
    TimeControls.tsx
    BayDrawer.tsx
    ReportModal.tsx
    ExportButtons.tsx
  hooks/
    useClock.ts
  styles/
    print.css
```

### Fluxo de dados

1. O `scheduler` gera eventos futuros com `simTime` (chegadas, descargas, saídas,
   anomalias) e os mantém em uma fila ordenada por tempo.
2. `useClock` avança o relógio simulado conforme a velocidade (1x/4x/16x).
3. A cada avanço, eventos cujo `simTime <= now` são aplicados via `engine.applyEvent`,
   produzindo o novo `WorldState` e sendo anexados ao feed.
4. O `engine` então deriva status de box, KPIs e novas anomalias, e o `scheduler`
   reabastece a fila para manter a operação viva.
5. Os componentes renderizam a partir do `WorldState` derivado.

O `engine` e o `scheduler` são funções puras (recebem estado, retornam estado/eventos),
o que mantém a simulação previsível e fácil de ajustar.

## 4. Modelo de Dados

### EventType

`TRUCK_ARRIVED`, `WEIGHED`, `UNLOADING_STARTED`, `UNLOADING_FINISHED`,
`CLEANING_DONE`, `CV_ANOMALY`, `CV_SIGNAL_LOST`, `DEPARTED`.

Observação: `UNLOADING_STARTED` é o evento que marca a ocupação do box (o CV
confirma veículo/mercadoria). A liberação acontece apenas com `CLEANING_DONE`.

### Event

```ts
type Event = {
  id: string;
  simTime: number;        // minutos simulados desde o início do turno
  type: EventType;
  boxId?: string;         // ex: "A02"
  truckId?: string;       // ex: "PXR-2A41"
  meta?: {
    produto?: string;
    precoKg?: number;
    motivo?: string;      // motivo de anomalia
    volumeTon?: number;
    placa?: string;       // placa exibida do caminhão
  };
};
```

### Bay

```ts
type BayStatus = 'livre' | 'ocupado' | 'alerta';

type Bay = {
  id: string;             // "A01".."A12", "B01".."B12"
  setor: 'A' | 'B';
  status: BayStatus;
  produto?: string;
  truckId?: string;
  ocupacaoInicio?: number;  // simTime em que ficou ocupado
  tempoOcupacaoMin?: number; // derivado: now - ocupacaoInicio
  alertaMotivo?: string;
  rotatividade: number[];   // 6 valores (últimas 6h) para o sparkline
};
```

### Truck

```ts
type Truck = {
  id: string;             // id único da jornada, ex: "PXR-2A41-1234"
  placa: string;          // placa exibida, ex: "PXR-2A41"
  produto: string;
  procedencia: string;    // origem do produto, ex: "Petrolina/PE"
  estado: 'chegou' | 'pesando' | 'descarregando' | 'saindo';
  boxId?: string;
  volumeTon: number;
};
```

### WorldState

```ts
type WorldState = {
  now: number;                 // minuto simulado atual
  turno: Turno;                // 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite'
  speed: 1 | 4 | 16;           // multiplicador de tempo
  paused: boolean;
  bays: Record<string, Bay>;
  trucks: Record<string, Truck>;
  events: Event[];             // feed completo, mais recente primeiro
  precos: Record<string, number>; // preço atual por produto (drift por tick)
  volumeTurno: number;         // ton acumuladas no turno atual (reseta na virada)
  cvOnline: boolean;           // false → badge "sinal perdido"
  cvPrecisao: number;          // ex: 0.98
  cvUltimaSyncMin: number;     // minutos desde a última sync
};
```

### KPIs (derivados, não armazenados)

- **Taxa de Ocupação Geral**: `boxes ocupados + alerta / total`.
- **Boxes com Alerta de Permanência**: contagem de `status === 'alerta'`.
- **Volume Estimado de Descarga (ton)**: soma dos volumes de eventos
  `UNLOADING_FINISHED` no turno.

## 5. Regras da Simulação

- **RNG com seed fixa** (`rng.ts`) para que a demo seja reproduzível e testável
  manualmente.
- **Chegada**: um caminhão chega em uma portaria em intervalos variáveis.
- **Pesagem**: passa pela balança; registra volume estimado.
- **Descarga**: ocupa um box livre do setor correspondente ao produto.
- **Ocupação**: box vira `ocupado` e inicia contagem de permanência.
- **Limite de turno**: cada turno tem um tempo máximo de permanência (ex: 6h).
  Se a ocupação exceder o limite, o box vira `alerta` (`CV_ANOMALY`,
  motivo "tempo de ocupação excedido").
- **Anomalia CV**: veículo parado em área de giro, ou ocupação acima do limite,
  gera `CV_ANOMALY`.
- **Limpeza**: ao sair, o box só volta a `livre` após `CLEANING_DONE` confirmado
  pelo CV.
- **Sinal CV**: ocasionalmente `CV_SIGNAL_LOST` (curto) → badge muda para
  "sinal perdido" e volta a online.
- **Rotatividade**: cada box mantém 6 amostras horárias usadas no sparkline.
- **Velocidade**: 1x = 1 minuto simulado por segundo real; 4x e 16x multiplicam.
- O `scheduler` mantém a fila de eventos futuros sempre abastecida para a
  operação nunca parecer parada.

## 6. Interface

### 6.1 Header institucional

- Logo/brasão estilizado: **CEASA | Sistema de Inteligência Logística**.
- Badge do CV: `Câmeras CV: Online (98% de precisão) | Última sync: 2 min atrás`.
  Quando `cvOnline === false`, o badge muda para estado de erro ("sinal perdido").
- Relógio e turno ao vivo: ex: `Madrugada · 04:31`.

### 6.2 KPIs superiores

Três cards: **Taxa de Ocupação dos Boxes**, **Boxes com Ocorrência CV**,
**Volume Ofertado no Turno (ton)**. Valores animam suavemente na mudança.

### 6.3 Planta espacial (núcleo) — variante "Espinha central"

- **Setor A** em uma faixa superior com 12 boxes; **Setor B** em uma faixa inferior
  com 12 boxes.
- Entre os setores, a **rua central de circulação** com chips de caminhões
  (placa + destino/estado).
- Barra superior da planta: **Portaria 1 · Balança** (esquerda), **Área de giro**
  (centro), **Portaria 2** (direita).
- Cada box: número, cor de status, e tempo de ocupação quando ocupado.
- **Hover no box** → tooltip com status, tempo de ocupação e motivo do alerta.
- **Clique no box** → abre o `BayDrawer`.

### 6.4 Cores e tokens

- Fundo: `#F5F7FA`; cards: `#FFFFFF` com sombra sutil.
- Status: Box disponível `#10B981`, Em comercialização `#EF4444`, Ocorrência CV `#F59E0B`.
- Texto: `#1F2937`; secundário `#6B7280`; bordas `#E5E7EB`.
- Tipografia: Inter, sans-serif técnica. Números tabulares nos KPIs e tabelas.

### 6.5 Feed de eventos

- Painel à direita: lista cronológica (mais recente no topo), com timestamp,
  ponto colorido por tipo e descrição curta.
- Indicador "ao vivo".
- Tipos de evento com cor: anomalia = amarelo, ocupação/descarga = vermelho,
  liberação = verde, entrada = azul.

### 6.6 Controles de tempo

- Botões `1x` / `4x` / `16x`, botão pausar/retomar, e barra de progresso do turno.
- Exibe o horário simulado atual.

### 6.7 Drawer do box

Abre ao clicar em um box, mantendo o mapa visível ao fundo:
- Cabeçalho com número do box, status e produto.
- Linha do tempo de eventos do box (chegada → descarga → ocupação → saída),
  com hora e descrição.
- Dados: placa, volume, tempo total de ocupação, alertas.
- Fecha por botão, tecla `Esc` ou clique no overlay.

### 6.8 Relatório (modal central)

- Botão de destaque no topo direito: **📊 Gerar Relatório de Cotações e Ocupação**.
- Abre modal central com tabela densa: `Box | Produto Principal | Procedência |
  Preço Médio/kg | Variação vs. Ontem | Tempo de Ocupação`.
- Variação com cor (alta = vermelho, baixa = verde) e setas.
- Rodapé: **Exportar PDF** e **Exportar CSV para Secretaria de Abastecimento**.
- Fecha por botão, `Esc` ou overlay.

### 6.9 Exportação

- **CSV real**: gera arquivo com cabeçalho e linhas do relatório, baixado via
  `Blob`/`URL.createObjectURL`.
- **PDF**: `window.print()` com `print.css` que isola a tabela do relatório,
  esconde o resto da UI e adiciona cabeçalho institucional para impressão.

## 7. Estados de Erro e Acessibilidade

- **CV offline**: badge de erro no header; boxes sem atualização recebem indicação
  discreta de dado desatualizado.
- **Sem eventos ainda**: feed mostra estado vazio ("aguardando eventos...").
- **Modal/drawer**: foco preso no painel enquanto aberto, `aria-modal`, fechamento
  com `Esc`, `aria-label` nos botões de ícone.
- Contraste adequado nos estados de status (texto branco sobre cores de status).

## 8. Critérios de Aceite

1. `npm run dev` sobe o app sem erros e a planta renderiza 24 boxes nos Setores A e B.
2. Com o tempo rodando, eventos aparecem no feed e mudam o estado dos boxes sem
   intervenção manual.
3. Alternar 1x/4x/16x altera visivelmente o ritmo dos eventos; pausar congela o
   relógio e o feed.
4. Hover no box mostra tooltip com tempo de ocupação; clique abre o drawer com a
   linha do tempo correta daquele box.
5. Um box que excede o limite de turno vira `alerta` (amarelo) e aparece no KPI de
   alertas.
6. O modal de relatório abre com a tabela preenchida; **Exportar CSV** baixa um
   arquivo válido; **Exportar PDF** abre o diálogo de impressão com a tabela isolada.
7. O badge do CV reflete `cvOnline`, inclusive o estado de sinal perdido.
8. A estética segue a paleta e a tipografia definidas, com aparência GovTech.

## 9. Riscos e Mitigações

- **Simulação parecer parada** → `scheduler` garante eventos frequentes e tempo
  acelerado por padrão.
- **Excesso de escopo visual** → foco em desktop; sem responsividade mobile completa.
- **Demo não reproduzível** → RNG com seed fixa.
- **PDF inconsistente entre navegadores** → `print.css` simples e testado
  manualmente no navegador da apresentação.
