// TechTable 2026 Spreadsheet Types

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

// Pipeline fases
export const PIPELINE_FASES = [
  'Lead',
  'Contact gelegd',
  'Offerte gestuurd',
  'In onderhandeling',
  'Klant',
  'Afgevallen',
] as const;

export type PipelineFase = typeof PIPELINE_FASES[number];

export interface Klant {
  id: string;
  klantnaam: string;
  productDienst: string;
  mrrPerMaand: number;
  eenmalig: number;
  salesCommissie: boolean;
  salesCommissiePercentage: number; // Specifiek percentage voor deze klant (0 = gebruik standaard)
  status: 'Actief' | 'Inactief' | 'Paused';
  maandInkomsten: number[]; // 12 months jan-dec
  // Extra klant info
  contactpersoon: string;
  email: string;
  telefoon: string;
  notities: string;
  // Pipeline tracking
  pipelineFase: PipelineFase;
  aantalContacten: number;
  laatsteContact: string;
  offerteWaarde: number;
  verwachteSluitdatum: string;
  // Datums
  datumKlantGeworden: string; // Wanneer klant binnenkwam
  datumOnderhoudStart: string; // Wanneer onderhoudspakket begint
  onderhoudActief: boolean; // Is het onderhoudspakket actief?
  // Betalingstermijnen eenmalig
  eenmaligTermijnen: number; // Aantal termijnen (1 = direct, 2+ = gespreide betaling)
  eenmaligStartdatum: string; // Wanneer eerste termijn betaald wordt
}

export interface Lead {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  productInteresse: string;
  bron: string;
  redenAfwijzing: string;
  notities: string;
  datumEersteContact: string;
  datumAfgewezen: string;
  offerteWaarde: number;
  aantalContacten: number;
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

export interface EenmaligeKost {
  id: string;
  datum: string;
  leverancier: string;
  omschrijving: string;
  categorie: string;
  bedragExclBTW: number;
  btw: number;
  bedragInclBTW: number;
  status: 'Gepland' | 'Besteld' | 'Betaald' | 'Geannuleerd';
}

// Categorieen voor eenmalige kosten
export const EENMALIGE_KOSTEN_CATEGORIEEN = [
  'Hardware / Apparatuur',
  'Software licenties',
  'Kantoorinrichting',
  'Marketing campagne',
  'Juridisch / Advies',
  'Opleiding / Training',
  'Reiskosten (eenmalig)',
  'Overig',
] as const;

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
  eenmaligeKosten: EenmaligeKost[];
  uitgavenCategorieen: string[];
}

// Month labels in Dutch
export const MAAND_LABELS = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
] as const;

// Default expense categories
export const UITGAVEN_CATEGORIEEN = [
  'Vercel (hosting)',
  'Resend (email)',
  'Telefoon',
  'Moneybird (boekhouding)',
  'Domeinnames',
  'Marketing & advertising',
  'Software & tools',
  'Kantoor / werkplek',
  'Verzekeringen (zakelijk)',
  'Reiskosten',
  'Hardware / apparatuur',
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
  bedrijfsnaam: 'TechTable',
  kvkNummer: '',
  boekjaar: 2026,
  startdatum: '',
};

const DEFAULT_KLANT_EXTRA = {
  contactpersoon: '',
  email: '',
  telefoon: '',
  notities: '',
  pipelineFase: 'Klant' as PipelineFase,
  aantalContacten: 0,
  laatsteContact: '',
  offerteWaarde: 0,
  verwachteSluitdatum: '',
  salesCommissiePercentage: 0,
  datumKlantGeworden: '',
  datumOnderhoudStart: '',
  onderhoudActief: true,
  eenmaligTermijnen: 1,
  eenmaligStartdatum: '',
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
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
    ...DEFAULT_KLANT_EXTRA,
  },
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_UITGAVEN: Record<string, number[]> = {
  'Vercel (hosting)': Array(12).fill(20),
  'Resend (email)': Array(12).fill(20),
  'Telefoon': Array(12).fill(7),
  'Moneybird (boekhouding)': Array(12).fill(22),
  'Domeinnames': Array(12).fill(0),
  'Marketing & advertising': Array(12).fill(0),
  'Software & tools': Array(12).fill(0),
  'Kantoor / werkplek': Array(12).fill(0),
  'Verzekeringen (zakelijk)': Array(12).fill(0),
  'Reiskosten': Array(12).fill(0),
  'Hardware / apparatuur': Array(12).fill(0),
  'KVK / juridisch': Array(12).fill(0),
  'Overige bedrijfskosten': Array(12).fill(0),
};
