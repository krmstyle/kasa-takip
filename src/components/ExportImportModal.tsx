import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  Database,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import {
  exportMonthToExcel,
  exportAllHistoryToExcel,
  exportComparativeToExcel,
} from '../utils/excelExport';
import { getMonthNameFromKey } from '../utils/formatters';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const {
    records,
    branch,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getMonthSummary,
    getComparativeData,
    exportDataToJson,
    importDataFromJson,
  } = useFinancial();

  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importErrorMessage, setImportErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleExportCurrentMonth = () => {
    const summary = getMonthSummary(selectedMonth);
    exportMonthToExcel(selectedMonth, records, summary, branch);
  };

  const handleExportAll = () => {
    exportAllHistoryToExcel(records, branch);
  };

  const handleExportComparative = () => {
    const compData = getComparativeData();
    exportComparativeToExcel(compData, branch);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Komagene_${branch.branchCode || 'Sube'}_Mali_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importDataFromJson(text);
        if (ok) {
          setImportStatus('success');
          setTimeout(() => {
            setImportStatus('idle');
            onClose();
          }, 1500);
        } else {
          setImportStatus('error');
          setImportErrorMessage('Geçersiz dosya formatı veya veri yapısı.');
        }
      } catch (err) {
        setImportStatus('error');
        setImportErrorMessage('Dosya okunurken bir hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Excel Raporlama & Yedekleme
            </h3>
            <p className="text-xs text-slate-500">
              Tüm gelir ve masraf verilerini resmi Excel (.xlsx) formatında indirin
            </p>
          </div>
        </div>

        {/* Export Options Cards */}
        <div className="space-y-3">
          {/* 1. Seçilen Ayın Detaylı Excel Raporu */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Aylık Resmi Mali Rapor (.xlsx)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ÖNERİLEN
                </span>
              </div>
              <p className="text-xs text-slate-500">
                P&L Özeti, Günlük Gelirler, Günlük Masraflar ve Kasa Mutabakatını içeren tam çalışma kitabı.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600 font-semibold">Ay Seçin:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {getMonthNameFromKey(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleExportCurrentMonth}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Aylık Excel'i İndir</span>
            </button>
          </div>

          {/* 2. Tüm Zamanlar / Tüm Geçmiş Excel Raporu */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-sm text-slate-900">
                Tüm Zamanlar Mali Geçmişi (.xlsx)
              </span>
              <p className="text-xs text-slate-500">
                Sistemdeki tüm kayıtlı günlerin (Ciro, Kart, Nakit, Online, Masraf, Kâr) dökümü.
              </p>
            </div>

            <button
              onClick={handleExportAll}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Tümünü İndir</span>
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span>Sistem Veri Yedeği (.json)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Yedek Dosyası İndir</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Yedekten Geri Yükle</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus === 'success' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Yedek başarıyla geri yüklendi!</span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{importErrorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
