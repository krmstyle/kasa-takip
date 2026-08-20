export type ExpenseCategory =
  | 'hammadde'
  | 'personel'
  | 'kira'
  | 'fatura'
  | 'ambalaj'
  | 'komisyon'
  | 'kurye'
  | 'banka'
  | 'muhasebe'
  | 'temizlik'
  | 'diger';

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  bgColor: string;
  description: string;
  isCogs?: boolean; // Cost of Goods Sold (Satılan Malın Maliyeti)
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  hammadde: {
    id: 'hammadde',
    name: 'Hammadde & Çiğ Köfte Tedarik (Genel Merkez)',
    shortName: 'Hammadde / Çiğ Köfte',
    iconName: 'Package',
    color: '#E11D48',
    bgColor: 'rgba(225, 29, 72, 0.12)',
    description: 'Çiğ köfte, lavaş, nar ekşisi, soslar, garnitür, içecek ve tatlı tedariği',
    isCogs: true,
  },
  personel: {
    id: 'personel',
    name: 'Personel Maaş, Yevmiye, Avans & SGK',
    shortName: 'Personel / Maaş',
    iconName: 'Users',
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.12)',
    description: 'Usta ve personel maaşları, günlük yevmiyeler, prim ve avanslar',
  },
  kira: {
    id: 'kira',
    name: 'Dükkan Kirası, Stopaj & Aidat',
    shortName: 'Kira & Stopaj',
    iconName: 'Building2',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    description: 'Aylık/günlük dükkan kirası payı, stopaj vergisi ve bina aidatı',
  },
  fatura: {
    id: 'fatura',
    name: 'Elektrik, Su, Doğalgaz & İnternet Faturaları',
    shortName: 'Faturalar / Enerji',
    iconName: 'Zap',
    color: '#CA8A04',
    bgColor: 'rgba(202, 138, 4, 0.12)',
    description: 'Dolap ve soğutucu elektriği, doğalgaz, su, internet ve telefon faturaları',
  },
  ambalaj: {
    id: 'ambalaj',
    name: 'Ambalaj, Poşet, Kutu & Paketleme',
    shortName: 'Ambalaj & Poşet',
    iconName: 'ShoppingBag',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.12)',
    description: 'Dürüm kağıdı, porsiyon kutuları, poşet, ıslak mendil ve pipet',
    isCogs: true,
  },
  komisyon: {
    id: 'komisyon',
    name: 'Online Yemek Platform Komisyonları',
    shortName: 'Online Komisyonlar',
    iconName: 'Smartphone',
    color: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.12)',
    description: 'Yemeksepeti, Trendyol, Getir, Migros Yemek sipariş kesintileri',
  },
  kurye: {
    id: 'kurye',
    name: 'Kurye, Paket Servis, Yakıt & Bakım',
    shortName: 'Kurye & Yakıt',
    iconName: 'Bike',
    color: '#0D9488',
    bgColor: 'rgba(13, 148, 136, 0.12)',
    description: 'Moto kurye saatlik/paket ücreti, benzin, motosiklet bakım masrafları',
  },
  banka: {
    id: 'banka',
    name: 'POS Cihazı & Banka Komisyon Kesintileri',
    shortName: 'POS & Banka',
    iconName: 'CreditCard',
    color: '#4F46E5',
    bgColor: 'rgba(79, 70, 229, 0.12)',
    description: 'Banka POS komisyon oranları ve slip işlem kesintileri',
  },
  muhasebe: {
    id: 'muhasebe',
    name: 'Muhasebe, Vergi, KDV & Resmi Harçlar',
    shortName: 'Muhasebe & Vergi',
    iconName: 'Receipt',
    color: '#475569',
    bgColor: 'rgba(71, 85, 105, 0.12)',
    description: 'Mali müşavir ücreti, KDV, muhtasar ve resmi harçlar',
  },
  temizlik: {
    id: 'temizlik',
    name: 'Temizlik, Hijyen & Sarf Malzemeleri',
    shortName: 'Temizlik & Hijyen',
    iconName: 'Sparkles',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.12)',
    description: 'Deterjan, eldiven, bone, dezenfektan ve dükkan sarf malzemeleri',
  },
  diger: {
    id: 'diger',
    name: 'Diğer / Çeşitli Giderler',
    shortName: 'Diğer Giderler',
    iconName: 'MoreHorizontal',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.12)',
    description: 'Tamirat, küçük tadilat, bahşiş veya beklenmeyen acil giderler',
  },
};

export interface OnlineDetails {
  yemeksepeti: number;
  trendyol: number;
  getir: number;
  migros: number;
  digerOnline: number;
}

export interface DailyIncome {
  card: number; // Kredi / Banka Kartı
  cash: number; // Nakit
  onlineTotal: number; // Toplam Online Gelir
  onlineDetails: OnlineDetails;
  totalRevenue: number; // Canlı hesaplanan toplam ciro
  orderCount: number; // Günlük Toplam Sipariş / Fiş Adedi
  slipCashCount?: number;
  slipCardCount?: number;
  slipOnlineCount?: number;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paymentMethod: 'nakit' | 'kart_banka' | 'vadeli_fatura';
  receiptNo?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface CashReconciliation {
  actualCashInDrawer: number; // Kasada fiilen sayılan nakit
  systemCashExpected: number; // Sistemdeki nakit gelir - nakit ödenen masraflar
  difference: number; // Fark (Artı/Eksi)
  status: 'balanced' | 'surplus' | 'shortage';
  notes?: string;
}

export interface DailyRecord {
  date: string; // Format: "YYYY-MM-DD"
  incomes: DailyIncome;
  expenses: ExpenseItem[];
  totalExpense: number; // Canlı hesaplanan toplam gider
  netProfit: number; // totalRevenue - totalExpense
  profitMarginPercent: number; // (netProfit / totalRevenue) * 100
  isCampaignDay: boolean; // Her ayın 15'i veya özel çiğ köfte kampanya günü
  cashReconciliation?: CashReconciliation;
  generalNotes?: string;
  updatedAt: string;
}

export interface BranchProfile {
  branchName: string;
  branchCode: string;
  managerName: string;
  phone?: string;
  city: string;
  district: string;
  monthlyRevenueTarget: number; // ₺
  dailyRevenueTarget: number; // ₺
  estimatedRentMonthly: number; // ₺
}

export interface MonthSummary {
  monthKey: string; // "YYYY-MM"
  monthName: string; // "Ağustos 2026"
  daysLogged: number;
  totalDaysInMonth: number;
  totalRevenue: number;
  totalCardRevenue: number;
  totalCashRevenue: number;
  totalOnlineRevenue: number;
  totalOnlineDetails: OnlineDetails;
  totalExpense: number;
  totalCogs: number; // Satılan Malın Maliyeti (Hammadde + Ambalaj)
  grossProfit: number; // totalRevenue - totalCogs
  grossMarginPercent: number;
  totalOpex: number; // Faaliyet Giderleri (Kira, Personel, Fatura vb.)
  netProfit: number;
  netProfitMarginPercent: number;
  averageDailyRevenue: number;
  averageDailyExpense: number;
  averageDailyProfit: number;
  totalOrderCount: number;
  averageOrderValue: number; // Ortalama Sepet Tutarı
  campaignDay15Revenue: number;
  campaignDay15Profit: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  bestDay: { date: string; revenue: number; profit: number };
  worstDay: { date: string; revenue: number; profit: number };
}

export interface ComparativePeriodData {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  expense: number;
  profit: number;
  marginPercent: number;
  orderCount: number;
  cardShare: number;
  cashShare: number;
  onlineShare: number;
  day15Revenue: number;
}
