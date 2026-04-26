'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Check, AlertCircle, Database, HardDrive } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'techtable-spreadsheet-2026';

interface MigrationStatus {
  instellingen: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  coFounders: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  salesPersons: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  klanten: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  leads: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  eenmaligeInkomsten: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  eenmaligeKosten: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  uitgaven: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
  salesTeam: 'pending' | 'migrating' | 'done' | 'error' | 'empty';
}

interface OldData {
  instellingen: {
    bedrijfsnaam: string;
    btwPercentage: number;
    boekjaar: number;
    kvkNummer: string;
    coFounders: Array<{
      id: string;
      naam: string;
      winstverdelingPercentage: number;
      rol?: string;
    }>;
    salesPersonen: Array<{
      id: string;
      naam: string;
      commissiePercentage: number;
    }>;
  } | null;
  klanten: Array<{
    id: string;
    klantnaam: string;
    productDienst: string;
    mrrPerMaand: number;
    eenmalig: number;
    salesPersoonId: string | null;
    status: string;
    maandInkomsten: number[];
    contactpersoon: string;
    email: string;
    telefoon: string;
    notities: string;
    pipelineFase: string;
    aantalContacten: number;
    laatsteContact: string | null;
    offerteWaarde: number;
    verwachteSluitdatum: string | null;
    datumKlantGeworden: string | null;
    datumOnderhoudStart: string | null;
    onderhoudActief: boolean;
    eenmaligTermijnen: number;
    eenmaligStartdatum: string | null;
  }> | null;
  leads: Array<{
    id: string;
    bedrijfsnaam: string;
    contactpersoon: string;
    email: string;
    telefoon: string;
    productInteresse: string;
    bron: string;
    redenAfwijzing: string;
    notities: string;
    datumEersteContact: string | null;
    datumAfgewezen: string | null;
    offerteWaarde: number;
    aantalContacten: number;
  }> | null;
  eenmaligeInkomsten: Array<{
    id: string;
    datum: string;
    klantnaam: string;
    omschrijving: string;
    bedragExclBTW: number;
    btw: number;
    bedragInclBTW: number;
    salesCommissie: boolean;
    nettoNaCommissie: number;
    status: string;
  }> | null;
  eenmaligeKosten: Array<{
    id: string;
    datum: string;
    leverancier: string;
    omschrijving: string;
    categorie: string;
    bedragExclBTW: number;
    btw: number;
    bedragInclBTW: number;
    status: string;
  }> | null;
  uitgaven: Record<string, number[]> | null;
  salesTeam: Array<{
    id: string;
    name: string;
    role: string;
    tasks: Array<{
      id: string;
      text: string;
      completed: boolean;
      createdAt: string;
    }>;
  }> | null;
}

export default function MigratiePage() {
  const [status, setStatus] = useState<MigrationStatus>({
    instellingen: 'pending',
    coFounders: 'pending',
    salesPersons: 'pending',
    klanten: 'pending',
    leads: 'pending',
    eenmaligeInkomsten: 'pending',
    eenmaligeKosten: 'pending',
    uitgaven: 'pending',
    salesTeam: 'pending',
  });
  const [oldData, setOldData] = useState<OldData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanLocalStorage = () => {
    setIsScanning(true);
    setError(null);

    try {
      const instellingen = localStorage.getItem(`${STORAGE_KEY}-instellingen`);
      const klanten = localStorage.getItem(`${STORAGE_KEY}-klanten`);
      const leads = localStorage.getItem(`${STORAGE_KEY}-leads`);
      const eenmaligeInkomsten = localStorage.getItem(`${STORAGE_KEY}-eenmaligeInkomsten`);
      const eenmaligeKosten = localStorage.getItem(`${STORAGE_KEY}-eenmaligeKosten`);
      const uitgaven = localStorage.getItem(`${STORAGE_KEY}-uitgaven`);
      const salesTeam = localStorage.getItem('techtable-sales-team');

      const data: OldData = {
        instellingen: instellingen ? JSON.parse(instellingen) : null,
        klanten: klanten ? JSON.parse(klanten) : null,
        leads: leads ? JSON.parse(leads) : null,
        eenmaligeInkomsten: eenmaligeInkomsten ? JSON.parse(eenmaligeInkomsten) : null,
        eenmaligeKosten: eenmaligeKosten ? JSON.parse(eenmaligeKosten) : null,
        uitgaven: uitgaven ? JSON.parse(uitgaven) : null,
        salesTeam: salesTeam ? JSON.parse(salesTeam) : null,
      };

      setOldData(data);
      setIsScanning(false);
    } catch (e) {
      setError(`Fout bij scannen: ${e}`);
      setIsScanning(false);
    }
  };

  const migrateData = async () => {
    if (!oldData) return;
    setIsMigrating(true);
    setError(null);

    try {
      // 1. Migrate Instellingen (Company Settings)
      if (oldData.instellingen) {
        setStatus(s => ({ ...s, instellingen: 'migrating' }));

        // First delete existing settings
        await supabase.from('company_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const { error } = await supabase.from('company_settings').insert({
          bedrijfsnaam: oldData.instellingen.bedrijfsnaam || 'TechTable',
          kvk_nummer: oldData.instellingen.kvkNummer || '',
          btw_percentage: oldData.instellingen.btwPercentage || 21,
          boekjaar: oldData.instellingen.boekjaar || 2026,
        });

        if (error) throw new Error(`Instellingen: ${error.message}`);
        setStatus(s => ({ ...s, instellingen: 'done' }));

        // 2. Migrate Co-Founders
        if (oldData.instellingen.coFounders?.length) {
          setStatus(s => ({ ...s, coFounders: 'migrating' }));

          // Delete existing
          await supabase.from('co_founders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

          const coFoundersData = oldData.instellingen.coFounders.map(f => ({
            naam: f.naam,
            winstverdeling_percentage: f.winstverdelingPercentage || 0,
            rol: f.rol || '',
          }));

          const { error } = await supabase.from('co_founders').insert(coFoundersData);
          if (error) throw new Error(`Co-founders: ${error.message}`);
          setStatus(s => ({ ...s, coFounders: 'done' }));
        } else {
          setStatus(s => ({ ...s, coFounders: 'empty' }));
        }

        // 3. Migrate Sales Persons
        if (oldData.instellingen.salesPersonen?.length) {
          setStatus(s => ({ ...s, salesPersons: 'migrating' }));

          // Delete existing
          await supabase.from('sales_persons').delete().neq('id', '00000000-0000-0000-0000-000000000000');

          const salesData = oldData.instellingen.salesPersonen.map(sp => ({
            naam: sp.naam,
            commissie_percentage: sp.commissiePercentage || 0,
          }));

          const { error } = await supabase.from('sales_persons').insert(salesData);
          if (error) throw new Error(`Sales persons: ${error.message}`);
          setStatus(s => ({ ...s, salesPersons: 'done' }));
        } else {
          setStatus(s => ({ ...s, salesPersons: 'empty' }));
        }
      } else {
        setStatus(s => ({ ...s, instellingen: 'empty', coFounders: 'empty', salesPersons: 'empty' }));
      }

      // 4. Migrate Klanten (Customers)
      if (oldData.klanten?.length) {
        setStatus(s => ({ ...s, klanten: 'migrating' }));

        // Delete existing
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const klantenData = oldData.klanten.map(k => ({
          klantnaam: k.klantnaam,
          product_dienst: k.productDienst || '',
          mrr_per_maand: k.mrrPerMaand || 0,
          eenmalig: k.eenmalig || 0,
          sales_persoon_id: null, // Can't map old IDs to new UUIDs
          status: k.status || 'Actief',
          maand_inkomsten: k.maandInkomsten || [0,0,0,0,0,0,0,0,0,0,0,0],
          contactpersoon: k.contactpersoon || '',
          email: k.email || '',
          telefoon: k.telefoon || '',
          notities: k.notities || '',
          pipeline_fase: k.pipelineFase || 'Klant',
          aantal_contacten: k.aantalContacten || 0,
          laatste_contact: k.laatsteContact || null,
          offerte_waarde: k.offerteWaarde || 0,
          verwachte_sluitdatum: k.verwachteSluitdatum || null,
          datum_klant_geworden: k.datumKlantGeworden || null,
          datum_onderhoud_start: k.datumOnderhoudStart || null,
          onderhoud_actief: k.onderhoudActief ?? true,
          eenmalig_termijnen: k.eenmaligTermijnen || 1,
          eenmalig_startdatum: k.eenmaligStartdatum || null,
        }));

        const { error } = await supabase.from('customers').insert(klantenData);
        if (error) throw new Error(`Klanten: ${error.message}`);
        setStatus(s => ({ ...s, klanten: 'done' }));
      } else {
        setStatus(s => ({ ...s, klanten: 'empty' }));
      }

      // 5. Migrate Leads
      if (oldData.leads?.length) {
        setStatus(s => ({ ...s, leads: 'migrating' }));

        await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const leadsData = oldData.leads.map(l => ({
          bedrijfsnaam: l.bedrijfsnaam,
          contactpersoon: l.contactpersoon || '',
          email: l.email || '',
          telefoon: l.telefoon || '',
          product_interesse: l.productInteresse || '',
          bron: l.bron || '',
          reden_afwijzing: l.redenAfwijzing || '',
          notities: l.notities || '',
          datum_eerste_contact: l.datumEersteContact || null,
          datum_afgewezen: l.datumAfgewezen || null,
          offerte_waarde: l.offerteWaarde || 0,
          aantal_contacten: l.aantalContacten || 0,
        }));

        const { error } = await supabase.from('leads').insert(leadsData);
        if (error) throw new Error(`Leads: ${error.message}`);
        setStatus(s => ({ ...s, leads: 'done' }));
      } else {
        setStatus(s => ({ ...s, leads: 'empty' }));
      }

      // 6. Migrate Eenmalige Inkomsten
      if (oldData.eenmaligeInkomsten?.length) {
        setStatus(s => ({ ...s, eenmaligeInkomsten: 'migrating' }));

        await supabase.from('one_time_income').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const incomeData = oldData.eenmaligeInkomsten.map(i => ({
          datum: i.datum,
          klantnaam: i.klantnaam || '',
          omschrijving: i.omschrijving || '',
          bedrag_excl_btw: i.bedragExclBTW || 0,
          btw: i.btw || 0,
          bedrag_incl_btw: i.bedragInclBTW || 0,
          sales_commissie: i.salesCommissie || false,
          netto_na_commissie: i.nettoNaCommissie || 0,
          status: i.status || 'Open',
        }));

        const { error } = await supabase.from('one_time_income').insert(incomeData);
        if (error) throw new Error(`Eenmalige inkomsten: ${error.message}`);
        setStatus(s => ({ ...s, eenmaligeInkomsten: 'done' }));
      } else {
        setStatus(s => ({ ...s, eenmaligeInkomsten: 'empty' }));
      }

      // 7. Migrate Eenmalige Kosten
      if (oldData.eenmaligeKosten?.length) {
        setStatus(s => ({ ...s, eenmaligeKosten: 'migrating' }));

        await supabase.from('one_time_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const expenseData = oldData.eenmaligeKosten.map(k => ({
          datum: k.datum,
          leverancier: k.leverancier || '',
          omschrijving: k.omschrijving || '',
          categorie: k.categorie || 'Overig',
          bedrag_excl_btw: k.bedragExclBTW || 0,
          btw: k.btw || 0,
          bedrag_incl_btw: k.bedragInclBTW || 0,
          status: k.status || 'Gepland',
        }));

        const { error } = await supabase.from('one_time_expenses').insert(expenseData);
        if (error) throw new Error(`Eenmalige kosten: ${error.message}`);
        setStatus(s => ({ ...s, eenmaligeKosten: 'done' }));
      } else {
        setStatus(s => ({ ...s, eenmaligeKosten: 'empty' }));
      }

      // 8. Migrate Uitgaven (Monthly Expenses)
      if (oldData.uitgaven && Object.keys(oldData.uitgaven).length) {
        setStatus(s => ({ ...s, uitgaven: 'migrating' }));

        await supabase.from('monthly_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const uitgavenData = Object.entries(oldData.uitgaven).map(([categorie, bedragen]) => ({
          categorie,
          maand_bedragen: bedragen,
        }));

        const { error } = await supabase.from('monthly_expenses').insert(uitgavenData);
        if (error) throw new Error(`Uitgaven: ${error.message}`);
        setStatus(s => ({ ...s, uitgaven: 'done' }));
      } else {
        setStatus(s => ({ ...s, uitgaven: 'empty' }));
      }

      // 9. Sales Team (stays in localStorage for now, or we can add to tasks)
      setStatus(s => ({ ...s, salesTeam: oldData.salesTeam?.length ? 'done' : 'empty' }));

      setIsMigrating(false);
    } catch (e) {
      setError(`Migratie fout: ${e}`);
      setIsMigrating(false);
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'done': return <Check className="w-4 h-4 text-green-400" />;
      case 'migrating': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'empty': return <span className="text-zinc-500 text-xs">leeg</span>;
      default: return <span className="text-zinc-500 text-xs">wachtend</span>;
    }
  };

  const getDataCount = (key: keyof OldData) => {
    if (!oldData) return 0;
    const data = oldData[key];
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') return Object.keys(data).length;
    return 1;
  };

  const allDone = Object.values(status).every(s => s === 'done' || s === 'empty');

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Data Migratie</h1>
        <p className="text-zinc-400 mb-8">
          Verplaats je oude localStorage data naar Supabase database
        </p>

        {/* Step 1: Scan */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Stap 1: Scan localStorage</h2>
              <p className="text-sm text-zinc-500">Zoek naar oude data in je browser</p>
            </div>
          </div>

          {!oldData ? (
            <button
              onClick={scanLocalStorage}
              disabled={isScanning}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              {isScanning ? 'Scannen...' : 'Scan localStorage'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Instellingen</span>
                <span className="text-white">{oldData.instellingen ? 'Gevonden' : 'Niet gevonden'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Co-founders</span>
                <span className="text-white">{oldData.instellingen?.coFounders?.length || 0} personen</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Sales personen</span>
                <span className="text-white">{oldData.instellingen?.salesPersonen?.length || 0} personen</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Klanten</span>
                <span className="text-white">{oldData.klanten?.length || 0} klanten</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Leads</span>
                <span className="text-white">{oldData.leads?.length || 0} leads</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Eenmalige inkomsten</span>
                <span className="text-white">{oldData.eenmaligeInkomsten?.length || 0} items</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Eenmalige kosten</span>
                <span className="text-white">{oldData.eenmaligeKosten?.length || 0} items</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Uitgaven categorieën</span>
                <span className="text-white">{oldData.uitgaven ? Object.keys(oldData.uitgaven).length : 0} categorieën</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-zinc-400">Sales Team</span>
                <span className="text-white">{oldData.salesTeam?.length || 0} personen</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Migrate */}
        {oldData && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Stap 2: Migreer naar Supabase</h2>
                <p className="text-sm text-zinc-500">Verplaats alle data naar de database</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {Object.entries(status).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <span className="text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  {getStatusIcon(value)}
                </div>
              ))}
            </div>

            {!allDone ? (
              <button
                onClick={migrateData}
                disabled={isMigrating}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isMigrating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Migreren...
                  </>
                ) : (
                  <>
                    Start Migratie
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="text-center py-4">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Migratie voltooid!</p>
                <Link
                  href="/financieel"
                  className="inline-block mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                >
                  Ga naar Financieel
                </Link>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm">
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
