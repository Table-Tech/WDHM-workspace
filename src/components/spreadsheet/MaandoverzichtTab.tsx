'use client';

import { useState } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro, formatPercentage, sum } from '@/lib/spreadsheet-utils';
import { MAAND_LABELS } from '@/types/spreadsheet';

type ZoomLevel = 'small' | 'medium' | 'large';

const ZOOM_STYLES: Record<ZoomLevel, { text: string; cell: string; header: string }> = {
  small: { text: 'text-[11px]', cell: 'px-1.5 py-1', header: 'px-1.5 py-1.5' },
  medium: { text: 'text-xs', cell: 'px-2 py-1.5', header: 'px-2 py-2' },
  large: { text: 'text-sm', cell: 'px-3 py-2', header: 'px-3 py-2.5' },
};

export function MaandoverzichtTab() {
  const {
    instellingen,
    klanten,
    uitgaven,
    uitgavenCategorieen,
    eenmaligeKosten,
    updateUitgave,
    addUitgaveCategorie,
    deleteUitgaveCategorie,
    getMaandMRR,
    getMaandEenmalig,
    getMaandEenmaligeKosten,
    getSalesCommissiePerMaand,
    getTotaalUitgavenPerMaand,
    getWinstVoorVerdeling,
    getWinstmarge,
    getMRRBreakdown,
  } = useSpreadsheet();

  const [nieuweCat, setNieuweCat] = useState('');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('small');
  const [showMRRDetail, setShowMRRDetail] = useState(false);

  const zoom = ZOOM_STYLES[zoomLevel];
  const mrrBreakdown = getMRRBreakdown();

  const maandMRR = getMaandMRR();
  const maandEenmalig = getMaandEenmalig();
  const maandEenmaligeKosten = getMaandEenmaligeKosten();
  const totaalEenmaligeKosten = eenmaligeKosten
    .filter(k => k.status !== 'Geannuleerd')
    .reduce((sum, k) => sum + k.bedragExclBTW, 0);
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

  const cycleZoom = () => {
    const levels: ZoomLevel[] = ['small', 'medium', 'large'];
    const currentIndex = levels.indexOf(zoomLevel);
    setZoomLevel(levels[(currentIndex + 1) % levels.length]);
  };

  // Get klant start info for display
  const getKlantStartInfo = (klantId: string) => {
    const klant = klanten.find(k => k.id === klantId);
    if (!klant) return null;
    const startDatum = klant.datumOnderhoudStart || klant.datumKlantGeworden;
    if (!startDatum) return 'Heel jaar';
    const date = new Date(startDatum);
    return `Vanaf ${date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Maandoverzicht {instellingen.boekjaar}</h1>

        {/* Zoom control */}
        <button
          onClick={cycleZoom}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300"
        >
          {zoomLevel === 'large' ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          <span className="text-xs">
            {zoomLevel === 'small' ? 'Klein' : zoomLevel === 'medium' ? 'Medium' : 'Groot'}
          </span>
        </button>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${zoom.text}`}>
            <thead>
              <tr className="bg-zinc-800 text-zinc-400">
                <th className={`text-left font-medium ${zoom.header} sticky left-0 bg-zinc-800 z-10 min-w-[140px]`}></th>
                {MAAND_LABELS.map((label) => (
                  <th key={label} className={`text-right font-medium ${zoom.header} min-w-[60px]`}>{label}</th>
                ))}
                <th className={`text-right font-bold ${zoom.header} min-w-[70px] bg-zinc-700`}>TOTAAL</th>
              </tr>
            </thead>
            <tbody>
              {/* INKOMSTEN */}
              <tr className="bg-teal-600/80">
                <td colSpan={14} className={`${zoom.cell} text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-teal-600/80 z-10`}>Inkomsten</td>
              </tr>

              {/* MRR Row - Clickable to expand */}
              <tr
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
                onClick={() => setShowMRRDetail(!showMRRDetail)}
              >
                <td className={`${zoom.cell} text-zinc-300 sticky left-0 bg-zinc-900/95 z-10 flex items-center gap-2`}>
                  {showMRRDetail ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                  <span>MRR — Recurring</span>
                  <span className="text-zinc-600 text-[10px]">({mrrBreakdown.length} klanten)</span>
                </td>
                {maandMRR.map((bedrag, i) => (
                  <td key={i} className={`${zoom.cell} text-right text-teal-400 font-medium`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.cell} text-right text-white font-bold bg-zinc-800/50`}>{formatEuro(sum(maandMRR))}</td>
              </tr>

              {/* MRR Detail per klant */}
              {showMRRDetail && mrrBreakdown.map((klant) => (
                <tr key={klant.klantId} className="border-b border-zinc-800/30 bg-teal-900/10">
                  <td className={`${zoom.cell} pl-8 text-zinc-400 sticky left-0 bg-zinc-900/95 z-10`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                      <span>{klant.klantnaam}</span>
                      <span className="text-zinc-600 text-[9px]">({getKlantStartInfo(klant.klantId)})</span>
                    </div>
                  </td>
                  {klant.maanden.map((bedrag, i) => (
                    <td key={i} className={`${zoom.cell} text-right ${bedrag > 0 ? 'text-teal-400/70' : 'text-zinc-700'}`}>
                      {bedrag > 0 ? formatEuro(bedrag) : '—'}
                    </td>
                  ))}
                  <td className={`${zoom.cell} text-right text-teal-400/80 bg-zinc-800/30`}>{formatEuro(klant.totaal)}</td>
                </tr>
              ))}

              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className={`${zoom.cell} text-zinc-300 sticky left-0 bg-zinc-900/95 z-10`}>Eenmalige projecten</td>
                {maandEenmalig.map((bedrag, i) => (
                  <td key={i} className={`${zoom.cell} text-right text-zinc-400`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.cell} text-right text-white font-medium bg-zinc-800/50`}>{formatEuro(sum(maandEenmalig))}</td>
              </tr>

              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className={`${zoom.cell} text-zinc-300 sticky left-0 bg-zinc-900/95 z-10`}>Overige inkomsten</td>
                {overigeInkomsten.map((bedrag, i) => (
                  <td key={i} className={`${zoom.cell} text-right text-zinc-400`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.cell} text-right text-white font-medium bg-zinc-800/50`}>{formatEuro(sum(overigeInkomsten))}</td>
              </tr>

              <tr className="bg-teal-600/80">
                <td className={`${zoom.header} text-white font-semibold sticky left-0 bg-teal-600/80 z-10`}>TOTAAL INKOMSTEN</td>
                {totaalInkomsten.map((bedrag, i) => (
                  <td key={i} className={`${zoom.header} text-right text-white font-semibold`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.header} text-right text-white font-bold bg-teal-700/80`}>{formatEuro(sum(totaalInkomsten))}</td>
              </tr>

              <tr className="border-b border-zinc-800/50 bg-orange-500/10">
                <td className={`${zoom.cell} text-orange-300 sticky left-0 bg-zinc-900/95 z-10`}>Sales commissie (af)</td>
                {salesCommissieAf.map((bedrag, i) => (
                  <td key={i} className={`${zoom.cell} text-right text-orange-300/70`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.cell} text-right text-orange-300 font-medium bg-zinc-800/50`}>{formatEuro(sum(salesCommissieAf))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* UITGAVEN */}
              <tr className="bg-red-600/80">
                <td colSpan={14} className={`${zoom.cell} text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-red-600/80 z-10`}>Uitgaven</td>
              </tr>

              {uitgavenCategorieen.map((categorie) => {
                const bedragen = uitgaven[categorie] || Array(12).fill(0);
                return (
                  <tr key={categorie} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 group">
                    <td className={`${zoom.cell} text-zinc-300 sticky left-0 bg-zinc-900/95 z-10 flex items-center gap-1`}>
                      <span className="flex-1">{categorie}</span>
                      <button
                        onClick={() => deleteUitgaveCategorie(categorie)}
                        className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    {bedragen.map((bedrag, i) => (
                      <td key={i} className={`${zoom.cell} text-right`}>
                        <input
                          type="number"
                          value={bedrag || ''}
                          onChange={(e) => updateUitgave(categorie, i, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={`bg-transparent text-zinc-400 w-12 text-right focus:outline-none focus:bg-zinc-800 px-0.5 py-0.5 rounded ${zoom.text}`}
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className={`${zoom.cell} text-right text-white font-medium bg-zinc-800/50`}>{formatEuro(sum(bedragen))}</td>
                  </tr>
                );
              })}

              {/* Add expense category */}
              <tr className="border-b border-zinc-800/50">
                <td className={`${zoom.cell} sticky left-0 bg-zinc-900/95 z-10`}>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nieuweCat}
                      onChange={(e) => setNieuweCat(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategorie()}
                      placeholder="+ Categorie toevoegen..."
                      className={`bg-transparent text-zinc-500 w-full focus:outline-none focus:text-white ${zoom.text} placeholder:text-zinc-600`}
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
                <td className={`${zoom.header} text-white font-semibold sticky left-0 bg-red-600/80 z-10`}>TOTAAL UITGAVEN</td>
                {totaalUitgaven.map((bedrag, i) => (
                  <td key={i} className={`${zoom.header} text-right text-white font-semibold`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.header} text-right text-white font-bold bg-red-700/80`}>{formatEuro(sum(totaalUitgaven))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* WINST */}
              <tr className="bg-blue-600/80">
                <td className={`${zoom.header} text-white font-semibold sticky left-0 bg-blue-600/80 z-10`}>WINST VOOR VERDELING</td>
                {winstVoorVerdeling.map((bedrag, i) => (
                  <td key={i} className={`${zoom.header} text-right text-white font-semibold`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.header} text-right text-white font-bold bg-blue-700/80`}>{formatEuro(sum(winstVoorVerdeling))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* VERDELING */}
              <tr className="bg-purple-600/80">
                <td colSpan={14} className={`${zoom.cell} text-white font-semibold text-[10px] uppercase tracking-wide sticky left-0 bg-purple-600/80 z-10`}>Verdeling Co-founders</td>
              </tr>

              {founderVerdelingen.map((founder) => (
                <tr key={founder.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className={`${zoom.cell} text-zinc-300 sticky left-0 bg-zinc-900/95 z-10`}>
                    {founder.naam} <span className="text-zinc-500 text-[10px]">({founder.percentage}%)</span>
                  </td>
                  {founder.maandBedragen.map((bedrag, i) => (
                    <td key={i} className={`${zoom.cell} text-right text-zinc-400`}>{formatEuro(bedrag)}</td>
                  ))}
                  <td className={`${zoom.cell} text-right text-white font-medium bg-zinc-800/50`}>{formatEuro(sum(founder.maandBedragen))}</td>
                </tr>
              ))}

              <tr className="bg-purple-600/80">
                <td className={`${zoom.header} text-white font-semibold sticky left-0 bg-purple-600/80 z-10`}>TOTAAL VERDEELD</td>
                {totaalVerdeeld.map((bedrag, i) => (
                  <td key={i} className={`${zoom.header} text-right text-white font-semibold`}>{formatEuro(bedrag)}</td>
                ))}
                <td className={`${zoom.header} text-right text-white font-bold bg-purple-700/80`}>{formatEuro(sum(totaalVerdeeld))}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={14} className="h-2"></td></tr>

              {/* Winstmarge */}
              <tr className="bg-sky-600/50">
                <td className={`${zoom.header} text-white font-medium sticky left-0 bg-sky-600/50 z-10`}>Winstmarge (%)</td>
                {winstmarge.map((percentage, i) => (
                  <td key={i} className={`${zoom.header} text-right text-white font-medium`}>{formatPercentage(percentage)}</td>
                ))}
                <td className={`${zoom.header} text-right text-white font-bold bg-sky-700/50`}>
                  {formatPercentage(sum(totaalInkomsten) > 0 ? (sum(winstVoorVerdeling) / sum(totaalInkomsten)) * 100 : 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>Klik op &quot;MRR — Recurring&quot; voor detail per klant</span>
        <span>•</span>
        <span>MRR start vanaf de ingestelde startdatum per klant</span>
      </div>
    </div>
  );
}
