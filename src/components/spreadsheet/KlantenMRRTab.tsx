'use client';

import { useState, Fragment } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Mail, Phone, User, Calendar, RotateCcw, Users, Archive } from 'lucide-react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro } from '@/lib/spreadsheet-utils';
import { MAAND_LABELS, PIPELINE_FASES, type Klant, type PipelineFase } from '@/types/spreadsheet';

// Pipeline fases voor dropdown (alle fases behalve Afgevallen)
const SELECTABLE_FASES: PipelineFase[] = ['Lead', 'Contact gelegd', 'Offerte gestuurd', 'In onderhandeling', 'Klant'];

const FASE_STYLES: Record<PipelineFase, string> = {
  'Lead': 'bg-zinc-700 text-zinc-200',
  'Contact gelegd': 'bg-blue-600 text-white',
  'Offerte gestuurd': 'bg-yellow-600 text-white',
  'In onderhandeling': 'bg-purple-600 text-white',
  'Klant': 'bg-green-600 text-white',
  'Afgevallen': 'bg-red-600 text-white',
};

type InnerTab = 'klanten' | 'leads';

export function KlantenMRRTab() {
  const { klanten, leads, addKlant, updateKlant, deleteKlant, deleteLead, getKlantenKPIs, moveKlantToLeads, restoreLeadToKlant, instellingen, getSalesPersoon } = useSpreadsheet();
  const salesPersonen = instellingen.salesPersonen || [];
  const [innerTab, setInnerTab] = useState<InnerTab>('klanten');
  const [expandedKlant, setExpandedKlant] = useState<string | null>(null);
  const [showAfwijsModal, setShowAfwijsModal] = useState<string | null>(null);
  const [afwijsReden, setAfwijsReden] = useState('');
  const [showFaseDropdown, setShowFaseDropdown] = useState<string | null>(null);
  const kpis = getKlantenKPIs();

  const totaalMRR = klanten.filter(k => k.status === 'Actief').reduce((s, k) => s + k.mrrPerMaand, 0);
  const totaalEenmalig = klanten.reduce((s, k) => s + k.eenmalig, 0);
  const totaalJaar = klanten.filter(k => k.status === 'Actief').reduce((s, k) => s + (k.mrrPerMaand * 12), 0);

  const handleAddKlant = () => {
    addKlant({
      klantnaam: '',
      productDienst: '',
      mrrPerMaand: 0,
      eenmalig: 0,
      salesPersoonId: '',
      status: 'Actief',
      maandInkomsten: Array(12).fill(0),
      contactpersoon: '',
      email: '',
      telefoon: '',
      notities: '',
      pipelineFase: 'Lead',
      aantalContacten: 0,
      laatsteContact: '',
      offerteWaarde: 0,
      verwachteSluitdatum: '',
      datumKlantGeworden: '',
      datumOnderhoudStart: '',
      onderhoudActief: true,
      eenmaligTermijnen: 1,
      eenmaligStartdatum: '',
    });
  };

  const handleMRRChange = (klant: Klant, value: number) => {
    updateKlant(klant.id, {
      mrrPerMaand: value,
      maandInkomsten: Array(12).fill(value),
    });
  };

  const handleAfwijzen = (id: string) => {
    moveKlantToLeads(id, afwijsReden.trim() || 'Geen reden opgegeven');
    setShowAfwijsModal(null);
    setAfwijsReden('');
  };

  return (
    <div className="space-y-4">
      {/* Header with KPIs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-semibold text-white">Klanten & MRR</h1>
        <div className="flex items-center gap-6 text-sm">
          <div><span className="text-zinc-500">Klanten:</span> <span className="text-blue-400 font-semibold">{kpis.actieveKlanten}</span></div>
          <div><span className="text-zinc-500">MRR:</span> <span className="text-teal-400 font-semibold">{formatEuro(kpis.totaleMRR)}</span></div>
          <div><span className="text-zinc-500">ARR:</span> <span className="text-green-400 font-semibold">{formatEuro(kpis.arr)}</span></div>
        </div>
      </div>

      {/* Inner Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setInnerTab('klanten')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            innerTab === 'klanten'
              ? 'bg-teal-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Klanten ({klanten.length})
        </button>
        <button
          onClick={() => setInnerTab('leads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            innerTab === 'leads'
              ? 'bg-orange-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Archive className="w-4 h-4" />
          Oude Leads ({leads.length})
        </button>
      </div>

      {/* Klanten Tab */}
      {innerTab === 'klanten' && (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800 text-zinc-400">
              <th className="w-10 px-2 py-3"></th>
              <th className="text-left px-4 py-3 font-medium">Klant</th>
              <th className="text-left px-4 py-3 font-medium">Dienst</th>
              <th className="text-left px-4 py-3 font-medium">Fase</th>
              <th className="text-right px-4 py-3 font-medium">MRR</th>
              <th className="text-right px-4 py-3 font-medium">Jaar</th>
              <th className="text-right px-4 py-3 font-medium">Eenmalig</th>
              <th className="text-center px-4 py-3 font-medium">Comm.</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {klanten.map((klant, index) => {
              // Dropdown boven tonen voor laatste 3 rijen
              const showDropdownAbove = index >= klanten.length - 3;
              return (
              <Fragment key={klant.id}>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-2 py-3">
                    <button
                      onClick={() => setExpandedKlant(expandedKlant === klant.id ? null : klant.id)}
                      className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-white"
                    >
                      {expandedKlant === klant.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={klant.klantnaam}
                      onChange={(e) => updateKlant(klant.id, { klantnaam: e.target.value })}
                      placeholder="Naam..."
                      className="bg-transparent text-white w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded font-medium"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={klant.productDienst}
                      onChange={(e) => updateKlant(klant.id, { productDienst: e.target.value })}
                      placeholder="—"
                      className="bg-transparent text-zinc-300 w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setShowFaseDropdown(showFaseDropdown === klant.id ? null : klant.id)}
                      className={`text-xs px-3 py-1.5 rounded font-medium w-full text-left ${FASE_STYLES[klant.pipelineFase] || FASE_STYLES['Lead']}`}
                    >
                      {klant.pipelineFase || 'Lead'}
                    </button>
                    {showFaseDropdown === klant.id && (
                      <div className={`absolute left-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 min-w-[160px] ${
                        showDropdownAbove ? 'bottom-full mb-1' : 'top-full mt-1'
                      }`}>
                        {SELECTABLE_FASES.map(fase => (
                          <button
                            key={fase}
                            onClick={() => {
                              updateKlant(klant.id, { pipelineFase: fase });
                              setShowFaseDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg ${
                              klant.pipelineFase === fase ? 'bg-zinc-700' : ''
                            } text-white`}
                          >
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              fase === 'Lead' ? 'bg-zinc-400' :
                              fase === 'Contact gelegd' ? 'bg-blue-500' :
                              fase === 'Offerte gestuurd' ? 'bg-yellow-500' :
                              fase === 'In onderhandeling' ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}></span>
                            {fase}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          klant.onderhoudActief !== false ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={klant.onderhoudActief !== false ? 'Onderhoud actief' : 'Onderhoud inactief'}
                      />
                      <input
                        type="number"
                        value={klant.mrrPerMaand || ''}
                        onChange={(e) => handleMRRChange(klant, parseFloat(e.target.value) || 0)}
                        placeholder="€ 0"
                        className="bg-transparent text-teal-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded font-medium"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {formatEuro(klant.status === 'Actief' ? klant.mrrPerMaand * 12 : 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={klant.eenmalig || ''}
                      onChange={(e) => updateKlant(klant.id, { eenmalig: parseFloat(e.target.value) || 0 })}
                      placeholder="€ 0"
                      className="bg-transparent text-orange-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {salesPersonen.length === 0 ? (
                      <span className="text-zinc-600 text-xs">—</span>
                    ) : (
                      <select
                        value={klant.salesPersoonId || ''}
                        onChange={(e) => updateKlant(klant.id, { salesPersoonId: e.target.value })}
                        className={`text-xs px-2 py-1 rounded bg-zinc-800 border-0 ${
                          klant.salesPersoonId ? 'text-orange-400' : 'text-zinc-500'
                        }`}
                      >
                        <option value="">—</option>
                        {salesPersonen.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.naam} ({sp.commissiePercentage}%)
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        const statuses: Klant['status'][] = ['Actief', 'Paused', 'Inactief'];
                        const currentIndex = statuses.indexOf(klant.status);
                        const nextIndex = (currentIndex + 1) % statuses.length;
                        updateKlant(klant.id, { status: statuses[nextIndex] });
                      }}
                      className={`text-xs px-3 py-1 rounded font-medium ${
                        klant.status === 'Actief' ? 'bg-green-600 text-white' :
                        klant.status === 'Inactief' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}
                    >
                      {klant.status}
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <button
                      onClick={() => setShowAfwijsModal(klant.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                      title="Verplaats naar oude leads"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {/* Expanded details row */}
                {expandedKlant === klant.id && (
                  <tr className="bg-zinc-800/30 border-b border-zinc-800/50">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <User className="w-3 h-3" /> Contactpersoon
                          </label>
                          <input
                            type="text"
                            value={klant.contactpersoon || ''}
                            onChange={(e) => updateKlant(klant.id, { contactpersoon: e.target.value })}
                            placeholder="Naam..."
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Mail className="w-3 h-3" /> Email
                          </label>
                          <input
                            type="email"
                            value={klant.email || ''}
                            onChange={(e) => updateKlant(klant.id, { email: e.target.value })}
                            placeholder="email@..."
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Phone className="w-3 h-3" /> Telefoon
                          </label>
                          <input
                            type="tel"
                            value={klant.telefoon || ''}
                            onChange={(e) => updateKlant(klant.id, { telefoon: e.target.value })}
                            placeholder="06..."
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" /> Laatste contact
                          </label>
                          <input
                            type="date"
                            value={klant.laatsteContact || ''}
                            onChange={(e) => updateKlant(klant.id, { laatsteContact: e.target.value })}
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Offerte waarde incl BTW</label>
                          <input
                            type="number"
                            value={klant.offerteWaarde || ''}
                            onChange={(e) => updateKlant(klant.id, { offerteWaarde: parseFloat(e.target.value) || 0 })}
                            placeholder="€ 0"
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          {klant.offerteWaarde > 0 && (
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Excl BTW: {formatEuro(klant.offerteWaarde / 1.21)} · BTW: {formatEuro(klant.offerteWaarde - (klant.offerteWaarde / 1.21))}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Aantal contacten</label>
                          <input
                            type="number"
                            value={klant.aantalContacten || ''}
                            onChange={(e) => updateKlant(klant.id, { aantalContacten: parseInt(e.target.value) || 0 })}
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Verwachte sluitdatum</label>
                          <input
                            type="date"
                            value={klant.verwachteSluitdatum || ''}
                            onChange={(e) => updateKlant(klant.id, { verwachteSluitdatum: e.target.value })}
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-green-400" /> Klant geworden
                          </label>
                          <input
                            type="date"
                            value={klant.datumKlantGeworden || ''}
                            onChange={(e) => updateKlant(klant.id, { datumKlantGeworden: e.target.value })}
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-teal-400" /> Start onderhoudspakket
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={klant.datumOnderhoudStart || ''}
                              onChange={(e) => updateKlant(klant.id, { datumOnderhoudStart: e.target.value })}
                              className="bg-zinc-800 text-white flex-1 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            <button
                              onClick={() => updateKlant(klant.id, { onderhoudActief: !klant.onderhoudActief })}
                              className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-1.5 ${
                                klant.onderhoudActief !== false
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${
                                klant.onderhoudActief !== false ? 'bg-green-300' : 'bg-red-300'
                              }`} />
                              {klant.onderhoudActief !== false ? 'Actief' : 'Inactief'}
                            </button>
                          </div>
                        </div>
                        {/* Betalingstermijnen eenmalig */}
                        {klant.eenmalig > 0 && (
                          <>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Aantal termijnen</label>
                              <select
                                value={klant.eenmaligTermijnen || 1}
                                onChange={(e) => updateKlant(klant.id, { eenmaligTermijnen: parseInt(e.target.value) || 1 })}
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                <option value={1}>1x (direct)</option>
                                <option value={2}>2 termijnen</option>
                                <option value={3}>3 termijnen</option>
                                <option value={4}>4 termijnen</option>
                                <option value={6}>6 termijnen</option>
                                <option value={12}>12 termijnen</option>
                              </select>
                              {(klant.eenmaligTermijnen || 1) > 1 && (
                                <p className="text-[10px] text-orange-400 mt-1">
                                  {formatEuro(klant.eenmalig / (klant.eenmaligTermijnen || 1))} per termijn
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3 text-orange-400" /> Start betaling
                              </label>
                              <input
                                type="date"
                                value={klant.eenmaligStartdatum || ''}
                                onChange={(e) => updateKlant(klant.id, { eenmaligStartdatum: e.target.value })}
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                          </>
                        )}
                        <div className={klant.eenmalig > 0 ? 'lg:col-span-2' : ''}>
                          <label className="text-xs text-zinc-500 mb-1 block">Notities</label>
                          <textarea
                            value={klant.notities || ''}
                            onChange={(e) => updateKlant(klant.id, { notities: e.target.value })}
                            placeholder="Notities..."
                            rows={2}
                            className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-teal-600/90 text-white font-medium">
              <td></td>
              <td colSpan={3} className="px-4 py-3">TOTAAL ({klanten.filter(k => k.status === 'Actief').length} actief)</td>
              <td className="px-4 py-3 text-right font-bold">{formatEuro(totaalMRR)}</td>
              <td className="px-4 py-3 text-right font-bold">{formatEuro(totaalJaar)}</td>
              <td className="px-4 py-3 text-right">{formatEuro(totaalEenmalig)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
        <div className="px-4 py-3 border-t border-zinc-800">
          <button onClick={handleAddKlant} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm">
            <Plus className="w-4 h-4" /> Klant toevoegen
          </button>
        </div>
      </div>
      )}

      {/* Oude Leads Tab */}
      {innerTab === 'leads' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-8 text-center">
              <Archive className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Geen oude leads</p>
              <p className="text-zinc-600 text-sm mt-1">Afgewezen klanten verschijnen hier</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Bedrijf</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Reden afwijzing</th>
                  <th className="text-left px-4 py-3 font-medium">Datum</th>
                  <th className="text-right px-4 py-3 font-medium">Offerte</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{lead.bedrijfsnaam || '—'}</p>
                      {lead.email && <p className="text-zinc-500 text-xs">{lead.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{lead.contactpersoon || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{lead.productInteresse || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded">
                        {lead.redenAfwijzing || 'Geen reden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {lead.datumAfgewezen ? new Date(lead.datumAfgewezen).toLocaleDateString('nl-NL') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-400">
                      {lead.offerteWaarde > 0 ? formatEuro(lead.offerteWaarde) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => restoreLeadToKlant(lead.id)}
                          className="p-1.5 hover:bg-green-500/20 rounded text-zinc-500 hover:text-green-400"
                          title="Terughalen als klant"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400"
                          title="Permanent verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showFaseDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFaseDropdown(null)} />
      )}

      {/* Verwijder/Afwijs Modal */}
      {showAfwijsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Klant verwijderen</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Wat wil je met deze klant doen?
            </p>

            {/* Optie 1: Naar oude leads */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-3 border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">Naar Oude Leads verplaatsen</h4>
              <p className="text-xs text-zinc-500 mb-3">
                Bewaar de klantgegevens zodat je later kunt opvolgen.
              </p>
              <label className="text-xs text-zinc-500 mb-1 block">Reden (optioneel)</label>
              <textarea
                value={afwijsReden}
                onChange={(e) => setAfwijsReden(e.target.value)}
                placeholder="Bijv: Te duur, geen interesse..."
                rows={2}
                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none mb-2"
              />
              <button
                onClick={() => handleAfwijzen(showAfwijsModal)}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium"
              >
                Verplaats naar Oude Leads
              </button>
            </div>

            {/* Optie 2: Volledig verwijderen */}
            <div className="bg-red-950/30 rounded-lg p-4 border border-red-900/50">
              <h4 className="text-sm font-medium text-red-400 mb-2">Volledig verwijderen</h4>
              <p className="text-xs text-zinc-500 mb-3">
                Verwijder de klant permanent. Dit kan niet ongedaan worden gemaakt.
              </p>
              <button
                onClick={() => {
                  deleteKlant(showAfwijsModal);
                  setShowAfwijsModal(null);
                  setAfwijsReden('');
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Permanent Verwijderen
              </button>
            </div>

            <button
              onClick={() => { setShowAfwijsModal(null); setAfwijsReden(''); }}
              className="w-full mt-4 px-4 py-2 text-zinc-400 hover:text-white text-sm"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
