'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro } from '@/lib/spreadsheet-utils';
import type { EenmaligeInkomst, EenmaligeKost } from '@/types/spreadsheet';
import { EENMALIGE_KOSTEN_CATEGORIEEN } from '@/types/spreadsheet';

type InnerTab = 'inkomsten' | 'kosten' | 'overzicht';

export function EenmaligeInkomstenTab() {
  const {
    eenmaligeInkomsten,
    setEenmaligeInkomsten,
    eenmaligeKosten,
    setEenmaligeKosten,
    instellingen,
  } = useSpreadsheet();

  const [innerTab, setInnerTab] = useState<InnerTab>('inkomsten');

  // === INKOMSTEN HANDLERS ===
  const addInkomst = () => {
    const newInkomst: EenmaligeInkomst = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      datum: '',
      klantnaam: '',
      omschrijving: '',
      bedragExclBTW: 0,
      btw: 0,
      bedragInclBTW: 0,
      salesCommissie: false,
      nettoNaCommissie: 0,
      status: 'Open',
    };
    setEenmaligeInkomsten([...eenmaligeInkomsten, newInkomst]);
  };

  // Calculate average commission percentage from salesPersonen, default to 15%
  const salesPersonen = instellingen.salesPersonen || [];
  const avgCommissiePercentage = salesPersonen.length > 0
    ? salesPersonen.reduce((sum, sp) => sum + sp.commissiePercentage, 0) / salesPersonen.length
    : 15;

  const updateInkomst = (id: string, field: keyof EenmaligeInkomst, value: string | number | boolean) => {
    const updated = eenmaligeInkomsten.map(inkomst => {
      if (inkomst.id !== id) return inkomst;

      const newInkomst = { ...inkomst, [field]: value };

      if (field === 'bedragExclBTW' || field === 'salesCommissie') {
        const bedragExcl = field === 'bedragExclBTW' ? (value as number) : inkomst.bedragExclBTW;
        const hasSalesComm = field === 'salesCommissie' ? (value as boolean) : inkomst.salesCommissie;

        newInkomst.btw = bedragExcl * (instellingen.btwPercentage / 100);
        newInkomst.bedragInclBTW = bedragExcl + newInkomst.btw;
        newInkomst.nettoNaCommissie = hasSalesComm
          ? bedragExcl * (1 - avgCommissiePercentage / 100)
          : bedragExcl;
      }

      return newInkomst;
    });
    setEenmaligeInkomsten(updated);
  };

  const deleteInkomst = (id: string) => {
    setEenmaligeInkomsten(eenmaligeInkomsten.filter(i => i.id !== id));
  };

  // === KOSTEN HANDLERS ===
  const addKost = () => {
    const newKost: EenmaligeKost = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      datum: '',
      leverancier: '',
      omschrijving: '',
      categorie: EENMALIGE_KOSTEN_CATEGORIEEN[0],
      bedragExclBTW: 0,
      btw: 0,
      bedragInclBTW: 0,
      status: 'Gepland',
    };
    setEenmaligeKosten([...eenmaligeKosten, newKost]);
  };

  const updateKost = (id: string, field: keyof EenmaligeKost, value: string | number) => {
    const updated = eenmaligeKosten.map(kost => {
      if (kost.id !== id) return kost;

      const newKost = { ...kost, [field]: value };

      if (field === 'bedragExclBTW') {
        const bedragExcl = value as number;
        newKost.btw = bedragExcl * (instellingen.btwPercentage / 100);
        newKost.bedragInclBTW = bedragExcl + newKost.btw;
      }

      return newKost;
    });
    setEenmaligeKosten(updated);
  };

  const deleteKost = (id: string) => {
    setEenmaligeKosten(eenmaligeKosten.filter(k => k.id !== id));
  };

  // === TOTALEN BEREKENEN ===
  const totaalInkomstenExclBTW = eenmaligeInkomsten.reduce((s, i) => s + i.bedragExclBTW, 0);
  const totaalInkomstenBTW = eenmaligeInkomsten.reduce((s, i) => s + i.btw, 0);
  const totaalInkomstenInclBTW = eenmaligeInkomsten.reduce((s, i) => s + i.bedragInclBTW, 0);
  const totaalInkomstenNetto = eenmaligeInkomsten.reduce((s, i) => s + i.nettoNaCommissie, 0);
  const totaalInkomstenBetaald = eenmaligeInkomsten
    .filter(i => i.status === 'Betaald')
    .reduce((s, i) => s + i.nettoNaCommissie, 0);

  const totaalKostenExclBTW = eenmaligeKosten.reduce((s, k) => s + k.bedragExclBTW, 0);
  const totaalKostenBTW = eenmaligeKosten.reduce((s, k) => s + k.btw, 0);
  const totaalKostenInclBTW = eenmaligeKosten.reduce((s, k) => s + k.bedragInclBTW, 0);
  const totaalKostenBetaald = eenmaligeKosten
    .filter(k => k.status === 'Betaald')
    .reduce((s, k) => s + k.bedragExclBTW, 0);

  const nettoResultaat = totaalInkomstenNetto - totaalKostenExclBTW;

  // Kosten per categorie
  const kostenPerCategorie = EENMALIGE_KOSTEN_CATEGORIEEN.map(cat => ({
    categorie: cat,
    totaal: eenmaligeKosten
      .filter(k => k.categorie === cat)
      .reduce((s, k) => s + k.bedragExclBTW, 0),
  })).filter(c => c.totaal > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Eenmalig</h1>

        {/* Inner Tabs */}
        <div className="flex gap-1 bg-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => setInnerTab('inkomsten')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              innerTab === 'inkomsten'
                ? 'bg-green-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Inkomsten ({eenmaligeInkomsten.length})
          </button>
          <button
            onClick={() => setInnerTab('kosten')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              innerTab === 'kosten'
                ? 'bg-red-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Kosten ({eenmaligeKosten.length})
          </button>
          <button
            onClick={() => setInnerTab('overzicht')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              innerTab === 'overzicht'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Overzicht
          </button>
        </div>
      </div>

      {/* INKOMSTEN TAB */}
      {innerTab === 'inkomsten' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-green-600/80 text-white">
                  <th className="text-left font-medium px-2 py-1.5 min-w-[90px]">Datum</th>
                  <th className="text-left font-medium px-2 py-1.5 min-w-[100px]">Klant</th>
                  <th className="text-left font-medium px-2 py-1.5 min-w-[120px]">Omschrijving</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[80px]">Excl. BTW</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[60px]">BTW</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[80px]">Incl. BTW</th>
                  <th className="text-center font-medium px-2 py-1.5 min-w-[50px]">Comm.</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[80px]">Netto</th>
                  <th className="text-center font-medium px-2 py-1.5 min-w-[70px]">Status</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {eenmaligeInkomsten.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-zinc-500 text-xs">
                      Nog geen eenmalige inkomsten.
                      <button
                        onClick={addInkomst}
                        className="ml-2 text-green-400 hover:text-green-300"
                      >
                        + Toevoegen
                      </button>
                    </td>
                  </tr>
                ) : (
                  eenmaligeInkomsten.map((inkomst) => (
                    <tr key={inkomst.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-2 py-1">
                        <input
                          type="date"
                          value={inkomst.datum}
                          onChange={(e) => updateInkomst(inkomst.id, 'datum', e.target.value)}
                          className="bg-transparent text-white w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={inkomst.klantnaam}
                          onChange={(e) => updateInkomst(inkomst.id, 'klantnaam', e.target.value)}
                          placeholder="Naam..."
                          className="bg-transparent text-white w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={inkomst.omschrijving}
                          onChange={(e) => updateInkomst(inkomst.id, 'omschrijving', e.target.value)}
                          placeholder="—"
                          className="bg-transparent text-zinc-400 w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1 text-right">
                        <input
                          type="number"
                          value={inkomst.bedragExclBTW || ''}
                          onChange={(e) => updateInkomst(inkomst.id, 'bedragExclBTW', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-transparent text-white w-16 text-right focus:outline-none text-[11px]"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-1 text-right text-zinc-400">
                        {formatEuro(inkomst.btw)}
                      </td>
                      <td className="px-2 py-1 text-right text-white font-medium">
                        {formatEuro(inkomst.bedragInclBTW)}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => updateInkomst(inkomst.id, 'salesCommissie', !inkomst.salesCommissie)}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${inkomst.salesCommissie ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-600'}`}
                        >
                          {inkomst.salesCommissie ? 'Ja' : '—'}
                        </button>
                      </td>
                      <td className="px-2 py-1 text-right text-green-400 font-medium">
                        {formatEuro(inkomst.nettoNaCommissie)}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <select
                          value={inkomst.status}
                          onChange={(e) => updateInkomst(inkomst.id, 'status', e.target.value)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border-0 bg-zinc-800 ${
                            inkomst.status === 'Betaald' ? 'text-green-400' :
                            inkomst.status === 'Gefactureerd' ? 'text-blue-400' :
                            inkomst.status === 'Geannuleerd' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="Gefactureerd">Gefact.</option>
                          <option value="Betaald">Betaald</option>
                          <option value="Geannuleerd">Geann.</option>
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <button
                          onClick={() => deleteInkomst(inkomst.id)}
                          className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {eenmaligeInkomsten.length > 0 && (
                <tfoot>
                  <tr className="bg-green-600/80 text-white font-medium">
                    <td colSpan={3} className="px-2 py-1.5">TOTAAL</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalInkomstenExclBTW)}</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalInkomstenBTW)}</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalInkomstenInclBTW)}</td>
                    <td></td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalInkomstenNetto)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {eenmaligeInkomsten.length > 0 && (
            <div className="px-3 py-2 border-t border-zinc-800">
              <button onClick={addInkomst} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs">
                <Plus className="w-3 h-3" /> Inkomst toevoegen
              </button>
            </div>
          )}
        </div>
      )}

      {/* KOSTEN TAB */}
      {innerTab === 'kosten' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-red-600/80 text-white">
                  <th className="text-left font-medium px-2 py-1.5 min-w-[90px]">Datum</th>
                  <th className="text-left font-medium px-2 py-1.5 min-w-[100px]">Leverancier</th>
                  <th className="text-left font-medium px-2 py-1.5 min-w-[120px]">Omschrijving</th>
                  <th className="text-left font-medium px-2 py-1.5 min-w-[100px]">Categorie</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[80px]">Excl. BTW</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[60px]">BTW</th>
                  <th className="text-right font-medium px-2 py-1.5 min-w-[80px]">Incl. BTW</th>
                  <th className="text-center font-medium px-2 py-1.5 min-w-[70px]">Status</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {eenmaligeKosten.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-zinc-500 text-xs">
                      Nog geen eenmalige kosten.
                      <button
                        onClick={addKost}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        + Toevoegen
                      </button>
                    </td>
                  </tr>
                ) : (
                  eenmaligeKosten.map((kost) => (
                    <tr key={kost.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-2 py-1">
                        <input
                          type="date"
                          value={kost.datum}
                          onChange={(e) => updateKost(kost.id, 'datum', e.target.value)}
                          className="bg-transparent text-white w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={kost.leverancier}
                          onChange={(e) => updateKost(kost.id, 'leverancier', e.target.value)}
                          placeholder="Naam..."
                          className="bg-transparent text-white w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={kost.omschrijving}
                          onChange={(e) => updateKost(kost.id, 'omschrijving', e.target.value)}
                          placeholder="—"
                          className="bg-transparent text-zinc-400 w-full focus:outline-none text-[11px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={kost.categorie}
                          onChange={(e) => updateKost(kost.id, 'categorie', e.target.value)}
                          className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border-0 w-full"
                        >
                          {EENMALIGE_KOSTEN_CATEGORIEEN.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 text-right">
                        <input
                          type="number"
                          value={kost.bedragExclBTW || ''}
                          onChange={(e) => updateKost(kost.id, 'bedragExclBTW', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-transparent text-white w-16 text-right focus:outline-none text-[11px]"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-1 text-right text-zinc-400">
                        {formatEuro(kost.btw)}
                      </td>
                      <td className="px-2 py-1 text-right text-red-400 font-medium">
                        {formatEuro(kost.bedragInclBTW)}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <select
                          value={kost.status}
                          onChange={(e) => updateKost(kost.id, 'status', e.target.value)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border-0 bg-zinc-800 ${
                            kost.status === 'Betaald' ? 'text-green-400' :
                            kost.status === 'Besteld' ? 'text-blue-400' :
                            kost.status === 'Geannuleerd' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}
                        >
                          <option value="Gepland">Gepland</option>
                          <option value="Besteld">Besteld</option>
                          <option value="Betaald">Betaald</option>
                          <option value="Geannuleerd">Geann.</option>
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <button
                          onClick={() => deleteKost(kost.id)}
                          className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {eenmaligeKosten.length > 0 && (
                <tfoot>
                  <tr className="bg-red-600/80 text-white font-medium">
                    <td colSpan={4} className="px-2 py-1.5">TOTAAL</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalKostenExclBTW)}</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalKostenBTW)}</td>
                    <td className="px-2 py-1.5 text-right">{formatEuro(totaalKostenInclBTW)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {eenmaligeKosten.length > 0 && (
            <div className="px-3 py-2 border-t border-zinc-800">
              <button onClick={addKost} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs">
                <Plus className="w-3 h-3" /> Kost toevoegen
              </button>
            </div>
          )}
        </div>
      )}

      {/* OVERZICHT TAB */}
      {innerTab === 'overzicht' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Inkomsten Card */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium text-white">Eenmalige Inkomsten</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Totaal (excl. BTW)</span>
                  <span className="text-white">{formatEuro(totaalInkomstenExclBTW)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">BTW</span>
                  <span className="text-zinc-400">{formatEuro(totaalInkomstenBTW)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400">Totaal (incl. BTW)</span>
                  <span className="text-green-400 font-medium">{formatEuro(totaalInkomstenInclBTW)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Netto (na commissie)</span>
                  <span className="text-white">{formatEuro(totaalInkomstenNetto)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Waarvan betaald</span>
                  <span className="text-green-400">{formatEuro(totaalInkomstenBetaald)}</span>
                </div>
              </div>
            </div>

            {/* Kosten Card */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm font-medium text-white">Eenmalige Kosten</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Totaal (excl. BTW)</span>
                  <span className="text-white">{formatEuro(totaalKostenExclBTW)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">BTW</span>
                  <span className="text-zinc-400">{formatEuro(totaalKostenBTW)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400">Totaal (incl. BTW)</span>
                  <span className="text-red-400 font-medium">{formatEuro(totaalKostenInclBTW)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Waarvan betaald</span>
                  <span className="text-red-400">{formatEuro(totaalKostenBetaald)}</span>
                </div>
              </div>
            </div>

            {/* Netto Resultaat Card */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${nettoResultaat >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                  <PieChart className={`w-4 h-4 ${nettoResultaat >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
                </div>
                <span className="text-sm font-medium text-white">Netto Resultaat</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Inkomsten (netto)</span>
                  <span className="text-green-400">+{formatEuro(totaalInkomstenNetto)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Kosten (excl. BTW)</span>
                  <span className="text-red-400">-{formatEuro(totaalKostenExclBTW)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400 font-medium">Resultaat</span>
                  <span className={`font-bold ${nettoResultaat >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {nettoResultaat >= 0 ? '+' : ''}{formatEuro(nettoResultaat)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kosten per Categorie */}
          {kostenPerCategorie.length > 0 && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Kosten per Categorie</h3>
              <div className="space-y-2">
                {kostenPerCategorie.map((cat) => (
                  <div key={cat.categorie} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">{cat.categorie}</span>
                        <span className="text-white">{formatEuro(cat.totaal)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${totaalKostenExclBTW > 0 ? (cat.totaal / totaalKostenExclBTW) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 w-10 text-right">
                      {totaalKostenExclBTW > 0 ? ((cat.totaal / totaalKostenExclBTW) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Inkomsten */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Recente Inkomsten</h3>
              {eenmaligeInkomsten.length === 0 ? (
                <p className="text-xs text-zinc-500">Geen inkomsten</p>
              ) : (
                <div className="space-y-2">
                  {eenmaligeInkomsten.slice(-5).reverse().map(inkomst => (
                    <div key={inkomst.id} className="flex justify-between items-center text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="text-white truncate block">{inkomst.klantnaam || 'Geen naam'}</span>
                        <span className="text-zinc-500">{inkomst.omschrijving || '—'}</span>
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-green-400 font-medium">{formatEuro(inkomst.nettoNaCommissie)}</span>
                        <span className={`block text-[10px] ${
                          inkomst.status === 'Betaald' ? 'text-green-400' :
                          inkomst.status === 'Gefactureerd' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>{inkomst.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Kosten */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Recente Kosten</h3>
              {eenmaligeKosten.length === 0 ? (
                <p className="text-xs text-zinc-500">Geen kosten</p>
              ) : (
                <div className="space-y-2">
                  {eenmaligeKosten.slice(-5).reverse().map(kost => (
                    <div key={kost.id} className="flex justify-between items-center text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="text-white truncate block">{kost.leverancier || 'Geen naam'}</span>
                        <span className="text-zinc-500">{kost.categorie}</span>
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-red-400 font-medium">{formatEuro(kost.bedragExclBTW)}</span>
                        <span className={`block text-[10px] ${
                          kost.status === 'Betaald' ? 'text-green-400' :
                          kost.status === 'Besteld' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>{kost.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
