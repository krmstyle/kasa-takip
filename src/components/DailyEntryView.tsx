import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  HelpCircle,
  Receipt,
  AlertCircle,
  Sparkles,
  Layers,
  Save,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import {
  DailyRecord,
  ExpenseItem,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
} from '../types';
import {
  formatCurrency,
  formatPercent,
  formatDateTr,
  getTodayDateStr,
} from '../utils/formatters';

export const DailyEntryView: React.FC = () => {
  const { selectedDate, setSelectedDate, getRecordForDate, saveDailyRecord, records } = useFinancial();

  // Local state for current active record
  const [record, setRecord] = useState<DailyRecord>(() => getRecordForDate(selectedDate));
  const [showOnlineDetails, setShowOnlineDetails] = useState<boolean>(true);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // New Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('hammadde');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'nakit' | 'kart_banka' | 'vadeli_fatura'>('nakit');
  const [expenseSupplier, setExpenseSupplier] = useState('');
  const [expenseReceiptNo, setExpenseReceiptNo] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Cash Drawer State
  const [actualCashInput, setActualCashInput] = useState<string>('');

  // Sync state when selectedDate changes
  useEffect(() => {
    const rec = getRecordForDate(selectedDate);
    setRecord(rec);
    if (rec.cashReconciliation?.actualCashInDrawer !== undefined) {
      setActualCashInput(rec.cashReconciliation.actualCashInDrawer.toString());
    } else {
      setActualCashInput('');
    }
  }, [selectedDate, records]);

  // Recalculate totals and profit
  const updateIncomeField = (field: 'card' | 'cash' | 'onlineTotal' | 'orderCount', value: number) => {
    setRecord((prev) => {
      const newIncomes = { ...prev.incomes, [field]: value };
      const totalRevenue = (field === 'card' ? value : newIncomes.card) +
        (field === 'cash' ? value : newIncomes.cash) +
        (field === 'onlineTotal' ? value : newIncomes.onlineTotal);

      newIncomes.totalRevenue = totalRevenue;
      const netProfit = totalRevenue - prev.totalExpense;
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const updated: DailyRecord = {
        ...prev,
        incomes: newIncomes,
        netProfit,
        profitMarginPercent,
      };

      saveDailyRecord(updated);
      triggerSavedNotice();
      return updated;
    });
  };

  const updateOnlineDetailField = (subChannel: keyof DailyRecord['incomes']['onlineDetails'], value: number) => {
    setRecord((prev) => {
      const newDetails = { ...prev.incomes.onlineDetails, [subChannel]: value };
      const newOnlineTotal =
        newDetails.yemeksepeti +
        newDetails.trendyol +
        newDetails.getir +
        newDetails.migros +
        newDetails.digerOnline;

      const newIncomes = {
        ...prev.incomes,
        onlineDetails: newDetails,
        onlineTotal: newOnlineTotal,
      };

      const totalRevenue = newIncomes.card + newIncomes.cash + newOnlineTotal;
      newIncomes.totalRevenue = totalRevenue;
      const netProfit = totalRevenue - prev.totalExpense;
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const updated: DailyRecord = {
        ...prev,
        incomes: newIncomes,
        netProfit,
        profitMarginPercent,
      };

      saveDailyRecord(updated);
      triggerSavedNotice();
      return updated;
    });
  };

  const triggerSavedNotice = () => {
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  // Add Expense Item
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !expenseTitle.trim()) {
      return;
    }

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: expenseCategory,
      title: expenseTitle.trim(),
      amount: amountNum,
      paymentMethod: expensePaymentMethod,
      supplier: expenseSupplier.trim() || undefined,
      receiptNo: expenseReceiptNo.trim() || undefined,
      notes: expenseNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const newExpenses = [...record.expenses, newItem];
    const totalExpense = newExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = record.incomes.totalRevenue - totalExpense;
    const profitMarginPercent = record.incomes.totalRevenue > 0 ? (netProfit / record.incomes.totalRevenue) * 100 : 0;

    const updated: DailyRecord = {
      ...record,
      expenses: newExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
    };

    setRecord(updated);
    saveDailyRecord(updated);
    triggerSavedNotice();

    // Reset expense form
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseSupplier('');
    setExpenseReceiptNo('');
    setExpenseNotes('');
  };

  // Remove Expense Item
  const handleRemoveExpense = (id: string) => {
    const newExpenses = record.expenses.filter((e) => e.id !== id);
    const totalExpense = newExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = record.incomes.totalRevenue - totalExpense;
    const profitMarginPercent = record.incomes.totalRevenue > 0 ? (netProfit / record.incomes.totalRevenue) * 100 : 0;

    const updated: DailyRecord = {
      ...record,
      expenses: newExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
    };

    setRecord(updated);
    saveDailyRecord(updated);
    triggerSavedNotice();
  };

  // Quick Preset Adders
  const handleAddQuickExpense = (title: string, category: ExpenseCategory, defaultMethod: 'nakit' | 'kart_banka', defaultAmount?: number) => {
    setExpenseTitle(title);
    setExpenseCategory(category);
    setExpensePaymentMethod(defaultMethod);
    if (defaultAmount) {
      setExpenseAmount(defaultAmount.toString());
    }
  };

  // Auto calculate POS fee button (approx 2.1%)
  const handleAutoAddPosFee = () => {
    if (record.incomes.card <= 0) return;
    const fee = Math.round(record.incomes.card * 0.021);
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}-pos`,
      category: 'banka',
      title: 'POS Banka Komisyon Kesintisi (%2.1)',
      amount: fee,
      paymentMethod: 'kart_banka',
      createdAt: new Date().toISOString(),
    };
    const newExpenses = [...record.expenses, newItem];
    const totalExpense = newExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = record.incomes.totalRevenue - totalExpense;
    const profitMarginPercent = record.incomes.totalRevenue > 0 ? (netProfit / record.incomes.totalRevenue) * 100 : 0;

    const updated: DailyRecord = {
      ...record,
      expenses: newExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
    };
    setRecord(updated);
    saveDailyRecord(updated);
    triggerSavedNotice();
  };

  // Date step helper
  const handleDateStep = (direction: -1 | 1) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + direction);
    const newYear = dateObj.getFullYear();
    const newMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newDay = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
  };

  // Campaign Toggle
  const toggleCampaignDay = () => {
    const updated: DailyRecord = {
      ...record,
      isCampaignDay: !record.isCampaignDay,
    };
    setRecord(updated);
    saveDailyRecord(updated);
    triggerSavedNotice();
  };

  // Cash Reconciliation Calculation
  const nakitGiderler = record.expenses
    .filter((e) => e.paymentMethod === 'nakit')
    .reduce((sum, e) => sum + e.amount, 0);
  const expectedCashInDrawer = record.incomes.cash - nakitGiderler;
  const actualCashNum = parseFloat(actualCashInput) || 0;
  const cashDifference = actualCashInput !== '' ? actualCashNum - expectedCashInDrawer : 0;

  const handleUpdateCashDrawer = (value: string) => {
    setActualCashInput(value);
    const actual = parseFloat(value);
    const diff = !isNaN(actual) ? actual - expectedCashInDrawer : 0;

    const updated: DailyRecord = {
      ...record,
      cashReconciliation: {
        actualCashInDrawer: isNaN(actual) ? 0 : actual,
        systemCashExpected: expectedCashInDrawer,
        difference: diff,
        status: isNaN(actual) || diff === 0 ? 'balanced' : diff > 0 ? 'surplus' : 'shortage',
      },
    };
    setRecord(updated);
    saveDailyRecord(updated);
    triggerSavedNotice();
  };

  // Notes update
  const handleNotesChange = (text: string) => {
    const updated: DailyRecord = {
      ...record,
      generalNotes: text,
    };
    setRecord(updated);
    saveDailyRecord(updated);
  };

  const isSelected15th = selectedDate.endsWith('-15');
  const avgOrderValue = record.incomes.orderCount > 0 ? record.incomes.totalRevenue / record.incomes.orderCount : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Date Header & Control Toolbar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-950 border border-stone-700/80 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => handleDateStep(-1)}
              className="p-2 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-red-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-stone-100 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => handleDateStep(1)}
              className="p-2 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(getTodayDateStr())}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedDate === getTodayDateStr()
                ? 'bg-stone-800 text-stone-200 border-stone-600'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-stone-700'
            }`}
          >
            Bugün
          </button>

          <div className="text-xs font-medium text-stone-400 px-2 py-1">
            {formatDateTr(selectedDate, 'full')}
          </div>
        </div>

        {/* Campaign & Save Status */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          {/* Campaign Day Toggle */}
          <button
            onClick={toggleCampaignDay}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              record.isCampaignDay || isSelected15th
                ? 'bg-red-600/20 text-red-400 border-red-500/50 shadow-md shadow-red-950/40'
                : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
            }`}
            title="Her ayın 15'i %50 bedava kampanyası veya şube özel kampanya günü"
          >
            <Flame className={`w-4 h-4 ${record.isCampaignDay || isSelected15th ? 'text-red-500 animate-pulse' : 'text-stone-500'}`} />
            <span>15'i Kampanya Günü</span>
            {(record.isCampaignDay || isSelected15th) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Auto-saved badge */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            {isSavedRecently ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                <Check className="w-3.5 h-3.5" /> Kaydedildi
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-500">
                <Save className="w-3.5 h-3.5" /> Otomatik Kayıt Açık
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Live KPI Cards for the Day */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>GÜNLÜK TOPLAM CİRO</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(record.incomes.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Kart + Nakit + Online</span>
            <span className="text-emerald-400 font-semibold">{record.incomes.orderCount} Sipariş</span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Total Expense */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>GÜNLÜK TOPLAM GİDER</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(record.totalExpense)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>{record.expenses.length} Masraf Kalemi</span>
            <span className="text-rose-400 font-semibold">
              {record.incomes.totalRevenue > 0
                ? `%${((record.totalExpense / record.incomes.totalRevenue) * 100).toFixed(1)} Ciro Payı`
                : '%0'}
            </span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
        </div>

        {/* Net Profit */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>GÜNLÜK NET KÂR / ZARAR</span>
            <div
              className={`p-1.5 rounded-lg ${
                record.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              record.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(record.netProfit)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Net Kâr Marjı</span>
            <span
              className={`font-bold ${
                record.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPercent(record.profitMarginPercent, { showSign: true })}
            </span>
          </div>
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              record.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Avg Ticket / Order KPI */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-1">
            <span>ORTALAMA FİŞ / SEPET</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {formatCurrency(avgOrderValue, { showCents: false })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Toplam Sipariş</span>
            <span className="text-amber-400 font-semibold">{record.incomes.orderCount} adet</span>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
        </div>
      </div>

      {/* Main Grid: Left Column = Income Panel, Right Column = Expense Entry & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: GELİRLER PANELİ (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">Günlük Gelir Girişi</h3>
                  <p className="text-xs text-stone-400">Kart, nakit ve online platform hasılatları</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. KREDİ / BANKA KARTI */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 focus-within:border-blue-500 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>Kredi / Banka Kartı (POS)</span>
                  </label>
                  <span className="text-[11px] font-medium text-stone-400">
                    {record.incomes.totalRevenue > 0
                      ? `%${((record.incomes.card / record.incomes.totalRevenue) * 100).toFixed(1)} pay`
                      : '%0'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                    ₺
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={record.incomes.card || ''}
                    onChange={(e) => updateIncomeField('card', parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-8 pr-3 py-2 text-stone-100 font-bold text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 2. NAKİT HASILAT */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 focus-within:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Nakit Kasa Geliri</span>
                  </label>
                  <span className="text-[11px] font-medium text-stone-400">
                    {record.incomes.totalRevenue > 0
                      ? `%${((record.incomes.cash / record.incomes.totalRevenue) * 100).toFixed(1)} pay`
                      : '%0'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                    ₺
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={record.incomes.cash || ''}
                    onChange={(e) => updateIncomeField('cash', parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-8 pr-3 py-2 text-stone-100 font-bold text-base focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 3. ONLINE SİPARİŞLER (Yemeksepeti, Trendyol, Getir, Migros) */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 focus-within:border-orange-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-orange-400" />
                    <span>Online Sipariş Platformları Toplamı</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOnlineDetails(!showOnlineDetails)}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer underline"
                  >
                    {showOnlineDetails ? 'Detayları Gizle' : 'Kanal Kırılımı Gir'}
                  </button>
                </div>

                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                    ₺
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={record.incomes.onlineTotal || ''}
                    onChange={(e) => updateIncomeField('onlineTotal', parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-8 pr-3 py-2 text-stone-100 font-bold text-base focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Sub-channel breakdown */}
                {showOnlineDetails && (
                  <div className="space-y-2.5 pt-2 border-t border-stone-800">
                    <div className="text-[11px] font-semibold text-stone-400">
                      Platform Bazlı Dağılım (Otomatik Toplanır):
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-stone-400 font-medium block mb-1">
                          Yemeksepeti
                        </label>
                        <input
                          type="number"
                          placeholder="0 ₺"
                          value={record.incomes.onlineDetails.yemeksepeti || ''}
                          onChange={(e) => updateOnlineDetailField('yemeksepeti', parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-900/80 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-stone-400 font-medium block mb-1">
                          Trendyol Yemek
                        </label>
                        <input
                          type="number"
                          placeholder="0 ₺"
                          value={record.incomes.onlineDetails.trendyol || ''}
                          onChange={(e) => updateOnlineDetailField('trendyol', parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-900/80 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-stone-400 font-medium block mb-1">
                          GetirYemek
                        </label>
                        <input
                          type="number"
                          placeholder="0 ₺"
                          value={record.incomes.onlineDetails.getir || ''}
                          onChange={(e) => updateOnlineDetailField('getir', parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-900/80 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-stone-400 font-medium block mb-1">
                          Migros & Diğer
                        </label>
                        <input
                          type="number"
                          placeholder="0 ₺"
                          value={
                            (record.incomes.onlineDetails.migros || 0) +
                            (record.incomes.onlineDetails.digerOnline || 0) || ''
                          }
                          onChange={(e) => updateOnlineDetailField('migros', parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-900/80 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. SİPARİŞ VE FİŞ ADEDİ */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5">
                <label className="text-xs font-bold text-stone-300 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-purple-400" />
                    <span>Günlük Toplam Fiş / Sipariş Adedi</span>
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Ort. {formatCurrency(avgOrderValue, { showCents: false })} / fiş
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Örn: 95"
                  value={record.incomes.orderCount || ''}
                  onChange={(e) => updateIncomeField('orderCount', parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 font-bold text-base focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* KASA MUTABAKATI (CASH DRAWER RECONCILIATION) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ₺
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100">Gün Sonu Kasa Mutabakatı</h4>
                  <p className="text-[11px] text-stone-400">Nakit hasılat vs Nakit ödenen masraflar</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-stone-300">
                <span>Nakit Gelir:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(record.incomes.cash)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>Nakit Ödenen Masraflar:</span>
                <span className="font-bold text-rose-400">-{formatCurrency(nakitGiderler)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950 border border-stone-800 font-semibold">
                <span className="text-stone-300">Kasada Olması Gereken:</span>
                <span className="font-extrabold text-stone-100">{formatCurrency(expectedCashInDrawer)}</span>
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-medium">
                  Kasada Fiilen Sayılan Nakit (TL):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Sayılan nakit tutarı"
                    value={actualCashInput}
                    onChange={(e) => handleUpdateCashDrawer(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-7 pr-3 py-1.5 text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {actualCashInput !== '' && (
                <div
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-bold ${
                    Math.abs(cashDifference) < 0.01
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : cashDifference > 0
                        ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {Math.abs(cashDifference) < 0.01 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {Math.abs(cashDifference) < 0.01
                      ? 'Kasa Tam Mutabık'
                      : cashDifference > 0
                        ? 'Kasa Fazlası Var'
                        : 'Kasa Açığı / Eksiği Var'}
                  </span>
                  <span>{cashDifference > 0 ? `+${formatCurrency(cashDifference)}` : formatCurrency(cashDifference)}</span>
                </div>
              )}
            </div>
          </div>

          {/* GÜN NOTLARI */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <label className="text-xs font-bold text-stone-300 block mb-2">
              Gün Sonu Yönetici Notu & Açıklama
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Hava yağmurlu olduğu için paket servis yoğun oldu, akşam saatlerinde çiğ köfte tükendi..."
              value={record.generalNotes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: MASRAFLAR VE GİDERLER (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* EXPENSE ENTRY FORM */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600/10 text-rose-500 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">Yeni Masraf / Gider Ekle</h3>
                  <p className="text-xs text-stone-400">Hammadde, personel, fatura ve günlük harcamalar</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/40">
                Toplam Gider: {formatCurrency(record.totalExpense)}
              </div>
            </div>

            {/* Quick Template Chips for Fast Entry */}
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-stone-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hızlı Masraf Şablonları:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddQuickExpense('Komagene Çiğ Köfte & Lavaş Sevkiyatı', 'hammadde', 'kart_banka')}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-rose-300 border border-stone-700 transition-colors cursor-pointer"
                >
                  + Çiğ Köfte Sevkiyatı
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickExpense('Paket Kurye Yevmiye & Yakıt Bedeli', 'kurye', 'nakit', 950)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-teal-300 border border-stone-700 transition-colors cursor-pointer"
                >
                  + Kurye Yevmiyesi
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickExpense('Personel Günlük Yemek & Yol Harçlığı', 'personel', 'nakit', 550)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-blue-300 border border-stone-700 transition-colors cursor-pointer"
                >
                  + Personel Yemeği
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickExpense('Ambalaj, Poşet ve Dürüm Kağıdı', 'ambalaj', 'kart_banka')}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-purple-300 border border-stone-700 transition-colors cursor-pointer"
                >
                  + Ambalaj & Poşet
                </button>
                {record.incomes.card > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoAddPosFee}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-[11px] font-medium text-indigo-300 border border-indigo-700/50 transition-colors cursor-pointer"
                    title="Kart cirosunun %2.1'i olarak POS komisyonunu otomatik hesaplar ve ekler"
                  >
                    ⚡ POS Komisyonunu Otomatik Ekle
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Gider Açıklaması *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Komagene Genel Merkez sevkiyatı, dükkan elektriği, yeşillik..."
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Tutar (TL) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">
                      ₺
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0,00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm text-stone-100 font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Kategori *
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {Object.values(EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) =>
                      setExpensePaymentMethod(e.target.value as 'nakit' | 'kart_banka' | 'vadeli_fatura')
                    }
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="nakit">💵 Nakit Kasa</option>
                    <option value="kart_banka">💳 Banka Transferi / Şirket Kartı</option>
                    <option value="vadeli_fatura">📄 Vadeli / Cari Fatura</option>
                  </select>
                </div>

                {/* Supplier / Receipt */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Tedarikçi / Fiş No (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Yörpaş A.Ş. / FTR-10293"
                    value={expenseSupplier}
                    onChange={(e) => setExpenseSupplier(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/60 transition-all cursor-pointer border border-red-500/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Masrafı Kaydet</span>
                </button>
              </div>
            </form>
          </div>

          {/* LIST OF EXPENSES FOR THE DAY */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-400" />
                <h4 className="text-sm font-bold text-stone-100">
                  Günün Masraf Dökümü ({record.expenses.length})
                </h4>
              </div>
              <span className="text-xs text-stone-400">
                Toplam: <strong className="text-stone-100">{formatCurrency(record.totalExpense)}</strong>
              </span>
            </div>

            {record.expenses.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs sm:text-sm">
                Bu tarih için henüz kayıtlı masraf bulunmuyor. Yukarıdaki formdan ekleyebilirsiniz.
              </div>
            ) : (
              <div className="divide-y divide-stone-800/80 max-h-[380px] overflow-y-auto pr-1">
                {record.expenses.map((item) => {
                  const cat = EXPENSE_CATEGORIES[item.category] || EXPENSE_CATEGORIES.diger;
                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-stone-800/30 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                          title={cat.name}
                        />
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-bold text-stone-200 truncate">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                              {cat.shortName}
                            </span>
                            <span>•</span>
                            <span>
                              {item.paymentMethod === 'nakit'
                                ? '💵 Nakit'
                                : item.paymentMethod === 'kart_banka'
                                  ? '💳 Banka/Kart'
                                  : '📄 Vadeli'}
                            </span>
                            {item.supplier && (
                              <>
                                <span>•</span>
                                <span className="text-stone-500 truncate max-w-[120px]">
                                  {item.supplier}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs sm:text-sm font-black text-rose-400">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(item.id)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Masrafı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
