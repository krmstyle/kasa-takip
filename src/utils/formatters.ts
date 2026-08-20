export const formatCurrency = (amount: number, options?: { showCents?: boolean; compact?: boolean }): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₺0,00';
  }

  const showCents = options?.showCents !== undefined ? options.showCents : true;

  if (options?.compact && Math.abs(amount) >= 10000) {
    if (Math.abs(amount) >= 1000000) {
      return `₺${(amount / 1000000).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    }
    return `₺${(amount / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
  }

  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  return `₺${formatted}`;
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (percent: number, options?: { showSign?: boolean; decimals?: number }): string => {
  if (isNaN(percent) || percent === null || percent === undefined) return '%0,0';
  const decimals = options?.decimals ?? 1;
  const formatted = Math.abs(percent).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.showSign && percent > 0) {
    return `+%${formatted}`;
  } else if (percent < 0) {
    return `-%${formatted}`;
  }
  return `%${formatted}`;
};

export const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export const TURKISH_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const TURKISH_DAYS_LONG = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

export const formatDateTr = (dateStr: string, format: 'full' | 'short' | 'dayOnly' | 'monthYear' = 'full'): string => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return dateStr;

    const dayName = TURKISH_DAYS_LONG[date.getDay()];
    const monthName = TURKISH_MONTHS[month - 1];

    switch (format) {
      case 'short':
        return `${day} ${monthName}`;
      case 'dayOnly':
        return `${day} ${monthName.slice(0, 3)}, ${dayName.slice(0, 3)}`;
      case 'monthYear':
        return `${monthName} ${year}`;
      case 'full':
      default:
        return `${day} ${monthName} ${year}, ${dayName}`;
    }
  } catch {
    return dateStr;
  }
};

export const getMonthKey = (dateStr: string): string => {
  return dateStr.substring(0, 7); // "YYYY-MM"
};

export const getMonthNameFromKey = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  if (!month || month < 1 || month > 12) return monthKey;
  return `${TURKISH_MONTHS[month - 1]} ${year}`;
};

export const getTodayDateStr = (): string => {
  // Use today's local date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};
