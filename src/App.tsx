import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Header } from './components/Header';
import { SimpleDashboard } from './components/SimpleDashboard';
import { ExportImportModal } from './components/ExportImportModal';
import { BranchSettingsModal } from './components/BranchSettingsModal';

const MainContent: React.FC = () => {
  const { branch } = useFinancial();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Single Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SimpleDashboard />
      </main>

      {/* Modals */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <BranchSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-bold text-slate-700">Komagene Etsiz Çiğ Köfte</span>
            <span>•</span>
            <span className="text-slate-600">{branch.branchName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
            <span>Kart, Nakit & Online Gelir Takibi</span>
            <span>•</span>
            <span>Her Ayın 15'i Kampanya Desteği</span>
            <span>•</span>
            <span>Excel (.xlsx) Aktarımı</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <MainContent />
    </FinancialProvider>
  );
}
