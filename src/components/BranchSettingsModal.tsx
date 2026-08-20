import React, { useState } from 'react';
import {
  X,
  Building2,
  Save,
  Check,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { BranchProfile } from '../types';

interface BranchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchSettingsModal: React.FC<BranchSettingsModalProps> = ({ isOpen, onClose }) => {
  const { branch, updateBranch } = useFinancial();

  const [form, setForm] = useState<BranchProfile>({ ...branch });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranch(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
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
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Komagene Şube Bilgileri
            </h3>
            <p className="text-xs text-slate-500">
              Şube adını, kodunu ve hedeflerini güncelleyin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            {/* Branch Name */}
            <div>
              <label className="text-slate-700 font-bold block mb-1">
                Şube / Bayi Adı *
              </label>
              <input
                type="text"
                required
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Branch Code & Manager */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Şube Kodu
                </label>
                <input
                  type="text"
                  value={form.branchCode}
                  onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
                  placeholder="KMG-XXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Şube Yetkilisi
                </label>
                <input
                  type="text"
                  value={form.managerName}
                  onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* City & District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  İlçe / Semt
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Targets */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Aylık Ciro Hedefi (TL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.monthlyRevenueTarget || ''}
                  onChange={(e) =>
                    setForm({ ...form, monthlyRevenueTarget: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Aylık Dükkan Kirası (TL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={form.estimatedRentMonthly || ''}
                  onChange={(e) =>
                    setForm({ ...form, estimatedRentMonthly: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Ayarları Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
