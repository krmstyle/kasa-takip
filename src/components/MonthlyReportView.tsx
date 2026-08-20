import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  ShoppingBag,
  CreditCard,
  Building,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  DailyRecord,
} from '../types';
import {
  formatCurrency,
  formatPercent,
  formatDateTr,
  getMonthNameFromKey,
} from '../utils/formatters';
import { exportMonthToExcel } from '../utils/excelExport';

export const MonthlyReportView: React.FC = () => {
  const {
    records,
    branch,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getMonthSummary,
    setSelectedDate,
    setActiveTab,
  } = useFinancial();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pnl' | 'dailyLedger'>('overview');

  const summary = getMonthSummary(selectedMonth);

  // Prepare Daily Chart Data
  const dailyChartData = (Object.values(records) as DailyRecord[])
    .filter((r) => r.date.startsWith(selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const dayNum = parseInt(r.date.split('-')[2], 10);
      return {
        date: r.date,
        dayLabel: `${dayNum}`,
        fullDate: formatDateTr(r.date, 'dayOnly'),
        ciro: r.incomes.totalRevenue,
        gider: r.totalExpense,
        netKar: r.netProfit,
        kart: r.incomes.card,
        nakit: r.incomes.cash,
        online: r.incomes.onlineTotal,
        is15: r.isCampaignDay,
      };
    });

  // Prepare Expense Categories Donut Data
  const expensePieData = (Object.entries(summary.expensesByCategory) as [ExpenseCategory, number][])
    .filter(([_, amount]) => amount > 0)
    .map(([catKey, amount]) => {
      const meta = EXPENSE_CATEGORIES[catKey] || EXPENSE_CATEGORIES.diger;
      return {
        name: meta.shortName,
        fullName: meta.name,
        value: amount,
        color: meta.color,
        categoryKey: catKey,
        percentage: summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Revenue Channel Pie Data
  const revenuePieData = [
    {
      name: 'Kredi/Banka Kartı',
      value: summary.totalCardRevenue,
      color: '#3B82F6',
      percent: summary.totalRevenue > 0 ? (summary.totalCardRevenue / summary.totalRevenue) * 100 : 0,
    },
    {
      name: 'Nakit Kasa',
      value: summary.totalCashRevenue,
      color: '#10B981',
      percent: summary.totalRevenue > 0 ? (summary.totalCashRevenue / summary.totalRevenue) * 100 : 0,
    },
    {
      name: 'Online Siparişler',
      value: summary.totalOnlineRevenue,
      color: '#F97316',
      percent: summary.totalRevenue > 0 ? (summary.totalOnlineRevenue / summary.totalRevenue) * 100 : 0,
    },
  ].filter((item) => item.value > 0);

  // Target Revenue calculation
  const targetMonthly = branch.monthlyRevenueTarget || 600000;
  const targetRealizedPercent = targetMonthly > 0 ? (summary.totalRevenue / targetMonthly) * 100 : 0;

  const handleExportMonth = () => {
    exportMonthToExcel(selectedMonth, records, summary, branch);
  };

  const handleGoToDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('daily');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Month Selector Bar & Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-400 font-semibold">RAPORLAMA DÖNEMİ</div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-stone-950 border border-stone-700 text-stone-100 text-base font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {availableMonths.map((mKey) => (
                    <option key={mKey} value={mKey}>
                      {getMonthNameFromKey(mKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs bg-stone-950 px-3 py-2 rounded-xl border border-stone-800 text-stone-400">
            <span>Kayıtlı:</span>
            <strong className="text-stone-200">
              {summary.daysLogged} / {summary.totalDaysInMonth} Gün
            </strong>
          </div>
        </div>

        {/* Action Controls & Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-stone-800 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Grafik & Özet
            </button>
            <button
              onClick={() => setActiveSubTab('pnl')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'pnl'
                  ? 'bg-stone-800 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Gelir Tablosu (P&L)
            </button>
            <button
              onClick={() => setActiveSubTab('dailyLedger')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'dailyLedger'
                  ? 'bg-stone-800 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Günlük Döküm
            </button>
          </div>

          <button
            onClick={handleExportMonth}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/60 transition-colors cursor-pointer border border-emerald-500/40"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bu Ayı Excel'e İndir</span>
          </button>
        </div>
      </div>

      {/* Top Level Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Toplam Ciro */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative shadow-md overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>AYLIK TOPLAM CİRO</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(summary.totalRevenue, { showCents: false })}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Günlük Ort: {formatCurrency(summary.averageDailyRevenue, { showCents: false })}</span>
            <span className="text-emerald-400 font-semibold">{summary.totalOrderCount} Fiş</span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Direkt Maliyetler (COGS) & Brüt Kar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative shadow-md overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>BRÜT KÂR (CİRO - COGS)</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(summary.grossProfit, { showCents: false })}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Brüt Marj: <strong className="text-blue-400">%{summary.grossMarginPercent.toFixed(1)}</strong></span>
            <span className="text-stone-500">COGS: {formatCurrency(summary.totalCogs, { showCents: false, compact: true })}</span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Toplam Faaliyet Masrafları (OPEX) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative shadow-md overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>TOPLAM TÜM GİDERLER</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(summary.totalExpense, { showCents: false })}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Günlük Ort: {formatCurrency(summary.averageDailyExpense, { showCents: false })}</span>
            <span className="text-rose-400 font-semibold">
              %{((summary.totalExpense / (summary.totalRevenue || 1)) * 100).toFixed(1)} Ciro Payı
            </span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
        </div>

        {/* Net Kâr / Zarar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative shadow-md overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>AYLIK NET KÂR / ZARAR</span>
            <div
              className={`p-1.5 rounded-lg ${
                summary.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary.netProfit, { showCents: false })}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Net Kâr Marjı:</span>
            <span
              className={`font-black ${
                summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              %{summary.netProfitMarginPercent.toFixed(1)}
            </span>
          </div>
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              summary.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>

      {/* Target Progress & 15th Campaign Highlight Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Target Meter */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                <Target className="w-4 h-4 text-red-500" />
                <span>Aylık Ciro Hedefi</span>
              </span>
              <span className="font-bold text-stone-100">
                {formatCurrency(targetMonthly, { showCents: false })}
              </span>
            </div>
            <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden my-2 border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  targetRealizedPercent >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-red-600 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, targetRealizedPercent)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
            <span>Gerçekleşme: <strong className="text-stone-100">%{targetRealizedPercent.toFixed(1)}</strong></span>
            <span>Kalan: <strong className="text-stone-300">{formatCurrency(Math.max(0, targetMonthly - summary.totalRevenue), { showCents: false })}</strong></span>
          </div>
        </div>

        {/* 15th Campaign Performance Card */}
        <div className="bg-gradient-to-br from-red-950/40 via-stone-900 to-stone-900 border border-red-900/40 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
              <span>15'i Kampanya Günü Katkısı</span>
            </span>
            <span className="text-[10px] bg-red-900/60 text-red-300 px-2 py-0.5 rounded font-bold border border-red-700/50">
              ÖZEL GÜN
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xl font-extrabold text-stone-100">
                {formatCurrency(summary.campaignDay15Revenue, { showCents: false })}
              </div>
              <div className="text-[11px] text-stone-400">
                Aylık Cironun <strong className="text-red-400">%{((summary.campaignDay15Revenue / (summary.totalRevenue || 1)) * 100).toFixed(1)}</strong>'i
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400">
                +{formatCurrency(summary.campaignDay15Profit, { showCents: false })}
              </div>
              <div className="text-[11px] text-stone-400">15'i Net Kârı</div>
            </div>
          </div>
        </div>

        {/* Average Ticket & Order Metrics */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-stone-300">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Sipariş & Sepet Verimliliği</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-stone-950 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500 font-semibold">Ortalama Sepet</div>
              <div className="text-base font-extrabold text-amber-400">
                {formatCurrency(summary.averageOrderValue, { showCents: false })}
              </div>
            </div>
            <div className="bg-stone-950 p-2 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500 font-semibold">Toplam Sipariş</div>
              <div className="text-base font-extrabold text-stone-100">
                {summary.totalOrderCount} adet
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: CHARTS & OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Daily Trend Area Chart */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-red-500" />
                  <span>Günlük Ciro, Gider ve Net Kâr Eğilimi ({summary.monthName})</span>
                </h3>
                <p className="text-xs text-stone-400">Ay içindeki günlük finansal performans dalgalanmaları</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Ciro
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Gider
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Net Kâr
                </span>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ciroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="dayLabel" stroke="#78716C" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#78716C" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      borderColor: '#44403C',
                      borderRadius: '0.75rem',
                      color: '#F5F5F4',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [formatCurrency(val), '']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return `Gün ${label}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ciro"
                    name="Ciro"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ciroGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gider"
                    name="Gider"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#giderGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="netKar"
                    name="Net Kâr"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={0}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Columns: Left = Expense Distribution Donut, Right = Revenue Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown Pie */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-rose-500" />
                  <span>Giderlerin Kategori Dağılımı</span>
                </h4>
                <span className="text-xs font-semibold text-stone-400">
                  Toplam: {formatCurrency(summary.totalExpense, { showCents: false })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1C1917',
                          borderColor: '#44403C',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                        formatter={(val: number) => [formatCurrency(val), 'Tutar']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {expensePieData.map((item) => (
                    <div key={item.categoryKey} className="flex items-center justify-between text-xs py-1 border-b border-stone-800/40">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-stone-300 font-medium truncate">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-stone-100">{formatCurrency(item.value, { showCents: false, compact: true })}</span>
                        <span className="text-stone-500 text-[10px] ml-1.5">(%{item.percentage.toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Channel Distribution */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Gelir Kanalları & Online Platformlar</span>
                </h4>
                <span className="text-xs font-semibold text-stone-400">
                  Toplam: {formatCurrency(summary.totalRevenue, { showCents: false })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenuePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {revenuePieData.map((entry, index) => (
                          <Cell key={`cell-rev-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1C1917',
                          borderColor: '#44403C',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                        formatter={(val: number) => [formatCurrency(val), 'Tutar']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-blue-400 font-semibold">
                      <CreditCard className="w-3.5 h-3.5" /> Kredi/Banka Kartı:
                    </span>
                    <span className="font-bold text-stone-100">
                      {formatCurrency(summary.totalCardRevenue, { showCents: false })} (%
                      {((summary.totalCardRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})
                    </span>
                  </div>

                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" /> Nakit Satışlar:
                    </span>
                    <span className="font-bold text-stone-100">
                      {formatCurrency(summary.totalCashRevenue, { showCents: false })} (%
                      {((summary.totalCashRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})
                    </span>
                  </div>

                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-orange-400 font-semibold">
                      <ShoppingBag className="w-3.5 h-3.5" /> Online Kanallar:
                    </span>
                    <span className="font-bold text-stone-100">
                      {formatCurrency(summary.totalOnlineRevenue, { showCents: false })} (%
                      {((summary.totalOnlineRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Online Detailed breakdown row */}
              <div className="mt-3 pt-3 border-t border-stone-800/80 grid grid-cols-4 gap-2 text-center">
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800/50">
                  <div className="text-[10px] text-stone-500">Yemeksepeti</div>
                  <div className="text-xs font-bold text-stone-200">{formatCurrency(summary.totalOnlineDetails.yemeksepeti, { showCents: false, compact: true })}</div>
                </div>
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800/50">
                  <div className="text-[10px] text-stone-500">Trendyol</div>
                  <div className="text-xs font-bold text-stone-200">{formatCurrency(summary.totalOnlineDetails.trendyol, { showCents: false, compact: true })}</div>
                </div>
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800/50">
                  <div className="text-[10px] text-stone-500">GetirYemek</div>
                  <div className="text-xs font-bold text-stone-200">{formatCurrency(summary.totalOnlineDetails.getir, { showCents: false, compact: true })}</div>
                </div>
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800/50">
                  <div className="text-[10px] text-stone-500">Migros & Diğer</div>
                  <div className="text-xs font-bold text-stone-200">{formatCurrency(summary.totalOnlineDetails.migros + summary.totalOnlineDetails.digerOnline, { showCents: false, compact: true })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: INCOME STATEMENT / GELİR TABLOSU (P&L) */}
      {activeSubTab === 'pnl' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Aylık Resmi Kâr / Zarar Gelir Tablosu ({summary.monthName})
              </h3>
              <p className="text-xs text-stone-400">
                {branch.branchName} ({branch.branchCode}) - Standart Muhasebe Gelir Tablosu Formatı
              </p>
            </div>
            <button
              onClick={handleExportMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabloyu İndir</span>
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* 1. GELİRLER BÖLÜMÜ */}
            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
              <div className="flex justify-between items-center font-bold text-stone-100 text-sm border-b border-stone-800 pb-2 mb-2">
                <span>A. BRÜT SATIŞ HASILATI (TOPLAM CİRO)</span>
                <span className="text-emerald-400">{formatCurrency(summary.totalRevenue)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-300 pl-4">
                <div className="flex justify-between">
                  <span>- Kredi & Banka Kartı Satışları</span>
                  <span>{formatCurrency(summary.totalCardRevenue)} (%{((summary.totalCardRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})</span>
                </div>
                <div className="flex justify-between">
                  <span>- Nakit Kasa Satışları</span>
                  <span>{formatCurrency(summary.totalCashRevenue)} (%{((summary.totalCashRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})</span>
                </div>
                <div className="flex justify-between">
                  <span>- Online Platform Satışları Toplamı</span>
                  <span>{formatCurrency(summary.totalOnlineRevenue)} (%{((summary.totalOnlineRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)})</span>
                </div>
              </div>
            </div>

            {/* 2. DİREKT MALİYETLER (COGS) */}
            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
              <div className="flex justify-between items-center font-bold text-stone-100 text-sm border-b border-stone-800 pb-2 mb-2">
                <span>B. SATILAN MALIN MALİYETİ (COGS / DİREKT MALİYETLER)</span>
                <span className="text-rose-400">-{formatCurrency(summary.totalCogs)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-300 pl-4">
                <div className="flex justify-between">
                  <span>- Hammadde & Çiğ Köfte Tedariği (Genel Merkez)</span>
                  <span>{formatCurrency(summary.expensesByCategory.hammadde || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Ambalaj, Kutu & Poşet Giderleri</span>
                  <span>{formatCurrency(summary.expensesByCategory.ambalaj || 0)}</span>
                </div>
              </div>
            </div>

            {/* BRÜT KAR ÇİZGİSİ */}
            <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-800/60 flex justify-between items-center font-extrabold text-sm sm:text-base text-blue-200">
              <span>BRÜT FAALİYET KÂRI (A - B)</span>
              <span>{formatCurrency(summary.grossProfit)} (%{summary.grossMarginPercent.toFixed(1)})</span>
            </div>

            {/* 3. FAALİYET GİDERLERİ (OPEX) */}
            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
              <div className="flex justify-between items-center font-bold text-stone-100 text-sm border-b border-stone-800 pb-2 mb-2">
                <span>C. İŞLETME VE FAALİYET GİDERLERİ (OPEX)</span>
                <span className="text-rose-400">-{formatCurrency(summary.totalOpex)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-300 pl-4 divide-y divide-stone-800/50">
                <div className="flex justify-between pt-1">
                  <span>- Personel Maaş, Yevmiye, Prim & SGK</span>
                  <span>{formatCurrency(summary.expensesByCategory.personel || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Dükkan Kirası, Stopaj & Aidat</span>
                  <span>{formatCurrency(summary.expensesByCategory.kira || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Online Platform Komisyonları</span>
                  <span>{formatCurrency(summary.expensesByCategory.komisyon || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Kurye, Paket Servis & Yakıt Giderleri</span>
                  <span>{formatCurrency(summary.expensesByCategory.kurye || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Elektrik, Su, Doğalgaz & İnternet Faturaları</span>
                  <span>{formatCurrency(summary.expensesByCategory.fatura || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- POS Cihazı & Banka Komisyon Kesintileri</span>
                  <span>{formatCurrency(summary.expensesByCategory.banka || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Muhasebe, Vergi & Harçlar</span>
                  <span>{formatCurrency(summary.expensesByCategory.muhasebe || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Temizlik, Hijyen & Sarf Malzemeleri</span>
                  <span>{formatCurrency(summary.expensesByCategory.temizlik || 0)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>- Diğer Çeşitli Giderler</span>
                  <span>{formatCurrency(summary.expensesByCategory.diger || 0)}</span>
                </div>
              </div>
            </div>

            {/* NET DÖNEM KARI */}
            <div
              className={`rounded-xl p-4 border flex justify-between items-center font-black text-base sm:text-lg ${
                summary.netProfit >= 0
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 shadow-lg'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300 shadow-lg'
              }`}
            >
              <span>DÖNEM NET KÂR / ZARAR (A - B - C)</span>
              <span>{formatCurrency(summary.netProfit)} (Marj: %{summary.netProfitMarginPercent.toFixed(1)})</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DAY-BY-DAY DETAILED LEDGER */}
      {activeSubTab === 'dailyLedger' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Günlük Detaylı Mali Hareketler Çizelgesi ({summary.monthName})
              </h3>
              <p className="text-xs text-stone-400">Satıra tıklayarak o günün detaylı giriş sayfasına gidebilirsiniz</p>
            </div>
            <button
              onClick={handleExportMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel'e Aktar</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Tarih</th>
                  <th className="py-3 px-2">Kart (TL)</th>
                  <th className="py-3 px-2">Nakit (TL)</th>
                  <th className="py-3 px-2">Online (TL)</th>
                  <th className="py-3 px-3 font-bold text-stone-200">Toplam Ciro</th>
                  <th className="py-3 px-2 text-rose-400">Gider (TL)</th>
                  <th className="py-3 px-3 font-bold">Net Kâr (TL)</th>
                  <th className="py-3 px-2">Kâr Marjı</th>
                  <th className="py-3 px-2">Fiş Sayısı</th>
                  <th className="py-3 px-2 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {dailyChartData.map((row) => (
                  <tr
                    key={row.date}
                    onClick={() => handleGoToDay(row.date)}
                    className="hover:bg-stone-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-medium text-stone-200 flex items-center gap-2">
                      {row.is15 && (
                        <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" title="15'i Kampanyası" />
                      )}
                      <span>{row.fullDate}</span>
                    </td>
                    <td className="py-3 px-2 text-stone-300">{formatCurrency(row.kart, { showCents: false })}</td>
                    <td className="py-3 px-2 text-stone-300">{formatCurrency(row.nakit, { showCents: false })}</td>
                    <td className="py-3 px-2 text-stone-300">{formatCurrency(row.online, { showCents: false })}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrency(row.ciro, { showCents: false })}</td>
                    <td className="py-3 px-2 text-rose-400">{formatCurrency(row.gider, { showCents: false })}</td>
                    <td className={`py-3 px-3 font-black ${row.netKar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(row.netKar, { showCents: false })}
                    </td>
                    <td className="py-3 px-2 font-semibold text-stone-300">
                      {row.ciro > 0 ? `%${((row.netKar / row.ciro) * 100).toFixed(1)}` : '%0'}
                    </td>
                    <td className="py-3 px-2 text-stone-400">
                      {records[row.date]?.incomes.orderCount || 0}
                    </td>
                    <td className="py-3 px-2 text-center text-stone-500 group-hover:text-red-400">
                      <ChevronRight className="w-4 h-4 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
