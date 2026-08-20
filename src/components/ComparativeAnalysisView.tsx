import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Flame,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { DailyRecord } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { exportComparativeToExcel } from '../utils/excelExport';

export const ComparativeAnalysisView: React.FC = () => {
  const {
    getComparativeData,
    getWeekdayAnalysis,
    branch,
    records,
  } = useFinancial();

  const compData = getComparativeData();
  const weekdayData = getWeekdayAnalysis();

  const [selectedAnalysisTab, setSelectedAnalysisTab] = useState<'months' | 'weekdays' | 'campaign15'>('months');

  // Month-over-month Growth calculations
  const latestMonth = compData[compData.length - 1];
  const previousMonth = compData.length > 1 ? compData[compData.length - 2] : null;

  const revenueGrowth = previousMonth && previousMonth.revenue > 0
    ? ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0;

  const profitGrowth = previousMonth && previousMonth.profit > 0
    ? ((latestMonth.profit - previousMonth.profit) / previousMonth.profit) * 100
    : 0;

  // Best & Lowest Weekdays
  const sortedWeekdays = [...weekdayData].sort((a, b) => b.avgRevenue - a.avgRevenue);
  const bestWeekday = sortedWeekdays[0];
  const lowestWeekday = sortedWeekdays[sortedWeekdays.length - 1];

  // Campaign 15th average stats
  const allRecs = Object.values(records) as DailyRecord[];
  const campaignDays = allRecs.filter((r) => r.isCampaignDay || r.date.endsWith('-15'));
  const normalDays = allRecs.filter((r) => !r.isCampaignDay && !r.date.endsWith('-15'));

  const avgCampaignRevenue = campaignDays.length > 0
    ? campaignDays.reduce((sum, r) => sum + r.incomes.totalRevenue, 0) / campaignDays.length
    : 0;

  const avgNormalRevenue = normalDays.length > 0
    ? normalDays.reduce((sum, r) => sum + r.incomes.totalRevenue, 0) / normalDays.length
    : 0;

  const campaignMultiplier = avgNormalRevenue > 0 ? avgCampaignRevenue / avgNormalRevenue : 0;

  const handleExport = () => {
    exportComparativeToExcel(compData, branch);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <span>Dönemsel ve Karşılaştırmalı Mali Analiz</span>
          </h2>
          <p className="text-xs text-stone-400">
            Aylar arası büyüme, haftanın günleri cirosu ve her ayın 15'i kampanya etkisi karşılaştırması
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab pills */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setSelectedAnalysisTab('months')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedAnalysisTab === 'months' ? 'bg-stone-800 text-white shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ay Karşılaştırması
            </button>
            <button
              onClick={() => setSelectedAnalysisTab('weekdays')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedAnalysisTab === 'weekdays' ? 'bg-stone-800 text-white shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Haftanın Günleri
            </button>
            <button
              onClick={() => setSelectedAnalysisTab('campaign15')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedAnalysisTab === 'campaign15' ? 'bg-stone-800 text-white shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              15'i Kampanya Etkisi
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer border border-emerald-500/40"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Analizi İndir</span>
          </button>
        </div>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Son Ay Ciro Büyümesi */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="text-xs text-stone-400 font-semibold mb-1">DÖNEMSEL CİRO DEĞİŞİMİ</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-100">
              {formatPercent(revenueGrowth, { showSign: true })}
            </span>
            {revenueGrowth >= 0 ? (
              <span className="flex items-center text-xs font-bold text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> Artış
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5" /> Düşüş
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            {previousMonth ? `${previousMonth.monthLabel} ayına göre` : 'Geçmiş dönem'}
          </div>
        </div>

        {/* Son Ay Net Kâr Büyümesi */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="text-xs text-stone-400 font-semibold mb-1">NET KÂR BÜYÜME ORANI</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${profitGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPercent(profitGrowth, { showSign: true })}
            </span>
            {profitGrowth >= 0 ? (
              <span className="flex items-center text-xs font-bold text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> Kârlılık Arttı
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5" /> Kâr Düştü
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Mevcut Net Kâr: {formatCurrency(latestMonth?.profit || 0, { showCents: false, compact: true })}
          </div>
        </div>

        {/* En Yoğun Gün */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
          <div className="text-xs text-stone-400 font-semibold mb-1">EN YÜKSEK CİRO GETİREN GÜN</div>
          <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>{bestWeekday?.dayName || '-'}</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-2 flex justify-between">
            <span>Günlük Ort:</span>
            <strong className="text-stone-200">{formatCurrency(bestWeekday?.avgRevenue || 0, { showCents: false })}</strong>
          </div>
        </div>

        {/* 15'i Kampanya Çarpanı */}
        <div className="bg-gradient-to-br from-red-950/40 via-stone-900 to-stone-900 border border-red-900/40 rounded-2xl p-4 shadow-md">
          <div className="text-xs text-red-400 font-bold mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>15'İ KAMPANYA ÇARPANI</span>
          </div>
          <div className="text-2xl font-black text-stone-100">
            {campaignMultiplier.toFixed(1)}x Kat Ciro
          </div>
          <div className="text-[11px] text-stone-400 mt-2">
            Normal günün ortalama {campaignMultiplier.toFixed(1)} katı hasılat
          </div>
        </div>
      </div>

      {/* TAB 1: MONTH-OVER-MONTH ANALYSIS */}
      {selectedAnalysisTab === 'months' && (
        <div className="space-y-6">
          {/* Revenue & Profit Multi-period Bar Chart */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="pb-4 border-b border-stone-800 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-500" />
                  <span>Aylar İtibarıyla Ciro, Gider ve Net Kâr Karşılaştırması</span>
                </h3>
                <p className="text-xs text-stone-400">Dönemsel performans ve işletme marjı takibi</p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="monthLabel" stroke="#78716C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#78716C" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      borderColor: '#44403C',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [formatCurrency(val, { showCents: false }), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Toplam Ciro" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Toplam Gider" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Kâr" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h4 className="text-sm font-bold text-stone-100">
                Aylık Karşılaştırma Matrisi ve Kanal Dağılımları
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-3">Dönem</th>
                    <th className="py-3 px-3">Ciro (TL)</th>
                    <th className="py-3 px-3">Gider (TL)</th>
                    <th className="py-3 px-3">Net Kâr (TL)</th>
                    <th className="py-3 px-2">Kâr Marjı (%)</th>
                    <th className="py-3 px-2">Kart Payı</th>
                    <th className="py-3 px-2">Nakit Payı</th>
                    <th className="py-3 px-2">Online Payı</th>
                    <th className="py-3 px-2">15'i Cirosu</th>
                    <th className="py-3 px-2">Sipariş Sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {compData.map((row) => (
                    <tr key={row.monthKey} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-stone-200">{row.monthLabel}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrency(row.revenue, { showCents: false })}</td>
                      <td className="py-3 px-3 text-rose-400">{formatCurrency(row.expense, { showCents: false })}</td>
                      <td className="py-3 px-3 font-bold text-blue-400">{formatCurrency(row.profit, { showCents: false })}</td>
                      <td className="py-3 px-2 font-bold text-stone-100">%{row.marginPercent.toFixed(1)}</td>
                      <td className="py-3 px-2 text-stone-300">%{row.cardShare.toFixed(1)}</td>
                      <td className="py-3 px-2 text-stone-300">%{row.cashShare.toFixed(1)}</td>
                      <td className="py-3 px-2 text-stone-300">%{row.onlineShare.toFixed(1)}</td>
                      <td className="py-3 px-2 font-semibold text-red-400">{formatCurrency(row.day15Revenue, { showCents: false })}</td>
                      <td className="py-3 px-2 text-stone-400">{row.orderCount} adet</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKDAY PERFORMANCE ANALYSIS */}
      {selectedAnalysisTab === 'weekdays' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="pb-4 border-b border-stone-800 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Haftanın Günlerine Göre Ortalama Ciro ve Kârlılık</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Hangi günlerin şube için en verimli ve karlı olduğunu analiz edin
                </p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="dayName" stroke="#78716C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#78716C" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      borderColor: '#44403C',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [formatCurrency(val, { showCents: false }), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="avgRevenue" name="Ortalama Günlük Ciro" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgProfit" name="Ortalama Net Kâr" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekday Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {weekdayData.map((d) => {
              const isBest = d.dayName === bestWeekday?.dayName;
              return (
                <div
                  key={d.dayName}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isBest
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md'
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-stone-200 mb-1.5">
                    <span>{d.dayName}</span>
                    {isBest && <span className="text-[10px] text-amber-400 font-extrabold">EN İYİ</span>}
                  </div>
                  <div className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(d.avgRevenue, { showCents: false })}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1 flex justify-between">
                    <span>Ort. Kâr:</span>
                    <span className="font-semibold text-blue-300">{formatCurrency(d.avgProfit, { showCents: false })}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Ort. {d.avgOrderCount} Sipariş ({d.count} gün kayıtlı)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: 15TH CAMPAIGN DAY ANALYSIS */}
      {selectedAnalysisTab === 'campaign15' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-950/40 via-stone-900 to-stone-900 border border-red-900/50 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-100">
                  Komagene "Her Ayın 15'i %50 Bedava" Kampanya Etki Raporu
                </h3>
                <p className="text-xs text-stone-300">
                  Çiğ köfte sektörünün en büyük kampanya gününün şubenize sağladığı finansal hacim
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="text-xs text-stone-400 font-semibold mb-1">15'İ ORTALAMA CİROSU</div>
                <div className="text-2xl font-black text-red-400">
                  {formatCurrency(avgCampaignRevenue, { showCents: false })}
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  Normal gün ortalaması: {formatCurrency(avgNormalRevenue, { showCents: false })}
                </div>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="text-xs text-stone-400 font-semibold mb-1">CİRO ÇARPANI</div>
                <div className="text-2xl font-black text-amber-400">
                  {campaignMultiplier.toFixed(1)}x KAT
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  Standart bir güne kıyasla %{((campaignMultiplier - 1) * 100).toFixed(0)} daha fazla gelir
                </div>
              </div>

              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="text-xs text-stone-400 font-semibold mb-1">ÖNERİLEN HAZIRLIK</div>
                <div className="text-sm font-bold text-emerald-400">
                  +3x Kat Hammadde & Ek Usta/Kurye
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  13-14'ü günlerinde Komagene GM'den ekstra çiğ köfte, lavaş ve ambalaj siparişi verilmelidir.
                </div>
              </div>
            </div>

            {/* Campaign Days Table */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3">
                Geçmiş 15'i Kampanya Günleri Performansı
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Toplam Ciro (TL)</th>
                      <th className="py-2.5 px-3">Gider (TL)</th>
                      <th className="py-2.5 px-3">Net Kâr (TL)</th>
                      <th className="py-2.5 px-2">Sipariş Sayısı</th>
                      <th className="py-2.5 px-2">Ortalama Sepet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {campaignDays.map((cd) => (
                      <tr key={cd.date} className="hover:bg-stone-800/30">
                        <td className="py-2.5 px-3 font-bold text-stone-200">{cd.date}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {formatCurrency(cd.incomes.totalRevenue, { showCents: false })}
                        </td>
                        <td className="py-2.5 px-3 text-rose-400">
                          {formatCurrency(cd.totalExpense, { showCents: false })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-blue-400">
                          {formatCurrency(cd.netProfit, { showCents: false })}
                        </td>
                        <td className="py-2.5 px-2 text-stone-300">{cd.incomes.orderCount} adet</td>
                        <td className="py-2.5 px-2 text-stone-400">
                          {formatCurrency(
                            cd.incomes.orderCount > 0
                              ? cd.incomes.totalRevenue / cd.incomes.orderCount
                              : 0,
                            { showCents: false }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
