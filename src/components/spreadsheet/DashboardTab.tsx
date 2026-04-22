'use client';

import { useState } from 'react';
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
import { formatEuro, formatPercentage } from '@/lib/spreadsheet-utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Users, Wallet, Receipt, PiggyBank, Target, Building2, Info, Calendar, ChevronDown, Percent } from 'lucide-react';

const CHART_COLORS = ['#14b8a6', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const MAANDEN = [
  { value: -1, label: 'Heel jaar', kort: 'Jaar' },
  { value: 0, label: 'Januari', kort: 'Jan' },
  { value: 1, label: 'Februari', kort: 'Feb' },
  { value: 2, label: 'Maart', kort: 'Mrt' },
  { value: 3, label: 'April', kort: 'Apr' },
  { value: 4, label: 'Mei', kort: 'Mei' },
  { value: 5, label: 'Juni', kort: 'Jun' },
  { value: 6, label: 'Juli', kort: 'Jul' },
  { value: 7, label: 'Augustus', kort: 'Aug' },
  { value: 8, label: 'September', kort: 'Sep' },
  { value: 9, label: 'Oktober', kort: 'Okt' },
  { value: 10, label: 'November', kort: 'Nov' },
  { value: 11, label: 'December', kort: 'Dec' },
];

export function DashboardTab() {
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 = heel jaar
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const {
    instellingen,
    getDashboardMetrics,
    getFounderVerdelingen,
    getMonthlyChartData,
    getUitgavenBreakdown,
    getYearSummary,
    getPipelineStats,
    getCurrentMonthIndex,
    getBTWSummary,
    leads,
  } = useSpreadsheet();

  const currentMonthIndex = getCurrentMonthIndex();

  const metrics = getDashboardMetrics();
  const founderVerdelingen = getFounderVerdelingen();
  const monthlyData = getMonthlyChartData();
  const uitgavenBreakdown = getUitgavenBreakdown();
  const yearSummary = getYearSummary();
  const pipelineStats = getPipelineStats();
  const btwSummary = getBTWSummary();

  // Calculate month-specific or year data based on selection
  const isYearView = selectedMonth === -1;
  const selectedMonthData = selectedMonth >= 0 ? monthlyData[selectedMonth] : null;
  const selectedMaandLabel = MAANDEN.find(m => m.value === selectedMonth)?.label || 'Heel jaar';
  const isFutureMonth = selectedMonth >= 0 && selectedMonth > currentMonthIndex;

  // Get display values based on selection
  const displayInkomsten = isYearView
    ? yearSummary.totaalInkomsten
    : (selectedMonthData?.inkomsten || 0);
  const displayUitgaven = isYearView
    ? yearSummary.totaalUitgaven
    : (selectedMonthData?.uitgaven || 0);
  const displayCommissie = isYearView
    ? yearSummary.totaalCommissie
    : (selectedMonthData?.commissie || 0);
  const displayKosten = isYearView
    ? yearSummary.totaalUitgaven + yearSummary.totaalCommissie
    : (selectedMonthData?.kosten || 0);
  const displayWinst = isYearView
    ? yearSummary.totaalWinst
    : (selectedMonthData?.winst || 0);
  const displayMarge = displayInkomsten > 0
    ? (displayWinst / displayInkomsten) * 100
    : 0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-zinc-400 text-xs mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {formatEuro(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Year and Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            {instellingen.bedrijfsnaam} Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Financieel overzicht {isYearView ? instellingen.boekjaar : `${selectedMaandLabel} ${instellingen.boekjaar}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-white">{selectedMaandLabel}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
            {showMonthDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMonthDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 min-w-[160px] max-h-80 overflow-y-auto">
                  {MAANDEN.map((maand) => {
                    const isFuture = maand.value >= 0 && maand.value > currentMonthIndex;
                    return (
                      <button
                        key={maand.value}
                        onClick={() => {
                          setSelectedMonth(maand.value);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                          selectedMonth === maand.value
                            ? 'bg-teal-600 text-white'
                            : isFuture
                              ? 'text-zinc-500 hover:bg-zinc-700/50'
                              : 'text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        <span>{maand.label}</span>
                        {isFuture && <span className="text-[10px] text-zinc-600">(toekomst)</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {/* Year indicator */}
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-4 py-2">
            <p className="text-xs text-teal-400">Boekjaar</p>
            <p className="text-lg font-bold text-white">{instellingen.boekjaar}</p>
          </div>
        </div>
      </div>

      {/* Info box */}
      {isYearView && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300/80">
            <span className="font-medium text-blue-300">Kosten zijn voor het hele jaar berekend (bekend vooraf).</span>{' '}
            Inkomsten worden pas getoond na afloop van de maand. Je ziet daarom mogelijk negatieve winst aan het begin van het jaar.
          </p>
        </div>
      )}

      {!isYearView && !isFutureMonth && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <Calendar className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-purple-300/80">
            <span className="font-medium text-purple-300">Je bekijkt {selectedMaandLabel} {instellingen.boekjaar}.</span>{' '}
            Selecteer &quot;Heel jaar&quot; om het volledige jaaroverzicht te zien.
          </p>
        </div>
      )}

      {isFutureMonth && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <Calendar className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-300/80">
            <span className="font-medium text-orange-300">{selectedMaandLabel} {instellingen.boekjaar} is nog niet begonnen.</span>{' '}
            Kosten zijn al wel bekend, maar inkomsten worden pas getoond na afloop van de maand.
          </p>
        </div>
      )}

      {/* Key Metrics - Clean Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={Wallet}
          label={isYearView ? "Jaar Omzet" : "Maand Omzet"}
          value={formatEuro(displayInkomsten)}
          subValue={isYearView ? `MRR: ${formatEuro(metrics.totaleMRR)}` : `MRR: ${formatEuro(selectedMonthData?.mrr || 0)}`}
          color="teal"
        />
        <MetricCard
          icon={Receipt}
          label={isYearView ? "Jaar Kosten" : "Maand Kosten"}
          value={formatEuro(displayKosten)}
          subValue={`Uitg: ${formatEuro(displayUitgaven)} + Comm: ${formatEuro(displayCommissie)}`}
          color="red"
        />
        <MetricCard
          icon={PiggyBank}
          label={isYearView ? "Jaarwinst" : "Maandwinst"}
          value={formatEuro(displayWinst)}
          subValue={`Marge: ${formatPercentage(displayMarge)}`}
          color="green"
          highlight
        />
        <MetricCard
          icon={Users}
          label="Actieve Klanten"
          value={String(yearSummary.aantalKlanten)}
          subValue={`${leads.length} oude leads`}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue vs Expenses - 2/3 width */}
        <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Inkomsten vs Kosten per Maand</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData.map(d => ({
                  ...d,
                  inkomsten: d.isFuture ? null : d.inkomsten,
                  kosten: d.isFuture ? null : d.kosten,
                }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorInkomsten" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKosten" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="maandKort" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inkomsten"
                  name="Inkomsten"
                  stroke="#14b8a6"
                  fillOpacity={1}
                  fill="url(#colorInkomsten)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="kosten"
                  name="Kosten"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorKosten)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart - 1/3 width */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-1">Kosten Verdeling</h3>
          <p className="text-[10px] text-zinc-500 mb-3">Jaarbedragen</p>
          <div className="h-64">
            {uitgavenBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={uitgavenBreakdown}
                    dataKey="totaal"
                    nameKey="categorie"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {uitgavenBreakdown.map((entry, index) => (
                      <Cell key={entry.categorie} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatEuro(Number(value) || 0)}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                Geen uitgaven
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
            {uitgavenBreakdown.slice(0, 5).map((item, index) => (
              <div key={item.categorie} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-zinc-400 truncate max-w-[120px]">{item.categorie}</span>
                </div>
                <span className="text-zinc-300">{formatEuro(item.totaal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Profit Chart - alleen verleden/huidige maanden */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Winst per Maand</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData.map(d => ({ ...d, winst: d.isFuture ? null : d.winst }))}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="maandKort" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `€${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="winst" name="Winst" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Founders + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Co-founder Distribution */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="bg-purple-600/80 px-4 py-3 border-b border-purple-700/50">
            <h2 className="text-sm font-semibold text-white">Winstverdeling Co-founders</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="text-left py-2 font-medium">Naam</th>
                  <th className="text-right py-2 font-medium">%</th>
                  <th className="text-right py-2 font-medium">Jaar</th>
                  <th className="text-right py-2 font-medium">Maand</th>
                </tr>
              </thead>
              <tbody>
                {founderVerdelingen.map((f) => (
                  <tr key={f.naam} className="border-b border-zinc-800/50">
                    <td className="py-2 text-white font-medium">{f.naam || '—'}</td>
                    <td className="py-2 text-right text-zinc-400">{f.aandeel}%</td>
                    <td className="py-2 text-right text-green-400 font-medium">{formatEuro(f.jaarwinst)}</td>
                    <td className="py-2 text-right text-zinc-400">{formatEuro(f.perMaandGem)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-purple-500/10">
                  <td className="py-2 text-purple-300 font-semibold">Totaal</td>
                  <td className="py-2 text-right text-purple-300 font-semibold">100%</td>
                  <td className="py-2 text-right text-green-400 font-bold">{formatEuro(metrics.jaarwinst)}</td>
                  <td className="py-2 text-right text-purple-300">{formatEuro(metrics.jaarwinst / 12)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="bg-blue-600/80 px-4 py-3 border-b border-blue-700/50">
            <h2 className="text-sm font-semibold text-white">Pipeline Status</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{pipelineStats.aantalActief}</p>
                <p className="text-xs text-zinc-500">Actief in pipeline</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{formatEuro(pipelineStats.totaalWaarde)}</p>
                <p className="text-xs text-zinc-500">Potentiële waarde</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{pipelineStats.perFase['Klant']}</p>
                <p className="text-xs text-zinc-500">Klanten</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(pipelineStats.perFase).map(([fase, aantal]) => {
                const percentage = yearSummary.aantalKlanten > 0 ? (aantal / yearSummary.aantalKlanten) * 100 : 0;
                const colors: Record<string, string> = {
                  'Lead': 'bg-zinc-500',
                  'Contact gelegd': 'bg-blue-500',
                  'Offerte gestuurd': 'bg-yellow-500',
                  'In onderhandeling': 'bg-orange-500',
                  'Klant': 'bg-green-500',
                  'Afgevallen': 'bg-red-500',
                };
                return (
                  <div key={fase} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-28 truncate">{fase}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[fase] || 'bg-zinc-500'}`}
                        style={{ width: `${Math.max(percentage, aantal > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-300 w-6 text-right">{aantal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary - Clean Stats */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-teal-400" />
          {isYearView ? `Jaar ${instellingen.boekjaar} Samenvatting` : `${selectedMaandLabel} ${instellingen.boekjaar} Details`}
        </h3>
        {isYearView ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <SummaryItem label="MRR Totaal" value={formatEuro(yearSummary.totaalMRR)} />
            <SummaryItem label="Eenmalig Totaal" value={formatEuro(yearSummary.totaalEenmalig)} />
            <SummaryItem label="ARR" value={formatEuro(metrics.arr)} />
            <SummaryItem label="Commissies" value={formatEuro(yearSummary.totaalCommissie)} />
            <SummaryItem label="Gem. per Klant" value={formatEuro(metrics.actieveKlanten > 0 ? yearSummary.totaalInkomsten / metrics.actieveKlanten : 0)} />
            <SummaryItem label="Winstmarge" value={formatPercentage(yearSummary.winstmarge)} highlight />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <SummaryItem label="MRR" value={formatEuro(selectedMonthData?.mrr || 0)} />
            <SummaryItem label="Eenmalig" value={formatEuro(selectedMonthData?.eenmalig || 0)} />
            <SummaryItem label="Inkomsten" value={formatEuro(displayInkomsten)} />
            <SummaryItem label="Uitgaven" value={formatEuro(displayUitgaven)} />
            <SummaryItem label="Commissie" value={formatEuro(displayCommissie)} />
            <SummaryItem label="Winst" value={formatEuro(displayWinst)} highlight />
          </div>
        )}
      </div>

      {/* BTW Overzicht */}
      {isYearView && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-orange-400" />
            BTW Overzicht ({btwSummary.btwPercentage}%)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Totaal */}
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="text-xs text-zinc-500 mb-3">Totaal Omzet</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Excl BTW</span>
                  <span className="text-sm font-medium text-white">{formatEuro(btwSummary.omzetExclBTW)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-400">+ BTW ({btwSummary.btwPercentage}%)</span>
                  <span className="text-sm font-medium text-orange-400">{formatEuro(btwSummary.btwBedrag)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between items-center">
                  <span className="text-xs text-zinc-300 font-medium">Incl BTW</span>
                  <span className="text-sm font-bold text-teal-400">{formatEuro(btwSummary.omzetInclBTW)}</span>
                </div>
              </div>
            </div>

            {/* MRR */}
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="text-xs text-zinc-500 mb-3">MRR (Recurring)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Excl BTW</span>
                  <span className="text-sm font-medium text-white">{formatEuro(btwSummary.mrrExclBTW)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-400">+ BTW</span>
                  <span className="text-sm font-medium text-orange-400">{formatEuro(btwSummary.mrrBTW)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between items-center">
                  <span className="text-xs text-zinc-300 font-medium">Incl BTW</span>
                  <span className="text-sm font-bold text-teal-400">{formatEuro(btwSummary.mrrInclBTW)}</span>
                </div>
              </div>
            </div>

            {/* Eenmalig */}
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="text-xs text-zinc-500 mb-3">Eenmalige Projecten</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Excl BTW</span>
                  <span className="text-sm font-medium text-white">{formatEuro(btwSummary.eenmaligExclBTW)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-400">+ BTW</span>
                  <span className="text-sm font-medium text-orange-400">{formatEuro(btwSummary.eenmaligBTW)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between items-center">
                  <span className="text-xs text-zinc-300 font-medium">Incl BTW</span>
                  <span className="text-sm font-bold text-teal-400">{formatEuro(btwSummary.eenmaligInclBTW)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini BTW Bar Chart */}
          <div className="mt-4 bg-zinc-800/30 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex h-6 rounded overflow-hidden">
                  <div
                    className="bg-teal-500 flex items-center justify-center text-[10px] font-medium text-white"
                    style={{ width: `${(btwSummary.omzetExclBTW / (btwSummary.omzetInclBTW || 1)) * 100}%` }}
                  >
                    Excl BTW
                  </div>
                  <div
                    className="bg-orange-500 flex items-center justify-center text-[10px] font-medium text-white"
                    style={{ width: `${(btwSummary.btwBedrag / (btwSummary.omzetInclBTW || 1)) * 100}%` }}
                  >
                    BTW
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500">Te betalen BTW</p>
                <p className="text-sm font-bold text-orange-400">{formatEuro(btwSummary.btwBedrag)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Future Years Placeholder */}
      <div className="bg-zinc-900/30 rounded-xl border border-dashed border-zinc-700 p-6 text-center">
        <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm">Jaar-over-jaar vergelijking</p>
        <p className="text-zinc-600 text-xs mt-1">Beschikbaar wanneer er data is voor meerdere jaren</p>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  highlight,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, { icon: string; value: string }> = {
    teal: { icon: 'text-teal-400', value: 'text-teal-400' },
    green: { icon: 'text-green-400', value: 'text-green-400' },
    blue: { icon: 'text-blue-400', value: 'text-blue-400' },
    red: { icon: 'text-red-400', value: 'text-red-400' },
    purple: { icon: 'text-purple-400', value: 'text-purple-400' },
    orange: { icon: 'text-orange-400', value: 'text-orange-400' },
  };

  const colors = colorClasses[color] || colorClasses.teal;

  return (
    <div className={`bg-zinc-900/50 rounded-xl border ${highlight ? 'border-green-500/30' : 'border-zinc-800'} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
      <p className={`text-lg font-bold ${colors.value}`}>{value}</p>
      {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
