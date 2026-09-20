# CEASA · Gêmeo Digital Logístico

Protótipo de dashboard que simula, como um **gêmeo digital**, a operação de boxes de
um CEASA (Central de Abastecimento): chegada do produtor, pesagem na balança,
descarga e comercialização nos boxes, com monitoramento por câmeras de visão
computacional (CV).

**Demo:** https://includeluisferreira.github.io/ceasa-digital-twin/

## O que mostra

- **Planta espacial** dos Setores A e B (24 boxes), rua central, portaria do
  produtor, balança e área de manobra.
- **Simulação orientada a eventos**: toda mudança tem causa, hora e origem
  rastreáveis (chegada → pesagem → descarga → comercialização → saída).
- **Feed de eventos ao vivo** e **linha do tempo por box** (clique no box).
- **Tempo acelerado** (1x / 4x / 16x) com pausa, para ver o turno acontecer.
- **KPIs**: taxa de ocupação, boxes com ocorrência CV e volume ofertado no turno.
- **Relatório de cotações e ocupação** com procedência dos produtos, exportável em
  CSV e PDF (impressão).
- Vocabulário alinhado à operação real do CEASA (produtor rural, balança, descarga,
  comercialização, procedência, boletim de cotações).

## Stack

Vite · React · TypeScript · Tailwind CSS · Lucide · Inter. Sem backend: os dados são
simulados no cliente, com RNG de seed fixa (demo reproduzível).

## Rodando localmente

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Deploy

Publicado automaticamente no GitHub Pages a cada push na `main`
(`.github/workflows/deploy.yml`).

## Estrutura

```
src/
  domain/     tipos, catálogo de produtos, RNG, motor e scheduler da simulação
  state/      contexto global, relógio simulado e reducer
  components/ header, KPIs, planta, feed, controles, drawer do box e relatório
```

## Documentação

- Design: `docs/superpowers/specs/2026-09-20-ceasa-digital-twin-design.md`
- Plano de implementação: `docs/superpowers/plans/2026-09-20-ceasa-digital-twin.md`
