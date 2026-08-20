import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useFinancial } from '../context/FinancialContext';
import { ExpenseCategory, EXPENSE_CATEGORIES, ExpenseItem, DailyRecord } from '../types';
import { formatCurrency, formatDateTr } from '../utils/formatters';

interface ExpenseRow extends ExpenseItem {
  date: string;
}

export const ExpenseExplorerView: React.FC = () => {
  const { records, saveDailyRecord, branch } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Flatten all expenses with their date
  const allExpenses = useMemo(() => {
    const list: ExpenseRow[] = [];
    (Object.values(records) as DailyRecord[]).forEach((rec) => {
      rec.expenses.forEach((e) => {
        list.push({
          ...e,
          date: rec.date,
        });
      });
    });
    return list;
  }, [records]);

  // Unique months available
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    allExpenses.forEach((e) => {
      set.add(e.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [allExpenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses
      .filter((e) => {
        const matchesSearch =
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.supplier && e.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (e.receiptNo && e.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
        const matchesMethod = selectedPaymentMethod === 'all' || e.paymentMethod === selectedPaymentMethod;
        const matchesMonth = selectedMonthFilter === 'all' || e.date.startsWith(selectedMonthFilter);

        return matchesSearch && matchesCat && matchesMethod && matchesMonth;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [allExpenses, searchTerm, selectedCategory, selectedPaymentMethod, selectedMonthFilter, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Handle Delete Expense
  const handleDeleteExpense = (date: string, expenseId: string) => {
    const rec = records[date];
    if (!rec) return;

    const newExpenses = rec.expenses.filter((e) => e.id !== expenseId);
    const totalExpense = newExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = rec.incomes.totalRevenue - totalExpense;
    const profitMarginPercent = rec.incomes.totalRevenue > 0 ? (netProfit / rec.incomes.totalRevenue) * 100 : 0;

    saveDailyRecord({
      ...rec,
      expenses: newExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
    });
  };

  // Export Filtered to Excel
  const handleExportFilteredToExcel = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
      'Tarih',
      'Kategori',
      'Gider Açıklaması',
      'Tutar (TL)',
      'Ödeme Şekli',
      'Tedarikçi / Muhatap',
      'Fiş/Fatura No',
      'Notlar',
    ];

    const rows = filteredExpenses.map((e) => [
      e.date,
      EXPENSE_CATEGORIES[e.category]?.name || e.category,
      e.title,
      e.amount,
      e.paymentMethod === 'nakit' ? 'Nakit' : e.paymentMethod === 'kart_banka' ? 'Banka/Kart' : 'Vadeli',
      e.supplier || '-',
      e.receiptNo || '-',
      e.notes || '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ['KOMAGENE MASRAF VE GİDER RAPORU'],
      ['Şube:', branch.branchName],
      ['Toplam Filtrelenen Tutar:', totalFilteredAmount],
      [''],
      headers,
      ...rows,
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Masraflar');
    XLSX.writeFile(wb, `Komagene_Masraf_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Filter Bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800 mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              <span>Tüm Masraf ve Gider Kalemleri Gezgini</span>
            </h2>
            <p className="text-xs text-stone-400">
              Tüm dönemlere ait harcamaları arayın, filtreleyin ve Excel formatında dışa aktarın
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <span className="text-stone-400">Toplam: </span>
              <strong className="text-rose-400 font-extrabold text-sm">{formatCurrency(totalFilteredAmount)}</strong>
              <span className="text-stone-500 ml-1">({filteredExpenses.length} kalem)</span>
            </div>

            <button
              onClick={handleExportFilteredToExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer border border-emerald-500/40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel'e İndir</span>
            </button>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Açıklama, tedarikçi veya fiş no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              {Object.values(EXPENSE_CATEGORIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tüm Ödeme Tipleri</option>
              <option value="nakit">💵 Nakit Kasa</option>
              <option value="kart_banka">💳 Banka / Şirket Kartı</option>
              <option value="vadeli_fatura">📄 Vadeli / Cari</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tüm Aylar</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m} Dönemi
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="date-desc">Tarih (En Yeni)</option>
              <option value="date-asc">Tarih (En Eski)</option>
              <option value="amount-desc">Tutar (En Yüksek)</option>
              <option value="amount-asc">Tutar (En Düşük)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            Filtreleme kriterlerinize uyan masraf kaydı bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Tarih</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Gider Açıklaması</th>
                  <th className="py-3 px-3">Tutar (TL)</th>
                  <th className="py-3 px-2">Ödeme Türü</th>
                  <th className="py-3 px-3">Tedarikçi / Fiş No</th>
                  <th className="py-3 px-2 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredExpenses.map((item) => {
                  const cat = EXPENSE_CATEGORIES[item.category] || EXPENSE_CATEGORIES.diger;
                  return (
                    <tr key={`${item.date}-${item.id}`} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-stone-300 whitespace-nowrap">
                        {formatDateTr(item.date, 'dayOnly')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold text-white inline-block whitespace-nowrap"
                          style={{ backgroundColor: `${cat.color}33`, color: cat.color, border: `1px solid ${cat.color}66` }}
                        >
                          {cat.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-100">{item.title}</td>
                      <td className="py-3 px-3 font-black text-rose-400 whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-2 text-stone-300">
                        {item.paymentMethod === 'nakit'
                          ? '💵 Nakit'
                          : item.paymentMethod === 'kart_banka'
                            ? '💳 Banka/Kart'
                            : '📄 Vadeli'}
                      </td>
                      <td className="py-3 px-3 text-stone-400">
                        {item.supplier ? <div>{item.supplier}</div> : null}
                        {item.receiptNo ? <div className="text-[10px] text-stone-500 font-mono">{item.receiptNo}</div> : '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleDeleteExpense(item.date, item.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Masrafı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
