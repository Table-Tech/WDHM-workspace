'use client';

import { useMemo } from 'react';
import { useCompanySettings } from './useCompanySettings';
import { useCoFounders } from './useCoFounders';
import { useSalesPersons } from './useSalesPersons';
import { useCustomers } from './useCustomers';
import { useOneTimeIncome } from './useOneTimeIncome';
import { useOneTimeExpenses } from './useOneTimeExpenses';
import { useMonthlyExpenses } from './useMonthlyExpenses';
import type {
  KlantenKPIs,
  DashboardMetrics,
  FounderVerdeling,
  PipelineStats,
  PipelineFase,
  MonthlyChartData,
  UitgavenBreakdown,
  YearSummary,
  BTWSummary,
} from '@/types/financial';

const MAAND_LABELS_ARRAY = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
];

const MAAND_LABELS_KORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function useFinancialMetrics() {
  const { settings } = useCompanySettings();
  const { coFounders } = useCoFounders();
  const { salesPersons } = useSalesPersons();
  const { customers } = useCustomers();
  const { oneTimeIncome } = useOneTimeIncome();
  const { oneTimeExpenses } = useOneTimeExpenses();
  const { uitgaven } = useMonthlyExpenses();

  const isLoading = !settings;

  const btwPercentage = settings?.btw_percentage ?? 21;

  // Get current month index (0-11)
  const getCurrentMonthIndex = (): number => {
    return new Date().getMonth();
  };

  // Active customers
  const activeCustomers = useMemo(() => {
    return customers.filter((k) => k.status === 'Actief');
  }, [customers]);

  // KPIs
  const getKlantenKPIs = useMemo((): KlantenKPIs => {
    const actieveKlanten = activeCustomers.length;
    const totaleMRR = activeCustomers.reduce((sum, k) => sum + k.mrr_per_maand, 0);
    const arr = totaleMRR * 12;
    const gemOmzetPerKlant = actieveKlanten > 0 ? totaleMRR / actieveKlanten : 0;

    return { actieveKlanten, totaleMRR, arr, gemOmzetPerKlant };
  }, [activeCustomers]);

  // MRR per month
  const getMaandMRR = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const klant of activeCustomers) {
      for (let i = 0; i < 12; i++) {
        result[i] += klant.maand_inkomsten[i] ?? 0;
      }
    }
    return result;
  }, [activeCustomers]);

  // One-time income per month
  const getMaandEenmalig = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const income of oneTimeIncome) {
      if (income.status !== 'Geannuleerd') {
        const month = new Date(income.datum).getMonth();
        result[month] += income.bedrag_excl_btw;
      }
    }
    return result;
  }, [oneTimeIncome]);

  // One-time expenses per month
  const getMaandEenmaligeKosten = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const expense of oneTimeExpenses) {
      if (expense.status !== 'Geannuleerd') {
        const month = new Date(expense.datum).getMonth();
        result[month] += expense.bedrag_excl_btw;
      }
    }
    return result;
  }, [oneTimeExpenses]);

  // Sales commission per month
  const getSalesCommissiePerMaand = useMemo((): number[] => {
    const result = Array(12).fill(0);

    for (const klant of activeCustomers) {
      if (klant.sales_persoon_id) {
        const salesPerson = salesPersons.find((sp) => sp.id === klant.sales_persoon_id);
        if (salesPerson) {
          const commissieRate = salesPerson.commissie_percentage / 100;
          for (let i = 0; i < 12; i++) {
            result[i] += (klant.maand_inkomsten[i] ?? 0) * commissieRate;
          }
        }
      }
    }

    for (const income of oneTimeIncome) {
      if (income.sales_commissie && income.status !== 'Geannuleerd') {
        const month = new Date(income.datum).getMonth();
        // Assuming default 10% commission for one-time income
        result[month] += income.bedrag_excl_btw * 0.1;
      }
    }

    return result;
  }, [activeCustomers, salesPersons, oneTimeIncome]);

  // Total expenses per month
  const getTotaalUitgavenPerMaand = useMemo((): number[] => {
    const result = Array(12).fill(0);
    const eenmaligeKosten = getMaandEenmaligeKosten;

    for (const categorie of Object.keys(uitgaven)) {
      const bedragen = uitgaven[categorie];
      for (let i = 0; i < 12; i++) {
        result[i] += bedragen[i] ?? 0;
      }
    }

    for (let i = 0; i < 12; i++) {
      result[i] += eenmaligeKosten[i];
    }

    return result;
  }, [uitgaven, getMaandEenmaligeKosten]);

  // Profit before distribution
  const getWinstVoorVerdeling = useMemo((): number[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;

    return Array(12).fill(0).map((_, i) => {
      return mrr[i] + eenmalig[i] - commissie[i] - uitgavenTotaal[i];
    });
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand]);

  // Founder distributions
  const getFounderVerdelingen = useMemo((): FounderVerdeling[] => {
    const winst = getWinstVoorVerdeling;
    const totaalJaarwinst = winst.reduce((a, b) => a + b, 0);

    return coFounders.map((founder) => {
      const aandeel = founder.winstverdeling_percentage / 100;
      const jaarwinst = totaalJaarwinst * aandeel;
      return {
        naam: founder.naam,
        aandeel: founder.winstverdeling_percentage,
        jaarwinst,
        perMaandGem: jaarwinst / 12,
      };
    });
  }, [coFounders, getWinstVoorVerdeling]);

  // Dashboard metrics
  const getDashboardMetrics = useMemo((): DashboardMetrics => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;

    const totaleMRR = getKlantenKPIs.totaleMRR;
    const arr = totaleMRR * 12;
    const totaleJaaromzetRecurring = mrr.reduce((a, b) => a + b, 0);
    const totaleEenmaligeInkomsten = eenmalig.reduce((a, b) => a + b, 0);
    const totaleJaaruitgaven = uitgavenTotaal.reduce((a, b) => a + b, 0);
    const totaleSalesCommissie = commissie.reduce((a, b) => a + b, 0);
    const totaalInkomsten = totaleJaaromzetRecurring + totaleEenmaligeInkomsten;
    const jaarwinst = totaalInkomsten - totaleJaaruitgaven - totaleSalesCommissie;
    const winstmarge = totaalInkomsten > 0 ? (jaarwinst / totaalInkomsten) * 100 : 0;

    return {
      totaleMRR,
      arr,
      actieveKlanten: getKlantenKPIs.actieveKlanten,
      totaleJaaromzetRecurring,
      totaleJaaruitgaven,
      jaarwinst,
      totaleEenmaligeInkomsten,
      totaleSalesCommissie,
      winstmarge,
    };
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand, getKlantenKPIs]);

  // Profit margin per month
  const getWinstmarge = useMemo((): number[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const winst = getWinstVoorVerdeling;

    return Array(12).fill(0).map((_, i) => {
      const totaalInkomsten = mrr[i] + eenmalig[i];
      return totaalInkomsten > 0 ? (winst[i] / totaalInkomsten) * 100 : 0;
    });
  }, [getMaandMRR, getMaandEenmalig, getWinstVoorVerdeling]);

  // Pipeline stats
  const getPipelineStats = useMemo((): PipelineStats => {
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

    for (const klant of customers) {
      perFase[klant.pipeline_fase]++;
      if (klant.pipeline_fase !== 'Afgevallen' && klant.pipeline_fase !== 'Klant') {
        totaalWaarde += klant.offerte_waarde;
        aantalActief++;
      }
    }

    return { perFase, totaalWaarde, aantalActief };
  }, [customers]);

  // Monthly chart data
  const getMonthlyChartData = useMemo((): MonthlyChartData[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;
    const currentMonth = getCurrentMonthIndex();

    return Array(12).fill(0).map((_, i) => {
      const inkomsten = mrr[i] + eenmalig[i];
      const kosten = uitgavenTotaal[i] + commissie[i];
      return {
        maand: MAAND_LABELS_ARRAY[i],
        maandKort: MAAND_LABELS_KORT[i],
        inkomsten,
        uitgaven: uitgavenTotaal[i],
        commissie: commissie[i],
        kosten,
        winst: inkomsten - kosten,
        mrr: mrr[i],
        eenmalig: eenmalig[i],
        isFuture: i > currentMonth,
      };
    });
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand]);

  // Expense breakdown
  const getUitgavenBreakdown = useMemo((): UitgavenBreakdown[] => {
    const totaalPerCategorie: Record<string, number> = {};
    let grandTotal = 0;

    for (const categorie of Object.keys(uitgaven)) {
      const totaal = uitgaven[categorie].reduce((a, b) => a + b, 0);
      totaalPerCategorie[categorie] = totaal;
      grandTotal += totaal;
    }

    return Object.keys(totaalPerCategorie)
      .map((categorie) => ({
        categorie,
        totaal: totaalPerCategorie[categorie],
        percentage: grandTotal > 0 ? (totaalPerCategorie[categorie] / grandTotal) * 100 : 0,
      }))
      .filter((item) => item.totaal > 0)
      .sort((a, b) => b.totaal - a.totaal);
  }, [uitgaven]);

  // Year summary
  const getYearSummary = useMemo((): YearSummary => {
    const metrics = getDashboardMetrics;
    return {
      jaar: settings?.boekjaar ?? 2026,
      totaalInkomsten: metrics.totaleJaaromzetRecurring + metrics.totaleEenmaligeInkomsten,
      totaalUitgaven: metrics.totaleJaaruitgaven,
      totaalWinst: metrics.jaarwinst,
      aantalKlanten: metrics.actieveKlanten,
      totaalMRR: metrics.totaleMRR,
      totaalEenmalig: metrics.totaleEenmaligeInkomsten,
      totaalCommissie: metrics.totaleSalesCommissie,
      winstmarge: metrics.winstmarge,
    };
  }, [getDashboardMetrics, settings]);

  // BTW summary
  const getBTWSummary = useMemo((): BTWSummary => {
    const mrrTotaal = getMaandMRR.reduce((a, b) => a + b, 0);
    const eenmaligTotaal = getMaandEenmalig.reduce((a, b) => a + b, 0);
    const omzetExclBTW = mrrTotaal + eenmaligTotaal;
    const btwRate = btwPercentage / 100;

    return {
      omzetExclBTW,
      btwBedrag: omzetExclBTW * btwRate,
      omzetInclBTW: omzetExclBTW * (1 + btwRate),
      mrrExclBTW: mrrTotaal,
      mrrBTW: mrrTotaal * btwRate,
      mrrInclBTW: mrrTotaal * (1 + btwRate),
      eenmaligExclBTW: eenmaligTotaal,
      eenmaligBTW: eenmaligTotaal * btwRate,
      eenmaligInclBTW: eenmaligTotaal * (1 + btwRate),
      btwPercentage,
    };
  }, [getMaandMRR, getMaandEenmalig, btwPercentage]);

  // Customer monthly income calculation
  const getKlantMaandInkomsten = (klantId: string): number[] => {
    const klant = customers.find((k) => k.id === klantId);
    return klant?.maand_inkomsten ?? Array(12).fill(0);
  };

  // MRR breakdown by customer
  const getMRRBreakdown = useMemo(() => {
    return activeCustomers.map((klant) => ({
      klantId: klant.id,
      klantnaam: klant.klantnaam,
      maanden: klant.maand_inkomsten,
      totaal: klant.maand_inkomsten.reduce((a, b) => a + b, 0),
    }));
  }, [activeCustomers]);

  return {
    isLoading,
    settings,
    btwPercentage,
    getCurrentMonthIndex,
    getKlantenKPIs,
    getMaandMRR,
    getMaandEenmalig,
    getMaandEenmaligeKosten,
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
    getBTWSummary,
    getKlantMaandInkomsten,
    getMRRBreakdown,
  };
}
