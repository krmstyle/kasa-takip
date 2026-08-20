import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Calendar,
  Save,
  Check,
  Plus,
  Tag,
  DollarSign,
  Building,
  CreditCard,
  Banknote,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ExpenseCategory, EXPENSE_CATEGORIES, ExpenseItem, DailyRecord } from '../types';
import { formatCurrency, getTodayDateStr } from '../utils/formatters';

interface MasrafGirModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

const QUICK_EXPENSE_PRESETS = [
  { title: 'Komagene Çiğ Köfte & Malzeme Tedarik', category: 'hammadde' as ExpenseCategory, method: 'kart_banka' as const },
  { title: 'Personel / Usta Günlük Yevmiye', category: 'personel' as ExpenseCategory, method: 'nakit' as const },
  { title: 'Lavaş, Ambalaj & Poşet Alımı', category: 'ambalaj' as ExpenseCategory, method: 'nakit' as const },
  { title: 'Dükkan Elektrik Faturası', category: 'fatura' as ExpenseCategory, method: 'kart_banka' as const },
  { title: 'Kurye Yakıt / Paket Gideri', category: 'kurye' as ExpenseCategory, method: 'nakit' as const },
  { title: 'Dükkan Kirası', category: 'kira' as ExpenseCategory, method: 'kart_banka' as const },
  { title: 'Temizlik & Hijyen Malzemeleri', category: 'temizlik' as ExpenseCategory, method: 'nakit' as const },
];

export const MasrafGirModal: React.FC<MasrafGirModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { records, saveDailyRecord, setSelectedDate } = useFinancial();

  const [date, setDate] = useState<string>(initialDate || getTodayDateStr());
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('hammadde');
  const [paymentMethod, setPaymentMethod] = useState<'nakit' | 'kart_banka' | 'vadeli_fatura'>('nakit');
  const [supplier, setSupplier] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof QUICK_EXPENSE_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setPaymentMethod(preset.method);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const existingRecord = records[date] || {
      date,
      incomes: {
        card: 0,
        cash: 0,
        onlineTotal: 0,
        onlineDetails: { yemeksepeti: 0, trendyol: 0, getir: 0, migros: 0, digerOnline: 0 },
        totalRevenue: 0,
        orderCount: 0,
      },
      expenses: [],
      totalExpense: 0,
      netProfit: 0,
      profitMarginPercent: 0,
      isCampaignDay: date.endsWith('-15'),
      updatedAt: new Date().toISOString(),
    };

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category,
      title: title.trim(),
      amount: numAmount,
      paymentMethod,
      supplier: supplier.trim() || undefined,
      receiptNo: receiptNo.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...existingRecord.expenses];
    const totalExpense = updatedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = existingRecord.incomes.totalRevenue - totalExpense;
    const profitMarginPercent =
      existingRecord.incomes.totalRevenue > 0
        ? (netProfit / existingRecord.incomes.totalRevenue) * 100
        : 0;

    const updatedRecord: DailyRecord = {
      ...existingRecord,
      expenses: updatedExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
      updatedAt: new Date().toISOString(),
    };

    saveDailyRecord(updatedRecord);
    setSelectedDate(date);
    setSavedSuccess(true);

    // Reset form fields
    setTitle('');
    setAmount('');
    setSupplier('');
    setReceiptNo('');
    setNotes('');

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Yeni Masraf / Gider Ekle
            </h3>
            <p className="text-xs text-slate-500">
              Şube harcamalarını kaydederek net kârınızı güncel tutun
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Hızlı Şablonlar (Tıklayın):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EXPENSE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer border border-slate-200/80"
              >
                + {p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Tarih & Tutar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Masraf Tarihi *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                <span>Tutar (TL) *</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00 ₺"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-rose-300 rounded-lg px-3 py-2 text-base font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-500 shadow-xs"
              />
            </div>
          </div>

          {/* Masraf Açıklaması */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Gider Açıklaması *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 2 Koli Lavaş & Çiğ Köfte Sosu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Kategori & Ödeme Şekli */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Gider Kategorisi</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {Object.values(EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Ödeme Şekli</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="nakit">💵 Nakit Kasa</option>
                <option value="kart_banka">💳 Şirket Kartı / Banka Havalesi</option>
                <option value="vadeli_fatura">📄 Vadeli / Cari Fatura</option>
              </select>
            </div>
          </div>

          {/* Tedarikçi & Fiş No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Tedarikçi / Muhatap (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Komagene Genel Merkez / Toptancı"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Fiş / Fatura No (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: GİB-202600124"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Masraf Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Masrafı Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
