export interface DateWithoutTime {
  addMonths(count: number): DateWithoutTime;
  clone(): DateWithoutTime;
  createForToday(): DateWithoutTime;
  createFromString(input: string, format: string): DateWithoutTime;
  createFromYearMonthDate(year: number, month: number, date: number): DateWithoutTime;
  equalsByMonth(input: DateWithoutTime): boolean;
  format(formatStr?: string): string;
  getMonth(): number;
  getYear(): number;
  isAfter(date: DateWithoutTime): boolean;
  isBefore(date: DateWithoutTime): boolean;
  isBetweenMonths(start: DateWithoutTime, end: DateWithoutTime): boolean;
  startOfMonth(): DateWithoutTime;
  createFromISOString(inp: string): DateWithoutTime;
  toISOString(): string;
  monthsApart(date: DateWithoutTime): number;
  startOfYear(): DateWithoutTime;
  endOfYear(): DateWithoutTime;
  setYear(year: number | string): DateWithoutTime;
  subtractYears(years: number): DateWithoutTime;
  setMonth(month: number | string): DateWithoutTime;
  subtractMonths(months: number): DateWithoutTime;
  endOfMonth(): DateWithoutTime;
  toUTCMoment(): import('moment').Moment;
  toNativeDate(): Date;
  getUTCTime(): number;
}

export interface YNABUtilities {
  DateWithoutTime: DateWithoutTime;
}
