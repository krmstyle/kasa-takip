import * as XLSX from 'xlsx';
import { DailyRecord, MonthSummary, BranchProfile, EXPENSE_CATEGORIES, ComparativePeriodData } from '../types';
import { formatDateTr, getMonthNameFromKey } from './formatters';

export const exportMonthToExcel = (
  monthKey: string,
  records: Record<string, DailyRecord>,
  summary: MonthSummary,
  branch: BranchProfile
) => {
  const wb = XLSX.utils.book_new();
  const monthName = getMonthNameFromKey(monthKey);

  // 1. SHEET: AYLIK ÖZET (P&L Statement)
  const pnlData = [
    ['KOMAGENE ŞUBE MALİ TABLOSU - AYLIK KAR/ZARAR RAPORU'],
    ['Şube Adı:', branch.branchName, 'Şube Kodu:', branch.branchCode],
    ['Dönem:', monthName, 'Rapor Tarihi:', new Date().toLocaleDateString('tr-TR')],
    ['Yönetici:', branch.managerName, 'Telefon:', branch.phone || '-'],
    [''],
    ['KALEM', 'TUTAR (TL)', 'GELİRE ORANI (%)', 'AÇIKLAMA / NOT'],
    ['1. TOPLAM GELİRLER (CİRO)', summary.totalRevenue, '100.0%', 'Tüm satış kanalları toplamı'],
    ['  - Kredi / Banka Kartı Satışları', summary.totalCardRevenue, `${((summary.totalCardRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'POS cihazları hasılatı'],
    ['  - Nakit Satışlar', summary.totalCashRevenue, `${((summary.totalCashRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Dükkan içi nakit kasa hasılatı'],
    ['  - Online Platform Satışları Toplamı', summary.totalOnlineRevenue, `${((summary.totalOnlineRevenue / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Yemeksepeti, Trendyol, Getir, Migros'],
    ['     * Yemeksepeti', summary.totalOnlineDetails.yemeksepeti, `${((summary.totalOnlineDetails.yemeksepeti / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, ''],
    ['     * Trendyol Yemek', summary.totalOnlineDetails.trendyol, `${((summary.totalOnlineDetails.trendyol / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, ''],
    ['     * GetirYemek', summary.totalOnlineDetails.getir, `${((summary.totalOnlineDetails.getir / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, ''],
    ['     * Migros Yemek & Diğer', summary.totalOnlineDetails.migros + summary.totalOnlineDetails.digerOnline, `${(((summary.totalOnlineDetails.migros + summary.totalOnlineDetails.digerOnline) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, ''],
    [''],
    ['2. DİREKT MALİYETLER (COGS / ÜRÜN MALİYETİ)', summary.totalCogs, `${((summary.totalCogs / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Hammadde + Ambalaj'],
    ['  - Çiğ Köfte & Hammadde Tedariği (Genel Merkez)', summary.expensesByCategory.hammadde || 0, `${(((summary.expensesByCategory.hammadde || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Komagene GM sevkiyatları'],
    ['  - Ambalaj, Kutu & Poşet Giderleri', summary.expensesByCategory.ambalaj || 0, `${(((summary.expensesByCategory.ambalaj || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Paketleme ve sarf'],
    [''],
    ['BRÜT KÂR (CİRO - DİREKT MALİYETLER)', summary.grossProfit, `${summary.grossMarginPercent.toFixed(1)}%`, 'Faaliyet öncesi brüt kârlılık'],
    [''],
    ['3. FAALİYET GİDERLERİ (OPEX)', summary.totalOpex, `${((summary.totalOpex / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'İşletme giderleri'],
    ['  - Personel Maaş, Yevmiye & SGK', summary.expensesByCategory.personel || 0, `${(((summary.expensesByCategory.personel || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Maaşlar, avanslar, primler'],
    ['  - Dükkan Kirası & Stopaj / Aidat', summary.expensesByCategory.kira || 0, `${(((summary.expensesByCategory.kira || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Aylık kira bedeli'],
    ['  - Online Platform Komisyonları', summary.expensesByCategory.komisyon || 0, `${(((summary.expensesByCategory.komisyon || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Sipariş başı kesintiler'],
    ['  - Kurye, Paket Servis & Yakıt', summary.expensesByCategory.kurye || 0, `${(((summary.expensesByCategory.kurye || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Lojistik ve kurye yevmiyeleri'],
    ['  - Elektrik, Su, Doğalgaz Faturaları', summary.expensesByCategory.fatura || 0, `${(((summary.expensesByCategory.fatura || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Enerji ve iletişim'],
    ['  - POS & Banka Komisyonları', summary.expensesByCategory.banka || 0, `${(((summary.expensesByCategory.banka || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Banka POS kesintileri'],
    ['  - Muhasebe & Resmi Harçlar', summary.expensesByCategory.muhasebe || 0, `${(((summary.expensesByCategory.muhasebe || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Mali müşavir ve vergiler'],
    ['  - Temizlik & Hijyen Sarfı', summary.expensesByCategory.temizlik || 0, `${(((summary.expensesByCategory.temizlik || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Deterjan, eldiven vb.'],
    ['  - Diğer Çeşitli Giderler', summary.expensesByCategory.diger || 0, `${(((summary.expensesByCategory.diger || 0) / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Beklenmeyen giderler'],
    [''],
    ['TOPLAM TÜM GİDERLER (COGS + OPEX)', summary.totalExpense, `${((summary.totalExpense / (summary.totalRevenue || 1)) * 100).toFixed(1)}%`, 'Tüm masraflar toplamı'],
    ['NET KÂR / ZARAR', summary.netProfit, `${summary.netProfitMarginPercent.toFixed(1)}%`, summary.netProfit >= 0 ? 'NET KÂR' : 'NET ZARAR'],
    [''],
    ['ÖNEMLİ İSTATİSTİKLER'],
    ['Kayıtlı Gün Sayısı:', summary.daysLogged, 'Toplam Sipariş / Fiş Adedi:', summary.totalOrderCount],
    ['Günlük Ortalama Ciro:', summary.averageDailyRevenue, 'Ortalama Fiş / Sepet Tutarı:', summary.averageOrderValue],
    ['Günlük Ortalama Masraf:', summary.averageDailyExpense, 'Günlük Ortalama Net Kâr:', summary.averageDailyProfit],
    ["15'i Kampanya Günü Cirosu:", summary.campaignDay15Revenue, "15'i Kampanya Net Kârı:", summary.campaignDay15Profit],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(pnlData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Aylik_Kar_Zarar_Ozeti');

  // 2. SHEET: GÜNLÜK GELİRLER
  const monthRecords = Object.values(records)
    .filter((r) => r.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const incomeHeaders = [
    'Tarih',
    'Gün',
    'Kart Geliri (TL)',
    'Nakit Gelir (TL)',
    'Yemeksepeti (TL)',
    'Trendyol (TL)',
    'Getir (TL)',
    'Migros (TL)',
    'Diğer Online (TL)',
    'Toplam Online (TL)',
    'TOPLAM CİRO (TL)',
    'Fiş/Sipariş Adedi',
    'Ortalama Sepet (TL)',
    'Kampanya Günü',
    'Notlar',
  ];

  const incomeRows = monthRecords.map((r) => {
    const is15 = r.isCampaignDay ? "15'i Kampanyası" : 'Normal';
    const aov = r.incomes.orderCount > 0 ? (r.incomes.totalRevenue / r.incomes.orderCount).toFixed(2) : '0';
    return [
      r.date,
      formatDateTr(r.date, 'dayOnly'),
      r.incomes.card,
      r.incomes.cash,
      r.incomes.onlineDetails.yemeksepeti,
      r.incomes.onlineDetails.trendyol,
      r.incomes.onlineDetails.getir,
      r.incomes.onlineDetails.migros,
      r.incomes.onlineDetails.digerOnline,
      r.incomes.onlineTotal,
      r.incomes.totalRevenue,
      r.incomes.orderCount,
      Number(aov),
      is15,
      r.generalNotes || '',
    ];
  });

  const wsIncome = XLSX.utils.aoa_to_sheet([incomeHeaders, ...incomeRows]);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Gunluk_Gelirler');

  // 3. SHEET: GÜNLÜK TÜM MASRAFLAR (Detailed Ledger)
  const expenseHeaders = [
    'Tarih',
    'Kategori Kodu',
    'Kategori Adı',
    'Gider Açıklaması',
    'Tutar (TL)',
    'Ödeme Yöntemi',
    'Tedarikçi / Muhatap',
    'Fiş / Fatura No',
    'Not',
  ];

  const expenseRows: any[] = [];
  monthRecords.forEach((r) => {
    r.expenses.forEach((e) => {
      expenseRows.push([
        r.date,
        e.category,
        EXPENSE_CATEGORIES[e.category]?.shortName || e.category,
        e.title,
        e.amount,
        e.paymentMethod === 'nakit' ? 'Nakit Kasa' : e.paymentMethod === 'kart_banka' ? 'Banka / Kart' : 'Vadeli / Cari',
        e.supplier || '-',
        e.receiptNo || '-',
        e.notes || '',
      ]);
    });
  });

  const wsExpenses = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Gunluk_Masraflar_Detayi');

  // 4. SHEET: GÜNLÜK KAR-ZARAR VE KASA MUTABAKATI
  const plDailyHeaders = [
    'Tarih',
    'Günlük Ciro (TL)',
    'Günlük Gider (TL)',
    'Günlük Net Kâr (TL)',
    'Kâr Marjı (%)',
    'Nakit Gelir',
    'Nakit Ödenen Gider',
    'Beklenen Nakit Kasa',
    'Sayılan Nakit Kasa',
    'Kasa Farkı',
  ];

  const plDailyRows = monthRecords.map((r) => {
    const nakitGider = r.expenses
      .filter((e) => e.paymentMethod === 'nakit')
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      r.date,
      r.incomes.totalRevenue,
      r.totalExpense,
      r.netProfit,
      `${r.profitMarginPercent.toFixed(1)}%`,
      r.incomes.cash,
      nakitGider,
      r.cashReconciliation?.systemCashExpected ?? (r.incomes.cash - nakitGider),
      r.cashReconciliation?.actualCashInDrawer ?? '-',
      r.cashReconciliation?.difference ?? 0,
    ];
  });

  const wsDailyPL = XLSX.utils.aoa_to_sheet([plDailyHeaders, ...plDailyRows]);
  XLSX.utils.book_append_sheet(wb, wsDailyPL, 'Gunluk_Kar_Zarar_Kasa');

  // Save and download file
  const fileName = `Komagene_${branch.branchCode || 'Sube'}_Mali_Rapor_${monthKey}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportAllHistoryToExcel = (
  records: Record<string, DailyRecord>,
  branch: BranchProfile
) => {
  const wb = XLSX.utils.book_new();
  const allDates = Object.keys(records).sort();

  const headers = [
    'Tarih',
    'Kart Geliri (TL)',
    'Nakit Gelir (TL)',
    'Online Gelir (TL)',
    'Toplam Ciro (TL)',
    'Toplam Masraf (TL)',
    'Net Kâr / Zarar (TL)',
    'Kâr Marjı (%)',
    'Sipariş Adedi',
    'Kampanya Günü',
  ];

  const rows = allDates.map((date) => {
    const r = records[date];
    return [
      date,
      r.incomes.card,
      r.incomes.cash,
      r.incomes.onlineTotal,
      r.incomes.totalRevenue,
      r.totalExpense,
      r.netProfit,
      `${r.profitMarginPercent.toFixed(1)}%`,
      r.incomes.orderCount,
      r.isCampaignDay ? 'EVET (15\'i)' : 'HAYIR',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ['KOMAGENE TÜM ZAMANLAR MALİ GEÇMİŞ DÖKÜMÜ'],
    ['Şube:', branch.branchName, 'Şube Kodu:', branch.branchCode],
    ['Oluşturulma:', new Date().toLocaleDateString('tr-TR')],
    [''],
    headers,
    ...rows,
  ]);

  XLSX.utils.book_append_sheet(wb, ws, 'Tum_Gecmis');
  const fileName = `Komagene_Tum_Mali_Gecmis_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportComparativeToExcel = (
  compData: ComparativePeriodData[],
  branch: BranchProfile
) => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Dönem',
    'Toplam Ciro (TL)',
    'Toplam Masraf (TL)',
    'Net Kâr (TL)',
    'Kâr Marjı (%)',
    'Toplam Sipariş Sayısı',
    'Kart Payı (%)',
    'Nakit Payı (%)',
    'Online Payı (%)',
    '15\'i Kampanya Cirosu (TL)',
  ];

  const rows = compData.map((d) => [
    d.monthLabel,
    d.revenue,
    d.expense,
    d.profit,
    `${d.marginPercent.toFixed(1)}%`,
    d.orderCount,
    `${d.cardShare.toFixed(1)}%`,
    `${d.cashShare.toFixed(1)}%`,
    `${d.onlineShare.toFixed(1)}%`,
    d.day15Revenue,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ['KOMAGENE DÖNEMSEL KARŞILAŞTIRMA VE TREND ANALİZİ'],
    ['Şube:', branch.branchName, 'Şube Kodu:', branch.branchCode],
    [''],
    headers,
    ...rows,
  ]);

  XLSX.utils.book_append_sheet(wb, ws, 'Donem_Karsilastirma');
  const fileName = `Komagene_Karsilastirmali_Analiz_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
