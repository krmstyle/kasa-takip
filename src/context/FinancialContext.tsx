import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DailyRecord,
  BranchProfile,
  MonthSummary,
  ComparativePeriodData,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
} from '../types';
import { DEFAULT_BRANCH_PROFILE, generateSampleData } from '../utils/sampleData';
import { getMonthKey, getMonthNameFromKey, getTodayDateStr } from '../utils/formatters';

interface WeekdayStat {
  dayIndex: number;
  dayName: string;
  count: number;
  totalRevenue: number;
  avgRevenue: number;
  avgOrderCount: number;
  totalProfit: number;
  avgProfit: number;
}

interface FinancialContextType {
  records: Record<string, DailyRecord>;
  branch: BranchProfile;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (monthKey: string) => void;
  activeTab: 'daily' | 'monthly' | 'comparative' | 'expenses' | 'settings';
  setActiveTab: (tab: 'daily' | 'monthly' | 'comparative' | 'expenses' | 'settings') => void;
  saveDailyRecord: (record: DailyRecord) => void;
  deleteDailyRecord: (date: string) => void;
  updateBranch: (profile: Partial<BranchProfile>) => void;
  getRecordForDate: (date: string) => DailyRecord;
  getMonthSummary: (monthKey: string) => MonthSummary;
  getComparativeData: () => ComparativePeriodData[];
  getWeekdayAnalysis: (monthKey?: string) => WeekdayStat[];
  availableMonths: string[];
  resetToSampleData: () => void;
  clearAllData: () => void;
  importDataFromJson: (jsonStr: string) => boolean;
  exportDataToJson: () => string;
}

const STORAGE_RECORDS_KEY = 'komagene_financial_records_v1';
const STORAGE_BRANCH_KEY = 'komagene_branch_profile_v1';

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or load rich sample data on first run
  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading records from localStorage', e);
    }
    const samples = generateSampleData();
    try {
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(samples));
    } catch {}
    return samples;
  });

  const [branch, setBranch] = useState<BranchProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BRANCH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading branch profile from localStorage', e);
    }
    return DEFAULT_BRANCH_PROFILE;
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey(getTodayDateStr()));
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'comparative' | 'expenses' | 'settings'>('daily');

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BRANCH_KEY, JSON.stringify(branch));
    } catch (e) {
      console.error('Failed to save branch to localStorage', e);
    }
  }, [branch]);

  // Available unique month keys sorted desc (newest first)
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    Object.keys(records).forEach((d) => {
      set.add(getMonthKey(d));
    });
    // Ensure current month is always present in list
    set.add(getMonthKey(getTodayDateStr()));
    return Array.from(set).sort().reverse();
  }, [records]);

  // Save or update daily record
  const saveDailyRecord = (record: DailyRecord) => {
    setRecords((prev) => ({
      ...prev,
      [record.date]: {
        ...record,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Delete daily record
  const deleteDailyRecord = (date: string) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  };

  // Update branch profile
  const updateBranch = (profile: Partial<BranchProfile>) => {
    setBranch((prev) => ({ ...prev, ...profile }));
  };

  // Helper to fetch record for a date or generate a fresh empty structure
  const getRecordForDate = (date: string): DailyRecord => {
    if (records[date]) {
      return records[date];
    }
    const [year, month, day] = date.split('-').map(Number);
    const is15th = day === 15;

    return {
      date,
      incomes: {
        card: 0,
        cash: 0,
        onlineTotal: 0,
        onlineDetails: {
          yemeksepeti: 0,
          trendyol: 0,
          getir: 0,
          migros: 0,
          digerOnline: 0,
        },
        totalRevenue: 0,
        orderCount: 0,
      },
      expenses: [],
      totalExpense: 0,
      netProfit: 0,
      profitMarginPercent: 0,
      isCampaignDay: is15th,
      cashReconciliation: {
        actualCashInDrawer: 0,
        systemCashExpected: 0,
        difference: 0,
        status: 'balanced',
      },
      updatedAt: new Date().toISOString(),
    };
  };

  // Compute detailed MonthSummary
  const getMonthSummary = (monthKey: string): MonthSummary => {
    const monthRecords = (Object.values(records) as DailyRecord[])
      .filter((r) => r.date.startsWith(monthKey))
      .sort((a, b) => a.date.localeCompare(b.date));

    const [year, month] = monthKey.split('-').map(Number);
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const daysLogged = monthRecords.length;

    let totalRevenue = 0;
    let totalCardRevenue = 0;
    let totalCashRevenue = 0;
    let totalOnlineRevenue = 0;
    const totalOnlineDetails = {
      yemeksepeti: 0,
      trendyol: 0,
      getir: 0,
      migros: 0,
      digerOnline: 0,
    };
    let totalExpense = 0;
    let totalCogs = 0;
    let totalOpex = 0;
    let totalOrderCount = 0;
    let campaignDay15Revenue = 0;
    let campaignDay15Profit = 0;

    const expensesByCategory: Record<ExpenseCategory, number> = {
      hammadde: 0,
      personel: 0,
      kira: 0,
      fatura: 0,
      ambalaj: 0,
      komisyon: 0,
      kurye: 0,
      banka: 0,
      muhasebe: 0,
      temizlik: 0,
      diger: 0,
    };

    let bestDay = { date: '', revenue: -1, profit: -Infinity };
    let worstDay = { date: '', revenue: Infinity, profit: Infinity };

    monthRecords.forEach((r) => {
      const rev = r.incomes.totalRevenue;
      const exp = r.totalExpense;
      const profit = r.netProfit;

      totalRevenue += rev;
      totalCardRevenue += r.incomes.card;
      totalCashRevenue += r.incomes.cash;
      totalOnlineRevenue += r.incomes.onlineTotal;

      totalOnlineDetails.yemeksepeti += r.incomes.onlineDetails.yemeksepeti || 0;
      totalOnlineDetails.trendyol += r.incomes.onlineDetails.trendyol || 0;
      totalOnlineDetails.getir += r.incomes.onlineDetails.getir || 0;
      totalOnlineDetails.migros += r.incomes.onlineDetails.migros || 0;
      totalOnlineDetails.digerOnline += r.incomes.onlineDetails.digerOnline || 0;

      totalExpense += exp;
      totalOrderCount += r.incomes.orderCount || 0;

      if (r.isCampaignDay || r.date.endsWith('-15')) {
        campaignDay15Revenue += rev;
        campaignDay15Profit += profit;
      }

      // Best and worst days
      if (rev > bestDay.revenue) {
        bestDay = { date: r.date, revenue: rev, profit };
      }
      if (rev < worstDay.revenue && rev > 0) {
        worstDay = { date: r.date, revenue: rev, profit };
      }

      // Group expenses
      r.expenses.forEach((e) => {
        const cat = e.category || 'diger';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
        if (EXPENSE_CATEGORIES[cat]?.isCogs) {
          totalCogs += e.amount;
        } else {
          totalOpex += e.amount;
        }
      });
    });

    if (worstDay.revenue === Infinity) {
      worstDay = { date: '', revenue: 0, profit: 0 };
    }
    if (bestDay.revenue === -1) {
      bestDay = { date: '', revenue: 0, profit: 0 };
    }

    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = totalRevenue - totalExpense;
    const netProfitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const averageDailyRevenue = daysLogged > 0 ? totalRevenue / daysLogged : 0;
    const averageDailyExpense = daysLogged > 0 ? totalExpense / daysLogged : 0;
    const averageDailyProfit = daysLogged > 0 ? netProfit / daysLogged : 0;
    const averageOrderValue = totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

    return {
      monthKey,
      monthName: getMonthNameFromKey(monthKey),
      daysLogged,
      totalDaysInMonth,
      totalRevenue,
      totalCardRevenue,
      totalCashRevenue,
      totalOnlineRevenue,
      totalOnlineDetails,
      totalExpense,
      totalCogs,
      grossProfit,
      grossMarginPercent,
      totalOpex,
      netProfit,
      netProfitMarginPercent,
      averageDailyRevenue,
      averageDailyExpense,
      averageDailyProfit,
      totalOrderCount,
      averageOrderValue,
      campaignDay15Revenue,
      campaignDay15Profit,
      expensesByCategory,
      bestDay,
      worstDay,
    };
  };

  // Get comparative periods data across all stored months
  const getComparativeData = (): ComparativePeriodData[] => {
    const sortedMonthKeys = Array.from(
      new Set(Object.keys(records).map((d) => getMonthKey(d)))
    ).sort();

    return sortedMonthKeys.map((mKey) => {
      const summary = getMonthSummary(mKey);
      const totalRev = summary.totalRevenue || 1;
      return {
        monthKey: mKey,
        monthLabel: summary.monthName,
        revenue: summary.totalRevenue,
        expense: summary.totalExpense,
        profit: summary.netProfit,
        marginPercent: summary.netProfitMarginPercent,
        orderCount: summary.totalOrderCount,
        cardShare: (summary.totalCardRevenue / totalRev) * 100,
        cashShare: (summary.totalCashRevenue / totalRev) * 100,
        onlineShare: (summary.totalOnlineRevenue / totalRev) * 100,
        day15Revenue: summary.campaignDay15Revenue,
      };
    });
  };

  // Weekday performance aggregation
  const getWeekdayAnalysis = (monthKey?: string): WeekdayStat[] => {
    const daysName = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const stats: WeekdayStat[] = daysName.map((name, index) => ({
      dayIndex: index,
      dayName: name,
      count: 0,
      totalRevenue: 0,
      avgRevenue: 0,
      avgOrderCount: 0,
      totalProfit: 0,
      avgProfit: 0,
    }));

    const filteredRecords = (Object.values(records) as DailyRecord[]).filter((r) =>
      monthKey ? r.date.startsWith(monthKey) : true
    );

    filteredRecords.forEach((r) => {
      const [y, m, d] = r.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayIdx = dateObj.getDay();

      stats[dayIdx].count += 1;
      stats[dayIdx].totalRevenue += r.incomes.totalRevenue;
      stats[dayIdx].totalProfit += r.netProfit;
      stats[dayIdx].avgOrderCount += r.incomes.orderCount || 0;
    });

    stats.forEach((s) => {
      if (s.count > 0) {
        s.avgRevenue = Math.round(s.totalRevenue / s.count);
        s.avgProfit = Math.round(s.totalProfit / s.count);
        s.avgOrderCount = Math.round(s.avgOrderCount / s.count);
      }
    });

    // Reorder: Monday (1) to Sunday (0)
    return [stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[0]];
  };

  const resetToSampleData = () => {
    const samples = generateSampleData();
    setRecords(samples);
    setBranch(DEFAULT_BRANCH_PROFILE);
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(samples));
    localStorage.setItem(STORAGE_BRANCH_KEY, JSON.stringify(DEFAULT_BRANCH_PROFILE));
  };

  const clearAllData = () => {
    setRecords({});
    localStorage.removeItem(STORAGE_RECORDS_KEY);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.records) {
        setRecords(parsed.records);
        if (parsed.branch) setBranch(parsed.branch);
        return true;
      } else if (typeof parsed === 'object') {
        setRecords(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const exportDataToJson = (): string => {
    return JSON.stringify({ records, branch, exportedAt: new Date().toISOString() }, null, 2);
  };

  return (
    <FinancialContext.Provider
      value={{
        records,
        branch,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        activeTab,
        setActiveTab,
        saveDailyRecord,
        deleteDailyRecord,
        updateBranch,
        getRecordForDate,
        getMonthSummary,
        getComparativeData,
        getWeekdayAnalysis,
        availableMonths,
        resetToSampleData,
        clearAllData,
        importDataFromJson,
        exportDataToJson,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
