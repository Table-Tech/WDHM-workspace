// Financial Data Types - matching Supabase schema

export interface CompanySettings {
  id: string;
  bedrijfsnaam: string;
  kvk_nummer: string;
  btw_percentage: number;
  boekjaar: number;
  startdatum: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoFounder {
  id: string;
  naam: string;
  rol: string;
  winstverdeling_percentage: number;
  created_at: string;
}

export interface SalesPerson {
  id: string;
  naam: string;
  commissie_percentage: number;
  created_at: string;
}

export type CustomerStatus = 'Actief' | 'Inactief' | 'Paused';
export type PipelineFase = 'Lead' | 'Contact gelegd' | 'Offerte gestuurd' | 'In onderhandeling' | 'Klant' | 'Afgevallen';

export interface Customer {
  id: string;
  klantnaam: string;
  product_dienst: string;
  mrr_per_maand: number;
  eenmalig: number;
  sales_persoon_id: string | null;
  status: CustomerStatus;
  maand_inkomsten: number[];
  contactpersoon: string;
  email: string;
  telefoon: string;
  notities: string;
  pipeline_fase: PipelineFase;
  aantal_contacten: number;
  laatste_contact: string | null;
  offerte_waarde: number;
  verwachte_sluitdatum: string | null;
  datum_klant_geworden: string | null;
  datum_onderhoud_start: string | null;
  onderhoud_actief: boolean;
  eenmalig_termijnen: number;
  eenmalig_startdatum: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  product_interesse: string;
  bron: string;
  reden_afwijzing: string;
  notities: string;
  datum_eerste_contact: string | null;
  datum_afgewezen: string | null;
  offerte_waarde: number;
  aantal_contacten: number;
  created_at: string;
}

export type OneTimeIncomeStatus = 'Open' | 'Gefactureerd' | 'Betaald' | 'Geannuleerd';

export interface OneTimeIncome {
  id: string;
  datum: string;
  klantnaam: string;
  omschrijving: string;
  bedrag_excl_btw: number;
  btw: number;
  bedrag_incl_btw: number;
  sales_commissie: boolean;
  netto_na_commissie: number;
  status: OneTimeIncomeStatus;
  created_at: string;
}

export type OneTimeExpenseStatus = 'Gepland' | 'Besteld' | 'Betaald' | 'Geannuleerd';

export interface OneTimeExpense {
  id: string;
  datum: string;
  leverancier: string;
  omschrijving: string;
  categorie: string;
  bedrag_excl_btw: number;
  btw: number;
  bedrag_incl_btw: number;
  status: OneTimeExpenseStatus;
  created_at: string;
}

export interface MonthlyExpense {
  id: string;
  categorie: string;
  maand_bedragen: number[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  naam: string;
  created_at: string;
}

// Form data types (without id and timestamps)
export type CompanySettingsFormData = Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>;
export type CoFounderFormData = Omit<CoFounder, 'id' | 'created_at'>;
export type SalesPersonFormData = Omit<SalesPerson, 'id' | 'created_at'>;
export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type LeadFormData = Omit<Lead, 'id' | 'created_at'>;
export type OneTimeIncomeFormData = Omit<OneTimeIncome, 'id' | 'created_at'>;
export type OneTimeExpenseFormData = Omit<OneTimeExpense, 'id' | 'created_at'>;
export type MonthlyExpenseFormData = Omit<MonthlyExpense, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseCategoryFormData = Omit<ExpenseCategory, 'id' | 'created_at'>;

// Calculated types
export interface KlantenKPIs {
  actieveKlanten: number;
  totaleMRR: number;
  arr: number;
  gemOmzetPerKlant: number;
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

export interface PipelineStats {
  perFase: Record<PipelineFase, number>;
  totaalWaarde: number;
  aantalActief: number;
}

export interface MonthlyChartData {
  maand: string;
  maandKort: string;
  inkomsten: number;
  uitgaven: number;
  commissie: number;
  kosten: number;
  winst: number;
  mrr: number;
  eenmalig: number;
  isFuture: boolean;
}

export interface UitgavenBreakdown {
  categorie: string;
  totaal: number;
  percentage: number;
}

export interface YearSummary {
  jaar: number;
  totaalInkomsten: number;
  totaalUitgaven: number;
  totaalWinst: number;
  aantalKlanten: number;
  totaalMRR: number;
  totaalEenmalig: number;
  totaalCommissie: number;
  winstmarge: number;
}

export interface BTWSummary {
  omzetExclBTW: number;
  btwBedrag: number;
  omzetInclBTW: number;
  mrrExclBTW: number;
  mrrBTW: number;
  mrrInclBTW: number;
  eenmaligExclBTW: number;
  eenmaligBTW: number;
  eenmaligInclBTW: number;
  btwPercentage: number;
}

// Month labels
export const MAAND_LABELS = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
] as const;

export const MAAND_LABELS_KORT = [
  'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
] as const;

export const PIPELINE_FASES: PipelineFase[] = [
  'Lead',
  'Contact gelegd',
  'Offerte gestuurd',
  'In onderhandeling',
  'Klant',
  'Afgevallen',
];

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
