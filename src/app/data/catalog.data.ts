import { CatalogSector } from '../models/catalog.models';

const CATALOG_BRAND_MARKS: Readonly<Record<string, string>> = {
  Dior: 'DIOR',
  Chanel: 'CHANEL',
  'Carolina Herrera': '212',
  Apple: 'AIR',
  Sony: 'SONY',
  Marshall: 'AMP',
  JBL: 'JBL',
  'Johnnie Walker': 'JW',
  "Jack Daniel's": 'JD',
  'Bombay Sapphire': 'BS',
  Corona: 'SUN',
  Lindt: 'LINDT',
  Toblerone: 'TRI',
  Pringles: 'MINI',
  "Reese's": 'DUO',
  Lancome: 'LAN',
  MAC: 'MAC',
  Fenty: 'FENTY',
  'Polo Ralph Lauren': 'RL',
  'Tommy Hilfiger': 'TH',
  'Calvin Klein': 'CK',
  'Nike Sportswear': 'NSW',
  'Ray-Ban': 'RAY',
  Prada: 'PRA',
  Tiffany: 'ATLAS',
  Montblanc: 'MB',
};

function bottleArt(options: {
  body?: string;
  label?: string;
  cap?: string;
  accent?: string;
  shape?: 'square';
}): string {
  const bodyFill = options.body ?? '#243a85';
  const labelFill = options.label ?? '#f3e0ba';
  const capFill = options.cap ?? labelFill;
  const accentFill = options.accent ?? '#ffffff';
  const bodyPath =
    options.shape === 'square'
      ? 'M66 94H154V110C154 123 161 136 169 147C176 157 180 169 180 182V228C180 249 163 266 142 266H78C57 266 40 249 40 228V182C40 169 44 157 51 147C59 136 66 123 66 110V94Z'
      : 'M74 84H146V102C146 116 152 128 162 139C171 149 176 161 176 175V228C176 249 159 266 138 266H82C61 266 44 249 44 228V175C44 161 49 149 58 139C68 128 74 116 74 102V84Z';

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="87" y="26" width="46" height="42" rx="14" fill="${capFill}" opacity="0.95"></rect>
      <rect x="95" y="10" width="30" height="24" rx="10" fill="${accentFill}" opacity="0.26"></rect>
      <path d="${bodyPath}" fill="${bodyFill}" opacity="0.96"></path>
      <path d="M70 116C82 126 96 130 110 130C124 130 138 126 150 116" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.26"></path>
      <rect x="66" y="142" width="88" height="70" rx="18" fill="${labelFill}" opacity="0.92"></rect>
      <path d="M86 168H134" stroke="${bodyFill}" stroke-linecap="round" stroke-width="4" opacity="0.58"></path>
      <path d="M92 186H128" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.72"></path>
      <path d="M84 224C94 232 102 236 110 236C118 236 126 232 136 224" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
    </svg>
  `;
}

function boxArt(options: { body?: string; cap?: string; accent?: string }): string {
  const bodyFill = options.body ?? '#d5a551';
  const capFill = options.cap ?? '#f6e7c7';
  const accentFill = options.accent ?? '#ffffff';

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M56 110L110 76L164 110V204L110 238L56 204V110Z" fill="${bodyFill}" opacity="0.96"></path>
      <path d="M110 76V238" stroke="${accentFill}" stroke-opacity="0.42" stroke-width="4"></path>
      <path d="M56 110L110 144L164 110" stroke="${accentFill}" stroke-opacity="0.3" stroke-width="4"></path>
      <rect x="78" y="136" width="64" height="48" rx="14" fill="${capFill}" opacity="0.92"></rect>
      <path d="M92 160H128" stroke="${bodyFill}" stroke-linecap="round" stroke-width="5" opacity="0.58"></path>
      <path d="M84 214C95 203 104 198 110 198C116 198 125 203 136 214" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
    </svg>
  `;
}

function prismArt(options: { body?: string; side?: string; accent?: string }): string {
  const bodyFill = options.body ?? '#e1b652';
  const accentFill = options.accent ?? '#2d1b0f';
  const sideFill = options.side ?? '#b8832b';

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 194L110 88L172 194H48Z" fill="${bodyFill}" opacity="0.97"></path>
      <path d="M110 88L140 194H172L110 88Z" fill="${sideFill}" opacity="0.92"></path>
      <path d="M72 158H140" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.52"></path>
      <path d="M82 178H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.32"></path>
    </svg>
  `;
}

function canArt(options: { body?: string; cap?: string; accent?: string }): string {
  const bodyFill = options.body ?? '#d64f45';
  const capFill = options.cap ?? '#f3d35c';
  const accentFill = options.accent ?? '#ffffff';

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="70" y="44" width="80" height="212" rx="34" fill="${bodyFill}" opacity="0.96"></rect>
      <ellipse cx="110" cy="62" rx="40" ry="14" fill="${capFill}" opacity="0.95"></ellipse>
      <ellipse cx="110" cy="236" rx="40" ry="14" fill="${capFill}" opacity="0.74"></ellipse>
      <rect x="74" y="106" width="72" height="72" rx="18" fill="${capFill}" opacity="0.92"></rect>
      <path d="M88 140H132" stroke="${bodyFill}" stroke-linecap="round" stroke-width="6" opacity="0.58"></path>
      <path d="M92 194C100 188 106 186 110 186C114 186 120 188 128 194" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.5"></path>
    </svg>
  `;
}

function pouchArt(options: { body?: string; stripe?: string; accent?: string }): string {
  const bodyFill = options.body ?? '#ec7c2b';
  const stripeFill = options.stripe ?? '#f8d7a7';
  const accentFill = options.accent ?? '#4b1908';

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M68 72H152L166 100L154 252H66L54 100L68 72Z" fill="${bodyFill}" opacity="0.96"></path>
      <path d="M82 72H138L128 98H92L82 72Z" fill="${stripeFill}" opacity="0.94"></path>
      <rect x="72" y="126" width="76" height="70" rx="20" fill="${stripeFill}" opacity="0.92"></rect>
      <path d="M90 160H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.56"></path>
      <path d="M92 212C98 206 104 203 110 203C116 203 122 206 128 212" stroke="${stripeFill}" stroke-linecap="round" stroke-width="5" opacity="0.74"></path>
    </svg>
  `;
}

function garmentArt(options: {
  body?: string;
  accent?: string;
  trim?: string;
  variant?: 'jacket' | 'polo' | 'hoodie' | 'knit';
}): string {
  const bodyFill = options.body ?? '#2d3342';
  const accentFill = options.accent ?? '#ffffff';
  const trimFill = options.trim ?? '#9da8ba';
  const variant = options.variant ?? 'jacket';

  let collar = '';
  let detail = '';

  if (variant === 'polo') {
    collar = `
      <path d="M90 72L110 92L130 72" fill="${trimFill}" opacity="0.96"></path>
      <path d="M102 82L110 104L118 82" fill="${accentFill}" opacity="0.24"></path>
    `;
    detail = `
      <path d="M110 106V228" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.38"></path>
      <path d="M92 134H128" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.3"></path>
    `;
  } else if (variant === 'hoodie') {
    collar = `
      <path d="M80 84C80 58 94 42 110 42C126 42 140 58 140 84V102H80V84Z" fill="${trimFill}" opacity="0.9"></path>
      <path d="M98 90C101 82 105 78 110 78C115 78 119 82 122 90" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
    `;
    detail = `
      <path d="M110 116V234" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.28"></path>
      <path d="M90 170H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.24"></path>
    `;
  } else if (variant === 'knit') {
    collar = `<path d="M92 78C96 70 103 66 110 66C117 66 124 70 128 78" stroke="${trimFill}" stroke-linecap="round" stroke-width="8" opacity="0.9"></path>`;
    detail = `
      <path d="M78 142H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
      <path d="M78 168H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
      <path d="M78 194H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
    `;
  } else {
    collar = `
      <path d="M88 72L110 96L132 72" fill="${trimFill}" opacity="0.96"></path>
      <path d="M104 82H116L110 104L104 82Z" fill="${accentFill}" opacity="0.2"></path>
    `;
    detail = `
      <path d="M110 102V234" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.38"></path>
      <path d="M86 136H98" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.22"></path>
      <path d="M122 136H134" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.22"></path>
    `;
  }

  return `
    <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M74 74H146L174 118L156 252H64L46 118L74 74Z" fill="${bodyFill}" opacity="0.96"></path>
      <path d="M74 74L46 118L62 132L82 110" fill="${trimFill}" opacity="0.3"></path>
      <path d="M146 74L174 118L158 132L138 110" fill="${trimFill}" opacity="0.3"></path>
      ${collar}
      ${detail}
      <path d="M82 248H138" stroke="${trimFill}" stroke-linecap="round" stroke-width="8" opacity="0.76"></path>
    </svg>
  `;
}

const sectorIcons = {
  perfumery: `
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 12H38"></path>
      <path d="M28 12V19"></path>
      <path d="M36 12V19"></path>
      <rect x="18" y="20" width="28" height="32" rx="9"></rect>
      <path d="M18 29C24 26.5 28.7 25.5 32 25.5C35.3 25.5 40 26.5 46 29"></path>
      <path d="M24 40C26.7 42.4 29.3 43.6 32 43.6C34.7 43.6 37.3 42.4 40 40"></path>
    </svg>
  `,
  electronics: `
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 33V30C18 22.8 23.8 17 31 17H33C40.2 17 46 22.8 46 30V33"></path>
      <rect x="14" y="31" width="9" height="17" rx="4.5"></rect>
      <rect x="41" y="31" width="9" height="17" rx="4.5"></rect>
      <path d="M23 39C25.6 42.4 28.5 44 32 44C35.5 44 38.4 42.4 41 39"></path>
      <path d="M49 22L52 19"></path>
    </svg>
  `,
  drinks: `
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11H28V18H20V11Z"></path>
      <path d="M18 20H30V27C30 32 34 36 34 43V48C34 52 31 55 27 55H21C17 55 14 52 14 48V43C14 36 18 32 18 27V20Z"></path>
      <path d="M39 31H50L48 49H41L39 31Z"></path>
      <path d="M41 37H48"></path>
    </svg>
  `,
  food: `
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="18" width="34" height="28" rx="8"></rect>
      <path d="M26 18V46"></path>
      <path d="M38 18V46"></path>
      <path d="M15 32H49"></path>
      <path d="M20 14L24 18"></path>
    </svg>
  `,
  apparel: `
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 18C32 14.7 34.5 12 37.5 12C40.5 12 43 14.7 43 18C43 20.4 41.8 22.4 39.3 23.9L34 27"></path>
      <path d="M14 40L32 27L50 40"></path>
      <path d="M18 40H46"></path>
    </svg>
  `,
} as const;

export function getCatalogBrandMark(brand: string): string {
  return CATALOG_BRAND_MARKS[brand] ?? brand.slice(0, 4).toUpperCase();
}

export const CATALOG_SECTORS: readonly CatalogSector[] = [
  {
    id: 'perfumery',
    name: 'Perfumaria',
    sup: 'edit',
    accent: '#d7b56d',
    soft: 'rgba(215, 181, 109, 0.18)',
    icon: sectorIcons.perfumery,
    description:
      'Fragrancias de assinatura com leitura editorial, menos volume visual e mais presenca de marca.',
    brandNote:
      'Dior, Chanel e Carolina Herrera atravessam a dobra como assinatura lenta de vitrine em Madison Avenue.',
    brands: [
      { name: 'Dior', logoClass: 'wordmark-serif wordmark-wide' },
      { name: 'Chanel', logoClass: 'wordmark-classic' },
      { name: 'Carolina Herrera', logoClass: 'wordmark-serif' },
    ],
    products: [
      {
        id: 'pf1',
        brand: 'Dior',
        name: 'Sauvage Elixir 60ml',
        note: 'ambar amadeirado',
        price: 'US$ 129 info',
        description:
          'Leitura intensa e limpa, pensada para presentear com impacto sem perder refinamento.',
        tone: 'rgba(197, 159, 88, 0.2)',
        position: 'center center',
        shape: 'tall',
        radius: '38px 18px 34px 20px',
        lift: 0,
      },
      {
        id: 'pf2',
        brand: 'Chanel',
        name: 'No.5 Eau de Parfum',
        note: 'floral iluminado',
        price: 'US$ 118 info',
        description:
          'Uma presenca mais luminosa e elegante, com pegada precisa de corredor premium.',
        tone: 'rgba(255, 255, 255, 0.12)',
        position: 'center 18%',
        shape: 'soft',
        radius: '24px 38px 22px 34px',
        lift: 32,
      },
      {
        id: 'pf3',
        brand: 'Carolina Herrera',
        name: '212 Sexy Eau de Parfum',
        note: 'doce noturno',
        price: 'US$ 112 info',
        description:
          'Um perfume de atmosfera urbana, mostrado como objeto de desejo e nao como vitrine pesada.',
        tone: 'rgba(111, 142, 112, 0.18)',
        position: 'center 24%',
        shape: 'portrait',
        radius: '32px 26px 34px 18px',
        lift: 10,
      },
      {
        id: 'pf4',
        brand: 'Dior',
        name: 'Miss Dior Eau de Parfum',
        note: 'floral luminoso',
        price: 'US$ 124 info',
        description:
          'Assinatura leve com brilho contido, ideal para uma dobra que privilegia respiro e sofisticao.',
        tone: 'rgba(214, 183, 110, 0.16)',
        position: 'center 10%',
        shape: 'wide',
        radius: '20px 34px 30px 24px',
        lift: 24,
      },
    ],
  },
  {
    id: 'electronics',
    name: 'Eletros',
    sup: 'sound',
    accent: '#91d4ff',
    soft: 'rgba(145, 212, 255, 0.17)',
    icon: sectorIcons.electronics,
    description:
      'Objetos compactos para viagem, mostrados com calma visual e foco em silhueta, superficie e uso.',
    brandNote:
      'Apple, Sony, Marshall e JBL deslizam como wordmarks de lounge, com bastante respiro entre cada assinatura.',
    brands: [
      { name: 'Apple', logoClass: 'wordmark-tech' },
      { name: 'Sony', logoClass: 'wordmark-mono' },
      { name: 'Marshall', logoClass: 'wordmark-serif' },
      { name: 'JBL', logoClass: 'wordmark-classic' },
    ],
    products: [
      {
        id: 'el1',
        brand: 'Apple',
        name: 'AirPods Pro Travel',
        note: 'audio imersivo',
        price: 'US$ 249 info',
        description:
          'Tecnologia de bolso com leitura limpa e framing pensado para uso em deslocamento.',
        tone: 'rgba(124, 203, 255, 0.18)',
        position: 'center center',
        shape: 'portrait',
        radius: '36px 18px 34px 24px',
        lift: 0,
      },
      {
        id: 'el2',
        brand: 'Apple',
        name: 'Apple Watch Transit',
        note: 'ritmo em pulso',
        price: 'US$ 279 info',
        description:
          'Um companion compacto, exposto de forma aspiracional e sem contaminar a dobra com ruido tecnico.',
        tone: 'rgba(150, 203, 255, 0.18)',
        position: 'center center',
        shape: 'wide',
        radius: '24px 40px 22px 36px',
        lift: 26,
      },
      {
        id: 'el3',
        brand: 'Sony',
        name: 'WH-1000XM5 Quiet Set',
        note: 'long haul audio',
        price: 'US$ 328 info',
        description:
          'Acabamento calmo e silencioso, tratado como objeto premium dentro de uma vitrine mais leve.',
        tone: 'rgba(178, 124, 255, 0.16)',
        position: 'center center',
        shape: 'soft',
        radius: '34px 28px 36px 18px',
        lift: 12,
      },
      {
        id: 'el4',
        brand: 'JBL',
        name: 'Clip Speaker',
        note: 'som de mesa',
        price: 'US$ 199 info',
        description:
          'Forma compacta com presenca forte, apresentada mais como design object do que como item de prateleira comum.',
        tone: 'rgba(255, 206, 125, 0.14)',
        position: 'center center',
        shape: 'wide',
        radius: '26px 34px 24px 34px',
        lift: 28,
      },
    ],
  },
  {
    id: 'drinks',
    name: 'Bebidas',
    sup: 'night',
    accent: '#f0a15d',
    soft: 'rgba(240, 161, 93, 0.18)',
    icon: sectorIcons.drinks,
    description:
      'Rotulos iconicos reinterpretados em silhuetas limpas, com o mesmo peso de uma vitrine duty free de madrugada.',
    brandNote:
      "Johnnie Walker, Jack Daniel's, Bombay Sapphire e Corona entram como logos tipograficas espacadas, quase flutuando no corredor.",
    brands: [
      { name: 'Johnnie Walker', logoClass: 'wordmark-italic' },
      { name: "Jack Daniel's", logoClass: 'wordmark-classic' },
      { name: 'Bombay Sapphire', logoClass: 'wordmark-mono' },
      { name: 'Corona', logoClass: 'wordmark-serif' },
    ],
    products: [
      {
        id: 'dr1',
        brand: 'Johnnie Walker',
        name: 'Black Label 1L',
        note: 'blend encorpado',
        price: 'US$ 46 info',
        description:
          'Garrafa de gesto inclinado e aura noturna, perfeita para uma apresentacao mais autoral do setor.',
        tone: 'rgba(240, 161, 93, 0.2)',
        position: 'center center',
        art: bottleArt({
          body: '#1c2028',
          label: '#e6d2a6',
          cap: '#b88a49',
          accent: '#ffffff',
          shape: 'square',
        }),
        shape: 'tall',
        radius: '36px 18px 32px 20px',
        lift: 18,
      },
      {
        id: 'dr2',
        brand: "Jack Daniel's",
        name: 'Old No. 7 1L',
        note: 'label iconic',
        price: 'US$ 48 info',
        description: 'Volume mais marcado e leitura grafica direta, sem copiar o rotulo literalmente.',
        tone: 'rgba(210, 170, 121, 0.18)',
        position: 'center center',
        art: bottleArt({
          body: '#121418',
          label: '#f0e9d8',
          cap: '#cba76e',
          accent: '#ffffff',
          shape: 'square',
        }),
        shape: 'soft',
        radius: '22px 36px 24px 34px',
        lift: 0,
      },
      {
        id: 'dr3',
        brand: 'Bombay Sapphire',
        name: 'Bombay Sapphire 750ml',
        note: 'botanicos citricos',
        price: 'US$ 38 info',
        description:
          'A garrafa entra como joia azul do corredor, com brilho contido e bastante respiro ao redor.',
        tone: 'rgba(99, 150, 255, 0.16)',
        position: 'center center',
        art: bottleArt({
          body: '#1f57a8',
          label: '#d5e6ff',
          cap: '#9fc1ff',
          accent: '#ffffff',
        }),
        shape: 'tall',
        radius: '38px 20px 34px 24px',
        lift: 28,
      },
      {
        id: 'dr4',
        brand: 'Corona',
        name: 'Corona Extra 330ml',
        note: 'fresh arrival',
        price: 'US$ 19 info',
        description:
          'Long neck solar com leitura leve e uma energia mais aberta dentro da selecao de bebidas.',
        tone: 'rgba(255, 208, 116, 0.18)',
        position: 'center center',
        art: bottleArt({
          body: '#d1a24b',
          label: '#fbf1d8',
          cap: '#fff3b7',
          accent: '#4a2b08',
        }),
        shape: 'portrait',
        radius: '28px 34px 22px 34px',
        lift: 12,
      },
    ],
  },
  {
    id: 'food',
    name: 'Comidas',
    sup: 'gifts',
    accent: '#f0c775',
    soft: 'rgba(240, 199, 117, 0.18)',
    icon: sectorIcons.food,
    description:
      'Snacks e gift packs entram como pequenos achados de corredor, com formas marcantes e composicao respirada.',
    brandNote:
      "Lindt, Toblerone, Pringles e Reese's aparecem como uma faixa suave de lembrancas de viagem, sem nenhum container pesado.",
    brands: [
      { name: 'Lindt', logoClass: 'wordmark-script' },
      { name: 'Toblerone', logoClass: 'wordmark-classic' },
      { name: 'Pringles', logoClass: 'wordmark-mono' },
      { name: "Reese's", logoClass: 'wordmark-wide' },
    ],
    products: [
      {
        id: 'fd1',
        brand: 'Lindt',
        name: 'Swiss Gift Selection',
        note: 'gift box dourada',
        price: 'US$ 28 info',
        description:
          'Uma caixa pensada como presente rapido, tratada aqui como objeto dourado de vitrine editorial.',
        tone: 'rgba(240, 199, 117, 0.18)',
        position: 'center center',
        art: boxArt({ body: '#caa04c', cap: '#f6e6c8', accent: '#fff7e7' }),
        shape: 'soft',
        radius: '36px 24px 34px 18px',
        lift: 6,
      },
      {
        id: 'fd2',
        brand: 'Toblerone',
        name: 'Travel Chocolate Pack',
        note: 'selecionado para viagem',
        price: 'US$ 16 info',
        description:
          'Chocolate de viagem tratado como destaque leve de vitrine, mais proximo de uma mesa-curadoria do que de uma prateleira comum.',
        tone: 'rgba(224, 183, 84, 0.18)',
        position: 'center center',
        art: prismArt({ body: '#e0b754', side: '#bc8831', accent: '#3a220d' }),
        shape: 'wide',
        radius: '22px 36px 24px 32px',
        lift: 30,
      },
      {
        id: 'fd3',
        brand: 'Pringles',
        name: 'Snack Break Crisps',
        note: 'carry on snack',
        price: 'US$ 12 info',
        description:
          'Um snack rapido de corredor, escolhido para dar contraste de textura e cor sem transformar a dobra em marketplace.',
        tone: 'rgba(255, 132, 102, 0.16)',
        position: 'center center',
        art: canArt({ body: '#cf4e3f', cap: '#f1d25a', accent: '#fff2cf' }),
        shape: 'tall',
        radius: '34px 18px 30px 22px',
        lift: 14,
      },
      {
        id: 'fd4',
        brand: "Reese's",
        name: 'Peanut Candy Mix',
        note: 'sweet carry',
        price: 'US$ 9 info',
        description:
          'Pequeno mix doce para fechar a composicao com calor cromatico e uma leitura mais casual de freeshop.',
        tone: 'rgba(234, 122, 45, 0.18)',
        position: 'center center',
        art: pouchArt({ body: '#ea7a2d', stripe: '#f8d6a8', accent: '#56210a' }),
        shape: 'soft',
        radius: '24px 32px 22px 34px',
        lift: 24,
      },
    ],
  },
  {
    id: 'apparel',
    name: 'Vestuario',
    sup: 'wardrobe',
    accent: '#9fb4d8',
    soft: 'rgba(159, 180, 216, 0.18)',
    icon: sectorIcons.apparel,
    description:
      'Pecas de viagem com corte limpo e silhueta forte, tratadas como objetos editoriais e nao como grade de loja.',
    brandNote:
      'Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein e Nike Sportswear entram como um corredor de guarda-roupa cosmopolita, leve e aspiracional.',
    brands: [
      { name: 'Polo Ralph Lauren', logoClass: 'wordmark-serif' },
      { name: 'Tommy Hilfiger', logoClass: 'wordmark-wide' },
      { name: 'Calvin Klein', logoClass: 'wordmark-classic' },
      { name: 'Nike Sportswear', logoClass: 'wordmark-tech' },
    ],
    products: [
      {
        id: 'vt1',
        brand: 'Polo Ralph Lauren',
        name: 'Travel Polo Midnight',
        note: 'gola limpa',
        price: 'US$ 86 info',
        description:
          'Uma polo enxuta, pensada para viagem e mostrada com a mesma calma visual de uma vitrine de downtown Manhattan.',
        tone: 'rgba(159, 180, 216, 0.16)',
        position: 'center top',
        art: garmentArt({ variant: 'polo', body: '#202f4f', trim: '#d8e2f1', accent: '#ffffff' }),
        shape: 'tall',
        radius: '34px 20px 30px 24px',
        lift: 0,
      },
      {
        id: 'vt2',
        brand: 'Tommy Hilfiger',
        name: 'Downtown Bomber',
        note: 'layer urbana',
        price: 'US$ 119 info',
        description:
          'Jaqueta compacta com leitura grafica forte, apresentada como peca-objeto e sem ruido de marketplace.',
        tone: 'rgba(117, 137, 182, 0.18)',
        position: 'center top',
        art: garmentArt({
          variant: 'jacket',
          body: '#1f2534',
          trim: '#d5d9e3',
          accent: '#df3f4a',
        }),
        shape: 'soft',
        radius: '24px 36px 22px 34px',
        lift: 26,
      },
      {
        id: 'vt3',
        brand: 'Calvin Klein',
        name: 'Essential Knit Sand',
        note: 'malha leve',
        price: 'US$ 94 info',
        description:
          'Textura minimalista e leitura suave para manter o setor com postura premium e muito respiro.',
        tone: 'rgba(217, 209, 195, 0.18)',
        position: 'center top',
        art: garmentArt({ variant: 'knit', body: '#d9d1c3', trim: '#ffffff', accent: '#5f5a52' }),
        shape: 'wide',
        radius: '30px 30px 24px 34px',
        lift: 12,
      },
      {
        id: 'vt4',
        brand: 'Nike Sportswear',
        name: 'Manhattan Hoodie',
        note: 'street comfort',
        price: 'US$ 102 info',
        description:
          'Uma silhueta casual de viagem, tratada como destaque editorial dentro da dobra e nao como card repetitivo.',
        tone: 'rgba(170, 178, 191, 0.18)',
        position: 'center center',
        art: garmentArt({
          variant: 'hoodie',
          body: '#2a2f38',
          trim: '#aab2bf',
          accent: '#dfe7f5',
        }),
        shape: 'portrait',
        radius: '36px 18px 32px 22px',
        lift: 24,
      },
    ],
  },
];

export const CATALOG_FEATURED_MIX: readonly string[] = [
  'pf1',
  'el1',
  'dr3',
  'vt2',
  'fd2',
  'pf2',
  'el3',
  'dr1',
  'vt4',
  'fd1',
];
