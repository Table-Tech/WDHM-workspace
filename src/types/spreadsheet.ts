// LateTable 2026 Spreadsheet Types

export interface CoFounder {
  id: string;
  naam: string;
  winstverdelingPercentage: number;
  rol: string;
}

export interface Instellingen {
  coFounders: CoFounder[];
  salesCommissiePercentage: number;
  salesPersoonNaam: string;
  btwPercentage: number;
  bedrijfsnaam: string;
  kvkNummer: string;
  boekjaar: number;
  startdatum: string;
}

export interface Klant {
  id: string;
  klantnaam: string;
  productDienst: string;
  mrrPerMaand: number;
  eenmalig: number;
  salesCommissie: boolean;
  status: 'Actief' | 'Inactief' | 'Paused';
  maandInkomsten: number[]; // 12 months jan-dec
}

export interface KlantenKPIs {
  actieveKlanten: number;
  totaleMRR: number;
  arr: number;
  gemOmzetPerKlant: number;
}

export interface Uitgave {
  id: string;
  categorie: string;
  maandBedragen: number[]; // 12 months
}

export interface MaandOverzicht {
  mrrRecurring: number[];
  eenmaligeProjecten: number[];
  overigeInkomsten: number[];
  totaalInkomsten: number[];
  salesCommissieAf: number[];
  uitgaven: Uitgave[];
  totaalUitgaven: number[];
  winstVoorVerdeling: number[];
  verdelingPerFounder: { [founderId: string]: number[] };
  totaalVerdeeld: number[];
  winstmarge: number[];
}

export interface EenmaligeInkomst {
  id: string;
  datum: string;
  klantnaam: string;
  omschrijving: string;
  bedragExclBTW: number;
  btw: number;
  bedragInclBTW: number;
  salesCommissie: boolean;
  nettoNaCommissie: number;
  status: 'Open' | 'Gefactureerd' | 'Betaald' | 'Geannuleerd';
}

export interface DashboardMetrics {
  totaleMRR: number;
  arr: number;
  actieveKlanten: number;
  totaleJaaromzetRecurring: number;
  totaleJaaruitgaven: number;
  jaarwinst: number;
  totaleEenmaligeInkomsten: number;
  totaleSalesCommissie: number;
  winstmarge: number;
}

export interface FounderVerdeling {
  naam: string;
  aandeel: number;
  jaarwinst: number;
  perMaandGem: number;
}

export interface SpreadsheetData {
  instellingen: Instellingen;
  klanten: Klant[];
  eenmaligeInkomsten: EenmaligeInkomst[];
  uitgavenCategorieen: string[];
}

// Month labels in Dutch
export const MAAND_LABELS = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
] as const;

// Default expense categories
export const UITGAVEN_CATEGORIEEN = [
  'Hosting & servers',
  'Software & tools',
  'Domeinnames',
  'Marketing & advertising',
  'Kantoor / werkplek',
  'Telefoon & internet',
  'Verzekeringen (zakelijk)',
  'Boekhouder / administratie',
  'Reiskosten',
  'Hardware / apparatuur',
  'Freelancers / inhuur',
  'KVK / juridisch',
  'Overige bedrijfskosten',
] as const;

// Initial data
export const INITIAL_INSTELLINGEN: Instellingen = {
  coFounders: [
    { id: '1', naam: 'Damian', winstverdelingPercentage: 25, rol: '' },
    { id: '2', naam: 'Wishant', winstverdelingPercentage: 25, rol: '' },
    { id: '3', naam: 'Hicham', winstverdelingPercentage: 25, rol: '' },
    { id: '4', naam: 'Mohammad', winstverdelingPercentage: 25, rol: '' },
  ],
  salesCommissiePercentage: 15,
  salesPersoonNaam: '',
  btwPercentage: 21,
  bedrijfsnaam: 'LateTable',
  kvkNummer: '',
  boekjaar: 2026,
  startdatum: '',
};

export const INITIAL_KLANTEN: Klant[] = [
  {
    id: '1',
    klantnaam: 'Pokebowl original',
    productDienst: 'Webdesign',
    mrrPerMaand: 49,
    eenmalig: 1500,
    salesCommissie: false,
    status: 'Actief',
    maandInkomsten: Array(12).fill(49),
  },
  {
    id: '2',
    klantnaam: 'Cherani nails',
    productDienst: 'Webdesign',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: false,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
  {
    id: '3',
    klantnaam: 'IRI Service',
    productDienst: 'Applicatie',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: true,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
  {
    id: '4',
    klantnaam: 'Ontstoppingsdienst',
    productDienst: 'Applicatie',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: true,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
  {
    id: '5',
    klantnaam: 'lori events',
    productDienst: 'Websites',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: false,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
  {
    id: '6',
    klantnaam: 'Rijschool Planning',
    productDienst: 'Rijschool SaaS',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: false,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
  {
    id: '7',
    klantnaam: 'Restaurant Istanbul',
    productDienst: 'Websites',
    mrrPerMaand: 0,
    eenmalig: 0,
    salesCommissie: false,
    status: 'Actief',
    maandInkomsten: Array(12).fill(0),
  },
];

export const INITIAL_UITGAVEN: Record<string, number[]> = {
  'Hosting & servers': Array(12).fill(17),
  'Software & tools': Array(12).fill(0),
  'Domeinnames': Array(12).fill(0),
  'Marketing & advertising': Array(12).fill(0),
  'Kantoor / werkplek': Array(12).fill(0),
  'Telefoon & internet': Array(12).fill(6.5),
  'Verzekeringen (zakelijk)': Array(12).fill(0),
  'Boekhouder / administratie': Array(12).fill(22),
  'Reiskosten': Array(12).fill(0),
  'Hardware / apparatuur': Array(12).fill(0),
  'Freelancers / inhuur': Array(12).fill(0),
  'KVK / juridisch': Array(12).fill(0),
  'Overige bedrijfskosten': Array(12).fill(0),
};
