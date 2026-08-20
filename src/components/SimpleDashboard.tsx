import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Receipt,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Eye,
  Flame,
  Search,
  Filter,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { DailyRecord } from '../types';
import {
  formatCurrency,
  formatPercent,
  formatDateTr,
  getMonthNameFromKey,
  getTodayDateStr,
} from '../utils/formatters';
import { exportMonthToExcel } from '../utils/excelExport';
import { KasaYapModal } from './KasaYapModal';
import { MasrafGirModal } from './MasrafGirModal';
import { DayDetailModal } from './DayDetailModal';

export const SimpleDashboard: React.FC = () => {
  const {
    records,
    branch,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getMonthSummary,
    deleteDailyRecord,
  } = useFinancial();

  // Modals state
  const [isKasaModalOpen, setIsKasaModalOpen] = useState(false);
  const [isMasrafModalOpen, setIsMasrafModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeActionDate, setActiveActionDate] = useState<string>(getTodayDateStr());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'campaignOnly' | 'profitable' | 'loss'>('all');

  const currentSummary = getMonthSummary(selectedMonth);

  // Filtered records for the selected month
  const monthRecords = useMemo(() => {
    const list = (Object.values(records) as DailyRecord[])
      .filter((r) => r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    return list.filter((r) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        r.date.includes(searchQuery) ||
        (r.generalNotes && r.generalNotes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.expenses.some((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter
      if (filterType === 'campaignOnly') return matchesSearch && (r.isCampaignDay || r.date.endsWith('-15'));
      if (filterType === 'profitable') return matchesSearch && r.netProfit > 0;
      if (filterType === 'loss') return matchesSearch && r.netProfit < 0;

      return matchesSearch;
    });
  }, [records, selectedMonth, searchQuery, filterType]);

  // Computed Totals for the current table view
  const tableTotals = useMemo(() => {
    return monthRecords.reduce(
      (acc, r) => {
        acc.card += r.incomes.card;
        acc.cash += r.incomes.cash;
        acc.online += r.incomes.onlineTotal;
        acc.revenue += r.incomes.totalRevenue;
        acc.expense += r.totalExpense;
        acc.profit += r.netProfit;
        acc.orderCount += r.incomes.orderCount;
        return acc;
      },
      { card: 0, cash: 0, online: 0, revenue: 0, expense: 0, profit: 0, orderCount: 0 }
    );
  }, [monthRecords]);

  // Handlers
  const handleOpenKasaForDate = (date?: string) => {
    setActiveActionDate(date || getTodayDateStr());
    setIsKasaModalOpen(true);
  };

  const handleOpenMasrafForDate = (date?: string) => {
    setActiveActionDate(date || getTodayDateStr());
    setIsMasrafModalOpen(true);
  };

  const handleOpenDetailForDate = (date: string) => {
    setActiveActionDate(date);
    setIsDetailModalOpen(true);
  };

  const handleDeleteDay = (date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${date} tarihli kasa ve masraf kaydını silmek istediğinize emin misiniz?`)) {
      deleteDailyRecord(date);
    }
  };

  const handleExportExcel = () => {
    exportMonthToExcel(selectedMonth, records, currentSummary, branch);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP ACTION & MONTH BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Month Selector & Branch Title */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-xs sm:text-sm text-slate-900 pr-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthNameFromKey(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Toplam <strong className="text-slate-800 font-bold">{monthRecords.length} gün</strong> kayıtlı
          </div>
        </div>

        {/* Action Buttons: KASA YAP & MASRAF GİR & EXCEL */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Kasa Yap Button */}
          <button
            onClick={() => handleOpenKasaForDate(getTodayDateStr())}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Kasa Yap (Gelir Gir)</span>
          </button>

          {/* Masraf Gir Button */}
          <button
            onClick={() => handleOpenMasrafForDate(getTodayDateStr())}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold border border-rose-200 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Masraf Gir</span>
          </button>

          {/* Excel'e İndir Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            title="Seçili ayın resmi Excel tablosunu indir"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Excel'e Aktar</span>
          </button>
        </div>
      </div>

      {/* 2. MONTHLY CORNER SUMMARY CARDS (O Ay Nakit, Kart, Online, Toplam Ciro & Ortalama Ciro) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>{getMonthNameFromKey(selectedMonth)} Ayı Mali Özeti</span>
            </h2>
            <p className="text-xs text-slate-500">
              Şubenin bu ayki gelir kanalları, ortalama performansı ve net kâr durumu
            </p>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
            {branch.branchName}
          </div>
        </div>

        {/* 5 Prominent Corner Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Toplam Ciro */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>AYLIK TOPLAM CİRO</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 my-1">
              {formatCurrency(currentSummary.totalRevenue, { showCents: false })}
            </div>
            <div className="text-[11px] text-slate-400">
              {currentSummary.daysLogged} gün kayıtlı ciro toplamı
            </div>
          </div>

          {/* Nakit Toplamı */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>💵 NAKİT TOPLAMI</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 my-1">
              {formatCurrency(currentSummary.totalCashRevenue, { showCents: false })}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              Ciro Payı: %
              {currentSummary.totalRevenue > 0
                ? ((currentSummary.totalCashRevenue / currentSummary.totalRevenue) * 100).toFixed(1)
                : '0.0'}
            </div>
          </div>

          {/* Kart Toplamı */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-blue-800">
              <span>💳 KART (POS)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-950 my-1">
              {formatCurrency(currentSummary.totalCardRevenue, { showCents: false })}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold">
              Ciro Payı: %
              {currentSummary.totalRevenue > 0
                ? ((currentSummary.totalCardRevenue / currentSummary.totalRevenue) * 100).toFixed(1)
                : '0.0'}
            </div>
          </div>

          {/* Online Toplamı */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>🛵 ONLİNE SİPARİŞ</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 my-1">
              {formatCurrency(currentSummary.totalOnlineRevenue, { showCents: false })}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold">
              Ciro Payı: %
              {currentSummary.totalRevenue > 0
                ? ((currentSummary.totalOnlineRevenue / currentSummary.totalRevenue) * 100).toFixed(1)
                : '0.0'}
            </div>
          </div>

          {/* Ortalama Günlük Ciro & Net Kâr */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-700">
              📊 ORTALAMA CİRO
            </div>
            <div className="text-xl font-extrabold text-slate-900 my-1">
              {formatCurrency(currentSummary.averageDailyRevenue, { showCents: false })}
              <span className="text-xs font-medium text-slate-500 ml-1">/gün</span>
            </div>
            <div className="text-[11px] text-slate-600 flex justify-between items-center">
              <span>Net Kâr:</span>
              <strong
                className={`font-bold ${
                  currentSummary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(currentSummary.netProfit, { showCents: false, compact: true })}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TÜM GÜNLERİN RAPOR TABLOSU LİSTESİ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar (Search & Quick Filter) */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>Günlük Kasa & Mali Hareket Raporu</span>
            </h3>
            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
              {monthRecords.length} Gün
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tarih veya açıklama ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 shadow-2xs"
              />
            </div>

            {/* Quick Filter Pill */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Tüm Günler</option>
              <option value="campaignOnly">🔥 Sadece 15'i Kampanya Günleri</option>
              <option value="profitable">🟢 Kârda Olan Günler</option>
              <option value="loss">🔴 Zararda Olan Günler</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {monthRecords.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-slate-800 font-bold text-sm">
              Bu ay için henüz kayıtlı gün bulunmuyor.
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Yukarıdaki <strong>"Kasa Yap (Gelir Gir)"</strong> butonuna basarak günün hasılatını hemen kaydedebilirsiniz.
            </p>
            <button
              onClick={() => handleOpenKasaForDate(getTodayDateStr())}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>İlk Günün Kasasını Yap</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-4">Tarih & Gün</th>
                  <th className="py-3.5 px-3 text-right">Kart (POS)</th>
                  <th className="py-3.5 px-3 text-right">Nakit Kasa</th>
                  <th className="py-3.5 px-3 text-right">Online Toplam</th>
                  <th className="py-3.5 px-4 text-right bg-slate-200/50">Günlük Ciro</th>
                  <th className="py-3.5 px-3 text-right">Masraflar</th>
                  <th className="py-3.5 px-4 text-right">Net Kâr</th>
                  <th className="py-3.5 px-3 text-center">İşlemler</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-800">
                {monthRecords.map((row) => {
                  const is15 = row.isCampaignDay || row.date.endsWith('-15');
                  const hasExpenses = row.expenses && row.expenses.length > 0;

                  return (
                    <tr
                      key={row.date}
                      onClick={() => handleOpenDetailForDate(row.date)}
                      className={`hover:bg-red-50/40 transition-colors cursor-pointer ${
                        is15 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Tarih & Rozet */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{formatDateTr(row.date, 'full')}</span>
                          {is15 && (
                            <span className="flex items-center gap-0.5 bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                              <Flame className="w-3 h-3 text-red-600 fill-red-600" />
                              15'i
                            </span>
                          )}
                          {row.incomes.orderCount > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">
                              ({row.incomes.orderCount} sipariş)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kart (POS) */}
                      <td className="py-3.5 px-3 text-right font-medium text-blue-900 whitespace-nowrap">
                        {formatCurrency(row.incomes.card)}
                      </td>

                      {/* Nakit */}
                      <td className="py-3.5 px-3 text-right font-medium text-emerald-900 whitespace-nowrap">
                        {formatCurrency(row.incomes.cash)}
                      </td>

                      {/* Online Toplam */}
                      <td className="py-3.5 px-3 text-right font-medium text-amber-900 whitespace-nowrap">
                        {formatCurrency(row.incomes.onlineTotal)}
                      </td>

                      {/* Toplam Ciro */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-950 bg-slate-50/80 whitespace-nowrap">
                        {formatCurrency(row.incomes.totalRevenue)}
                      </td>

                      {/* Masraflar */}
                      <td className="py-3.5 px-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        {row.totalExpense > 0 ? (
                          <span title={`${row.expenses.length} adet masraf kalemi`}>
                            {formatCurrency(row.totalExpense)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">-</span>
                        )}
                      </td>

                      {/* Net Kâr */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black ${
                            row.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(row.netProfit)}
                        </span>
                        {row.incomes.totalRevenue > 0 && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-medium hidden sm:inline">
                            (%{row.profitMarginPercent.toFixed(0)})
                          </span>
                        )}
                      </td>

                      {/* İşlem Butonları */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* Detay & Harcamaları Gör */}
                          <button
                            onClick={() => handleOpenDetailForDate(row.date)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Günün Detaylarını Gör"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Kasa Düzenle */}
                          <button
                            onClick={() => handleOpenKasaForDate(row.date)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Kasayı Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Masraf Ekle */}
                          <button
                            onClick={() => handleOpenMasrafForDate(row.date)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Güne Masraf Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Sil */}
                          <button
                            onClick={(e) => handleDeleteDay(row.date, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Günü Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* 4. GENEL TOPLAMLAR SATIRI (TABLE FOOTER) */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold text-xs sm:text-sm border-t-2 border-slate-300">
                  <td className="py-4 px-4 text-slate-200 uppercase tracking-wider">
                    GENEL TOPLAM ({monthRecords.length} Gün)
                  </td>
                  <td className="py-4 px-3 text-right text-blue-300 font-bold">
                    {formatCurrency(tableTotals.card, { showCents: false })}
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-300 font-bold">
                    {formatCurrency(tableTotals.cash, { showCents: false })}
                  </td>
                  <td className="py-4 px-3 text-right text-amber-300 font-bold">
                    {formatCurrency(tableTotals.online, { showCents: false })}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-400 font-black text-base bg-slate-950">
                    {formatCurrency(tableTotals.revenue, { showCents: false })}
                  </td>
                  <td className="py-4 px-3 text-right text-rose-300 font-bold">
                    {formatCurrency(tableTotals.expense, { showCents: false })}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-emerald-400 text-base">
                    {formatCurrency(tableTotals.profit, { showCents: false })}
                  </td>
                  <td className="py-4 px-3 text-center text-slate-400 text-[11px] font-semibold">
                    Marj: %
                    {tableTotals.revenue > 0
                      ? ((tableTotals.profit / tableTotals.revenue) * 100).toFixed(1)
                      : '0.0'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <KasaYapModal
        isOpen={isKasaModalOpen}
        onClose={() => setIsKasaModalOpen(false)}
        initialDate={activeActionDate}
      />

      <MasrafGirModal
        isOpen={isMasrafModalOpen}
        onClose={() => setIsMasrafModalOpen(false)}
        initialDate={activeActionDate}
      />

      <DayDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        date={activeActionDate}
        onEditKasa={() => {
          setIsDetailModalOpen(false);
          setIsKasaModalOpen(true);
        }}
        onAddMasraf={() => {
          setIsDetailModalOpen(false);
          setIsMasrafModalOpen(true);
        }}
      />
    </div>
  );
};
