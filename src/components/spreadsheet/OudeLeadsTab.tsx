'use client';

import { useState } from 'react';
import { Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro } from '@/lib/spreadsheet-utils';

export function OudeLeadsTab() {
  const { leads, addLead, updateLead, deleteLead, restoreLeadToKlant } = useSpreadsheet();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const handleAddLead = () => {
    addLead({
      bedrijfsnaam: '',
      contactpersoon: '',
      email: '',
      telefoon: '',
      productInteresse: '',
      bron: '',
      redenAfwijzing: '',
      notities: '',
      datumEersteContact: '',
      datumAfgewezen: new Date().toISOString().split('T')[0],
      offerteWaarde: 0,
      aantalContacten: 0,
    });
  };

  const totaalWaarde = leads.reduce((s, l) => s + (l.offerteWaarde || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Oude Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">Klanten die nee hebben gezegd - voor latere opvolging</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div><span className="text-zinc-500">Aantal:</span> <span className="text-orange-400 font-semibold">{leads.length}</span></div>
          <div><span className="text-zinc-500">Totale waarde:</span> <span className="text-zinc-400 font-semibold">{formatEuro(totaalWaarde)}</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500 mb-4">Nog geen oude leads.</p>
            <button
              onClick={handleAddLead}
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300"
            >
              <Plus className="w-4 h-4" /> Eerste lead toevoegen
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-800 text-zinc-400">
                    <th className="w-8"></th>
                    <th className="text-left px-3 py-3 font-medium min-w-[160px]">Bedrijf</th>
                    <th className="text-left px-3 py-3 font-medium min-w-[140px]">Contact</th>
                    <th className="text-left px-3 py-3 font-medium min-w-[120px]">Product</th>
                    <th className="text-left px-3 py-3 font-medium min-w-[180px]">Reden afwijzing</th>
                    <th className="text-center px-3 py-3 font-medium min-w-[100px]">Afgewezen</th>
                    <th className="text-right px-3 py-3 font-medium min-w-[100px]">Waarde</th>
                    <th className="text-center px-3 py-3 font-medium min-w-[80px]">Contacten</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <>
                      <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-white"
                          >
                            {expandedLead === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={lead.bedrijfsnaam}
                            onChange={(e) => updateLead(lead.id, { bedrijfsnaam: e.target.value })}
                            placeholder="Bedrijfsnaam..."
                            className="bg-transparent text-white w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm font-medium"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={lead.contactpersoon}
                            onChange={(e) => updateLead(lead.id, { contactpersoon: e.target.value })}
                            placeholder="Naam..."
                            className="bg-transparent text-zinc-400 w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={lead.productInteresse}
                            onChange={(e) => updateLead(lead.id, { productInteresse: e.target.value })}
                            placeholder="Product..."
                            className="bg-transparent text-zinc-400 w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={lead.redenAfwijzing}
                            onChange={(e) => updateLead(lead.id, { redenAfwijzing: e.target.value })}
                            placeholder="Reden..."
                            className="bg-transparent text-red-400/80 w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="date"
                            value={lead.datumAfgewezen}
                            onChange={(e) => updateLead(lead.id, { datumAfgewezen: e.target.value })}
                            className="bg-transparent text-zinc-400 focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            value={lead.offerteWaarde || ''}
                            onChange={(e) => updateLead(lead.id, { offerteWaarde: parseFloat(e.target.value) || 0 })}
                            placeholder="€ 0"
                            className="bg-transparent text-zinc-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-zinc-400">
                          {lead.aantalContacten || 0}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => restoreLeadToKlant(lead.id)}
                              className="p-1.5 hover:bg-green-500/20 rounded text-zinc-600 hover:text-green-400"
                              title="Terugzetten naar klanten"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                              title="Permanent verwijderen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded details */}
                      {expandedLead === lead.id && (
                        <tr className="bg-zinc-800/20 border-b border-zinc-800/50">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                                  <Mail className="w-3 h-3" /> Email
                                </label>
                                <input
                                  type="email"
                                  value={lead.email || ''}
                                  onChange={(e) => updateLead(lead.id, { email: e.target.value })}
                                  placeholder="email@..."
                                  className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                                  <Phone className="w-3 h-3" /> Telefoon
                                </label>
                                <input
                                  type="tel"
                                  value={lead.telefoon || ''}
                                  onChange={(e) => updateLead(lead.id, { telefoon: e.target.value })}
                                  placeholder="06..."
                                  className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Bron</label>
                                <input
                                  type="text"
                                  value={lead.bron || ''}
                                  onChange={(e) => updateLead(lead.id, { bron: e.target.value })}
                                  placeholder="Waar kwam deze lead vandaan..."
                                  className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Eerste contact</label>
                                <input
                                  type="date"
                                  value={lead.datumEersteContact || ''}
                                  onChange={(e) => updateLead(lead.id, { datumEersteContact: e.target.value })}
                                  className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div className="lg:col-span-4">
                                <label className="text-xs text-zinc-500 mb-1 block">Notities</label>
                                <textarea
                                  value={lead.notities || ''}
                                  onChange={(e) => updateLead(lead.id, { notities: e.target.value })}
                                  placeholder="Extra informatie over deze lead..."
                                  rows={2}
                                  className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-zinc-800">
              <button onClick={handleAddLead} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm">
                <Plus className="w-4 h-4" /> Lead toevoegen
              </button>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <h3 className="text-orange-400 font-medium text-sm mb-2">Over oude leads</h3>
        <ul className="text-zinc-400 text-sm space-y-1">
          <li>• Leads hier zijn klanten die &quot;nee&quot; hebben gezegd of verloren zijn gegaan</li>
          <li>• Klik op <RotateCcw className="w-3 h-3 inline text-green-400" /> om een lead terug te zetten naar actieve klanten</li>
          <li>• Gebruik dit om later opnieuw contact op te nemen met potentiële klanten</li>
        </ul>
      </div>
    </div>
  );
}
