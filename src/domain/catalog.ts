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
