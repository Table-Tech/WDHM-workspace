'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro, formatPercentage, sum } from '@/lib/spreadsheet-utils';
import { MAAND_LABELS } from '@/types/spreadsheet';

export function MaandoverzichtTab() {
  const {
    instellingen,
    uitgaven,
    uitgavenCategorieen,
    updateUitgave,
    addUitgaveCategorie,
    deleteUitgaveCategorie,
    getMaandMRR,
    getMaandEenmalig,
    getSalesCommissiePerMaand,
    getTotaalUitgavenPerMaand,
    getWinstVoorVerdeling,
    getWinstmarge,
  } = useSpreadsheet();

  const [nieuweCat, setNieuweCat] = useState('');

  const maandMRR = getMaandMRR();
  const maandEenmalig = getMaandEenmalig();
  const overigeInkomsten = Array(12).fill(0);
  const totaalInkomsten = maandMRR.map((m, i) => m + maandEenmalig[i] + overigeInkomsten[i]);
  const salesCommissieAf = getSalesCommissiePerMaand();
  const totaalUitgaven = getTotaalUitgavenPerMaand();
  const winstVoorVerdeling = getWinstVoorVerdeling();
  const winstmarge = getWinstmarge();

  const founderVerdelingen = instellingen.coFounders.map(founder => ({
    naam: founder.naam,
    percentage: founder.winstverdelingPercentage,
    maandBedragen: winstVoorVerdeling.map(w => w * (founder.winstverdelingPercentage / 100)),
  }));

  const totaalVerdeeld = winstVoorVerdeling;

  const handleAddCategorie = () => {
    if (nieuweCat.trim()) {
      addUitgaveCategorie(nieuweCat.trim());
      setNieuweCat('');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Maandoverzicht {instellingen.boekjaar}</h1>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-zinc-800 text-zinc-400">
                <th className="text-left font-medium px-2 py-1.5 sticky left-0 bg-zinc-800 z-10 min-w-[140px]"></th>
                {MAAND_LABELS.map((label) => (
                  <th key={label} className="text-right font-medium px-1.5 py-1.5 min-w-[60px]">{label}</th>
                ))}
                <th className="text-right font-bold px-2 py-1.5 min-w-[70px] bg-zinc-700">TOTAAL</th>
              </tr>
            </thead>
            <tbody>
              {/* INKOMSTEN */}
              <tr className="bg-teal-600/80">
                <td colSpan={14} className="px-2 py-1 text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-teal-600/80 z-10">Inkomsten</td>
              </tr>

              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-2 py-1 text-zinc-300 sticky left-0 bg-zinc-900/95 z-10">MRR — Recurring</td>
                {maandMRR.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-zinc-400">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1 text-right text-white font-medium bg-zinc-800/50">{formatEuro(sum(maandMRR))}</td>
              </tr>

              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-2 py-1 text-zinc-300 sticky left-0 bg-zinc-900/95 z-10">Eenmalige projecten</td>
                {maandEenmalig.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-zinc-400">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1 text-right text-white font-medium bg-zinc-800/50">{formatEuro(sum(maandEenmalig))}</td>
              </tr>

              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-2 py-1 text-zinc-300 sticky left-0 bg-zinc-900/95 z-10">Overige inkomsten</td>
                {overigeInkomsten.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-zinc-400">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1 text-right text-white font-medium bg-zinc-800/50">{formatEuro(sum(overigeInkomsten))}</td>
              </tr>

              <tr className="bg-teal-600/80">
                <td className="px-2 py-1.5 text-white font-semibold sticky left-0 bg-teal-600/80 z-10">TOTAAL INKOMSTEN</td>
                {totaalInkomsten.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1.5 text-right text-white font-semibold">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1.5 text-right text-white font-bold bg-teal-700/80">{formatEuro(sum(totaalInkomsten))}</td>
              </tr>

              <tr className="border-b border-zinc-800/50 bg-orange-500/10">
                <td className="px-2 py-1 text-orange-300 sticky left-0 bg-zinc-900/95 z-10">Sales commissie (af)</td>
                {salesCommissieAf.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-orange-300/70">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1 text-right text-orange-300 font-medium bg-zinc-800/50">{formatEuro(sum(salesCommissieAf))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* UITGAVEN */}
              <tr className="bg-red-600/80">
                <td colSpan={14} className="px-2 py-1 text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-red-600/80 z-10">Uitgaven</td>
              </tr>

              {uitgavenCategorieen.map((categorie) => {
                const bedragen = uitgaven[categorie] || Array(12).fill(0);
                return (
                  <tr key={categorie} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 group">
                    <td className="px-2 py-0.5 text-zinc-300 sticky left-0 bg-zinc-900/95 z-10 flex items-center gap-1">
                      <span className="flex-1">{categorie}</span>
                      <button
                        onClick={() => deleteUitgaveCategorie(categorie)}
                        className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    {bedragen.map((bedrag, i) => (
                      <td key={i} className="px-1 py-0.5 text-right">
                        <input
                          type="number"
                          value={bedrag || ''}
                          onChange={(e) => updateUitgave(categorie, i, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="bg-transparent text-zinc-400 w-12 text-right focus:outline-none focus:bg-zinc-800 px-0.5 py-0.5 rounded text-[11px]"
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-0.5 text-right text-white font-medium bg-zinc-800/50">{formatEuro(sum(bedragen))}</td>
                  </tr>
                );
              })}

              {/* Add expense category */}
              <tr className="border-b border-zinc-800/50">
                <td className="px-2 py-1 sticky left-0 bg-zinc-900/95 z-10">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nieuweCat}
                      onChange={(e) => setNieuweCat(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategorie()}
                      placeholder="+ Categorie toevoegen..."
                      className="bg-transparent text-zinc-500 w-full focus:outline-none focus:text-white text-[11px] placeholder:text-zinc-600"
                    />
                    {nieuweCat && (
                      <button onClick={handleAddCategorie} className="text-green-400 hover:text-green-300">
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td colSpan={13}></td>
              </tr>

              <tr className="bg-red-600/80">
                <td className="px-2 py-1.5 text-white font-semibold sticky left-0 bg-red-600/80 z-10">TOTAAL UITGAVEN</td>
                {totaalUitgaven.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1.5 text-right text-white font-semibold">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1.5 text-right text-white font-bold bg-red-700/80">{formatEuro(sum(totaalUitgaven))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* WINST */}
              <tr className="bg-blue-600/80">
                <td className="px-2 py-1.5 text-white font-semibold sticky left-0 bg-blue-600/80 z-10">WINST VOOR VERDELING</td>
                {winstVoorVerdeling.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1.5 text-right text-white font-semibold">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1.5 text-right text-white font-bold bg-blue-700/80">{formatEuro(sum(winstVoorVerdeling))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* VERDELING */}
              <tr className="bg-purple-600/80">
                <td colSpan={14} className="px-2 py-1 text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-purple-600/80 z-10">Verdeling Co-founders</td>
              </tr>

              {founderVerdelingen.map((founder) => (
                <tr key={founder.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-2 py-1 text-zinc-300 sticky left-0 bg-zinc-900/95 z-10">
                    {founder.naam} <span className="text-zinc-500 text-[10px]">({founder.percentage}%)</span>
                  </td>
                  {founder.maandBedragen.map((bedrag, i) => (
                    <td key={i} className="px-1.5 py-1 text-right text-zinc-400">{formatEuro(bedrag)}</td>
                  ))}
                  <td className="px-2 py-1 text-right text-white font-medium bg-zinc-800/50">{formatEuro(sum(founder.maandBedragen))}</td>
                </tr>
              ))}

              <tr className="bg-purple-600/80">
                <td className="px-2 py-1.5 text-white font-semibold sticky left-0 bg-purple-600/80 z-10">TOTAAL VERDEELD</td>
                {totaalVerdeeld.map((bedrag, i) => (
                  <td key={i} className="px-1.5 py-1.5 text-right text-white font-semibold">{formatEuro(bedrag)}</td>
                ))}
                <td className="px-2 py-1.5 text-right text-white font-bold bg-purple-700/80">{formatEuro(sum(totaalVerdeeld))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* Winstmarge */}
              <tr className="bg-sky-600/50">
                <td className="px-2 py-1.5 text-white font-medium sticky left-0 bg-sky-600/50 z-10">Winstmarge (%)</td>
                {winstmarge.map((percentage, i) => (
                  <td key={i} className="px-1.5 py-1.5 text-right text-white font-medium">{formatPercentage(percentage)}</td>
                ))}
                <td className="px-2 py-1.5 text-right text-white font-bold bg-sky-700/50">
                  {formatPercentage(sum(totaalInkomsten) > 0 ? (sum(winstVoorVerdeling) / sum(totaalInkomsten)) * 100 : 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
