import React from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Trash2,
  Plus,
  Flame,
  Edit3,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { EXPENSE_CATEGORIES, DailyRecord } from '../types';
import { formatCurrency, formatDateTr } from '../utils/formatters';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onEditKasa: () => void;
  onAddMasraf: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  onEditKasa,
  onAddMasraf,
}) => {
  const { records, saveDailyRecord } = useFinancial();

  if (!isOpen) return null;

  const record: DailyRecord | undefined = records[date];

  const handleDeleteExpense = (expenseId: string) => {
    if (!record) return;
    const newExpenses = record.expenses.filter((e) => e.id !== expenseId);
    const totalExpense = newExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = record.incomes.totalRevenue - totalExpense;
    const profitMarginPercent =
      record.incomes.totalRevenue > 0 ? (netProfit / record.incomes.totalRevenue) * 100 : 0;

    saveDailyRecord({
      ...record,
      expenses: newExpenses,
      totalExpense,
      netProfit,
      profitMarginPercent,
    });
  };

  const isCampaign = record?.isCampaignDay || date.endsWith('-15');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pr-8">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {formatDateTr(date, 'full')}
              </h3>
              {isCampaign && (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded text-[11px] font-extrabold">
                  <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  15'i Kampanya Günü
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Günlük gelir kırılımı ve kaydedilen masraflar</p>
          </div>
        </div>

        {/* Ciro Özeti Kutuları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
            <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Kart (POS)
            </div>
            <div className="text-sm font-extrabold text-blue-900 mt-1">
              {formatCurrency(record?.incomes.card || 0)}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
            <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> Nakit
            </div>
            <div className="text-sm font-extrabold text-emerald-900 mt-1">
              {formatCurrency(record?.incomes.cash || 0)}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Online
            </div>
            <div className="text-sm font-extrabold text-amber-900 mt-1">
              {formatCurrency(record?.incomes.onlineTotal || 0)}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-2.5">
            <div className="text-[11px] font-bold text-slate-300">Toplam Ciro</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">
              {formatCurrency(record?.incomes.totalRevenue || 0)}
            </div>
          </div>
        </div>

        {/* Online platform breakdown if exists */}
        {record?.incomes.onlineDetails &&
          (record.incomes.onlineDetails.yemeksepeti > 0 ||
            record.incomes.onlineDetails.trendyol > 0 ||
            record.incomes.onlineDetails.getir > 0 ||
            record.incomes.onlineDetails.migros > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div className="font-bold text-slate-700 mb-2">Online Platform Dağılımı:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  Yemeksepeti:{' '}
                  <strong className="text-slate-900">
                    {formatCurrency(record.incomes.onlineDetails.yemeksepeti)}
                  </strong>
                </div>
                <div>
                  Trendyol:{' '}
                  <strong className="text-slate-900">
                    {formatCurrency(record.incomes.onlineDetails.trendyol)}
                  </strong>
                </div>
                <div>
                  Getir:{' '}
                  <strong className="text-slate-900">
                    {formatCurrency(record.incomes.onlineDetails.getir)}
                  </strong>
                </div>
                <div>
                  Migros:{' '}
                  <strong className="text-slate-900">
                    {formatCurrency(record.incomes.onlineDetails.migros)}
                  </strong>
                </div>
              </div>
            </div>
          )}

        {/* Masraflar Listesi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Günün Masrafları ({record?.expenses.length || 0} Adet)</span>
            </div>
            <div className="text-xs font-extrabold text-rose-600">
              Toplam: {formatCurrency(record?.totalExpense || 0)}
            </div>
          </div>

          {!record || record.expenses.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              Bu tarihe ait henüz masraf kaydedilmemiş.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {record.expenses.map((exp) => {
                const cat = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.diger;
                return (
                  <div
                    key={exp.id}
                    className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{exp.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {cat.shortName}
                        </span>
                        <span>
                          {exp.paymentMethod === 'nakit'
                            ? '💵 Nakit'
                            : exp.paymentMethod === 'kart_banka'
                            ? '💳 Kart/Banka'
                            : '📄 Vadeli'}
                        </span>
                        {exp.supplier && <span>• {exp.supplier}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-rose-600">
                        {formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Sil"
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

        {/* Net Kâr Kartı */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Günün Net Kârı:</span>
            <div
              className={`text-lg font-black ${
                (record?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(record?.netProfit || 0)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium">Kâr Marjı:</span>
            <div className="text-sm font-bold text-slate-800">
              %{record?.profitMarginPercent?.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onAddMasraf();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
          >
            <Plus className="w-4 h-4" />
            <span>Masraf Ekle</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEditKasa();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Kasayı Düzenle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
