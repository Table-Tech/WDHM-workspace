'use client';

import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatPercentage } from '@/lib/spreadsheet-utils';

export function InstellingenTab() {
  const {
    instellingen,
    setInstellingen,
    addCoFounder,
    deleteCoFounder,
    addSalesPersoon,
    updateSalesPersoon,
    deleteSalesPersoon,
  } = useSpreadsheet();

  const salesPersonen = instellingen.salesPersonen || [];

  const totaalVerdeling = instellingen.coFounders.reduce(
    (sum, f) => sum + f.winstverdelingPercentage, 0
  );
  const isVerdelingCorrect = Math.abs(totaalVerdeling - 100) < 0.01;

  const updateFounder = (id: string, field: string, value: string | number) => {
    const updated = {
      ...instellingen,
      coFounders: instellingen.coFounders.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      ),
    };
    setInstellingen(updated);
  };

  const updateField = (field: keyof typeof instellingen, value: string | number) => {
    setInstellingen({ ...instellingen, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Instellingen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Co-founders */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="bg-purple-600/80 px-3 py-2">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Co-founders</h2>
          </div>
          <div className="p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-1.5 font-medium">Naam</th>
                  <th className="text-right py-1.5 font-medium">Verdeling</th>
                  <th className="text-left py-1.5 font-medium pl-3">Rol</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {instellingen.coFounders.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-800/50">
                    <td className="py-1.5">
                      <input
                        type="text"
                        value={f.naam}
                        onChange={(e) => updateFounder(f.id, 'naam', e.target.value)}
                        placeholder="Naam..."
                        className="bg-transparent text-white w-full focus:outline-none focus:bg-zinc-800 px-1 py-0.5 rounded text-xs"
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <input
                        type="number"
                        value={f.winstverdelingPercentage}
                        onChange={(e) => updateFounder(f.id, 'winstverdelingPercentage', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-white w-12 text-right focus:outline-none focus:bg-zinc-800 px-1 py-0.5 rounded text-xs"
                        step="0.1"
                      />
                      <span className="text-zinc-500 ml-0.5">%</span>
                    </td>
                    <td className="py-1.5 pl-3">
                      <input
                        type="text"
                        value={f.rol}
                        onChange={(e) => updateFounder(f.id, 'rol', e.target.value)}
                        placeholder="—"
                        className="bg-transparent text-zinc-400 w-full focus:outline-none focus:bg-zinc-800 px-1 py-0.5 rounded text-xs"
                      />
                    </td>
                    <td className="py-1.5">
                      <button
                        onClick={() => deleteCoFounder(f.id)}
                        className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-purple-500/10">
                  <td className="py-1.5 text-purple-300 font-medium text-xs">Totaal</td>
                  <td className="py-1.5 text-right">
                    <span className={`font-medium text-xs ${isVerdelingCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(totaalVerdeling)}
                    </span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
            {!isVerdelingCorrect && (
              <div className="mt-2 flex items-center gap-1 text-amber-400 text-[10px]">
                <AlertTriangle className="w-3 h-3" />
                <span>Moet 100% zijn</span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-zinc-800">
              <button onClick={addCoFounder} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs">
                <Plus className="w-3 h-3" /> Co-founder toevoegen
              </button>
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="space-y-4">
          {/* Salespersonen */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-orange-600/80 px-3 py-2">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Salespersonen</h2>
            </div>
            <div className="p-3">
              {salesPersonen.length === 0 ? (
                <p className="text-zinc-500 text-xs mb-2">Nog geen salespersonen toegevoegd.</p>
              ) : (
                <table className="w-full text-xs mb-2">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-1.5 font-medium">Naam</th>
                      <th className="text-right py-1.5 font-medium">Commissie</th>
                      <th className="w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesPersonen.map((sp) => (
                      <tr key={sp.id} className="border-b border-zinc-800/50">
                        <td className="py-1.5">
                          <input
                            type="text"
                            value={sp.naam}
                            onChange={(e) => updateSalesPersoon(sp.id, { naam: e.target.value })}
                            placeholder="Naam..."
                            className="bg-transparent text-white w-full focus:outline-none focus:bg-zinc-800 px-1 py-0.5 rounded text-xs"
                          />
                        </td>
                        <td className="py-1.5 text-right">
                          <input
                            type="number"
                            value={sp.commissiePercentage}
                            onChange={(e) => updateSalesPersoon(sp.id, { commissiePercentage: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent text-white w-12 text-right focus:outline-none focus:bg-zinc-800 px-1 py-0.5 rounded text-xs"
                            step="0.1"
                          />
                          <span className="text-zinc-500 ml-0.5">%</span>
                        </td>
                        <td className="py-1.5">
                          <button
                            onClick={() => deleteSalesPersoon(sp.id)}
                            className="p-0.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button onClick={addSalesPersoon} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs">
                <Plus className="w-3 h-3" /> Salespersoon toevoegen
              </button>
            </div>
          </div>

          {/* BTW */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-teal-600/80 px-3 py-2">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wide">BTW</h2>
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">BTW percentage</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={instellingen.btwPercentage}
                    onChange={(e) => updateField('btwPercentage', parseFloat(e.target.value) || 0)}
                    className="bg-zinc-800 text-white w-14 px-2 py-1 rounded text-right text-xs"
                    step="0.1"
                  />
                  <span className="text-zinc-500 ml-1">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bedrijfsinfo */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-700 px-3 py-2">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Bedrijfsinfo</h2>
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Bedrijfsnaam</span>
                <input
                  type="text"
                  value={instellingen.bedrijfsnaam}
                  onChange={(e) => updateField('bedrijfsnaam', e.target.value)}
                  className="bg-zinc-800 text-white w-28 px-2 py-1 rounded text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">KVK nummer</span>
                <input
                  type="text"
                  value={instellingen.kvkNummer}
                  onChange={(e) => updateField('kvkNummer', e.target.value)}
                  placeholder="—"
                  className="bg-zinc-800 text-white w-28 px-2 py-1 rounded text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Boekjaar</span>
                <input
                  type="number"
                  value={instellingen.boekjaar}
                  onChange={(e) => updateField('boekjaar', parseInt(e.target.value) || 2026)}
                  className="bg-zinc-800 text-white w-20 px-2 py-1 rounded text-right text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
