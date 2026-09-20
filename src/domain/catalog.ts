export type Produto = { nome: string; precoBase: number; procedencia: string };

export const PRODUTOS: Produto[] = [
  { nome: 'Tomate', precoBase: 4.8, procedencia: 'Petrolina/PE' },
  { nome: 'Batata', precoBase: 3.1, procedencia: 'Vargem Grande do Sul/SP' },
  { nome: 'Cebola', precoBase: 5.25, procedencia: 'Piedade/SP' },
  { nome: 'Cenoura', precoBase: 2.95, procedencia: 'Carandaí/MG' },
  { nome: 'Mandioca', precoBase: 3.6, procedencia: 'Tupã/SP' },
  { nome: 'Banana', precoBase: 3.9, procedencia: 'Jaíba/MG' },
  { nome: 'Laranja', precoBase: 2.4, procedencia: 'Bebedouro/SP' },
  { nome: 'Repolho', precoBase: 2.1, procedencia: 'Piedade/SP' },
  { nome: 'Alface', precoBase: 1.8, procedencia: 'Holambra/SP' },
  { nome: 'Pimentão', precoBase: 6.2, procedencia: 'Holambra/SP' },
  { nome: 'Chuchu', precoBase: 2.3, procedencia: 'Mogi das Cruzes/SP' },
  { nome: 'Abobrinha', precoBase: 3.4, procedencia: 'Mogi das Cruzes/SP' },
];

export const SECTOR_BAY_COUNT = 12;

export const SETORES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const BAY_IDS: string[] = SETORES.flatMap((setor) =>
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
