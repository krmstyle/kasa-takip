import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Settings,
  Flame,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Building2,
  Calendar,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatDateTr, getTodayDateStr } from '../utils/formatters';

interface HeaderProps {
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExportModal, onOpenSettingsModal }) => {
  const { branch, resetToSampleData, records } = useFinancial();

  const [showSampleConfirm, setShowSampleConfirm] = useState(false);
  const [justReset, setJustReset] = useState(false);

  const todayStr = getTodayDateStr();
  const is15th = new Date().getDate() === 15;

  const handleReset = () => {
    resetToSampleData();
    setShowSampleConfirm(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2000);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* 15'i Kampanya Bildirim Bandı */}
      {is15th && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-4 py-1.5 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs">
          <Flame className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse" />
          <span>BUGÜN KOMAGENE HER AYIN 15'İ %50 BEDAVA KAMPANYA GÜNÜ!</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
            ÖZEL GÜN
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white font-black text-lg shadow-sm shadow-red-600/30">
              K
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span className="text-red-600">KOMAGENE</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="text-slate-700 font-bold text-xs sm:text-sm">
                    Kasa & Gelir Takip Paneli
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  {branch.branchCode || 'KMG-3482'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="truncate max-w-[200px] sm:max-w-[300px]">
                  {branch.branchName}
                </span>
                <span>•</span>
                <span>{formatDateTr(todayStr, 'short')}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Excel İndir / Raporlar */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Excel Raporlama Menüsü"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Raporlar & Excel</span>
            </button>

            {/* Örnek Veri */}
            <div className="relative">
              <button
                onClick={() => setShowSampleConfirm(!showSampleConfirm)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Örnek Veri Yükle"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${justReset ? 'animate-spin text-emerald-600' : ''}`} />
                <span className="hidden md:inline">Örnek Veri</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSampleConfirm && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Örnek Komagene Verilerini Yükle</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Ağustos, Temmuz ve Haziran aylarına ait zengin ciro, kart/nakit/online ve genel merkez masraf şablonunu yükler.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowSampleConfirm(false)}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Yükle
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Şube Ayarları */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Şube Bilgileri & Ayarlar"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
