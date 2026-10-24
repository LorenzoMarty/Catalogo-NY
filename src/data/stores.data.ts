import { StoreHours, StorePanel } from '../models/store.models';

// FICTITIOUS PLACEHOLDER — replace with real data before launch (stores open every day, holidays included)
const ALL_WEEK_HOURS: StoreHours = {
  1: ['09:00', '18:00'],
  2: ['09:00', '18:00'],
  3: ['09:00', '18:00'],
  4: ['09:00', '18:00'],
  5: ['09:00', '18:00'],
  6: ['09:00', '18:00'],
  0: ['09:00', '18:00'],
};

export const STORE_PANELS: readonly StorePanel[] = [
  {
    id: 'store-bento',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    phone: '+55 55 90000-0001',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    hours: ALL_WEEK_HOURS,
    timeZone: 'America/Sao_Paulo',
    displayIndex: '01',
    name: 'New York Filial Bento',
    status: 'Uruguaiana - RS',
    district: 'Centro de Uruguaiana / Gen. Bento Martins',
    title: 'New York Filial Bento',
    mobileSignature: 'Centro • Gen. Bento Martins, 2968',
    tagline: 'A poucos passos da principal avenida.',
    noteLocation: 'R. Gen. Bento Martins, 2968',
    address: 'Centro, Uruguaiana - RS, 97501-636',
    noteMeta: 'No coracao do centro',
    marker: 'Gen. Bento Martins',
    imageAlt: 'Fachada da New York Filial Bento no Centro de Uruguaiana',
    imageSrc: 'assets/ui/store-bento-640.webp',
    imageSrcset:
      'assets/ui/store-bento-640.webp 640w, assets/ui/store-bento-768.webp 768w, assets/ui/store-bento-1024.webp 1024w',
    imageWidth: 1024,
    imageHeight: 1536,
    accent: 'rgba(207, 164, 102, 0.24)',
    accentStrong: 'rgba(245, 214, 161, 0.5)',
    position: 'center 42%',
  },
  {
    id: 'store-duque',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    phone: '+55 55 90000-0002',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    hours: ALL_WEEK_HOURS,
    timeZone: 'America/Sao_Paulo',
    displayIndex: '02',
    name: 'New York Filial Duque',
    status: 'Uruguaiana - RS',
    district: 'Centro de Uruguaiana / Duque de Caxias',
    title: 'New York Filial Duque',
    mobileSignature: 'Centro • Duque de Caxias, 1518',
    tagline: 'Entre vitrines e movimento urbano.',
    noteLocation: 'Rua Duque de Caxias, 1518',
    address: 'Centro',
    noteMeta: 'Entre fluxo e conveniencia',
    marker: 'Duque de Caxias',
    imageAlt: 'Fachada da New York Filial Duque no Centro de Uruguaiana',
    imageSrc: 'assets/ui/store-duque-640.webp',
    imageSrcset:
      'assets/ui/store-duque-640.webp 640w, assets/ui/store-duque-768.webp 768w, assets/ui/store-duque-1024.webp 1024w',
    imageWidth: 1024,
    imageHeight: 1536,
    accent: 'rgba(150, 181, 202, 0.2)',
    accentStrong: 'rgba(214, 232, 245, 0.44)',
    position: 'center 48%',
  },
  {
    id: 'store-matriz',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    phone: '+55 55 90000-0003',
    // FICTITIOUS PLACEHOLDER — replace with real data before launch
    hours: ALL_WEEK_HOURS,
    timeZone: 'America/Sao_Paulo',
    displayIndex: '03',
    name: 'New York Matriz',
    status: 'Uruguaiana - RS',
    district: 'Centro de Uruguaiana / Domingos de Almeida',
    title: 'New York Matriz',
    mobileSignature: 'Centro • Domingos de Almeida, 2006',
    tagline: 'Centro pulsando, vitrine consolidada.',
    noteLocation: 'R. Domingos de Almeida, 2006',
    address: 'Centro, Uruguaiana - RS, 96501-516',
    noteMeta: 'Marca consolidada no centro',
    marker: 'Domingos de Almeida',
    imageAlt: 'Fachada da New York Matriz no Centro de Uruguaiana',
    imageSrc: 'assets/ui/store-matriz-640.webp',
    imageSrcset:
      'assets/ui/store-matriz-640.webp 640w, assets/ui/store-matriz-768.webp 768w, assets/ui/store-matriz-1024.webp 1024w',
    imageWidth: 1024,
    imageHeight: 1536,
    accent: 'rgba(132, 149, 208, 0.2)',
    accentStrong: 'rgba(209, 220, 255, 0.46)',
    position: 'center 46%',
  },
];
