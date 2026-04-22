'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type Instellingen,
  type Klant,
  type Lead,
  type EenmaligeInkomst,
  type EenmaligeKost,
  type KlantenKPIs,
  type DashboardMetrics,
  type FounderVerdeling,
  type CoFounder,
  type SalesPersoon,
  type PipelineFase,
  INITIAL_INSTELLINGEN,
  INITIAL_KLANTEN,
  INITIAL_LEADS,
  INITIAL_UITGAVEN,
  UITGAVEN_CATEGORIEEN,
} from '@/types/spreadsheet';

interface PipelineStats {
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
  kosten: number; // uitgaven + commissie
  winst: number;
  mrr: number;
  eenmalig: number;
  isFuture: boolean; // true als de maand nog niet voorbij is
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

interface SpreadsheetContextType {
  // Data
  instellingen: Instellingen;
  klanten: Klant[];
  leads: Lead[];
  eenmaligeInkomsten: EenmaligeInkomst[];
  eenmaligeKosten: EenmaligeKost[];
  uitgaven: Record<string, number[]>;
  uitgavenCategorieen: string[];

  // Setters
  setInstellingen: (data: Instellingen) => void;
  setKlanten: (data: Klant[]) => void;
  addKlant: (klant: Omit<Klant, 'id'>) => void;
  updateKlant: (id: string, data: Partial<Klant>) => void;
  deleteKlant: (id: string) => void;
  moveKlantToLeads: (id: string, redenAfwijzing: string) => void;
  setLeads: (data: Lead[]) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  restoreLeadToKlant: (id: string) => void;
  setEenmaligeInkomsten: (data: EenmaligeInkomst[]) => void;
  addEenmaligeInkomst: (inkomst: Omit<EenmaligeInkomst, 'id'>) => void;
  setEenmaligeKosten: (data: EenmaligeKost[]) => void;
  addEenmaligeKost: (kost: Omit<EenmaligeKost, 'id'>) => void;
  updateUitgave: (categorie: string, maandIndex: number, bedrag: number) => void;
  addCoFounder: () => void;
  deleteCoFounder: (id: string) => void;
  addSalesPersoon: () => void;
  updateSalesPersoon: (id: string, data: Partial<SalesPersoon>) => void;
  deleteSalesPersoon: (id: string) => void;
  getSalesPersoon: (id: string) => SalesPersoon | undefined;
  addUitgaveCategorie: (naam: string) => void;
  deleteUitgaveCategorie: (naam: string) => void;

  // Calculated values
  getKlantenKPIs: () => KlantenKPIs;
  getMaandMRR: () => number[];
  getMaandEenmalig: () => number[];
  getMaandEenmaligeKosten: () => number[];
  getSalesCommissiePerMaand: () => number[];
  getTotaalUitgavenPerMaand: () => number[];
  getWinstVoorVerdeling: () => number[];
  getFounderVerdelingen: () => FounderVerdeling[];
  getDashboardMetrics: () => DashboardMetrics;
  getWinstmarge: () => number[];
  getPipelineStats: () => PipelineStats;
  getMonthlyChartData: () => MonthlyChartData[];
  getUitgavenBreakdown: () => UitgavenBreakdown[];
  getYearSummary: () => YearSummary;
  getCurrentMonthIndex: () => number;
  getBTWSummary: () => BTWSummary;
  getKlantMaandInkomsten: (klant: Klant) => number[];
  getMRRBreakdown: () => { klantId: string; klantnaam: string; maanden: number[]; totaal: number }[];
}

const SpreadsheetContext = createContext<SpreadsheetContextType | null>(null);

const STORAGE_KEY = 'techtable-spreadsheet-2026';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function SpreadsheetProvider({ children }: { children: ReactNode }) {
  const [instellingen, setInstellingenState] = useState<Instellingen>(() =>
    loadFromStorage('instellingen', INITIAL_INSTELLINGEN)
  );
  const [klanten, setKlantenState] = useState<Klant[]>(() =>
    loadFromStorage('klanten', INITIAL_KLANTEN)
  );
  const [eenmaligeInkomsten, setEenmaligeInkomstenState] = useState<EenmaligeInkomst[]>(() =>
    loadFromStorage('eenmalig', [])
  );
  const [uitgaven, setUitgavenState] = useState<Record<string, number[]>>(() =>
    loadFromStorage('uitgaven', INITIAL_UITGAVEN)
  );
  const [uitgavenCategorieen, setUitgavenCategorieenState] = useState<string[]>(() =>
    loadFromStorage('uitgavenCategorieen', [...UITGAVEN_CATEGORIEEN])
  );
  const [leads, setLeadsState] = useState<Lead[]>(() =>
    loadFromStorage('leads', INITIAL_LEADS)
  );
  const [eenmaligeKosten, setEenmaligeKostenState] = useState<EenmaligeKost[]>(() =>
    loadFromStorage('eenmaligeKosten', [])
  );

  // Setters with persistence
  const setInstellingen = useCallback((data: Instellingen) => {
    setInstellingenState(data);
    saveToStorage('instellingen', data);
  }, []);

  const setKlanten = useCallback((data: Klant[]) => {
    setKlantenState(data);
    saveToStorage('klanten', data);
  }, []);

  const addKlant = useCallback((klant: Omit<Klant, 'id'>) => {
    const newKlant: Klant = {
      ...klant,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    setKlantenState(prev => {
      const updated = [...prev, newKlant];
      saveToStorage('klanten', updated);
      return updated;
    });
  }, []);

  const updateKlant = useCallback((id: string, data: Partial<Klant>) => {
    setKlantenState(prev => {
      const updated = prev.map(k => k.id === id ? { ...k, ...data } : k);
      saveToStorage('klanten', updated);
      return updated;
    });
  }, []);

  const deleteKlant = useCallback((id: string) => {
    setKlantenState(prev => {
      const updated = prev.filter(k => k.id !== id);
      saveToStorage('klanten', updated);
      return updated;
    });
  }, []);

  const setEenmaligeInkomsten = useCallback((data: EenmaligeInkomst[]) => {
    setEenmaligeInkomstenState(data);
    saveToStorage('eenmalig', data);
  }, []);

  const addEenmaligeInkomst = useCallback((inkomst: Omit<EenmaligeInkomst, 'id'>) => {
    const newInkomst: EenmaligeInkomst = {
      ...inkomst,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    setEenmaligeInkomstenState(prev => {
      const updated = [...prev, newInkomst];
      saveToStorage('eenmalig', updated);
      return updated;
    });
  }, []);

  const setEenmaligeKosten = useCallback((data: EenmaligeKost[]) => {
    setEenmaligeKostenState(data);
    saveToStorage('eenmaligeKosten', data);
  }, []);

  const addEenmaligeKost = useCallback((kost: Omit<EenmaligeKost, 'id'>) => {
    const newKost: EenmaligeKost = {
      ...kost,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    setEenmaligeKostenState(prev => {
      const updated = [...prev, newKost];
      saveToStorage('eenmaligeKosten', updated);
      return updated;
    });
  }, []);

  const updateUitgave = useCallback((categorie: string, maandIndex: number, bedrag: number) => {
    setUitgavenState(prev => {
      const updated = { ...prev };
      if (!updated[categorie]) {
        updated[categorie] = Array(12).fill(0);
      }
      updated[categorie] = [...updated[categorie]];
      updated[categorie][maandIndex] = bedrag;
      saveToStorage('uitgaven', updated);
      return updated;
    });
  }, []);

  const addCoFounder = useCallback(() => {
    const newFounder: CoFounder = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      naam: '',
      winstverdelingPercentage: 0,
      rol: '',
    };
    setInstellingenState(prev => {
      const updated = { ...prev, coFounders: [...prev.coFounders, newFounder] };
      saveToStorage('instellingen', updated);
      return updated;
    });
  }, []);

  const deleteCoFounder = useCallback((id: string) => {
    setInstellingenState(prev => {
      const updated = { ...prev, coFounders: prev.coFounders.filter(f => f.id !== id) };
      saveToStorage('instellingen', updated);
      return updated;
    });
  }, []);

  const addSalesPersoon = useCallback(() => {
    const newSalesPersoon: SalesPersoon = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      naam: '',
      commissiePercentage: 15,
    };
    setInstellingenState(prev => {
      const salesPersonen = prev.salesPersonen || [];
      const updated = { ...prev, salesPersonen: [...salesPersonen, newSalesPersoon] };
      saveToStorage('instellingen', updated);
      return updated;
    });
  }, []);

  const updateSalesPersoon = useCallback((id: string, data: Partial<SalesPersoon>) => {
    setInstellingenState(prev => {
      const salesPersonen = prev.salesPersonen || [];
      const updated = {
        ...prev,
        salesPersonen: salesPersonen.map(sp =>
          sp.id === id ? { ...sp, ...data } : sp
        ),
      };
      saveToStorage('instellingen', updated);
      return updated;
    });
  }, []);

  const deleteSalesPersoon = useCallback((id: string) => {
    setInstellingenState(prev => {
      const salesPersonen = prev.salesPersonen || [];
      const updated = { ...prev, salesPersonen: salesPersonen.filter(sp => sp.id !== id) };
      saveToStorage('instellingen', updated);
      return updated;
    });
  }, []);

  const getSalesPersoon = useCallback((id: string): SalesPersoon | undefined => {
    const salesPersonen = instellingen.salesPersonen || [];
    return salesPersonen.find(sp => sp.id === id);
  }, [instellingen.salesPersonen]);

  const addUitgaveCategorie = useCallback((naam: string) => {
    if (!naam.trim()) return;
    setUitgavenCategorieenState(prev => {
      if (prev.includes(naam)) return prev;
      const updated = [...prev, naam];
      saveToStorage('uitgavenCategorieen', updated);
      return updated;
    });
    setUitgavenState(prev => {
      if (prev[naam]) return prev;
      const updated = { ...prev, [naam]: Array(12).fill(0) };
      saveToStorage('uitgaven', updated);
      return updated;
    });
  }, []);

  const deleteUitgaveCategorie = useCallback((naam: string) => {
    setUitgavenCategorieenState(prev => {
      const updated = prev.filter(c => c !== naam);
      saveToStorage('uitgavenCategorieen', updated);
      return updated;
    });
    setUitgavenState(prev => {
      const updated = { ...prev };
      delete updated[naam];
      saveToStorage('uitgaven', updated);
      return updated;
    });
  }, []);

  // Lead management
  const setLeads = useCallback((data: Lead[]) => {
    setLeadsState(data);
    saveToStorage('leads', data);
  }, []);

  const addLead = useCallback((lead: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...lead,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    setLeadsState(prev => {
      const updated = [...prev, newLead];
      saveToStorage('leads', updated);
      return updated;
    });
  }, []);

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeadsState(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...data } : l);
      saveToStorage('leads', updated);
      return updated;
    });
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeadsState(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveToStorage('leads', updated);
      return updated;
    });
  }, []);

  const moveKlantToLeads = useCallback((id: string, redenAfwijzing: string) => {
    const klant = klanten.find(k => k.id === id);
    if (!klant) return;

    // Create lead from klant
    const newLead: Lead = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      bedrijfsnaam: klant.klantnaam,
      contactpersoon: klant.contactpersoon,
      email: klant.email,
      telefoon: klant.telefoon,
      productInteresse: klant.productDienst,
      bron: '',
      redenAfwijzing,
      notities: klant.notities,
      datumEersteContact: klant.laatsteContact,
      datumAfgewezen: new Date().toISOString().split('T')[0],
      offerteWaarde: klant.offerteWaarde,
      aantalContacten: klant.aantalContacten,
    };

    setLeadsState(prev => {
      const updated = [...prev, newLead];
      saveToStorage('leads', updated);
      return updated;
    });

    setKlantenState(prev => {
      const updated = prev.filter(k => k.id !== id);
      saveToStorage('klanten', updated);
      return updated;
    });
  }, [klanten]);

  const restoreLeadToKlant = useCallback((id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    // Create klant from lead
    const newKlant: Klant = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      klantnaam: lead.bedrijfsnaam,
      productDienst: lead.productInteresse,
      mrrPerMaand: 0,
      eenmalig: 0,
      salesPersoonId: '',
      status: 'Actief',
      maandInkomsten: Array(12).fill(0),
      contactpersoon: lead.contactpersoon,
      email: lead.email,
      telefoon: lead.telefoon,
      notities: lead.notities + (lead.redenAfwijzing ? `\n[Eerder afgewezen: ${lead.redenAfwijzing}]` : ''),
      pipelineFase: 'Contact gelegd',
      aantalContacten: lead.aantalContacten + 1,
      laatsteContact: new Date().toISOString().split('T')[0],
      offerteWaarde: lead.offerteWaarde,
      verwachteSluitdatum: '',
      datumKlantGeworden: '',
      datumOnderhoudStart: '',
      onderhoudActief: true,
      eenmaligTermijnen: 1,
      eenmaligStartdatum: '',
    };

    setKlantenState(prev => {
      const updated = [...prev, newKlant];
      saveToStorage('klanten', updated);
      return updated;
    });

    setLeadsState(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveToStorage('leads', updated);
      return updated;
    });
  }, [leads]);

  // Calculated values
  const getKlantenKPIs = useCallback((): KlantenKPIs => {
    const actieveKlanten = klanten.filter(k => k.status === 'Actief').length;
    const totaleMRR = klanten
      .filter(k => k.status === 'Actief')
      .reduce((sum, k) => sum + k.mrrPerMaand, 0);
    const arr = totaleMRR * 12;
    const gemOmzetPerKlant = actieveKlanten > 0 ? totaleMRR / actieveKlanten : 0;

    return { actieveKlanten, totaleMRR, arr, gemOmzetPerKlant };
  }, [klanten]);

  // Helper: get the start month index for a client's MRR (0-11, -1 if not started)
  const getKlantStartMaand = useCallback((klant: Klant): number => {
    const boekjaar = instellingen.boekjaar;
    // Priority: datumOnderhoudStart > datumKlantGeworden > no restriction
    const startDatum = klant.datumOnderhoudStart || klant.datumKlantGeworden;
    if (!startDatum) return 0; // If no date set, start from January

    const startDate = new Date(startDatum);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();

    // If start year is before boekjaar, MRR runs all year
    if (startYear < boekjaar) return 0;
    // If start year is after boekjaar, no MRR this year
    if (startYear > boekjaar) return 12;
    // Same year - return the start month
    return startMonth;
  }, [instellingen.boekjaar]);

  // Get effective maandInkomsten for a client (respects start date and onderhoudActief)
  const getKlantMaandInkomsten = useCallback((klant: Klant): number[] => {
    // If onderhoud is not active, no MRR
    if (klant.onderhoudActief === false) return Array(12).fill(0);

    const startMaand = getKlantStartMaand(klant);
    const maandInkomsten = Array(12).fill(0);

    for (let i = startMaand; i < 12; i++) {
      maandInkomsten[i] = klant.mrrPerMaand;
    }

    return maandInkomsten;
  }, [getKlantStartMaand]);

  const getMaandMRR = useCallback((): number[] => {
    const maandTotalen = Array(12).fill(0);
    klanten
      .filter(k => k.status === 'Actief')
      .forEach(k => {
        const klantMaanden = getKlantMaandInkomsten(k);
        klantMaanden.forEach((bedrag, i) => {
          maandTotalen[i] += bedrag;
        });
      });
    return maandTotalen;
  }, [klanten, getKlantMaandInkomsten]);

  const getMaandEenmalig = useCallback((): number[] => {
    const maandTotalen = Array(12).fill(0);
    eenmaligeInkomsten.forEach(inkomst => {
      if (inkomst.status === 'Betaald' && inkomst.datum) {
        const maand = new Date(inkomst.datum).getMonth();
        maandTotalen[maand] += inkomst.nettoNaCommissie;
      }
    });
    return maandTotalen;
  }, [eenmaligeInkomsten]);

  // Get eenmalige kosten per month (from Eenmalig tab)
  const getMaandEenmaligeKosten = useCallback((): number[] => {
    const maandTotalen = Array(12).fill(0);
    eenmaligeKosten.forEach(kost => {
      // Include all non-cancelled costs, not just paid ones (planned costs are known)
      if (kost.status !== 'Geannuleerd' && kost.datum) {
        const maand = new Date(kost.datum).getMonth();
        maandTotalen[maand] += kost.bedragExclBTW;
      }
    });
    return maandTotalen;
  }, [eenmaligeKosten]);

  const getTotaalUitgavenPerMaand = useCallback((): number[] => {
    const maandTotalen = Array(12).fill(0);
    // Regular expenses
    Object.values(uitgaven).forEach(bedragen => {
      bedragen.forEach((bedrag, i) => {
        maandTotalen[i] += bedrag;
      });
    });
    // Add eenmalige kosten
    const eenmaligeKostenPerMaand = getMaandEenmaligeKosten();
    eenmaligeKostenPerMaand.forEach((bedrag, i) => {
      maandTotalen[i] += bedrag;
    });
    return maandTotalen;
  }, [uitgaven, getMaandEenmaligeKosten]);

  // Calculate sales commission per month (from klanten with assigned salesPersoon)
  const getSalesCommissiePerMaand = useCallback((): number[] => {
    const salesPersonen = instellingen.salesPersonen || [];
    const maandTotalen = Array(12).fill(0);

    // Commission from klanten MRR - based on assigned salesPersoon's percentage
    klanten
      .filter(k => k.status === 'Actief' && k.salesPersoonId)
      .forEach(k => {
        const salesPersoon = salesPersonen.find(sp => sp.id === k.salesPersoonId);
        if (salesPersoon && salesPersoon.commissiePercentage > 0) {
          const percentage = salesPersoon.commissiePercentage / 100;
          const klantMaanden = getKlantMaandInkomsten(k);
          klantMaanden.forEach((bedrag, i) => {
            maandTotalen[i] += bedrag * percentage;
          });
        }
      });

    // Commission from eenmalige inkomsten - for now use first salesperson's rate if salesCommissie is true
    eenmaligeInkomsten
      .filter(i => i.status === 'Betaald' && i.salesCommissie && i.datum)
      .forEach(inkomst => {
        // Use average commission or first salesperson's rate
        const avgCommissie = salesPersonen.length > 0
          ? salesPersonen.reduce((sum, sp) => sum + sp.commissiePercentage, 0) / salesPersonen.length / 100
          : 0.15; // Default 15%
        const maand = new Date(inkomst.datum).getMonth();
        maandTotalen[maand] += inkomst.bedragExclBTW * avgCommissie;
      });

    return maandTotalen;
  }, [klanten, eenmaligeInkomsten, instellingen.salesPersonen, getKlantMaandInkomsten]);

  const getWinstVoorVerdeling = useCallback((): number[] => {
    const mrr = getMaandMRR();
    const eenmalig = getMaandEenmalig();
    const uitgavenTotaal = getTotaalUitgavenPerMaand();
    const commissie = getSalesCommissiePerMaand();

    return mrr.map((m, i) => {
      const totaalInkomsten = m + eenmalig[i];
      // Winst = inkomsten - uitgaven - commissie
      return totaalInkomsten - uitgavenTotaal[i] - commissie[i];
    });
  }, [getMaandMRR, getMaandEenmalig, getTotaalUitgavenPerMaand, getSalesCommissiePerMaand]);

  const getWinstmarge = useCallback((): number[] => {
    const mrr = getMaandMRR();
    const eenmalig = getMaandEenmalig();
    const winst = getWinstVoorVerdeling();

    return winst.map((w, i) => {
      const totaalInkomsten = mrr[i] + eenmalig[i];
      return totaalInkomsten > 0 ? (w / totaalInkomsten) * 100 : 0;
    });
  }, [getMaandMRR, getMaandEenmalig, getWinstVoorVerdeling]);

  const getFounderVerdelingen = useCallback((): FounderVerdeling[] => {
    const winst = getWinstVoorVerdeling();
    const jaarwinst = winst.reduce((sum, w) => sum + w, 0);

    return instellingen.coFounders.map(founder => ({
      naam: founder.naam,
      aandeel: founder.winstverdelingPercentage,
      jaarwinst: jaarwinst * (founder.winstverdelingPercentage / 100),
      perMaandGem: (jaarwinst * (founder.winstverdelingPercentage / 100)) / 12,
    }));
  }, [instellingen.coFounders, getWinstVoorVerdeling]);

  const getDashboardMetrics = useCallback((): DashboardMetrics => {
    const kpis = getKlantenKPIs();
    const mrr = getMaandMRR();
    const eenmalig = getMaandEenmalig();
    const uitgavenTotaal = getTotaalUitgavenPerMaand();
    const commissie = getSalesCommissiePerMaand();
    const winst = getWinstVoorVerdeling();

    const totaleJaaromzetRecurring = mrr.reduce((sum, m) => sum + m, 0);
    const totaleJaaromzetEenmalig = eenmalig.reduce((sum, e) => sum + e, 0);
    const totaleJaaruitgaven = uitgavenTotaal.reduce((sum, u) => sum + u, 0);
    const totaleSalesCommissie = commissie.reduce((sum, c) => sum + c, 0);
    const jaarwinst = winst.reduce((sum, w) => sum + w, 0);

    const totaleInkomsten = totaleJaaromzetRecurring + totaleJaaromzetEenmalig;

    return {
      totaleMRR: kpis.totaleMRR,
      arr: kpis.arr,
      actieveKlanten: kpis.actieveKlanten,
      totaleJaaromzetRecurring,
      totaleJaaruitgaven,
      jaarwinst,
      totaleEenmaligeInkomsten: totaleJaaromzetEenmalig,
      totaleSalesCommissie,
      winstmarge: totaleInkomsten > 0 ? (jaarwinst / totaleInkomsten) * 100 : 0,
    };
  }, [getKlantenKPIs, getMaandMRR, getMaandEenmalig, getTotaalUitgavenPerMaand, getSalesCommissiePerMaand, getWinstVoorVerdeling]);

  const getPipelineStats = useCallback((): PipelineStats => {
    const perFase: Record<PipelineFase, number> = {
      'Lead': 0,
      'Contact gelegd': 0,
      'Offerte gestuurd': 0,
      'In onderhandeling': 0,
      'Klant': 0,
      'Afgevallen': 0,
    };

    let totaalWaarde = 0;
    let aantalActief = 0;

    klanten.forEach(k => {
      if (k.pipelineFase) {
        perFase[k.pipelineFase]++;
        if (k.pipelineFase !== 'Klant' && k.pipelineFase !== 'Afgevallen') {
          totaalWaarde += k.offerteWaarde || 0;
          aantalActief++;
        }
      }
    });

    return { perFase, totaalWaarde, aantalActief };
  }, [klanten]);

  const MAAND_NAMEN = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  const MAAND_NAMEN_LANG = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

  // Get current month index (0-11) - only show data for months that have passed or current month
  const getCurrentMonthIndex = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // If we're in the boekjaar, return current month, otherwise return -1 (no months yet) or 11 (all months done)
    if (currentYear < instellingen.boekjaar) return -1; // Year hasn't started
    if (currentYear > instellingen.boekjaar) return 11; // Year is complete
    return now.getMonth(); // Current month (0-11)
  }, [instellingen.boekjaar]);

  const getMonthlyChartData = useCallback((): MonthlyChartData[] => {
    const mrr = getMaandMRR();
    const eenmalig = getMaandEenmalig();
    const uitgavenTotaal = getTotaalUitgavenPerMaand();
    const commissie = getSalesCommissiePerMaand();
    const currentMonthIndex = getCurrentMonthIndex();

    return MAAND_NAMEN.map((naam, i) => {
      const isPastOrCurrent = i <= currentMonthIndex;
      // Inkomsten alleen voor verleden/huidige maanden, kosten zijn altijd bekend
      const maandInkomsten = isPastOrCurrent ? mrr[i] + eenmalig[i] : 0;
      const maandCommissie = isPastOrCurrent ? commissie[i] : 0; // Commissie is % van inkomsten
      const maandKosten = uitgavenTotaal[i] + maandCommissie; // Uitgaven altijd bekend
      const maandWinst = maandInkomsten - maandKosten;

      return {
        maand: MAAND_NAMEN_LANG[i],
        maandKort: naam,
        inkomsten: maandInkomsten,
        uitgaven: uitgavenTotaal[i], // Uitgaven altijd tonen (bekend vooraf)
        commissie: maandCommissie,
        kosten: maandKosten,
        winst: maandWinst,
        mrr: isPastOrCurrent ? mrr[i] : 0,
        eenmalig: isPastOrCurrent ? eenmalig[i] : 0,
        isFuture: !isPastOrCurrent,
      };
    });
  }, [getMaandMRR, getMaandEenmalig, getTotaalUitgavenPerMaand, getSalesCommissiePerMaand, getCurrentMonthIndex]);

  const getUitgavenBreakdown = useCallback((): UitgavenBreakdown[] => {
    const breakdown: UitgavenBreakdown[] = [];
    let totaal = 0;

    // Add regular expenses
    Object.entries(uitgaven).forEach(([categorie, bedragen]) => {
      const categorieTotaal = bedragen.reduce((sum, b) => sum + b, 0);
      if (categorieTotaal > 0) {
        breakdown.push({ categorie, totaal: categorieTotaal, percentage: 0 });
        totaal += categorieTotaal;
      }
    });

    // Add sales commission as a cost category
    const commissie = getSalesCommissiePerMaand();
    const commissieTotaal = commissie.reduce((sum, c) => sum + c, 0);
    if (commissieTotaal > 0) {
      breakdown.push({ categorie: 'Sales Commissie', totaal: commissieTotaal, percentage: 0 });
      totaal += commissieTotaal;
    }

    // Calculate percentages
    breakdown.forEach(item => {
      item.percentage = totaal > 0 ? (item.totaal / totaal) * 100 : 0;
    });

    return breakdown.sort((a, b) => b.totaal - a.totaal);
  }, [uitgaven, getSalesCommissiePerMaand]);

  const getYearSummary = useCallback((): YearSummary => {
    const currentMonthIndex = getCurrentMonthIndex();
    const mrr = getMaandMRR();
    const eenmalig = getMaandEenmalig();
    const uitgavenTotaal = getTotaalUitgavenPerMaand();
    const commissie = getSalesCommissiePerMaand();

    // Inkomsten en commissie alleen tot huidige maand (onbekend voor toekomst)
    const sumUpToCurrent = (arr: number[]) =>
      arr.reduce((sum, val, i) => i <= currentMonthIndex ? sum + val : sum, 0);

    // Uitgaven voor hele jaar (bekend vooraf - vaste kosten)
    const sumAll = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0);

    const totaalInkomsten = sumUpToCurrent(mrr) + sumUpToCurrent(eenmalig);
    const totaalUitgaven = sumAll(uitgavenTotaal); // Hele jaar uitgaven (bekend)
    const totaalCommissie = sumUpToCurrent(commissie); // Commissie is % van inkomsten
    const totaalWinst = totaalInkomsten - totaalUitgaven - totaalCommissie;

    return {
      jaar: instellingen.boekjaar,
      totaalInkomsten,
      totaalUitgaven,
      totaalWinst,
      aantalKlanten: klanten.filter(k => k.status === 'Actief').length,
      totaalMRR: sumUpToCurrent(mrr),
      totaalEenmalig: sumUpToCurrent(eenmalig),
      totaalCommissie,
      winstmarge: totaalInkomsten > 0 ? (totaalWinst / totaalInkomsten) * 100 : 0,
    };
  }, [getCurrentMonthIndex, getMaandMRR, getMaandEenmalig, getTotaalUitgavenPerMaand, getSalesCommissiePerMaand, klanten, instellingen.boekjaar]);

  const getMRRBreakdown = useCallback(() => {
    return klanten
      .filter(k => k.status === 'Actief' && k.mrrPerMaand > 0)
      .map(k => {
        const maanden = getKlantMaandInkomsten(k);
        return {
          klantId: k.id,
          klantnaam: k.klantnaam,
          maanden,
          totaal: maanden.reduce((sum, m) => sum + m, 0),
        };
      })
      .sort((a, b) => b.totaal - a.totaal);
  }, [klanten, getKlantMaandInkomsten]);

  const getBTWSummary = useCallback((): BTWSummary => {
    const btwPercentage = instellingen.btwPercentage;
    const btwMultiplier = 1 + (btwPercentage / 100);
    const yearSummary = getYearSummary();

    // MRR is excl BTW, dus we berekenen incl BTW
    const mrrExclBTW = yearSummary.totaalMRR;
    const mrrInclBTW = mrrExclBTW * btwMultiplier;
    const mrrBTW = mrrInclBTW - mrrExclBTW;

    // Eenmalig is excl BTW
    const eenmaligExclBTW = yearSummary.totaalEenmalig;
    const eenmaligInclBTW = eenmaligExclBTW * btwMultiplier;
    const eenmaligBTW = eenmaligInclBTW - eenmaligExclBTW;

    // Totaal omzet
    const omzetExclBTW = mrrExclBTW + eenmaligExclBTW;
    const omzetInclBTW = mrrInclBTW + eenmaligInclBTW;
    const btwBedrag = mrrBTW + eenmaligBTW;

    return {
      omzetExclBTW,
      btwBedrag,
      omzetInclBTW,
      mrrExclBTW,
      mrrBTW,
      mrrInclBTW,
      eenmaligExclBTW,
      eenmaligBTW,
      eenmaligInclBTW,
      btwPercentage,
    };
  }, [getYearSummary, instellingen.btwPercentage]);

  return (
    <SpreadsheetContext.Provider
      value={{
        instellingen,
        klanten,
        leads,
        eenmaligeInkomsten,
        eenmaligeKosten,
        uitgaven,
        uitgavenCategorieen,
        setInstellingen,
        setKlanten,
        addKlant,
        updateKlant,
        deleteKlant,
        moveKlantToLeads,
        setLeads,
        addLead,
        updateLead,
        deleteLead,
        restoreLeadToKlant,
        setEenmaligeInkomsten,
        addEenmaligeInkomst,
        setEenmaligeKosten,
        addEenmaligeKost,
        updateUitgave,
        addCoFounder,
        deleteCoFounder,
        addSalesPersoon,
        updateSalesPersoon,
        deleteSalesPersoon,
        getSalesPersoon,
        addUitgaveCategorie,
        deleteUitgaveCategorie,
        getKlantenKPIs,
        getMaandMRR,
        getMaandEenmalig,
        getSalesCommissiePerMaand,
        getTotaalUitgavenPerMaand,
        getWinstVoorVerdeling,
        getFounderVerdelingen,
        getDashboardMetrics,
        getWinstmarge,
        getPipelineStats,
        getMonthlyChartData,
        getUitgavenBreakdown,
        getYearSummary,
        getCurrentMonthIndex,
        getBTWSummary,
        getKlantMaandInkomsten,
        getMRRBreakdown,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
  }
  return context;
}
