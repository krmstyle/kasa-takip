import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Save,
  Check,
  Calculator,
  Flame,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { DailyRecord } from '../types';
import { formatCurrency, getTodayDateStr } from '../utils/formatters';

interface KasaYapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const KasaYapModal: React.FC<KasaYapModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { records, saveDailyRecord, setSelectedDate } = useFinancial();

  const [date, setDate] = useState<string>(initialDate || getTodayDateStr());
  const [card, setCard] = useState<string>('0');
  const [cash, setCash] = useState<string>('0');
  const [onlineTotal, setOnlineTotal] = useState<string>('0');
  const [orderCount, setOrderCount] = useState<string>('0');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isCampaignDay, setIsCampaignDay] = useState<boolean>(false);
  const [showPlatformDetails, setShowPlatformDetails] = useState<boolean>(false);

  // Platform details
  const [yemeksepeti, setYemeksepeti] = useState<string>('0');
  const [trendyol, setTrendyol] = useState<string>('0');
  const [getir, setGetir] = useState<string>('0');
  const [migros, setMigros] = useState<string>('0');
  const [digerOnline, setDigerOnline] = useState<string>('0');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // When modal opens or initialDate changes, load existing record for that date
  useEffect(() => {
    const targetDate = initialDate || date || getTodayDateStr();
    setDate(targetDate);
    loadRecordForDate(targetDate);
  }, [isOpen, initialDate]);

  const loadRecordForDate = (targetDate: string) => {
    const existing = records[targetDate];
    const is15 = targetDate.endsWith('-15');
    if (existing) {
      setCard(existing.incomes.card > 0 ? existing.incomes.card.toString() : '');
      setCash(existing.incomes.cash > 0 ? existing.incomes.cash.toString() : '');
      setOnlineTotal(existing.incomes.onlineTotal > 0 ? existing.incomes.onlineTotal.toString() : '');
      setOrderCount(existing.incomes.orderCount > 0 ? existing.incomes.orderCount.toString() : '');
      setGeneralNotes(existing.generalNotes || '');
      setIsCampaignDay(existing.isCampaignDay || is15);

      if (existing.incomes.onlineDetails) {
        setYemeksepeti(existing.incomes.onlineDetails.yemeksepeti > 0 ? existing.incomes.onlineDetails.yemeksepeti.toString() : '');
        setTrendyol(existing.incomes.onlineDetails.trendyol > 0 ? existing.incomes.onlineDetails.trendyol.toString() : '');
        setGetir(existing.incomes.onlineDetails.getir > 0 ? existing.incomes.onlineDetails.getir.toString() : '');
        setMigros(existing.incomes.onlineDetails.migros > 0 ? existing.incomes.onlineDetails.migros.toString() : '');
        setDigerOnline(existing.incomes.onlineDetails.digerOnline > 0 ? existing.incomes.onlineDetails.digerOnline.toString() : '');
      }
    } else {
      setCard('');
      setCash('');
      setOnlineTotal('');
      setOrderCount('');
      setGeneralNotes('');
      setIsCampaignDay(is15);
      setYemeksepeti('');
      setTrendyol('');
      setGetir('');
      setMigros('');
      setDigerOnline('');
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    loadRecordForDate(newDate);
  };

  // Sync platform details to online total if user fills platform details
  const updatePlatformDetails = (
    field: 'yemeksepeti' | 'trendyol' | 'getir' | 'migros' | 'digerOnline',
    val: string
  ) => {
    let ys = parseFloat(field === 'yemeksepeti' ? val : yemeksepeti) || 0;
    let tr = parseFloat(field === 'trendyol' ? val : trendyol) || 0;
    let gt = parseFloat(field === 'getir' ? val : getir) || 0;
    let mg = parseFloat(field === 'migros' ? val : migros) || 0;
    let dg = parseFloat(field === 'digerOnline' ? val : digerOnline) || 0;

    if (field === 'yemeksepeti') setYemeksepeti(val);
    if (field === 'trendyol') setTrendyol(val);
    if (field === 'getir') setGetir(val);
    if (field === 'migros') setMigros(val);
    if (field === 'digerOnline') setDigerOnline(val);

    const sum = ys + tr + gt + mg + dg;
    if (sum > 0) {
      setOnlineTotal(sum.toString());
    }
  };

  const numCard = parseFloat(card) || 0;
  const numCash = parseFloat(cash) || 0;
  const numOnline = parseFloat(onlineTotal) || 0;
  const numOrderCount = parseInt(orderCount) || 0;
  const totalDailyRevenue = numCard + numCash + numOnline;

  const existingRecord = records[date];
  const existingExpenses = existingRecord ? existingRecord.expenses : [];
  const totalExpense = existingExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalDailyRevenue - totalExpense;
  const profitMarginPercent = totalDailyRevenue > 0 ? (netProfit / totalDailyRevenue) * 100 : 0;

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const recordToSave: DailyRecord = {
      date,
      incomes: {
        card: numCard,
        cash: numCash,
        onlineTotal: numOnline,
        onlineDetails: {
          yemeksepeti: parseFloat(yemeksepeti) || 0,
          trendyol: parseFloat(trendyol) || 0,
          getir: parseFloat(getir) || 0,
          migros: parseFloat(migros) || 0,
          digerOnline: parseFloat(digerOnline) || 0,
        },
        totalRevenue: totalDailyRevenue,
        orderCount: numOrderCount,
      },
      expenses: existingExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
      isCampaignDay: isCampaignDay || date.endsWith('-15'),
      generalNotes,
      updatedAt: new Date().toISOString(),
    };

    saveDailyRecord(recordToSave);
    setSelectedDate(date);
    setSavedSuccess(true);
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
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Gün Sonu Kasa Yap (Gelir Girişi)
            </h3>
            <p className="text-xs text-slate-500">
              Kart, nakit ve online satış tutarlarını girip günün cirosunu kaydedin
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Tarih Seçimi */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-700">Kasa Tarihi:</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 shadow-xs"
              />
              {date.endsWith('-15') && (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-md text-[11px] font-extrabold">
                  <Flame className="w-3 h-3 text-red-600 fill-red-600" />
                  15'i Kampanyası
                </span>
              )}
            </div>
          </div>

          {/* Gelir Alanları (Kart, Nakit, Online) */}
          <div className="space-y-3">
            {/* 1. Kredi / POS Kartı */}
            <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Kredi / Banka Kartı (POS) Toplamı</span>
                </label>
                <span className="text-[11px] text-blue-600 font-semibold">₺ TL</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* 2. Nakit Kasa */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Nakit Kasa Satışları</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold">₺ TL</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 shadow-xs"
              />
            </div>

            {/* 3. Online Siparişler Toplamı */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Online Platform Siparişleri Toplamı</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPlatformDetails(!showPlatformDetails)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                >
                  {showPlatformDetails ? 'Platformları Gizle' : '+ Platform Kırılımı Gir'}
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={onlineTotal}
                onChange={(e) => setOnlineTotal(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 shadow-xs"
              />

              {/* Optional Platform Breakdown */}
              {showPlatformDetails && (
                <div className="pt-2 border-t border-amber-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Yemeksepeti (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={yemeksepeti}
                      onChange={(e) => updatePlatformDetails('yemeksepeti', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Trendyol Yemek (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={trendyol}
                      onChange={(e) => updatePlatformDetails('trendyol', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">GetirYemek (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={getir}
                      onChange={(e) => updatePlatformDetails('getir', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Migros Yemek (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={migros}
                      onChange={(e) => updatePlatformDetails('migros', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info: Sipariş Sayısı & Not */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>Toplam Sipariş Adedi</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Örn: 85"
                value={orderCount}
                onChange={(e) => setOrderCount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Gün Sonu Notu</span>
              </label>
              <input
                type="text"
                placeholder="Hava yağmurlu vb."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Canlı Toplam Ciro Özeti Kutusu */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                GÜNLÜK TOPLAM CİRO
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {formatCurrency(totalDailyRevenue)}
              </div>
            </div>

            <div className="text-right text-xs text-slate-300">
              <div>Kayıtlı Gider: <span className="text-rose-400 font-bold">{formatCurrency(totalExpense)}</span></div>
              <div>Tahmini Kâr: <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(netProfit)}</span></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Kasa Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Kasayı Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
