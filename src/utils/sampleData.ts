import { DailyRecord, BranchProfile, ExpenseItem } from '../types';

export const DEFAULT_BRANCH_PROFILE: BranchProfile = {
  branchName: 'Komagene Kadıköy Çarşı Şubesi',
  branchCode: 'KMG-3482',
  managerName: 'Ahmet Karataş',
  phone: '0 (216) 418 55 90',
  city: 'İstanbul',
  district: 'Kadıköy',
  monthlyRevenueTarget: 650000,
  dailyRevenueTarget: 22000,
  estimatedRentMonthly: 38000,
};

export const generateSampleData = (): Record<string, DailyRecord> => {
  const records: Record<string, DailyRecord> = {};

  // Months to generate: June 2026 (06), July 2026 (07), August 2026 (08 up to day 20)
  const periods = [
    { year: 2026, month: 6, days: 30 },
    { year: 2026, month: 7, days: 31 },
    { year: 2026, month: 8, days: 20 },
  ];

  periods.forEach(({ year, month, days }) => {
    for (let day = 1; day <= days; day++) {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFriday = dayOfWeek === 5;
      const is15th = day === 15;

      // Base revenue calculation
      let baseRevenue = 16500 + (day % 7) * 900 + (day % 3) * 600;
      if (isFriday) baseRevenue *= 1.25;
      if (isWeekend) baseRevenue *= 1.45;

      // Komagene 15th Campaign Day boost!
      if (is15th) {
        baseRevenue = 78500 + (month % 2 === 0 ? 6400 : 9800);
      }

      // Proportions: Card ~62%, Cash ~16%, Online ~22%
      const cardRatio = is15th ? 0.70 : 0.60 + ((day % 5) - 2) * 0.02;
      const cashRatio = is15th ? 0.12 : 0.18 - ((day % 4) - 2) * 0.01;
      const onlineRatio = Math.max(0.05, 1 - cardRatio - cashRatio);

      const card = Math.round(baseRevenue * cardRatio);
      const cash = Math.round(baseRevenue * cashRatio);
      const onlineTotal = Math.round(baseRevenue * onlineRatio);
      const totalRevenue = card + cash + onlineTotal;

      // Online breakdown
      const yemeksepeti = Math.round(onlineTotal * 0.38);
      const trendyol = Math.round(onlineTotal * 0.32);
      const getir = Math.round(onlineTotal * 0.18);
      const migros = Math.round(onlineTotal * 0.08);
      const digerOnline = onlineTotal - (yemeksepeti + trendyol + getir + migros);

      // Order count & AOV
      const avgTicket = is15th ? 245 : 185 + (day % 6) * 10;
      const orderCount = Math.round(totalRevenue / avgTicket);

      // Expenses for this day
      const expenses: ExpenseItem[] = [];

      // 1. Fixed Daily POS Commission (~2%)
      const posFee = Math.round(card * 0.021);
      expenses.push({
        id: `exp-${dateKey}-pos`,
        category: 'banka',
        title: 'POS Banka Komisyon Kesintisi (%2.1)',
        amount: posFee,
        paymentMethod: 'kart_banka',
        createdAt: `${dateKey}T23:30:00Z`,
      });

      // 2. Online Platform Commissions (~18-20%)
      const platformFee = Math.round(onlineTotal * 0.19);
      if (platformFee > 0) {
        expenses.push({
          id: `exp-${dateKey}-online-comm`,
          category: 'komisyon',
          title: 'Online Sipariş Platform Komisyonları (YS, TY, Getir)',
          amount: platformFee,
          paymentMethod: 'vadeli_fatura',
          createdAt: `${dateKey}T23:45:00Z`,
        });
      }

      // 3. Daily Courier / Fuel
      const courierCost = isWeekend ? 1450 : is15th ? 2800 : 950;
      expenses.push({
        id: `exp-${dateKey}-kurye`,
        category: 'kurye',
        title: 'Paket Kurye Yevmiye & Yakıt Bedeli',
        amount: courierCost,
        paymentMethod: 'nakit',
        createdAt: `${dateKey}T22:00:00Z`,
      });

      // 4. Daily Staff Meals / Incidentals
      expenses.push({
        id: `exp-${dateKey}-personel-gunluk`,
        category: 'personel',
        title: 'Personel Yemek, Yol & Günlük Harçlık',
        amount: 550 + (is15th ? 600 : (day % 3) * 80),
        paymentMethod: 'nakit',
        createdAt: `${dateKey}T21:00:00Z`,
      });

      // 5. Periodic Major Expenses:
      // - Rent on the 1st
      if (day === 1) {
        expenses.push({
          id: `exp-${dateKey}-kira`,
          category: 'kira',
          title: 'Aylık Dükkan Kirası ve Bina Aidatı',
          amount: 38000,
          paymentMethod: 'kart_banka',
          supplier: 'Mülk Sahibi',
          receiptNo: `KRA-2026-${monthStr}`,
          createdAt: `${dateKey}T10:00:00Z`,
        });
      }

      // - Monthly Staff Salaries on the 5th
      if (day === 5) {
        expenses.push({
          id: `exp-${dateKey}-maaslar`,
          category: 'personel',
          title: '3 Personel + 1 Usta Aylık Net Maaş Ödemeleri',
          amount: 68500,
          paymentMethod: 'kart_banka',
          createdAt: `${dateKey}T12:00:00Z`,
        });
        expenses.push({
          id: `exp-${dateKey}-sgk`,
          category: 'personel',
          title: 'Personel SGK ve Vergi Primleri',
          amount: 24200,
          paymentMethod: 'kart_banka',
          createdAt: `${dateKey}T12:30:00Z`,
        });
      }

      // - Utility Bills on 10th-12th
      if (day === 10) {
        expenses.push({
          id: `exp-${dateKey}-elektrik`,
          category: 'fatura',
          title: 'Elektrik Faturası (Soğuk Hava & Dolaplar)',
          amount: 7650 + (month === 8 ? 850 : 0),
          paymentMethod: 'kart_banka',
          supplier: 'Enerjisa / CK Boğaziçi',
          createdAt: `${dateKey}T11:00:00Z`,
        });
        expenses.push({
          id: `exp-${dateKey}-su-net`,
          category: 'fatura',
          title: 'İSKİ Su + Fiber İnternet Faturası',
          amount: 2150,
          paymentMethod: 'kart_banka',
          createdAt: `${dateKey}T11:30:00Z`,
        });
      }

      // - Accountant on 20th
      if (day === 20) {
        expenses.push({
          id: `exp-${dateKey}-muhasebe`,
          category: 'muhasebe',
          title: 'Mali Müşavir ve Muhasebe Aylık Hizmet Bedeli',
          amount: 4500,
          paymentMethod: 'kart_banka',
          createdAt: `${dateKey}T14:00:00Z`,
        });
      }

      // - Major Raw Material (Genel Merkez Çiğ Köfte, Lavaş, Sos, Garnitür)
      // Usually ordered 2-3 times a week (Tuesdays, Fridays, and day 13 before 15th campaign)
      if (dayOfWeek === 2 || dayOfWeek === 5 || (is15th || day === 14)) {
        const hammaddeTutar = is15th || day === 14 ? 36000 : 16500 + (day % 4) * 2200;
        expenses.push({
          id: `exp-${dateKey}-hammadde`,
          category: 'hammadde',
          title: 'Komagene Genel Merkez Çiğ Köfte, Lavaş & Sos Sevkiyatı',
          amount: hammaddeTutar,
          paymentMethod: 'kart_banka',
          supplier: 'Komagene Genel Merkez (Yörpaş A.Ş.)',
          receiptNo: `FTR-KMG-${monthStr}${dayStr}`,
          createdAt: `${dateKey}T09:30:00Z`,
        });
      }

      // - Packaging & Boxes (Every 10 days)
      if (day === 3 || day === 14 || day === 24) {
        expenses.push({
          id: `exp-${dateKey}-ambalaj`,
          category: 'ambalaj',
          title: 'Komagene Logolu Dürüm Kağıdı, Porsiyon Kutuları & Poşet',
          amount: day === 14 ? 7400 : 4200,
          paymentMethod: 'kart_banka',
          supplier: 'Ambalaj Tedarikçisi',
          createdAt: `${dateKey}T15:00:00Z`,
        });
      }

      // - Cleaning & Hygiene once a week
      if (dayOfWeek === 3) {
        expenses.push({
          id: `exp-${dateKey}-temizlik`,
          category: 'temizlik',
          title: 'Dükkan Hijyen, Dezenfektan, Bone & Eldiven Sarfı',
          amount: 850,
          paymentMethod: 'nakit',
          createdAt: `${dateKey}T16:00:00Z`,
        });
      }

      // Calculate totals
      const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const netProfit = totalRevenue - totalExpense;
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Cash reconciliation
      const nakitGiderler = expenses
        .filter((e) => e.paymentMethod === 'nakit')
        .reduce((sum, e) => sum + e.amount, 0);
      const expectedCash = cash - nakitGiderler;
      const drawerDiff = (day % 5 === 0 ? 50 : 0) - (day % 7 === 0 ? 30 : 0);
      const actualDrawer = expectedCash + drawerDiff;

      records[dateKey] = {
        date: dateKey,
        incomes: {
          card,
          cash,
          onlineTotal,
          onlineDetails: {
            yemeksepeti,
            trendyol,
            getir,
            migros,
            digerOnline,
          },
          totalRevenue,
          orderCount,
          slipCardCount: Math.round(orderCount * cardRatio),
          slipCashCount: Math.round(orderCount * cashRatio),
          slipOnlineCount: Math.round(orderCount * onlineRatio),
        },
        expenses,
        totalExpense,
        netProfit,
        profitMarginPercent,
        isCampaignDay: is15th,
        cashReconciliation: {
          actualCashInDrawer: actualDrawer,
          systemCashExpected: expectedCash,
          difference: drawerDiff,
          status: drawerDiff === 0 ? 'balanced' : drawerDiff > 0 ? 'surplus' : 'shortage',
          notes: drawerDiff !== 0 ? 'Kasa kuruş yuvarlama farkı' : 'Kasa tam mutabık',
        },
        generalNotes: is15th
          ? "🎉 Komagene Her Ayın 15'i %50 Bedava Çiğ Köfte Kampanyası! Yoğun sipariş ve rekor ciro."
          : isWeekend
            ? 'Hafta sonu paket servis yoğun geçti.'
            : undefined,
        updatedAt: `${dateKey}T23:59:59Z`,
      };
    }
  });

  return records;
};
