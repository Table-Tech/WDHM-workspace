'use client';

import { useState, Fragment } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, Globe, Users, TrendingUp } from 'lucide-react';
import { useApps } from '@/hooks/useApps';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { formatEuro, sum } from '@/lib/spreadsheet-utils';
import { APP_PLATFORMS, MAAND_LABELS_KORT, type App, type AppStatus, type AppPlatform } from '@/types/financial';

const STATUS_OPTIONS: AppStatus[] = ['Actief', 'In ontwikkeling', 'Inactief'];

const STATUS_STYLES: Record<AppStatus, string> = {
  'Actief': 'bg-green-600 text-white',
  'In ontwikkeling': 'bg-blue-600 text-white',
  'Inactief': 'bg-zinc-600 text-zinc-200',
};

const PLATFORM_COLORS: Record<AppPlatform, string> = {
  'iOS': 'bg-zinc-700 text-zinc-100',
  'Android': 'bg-green-700/40 text-green-200',
  'Web': 'bg-blue-700/40 text-blue-200',
};

export function AppsTab() {
  const { apps, isLoading, addApp, updateApp, deleteApp } = useApps();
  const { getAppsKPIs } = useFinancialMetrics();

  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [showHistorie, setShowHistorie] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const kpis = getAppsKPIs;

  const handleAddApp = () => {
    addApp({
      naam: '',
      beschrijving: '',
      platform: [],
      status: 'Actief',
      mrr_per_maand: 0,
      aantal_gebruikers: 0,
      aantal_abonnees: 0,
      maand_inkomsten: Array(12).fill(0),
      maand_gebruikers: Array(12).fill(0),
      launch_datum: null,
      url: '',
      notities: '',
    });
  };

  const handleMRRChange = (app: App, value: number) => {
    updateApp({
      id: app.id,
      mrr_per_maand: value,
      maand_inkomsten: Array(12).fill(value),
    });
  };

  const togglePlatform = (app: App, platform: AppPlatform) => {
    const next = app.platform.includes(platform)
      ? app.platform.filter((p) => p !== platform)
      : [...app.platform, platform];
    updateApp({ id: app.id, platform: next });
  };

  const updateMaandInkomsten = (app: App, monthIndex: number, value: number) => {
    const next = [...app.maand_inkomsten];
    next[monthIndex] = value;
    updateApp({ id: app.id, maand_inkomsten: next });
  };

  const updateMaandGebruikers = (app: App, monthIndex: number, value: number) => {
    const next = [...app.maand_gebruikers];
    next[monthIndex] = value;
    updateApp({ id: app.id, maand_gebruikers: next });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-48" />
        <div className="bg-zinc-900 rounded-xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-white">Eigen Apps</h1>
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm overflow-x-auto">
          <div className="whitespace-nowrap">
            <span className="text-zinc-500">Apps:</span>{' '}
            <span className="text-blue-400 font-semibold">{kpis.actieveApps}</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-zinc-500">MRR:</span>{' '}
            <span className="text-teal-400 font-semibold">{formatEuro(kpis.totaleMRR)}</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-zinc-500">ARR:</span>{' '}
            <span className="text-green-400 font-semibold">{formatEuro(kpis.arr)}</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-zinc-500">Gebruikers:</span>{' '}
            <span className="text-purple-400 font-semibold">{kpis.totaalGebruikers.toLocaleString('nl-NL')}</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-zinc-500">Abonnees:</span>{' '}
            <span className="text-orange-400 font-semibold">{kpis.totaalAbonnees.toLocaleString('nl-NL')}</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {apps.length === 0 && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 text-center">
          <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-1">Nog geen apps toegevoegd</p>
          <p className="text-zinc-600 text-sm mb-4">
            Voeg je eigen apps toe om hun maandelijkse omzet en groei bij te houden.
          </p>
          <button
            onClick={handleAddApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Eerste app toevoegen
          </button>
        </div>
      )}

      {/* Apps Table */}
      {apps.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead>
                <tr className="bg-zinc-800 text-zinc-400">
                  <th className="w-10 px-2 py-3"></th>
                  <th className="text-left px-4 py-3 font-medium">App</th>
                  <th className="text-left px-4 py-3 font-medium">Platform</th>
                  <th className="text-right px-4 py-3 font-medium">MRR</th>
                  <th className="text-right px-4 py-3 font-medium">Jaar</th>
                  <th className="text-right px-4 py-3 font-medium">Gebruikers</th>
                  <th className="text-right px-4 py-3 font-medium">Abonnees</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <Fragment key={app.id}>
                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-2 py-3">
                        <button
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-white"
                        >
                          {expandedApp === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={app.naam}
                          onChange={(e) => updateApp({ id: app.id, naam: e.target.value })}
                          placeholder="App naam..."
                          className="bg-transparent text-white w-full focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded font-medium"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {APP_PLATFORMS.map((p) => {
                            const active = app.platform.includes(p);
                            return (
                              <button
                                key={p}
                                onClick={() => togglePlatform(app, p)}
                                className={`text-[10px] px-2 py-0.5 rounded font-medium transition ${
                                  active
                                    ? PLATFORM_COLORS[p]
                                    : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={app.mrr_per_maand || ''}
                          onChange={(e) => handleMRRChange(app, parseFloat(e.target.value) || 0)}
                          placeholder="€ 0"
                          className="bg-transparent text-teal-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded font-medium"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {formatEuro(app.status === 'Actief' ? app.mrr_per_maand * 12 : 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={app.aantal_gebruikers || ''}
                          onChange={(e) => updateApp({ id: app.id, aantal_gebruikers: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="bg-transparent text-purple-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={app.aantal_abonnees || ''}
                          onChange={(e) => updateApp({ id: app.id, aantal_abonnees: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="bg-transparent text-orange-400 w-20 text-right focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            const currentIndex = STATUS_OPTIONS.indexOf(app.status);
                            const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
                            updateApp({ id: app.id, status: STATUS_OPTIONS[nextIndex] });
                          }}
                          className={`text-xs px-3 py-1 rounded font-medium ${STATUS_STYLES[app.status]}`}
                        >
                          {app.status}
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => setConfirmDelete(app.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {expandedApp === app.id && (
                      <tr className="bg-zinc-800/30 border-b border-zinc-800/50">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Beschrijving</label>
                              <input
                                type="text"
                                value={app.beschrijving || ''}
                                onChange={(e) => updateApp({ id: app.id, beschrijving: e.target.value })}
                                placeholder="Korte beschrijving..."
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                                <Globe className="w-3 h-3" /> URL
                              </label>
                              <input
                                type="url"
                                value={app.url || ''}
                                onChange={(e) => updateApp({ id: app.id, url: e.target.value })}
                                placeholder="https://..."
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" /> Launch datum
                              </label>
                              <input
                                type="date"
                                value={app.launch_datum || ''}
                                onChange={(e) => updateApp({ id: app.id, launch_datum: e.target.value || null })}
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div className="lg:col-span-3">
                              <label className="text-xs text-zinc-500 mb-1 block">Notities</label>
                              <textarea
                                value={app.notities || ''}
                                onChange={(e) => updateApp({ id: app.id, notities: e.target.value })}
                                placeholder="Notities, marketing kanalen, mijlpalen..."
                                rows={2}
                                className="bg-zinc-800 text-white w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                              />
                            </div>
                          </div>

                          {/* Toggle historie */}
                          <button
                            onClick={() => setShowHistorie(showHistorie === app.id ? null : app.id)}
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white mb-3"
                          >
                            {showHistorie === app.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            <TrendingUp className="w-3 h-3" />
                            12-maanden historie (omzet & gebruikers)
                          </button>

                          {showHistorie === app.id && (
                            <div className="bg-zinc-900/60 rounded-lg p-3 overflow-x-auto">
                              <table className="w-full text-[11px] min-w-[700px]">
                                <thead>
                                  <tr className="text-zinc-500 border-b border-zinc-800">
                                    <th className="text-left py-2 px-2 font-medium w-24">Maand</th>
                                    {MAAND_LABELS_KORT.map((m, i) => (
                                      <th key={i} className="text-right py-2 px-1 font-medium">{m}</th>
                                    ))}
                                    <th className="text-right py-2 px-2 font-medium bg-zinc-800/50">Tot.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-zinc-800/50">
                                    <td className="py-1.5 px-2 text-teal-400 font-medium">Omzet</td>
                                    {app.maand_inkomsten.map((bedrag, i) => (
                                      <td key={i} className="py-1 px-0.5 text-right">
                                        <input
                                          type="number"
                                          value={bedrag || ''}
                                          onChange={(e) => updateMaandInkomsten(app, i, parseFloat(e.target.value) || 0)}
                                          placeholder="0"
                                          className="bg-transparent text-teal-400 w-12 text-right focus:outline-none focus:bg-zinc-800 rounded text-[10px] px-0.5"
                                        />
                                      </td>
                                    ))}
                                    <td className="py-1.5 px-2 text-right text-teal-300 font-bold bg-zinc-800/50">
                                      {formatEuro(sum(app.maand_inkomsten))}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="py-1.5 px-2 text-purple-400 font-medium flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      Users
                                    </td>
                                    {app.maand_gebruikers.map((aantal, i) => (
                                      <td key={i} className="py-1 px-0.5 text-right">
                                        <input
                                          type="number"
                                          value={aantal || ''}
                                          onChange={(e) => updateMaandGebruikers(app, i, parseInt(e.target.value) || 0)}
                                          placeholder="0"
                                          className="bg-transparent text-purple-400 w-12 text-right focus:outline-none focus:bg-zinc-800 rounded text-[10px] px-0.5"
                                        />
                                      </td>
                                    ))}
                                    <td className="py-1.5 px-2 text-right text-purple-300 font-bold bg-zinc-800/50">
                                      {Math.max(...app.maand_gebruikers).toLocaleString('nl-NL')}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p className="text-[10px] text-zinc-600 mt-2">
                                Tip: vul per maand de werkelijke omzet en gebruikers in voor groei-trends. MRR-veld in de hoofdtabel = standaard waarde voor alle maanden.
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-teal-600/90 text-white font-medium">
                  <td></td>
                  <td colSpan={2} className="px-4 py-3">
                    TOTAAL ({kpis.actieveApps} actief)
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatEuro(kpis.totaleMRR)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatEuro(kpis.arr)}</td>
                  <td className="px-4 py-3 text-right">{kpis.totaalGebruikers.toLocaleString('nl-NL')}</td>
                  <td className="px-4 py-3 text-right">{kpis.totaalAbonnees.toLocaleString('nl-NL')}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-800">
            <button onClick={handleAddApp} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm">
              <Plus className="w-4 h-4" /> App toevoegen
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">App verwijderen?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Dit verwijdert de app permanent inclusief alle historische omzet- en gebruikersdata.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  deleteApp(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
