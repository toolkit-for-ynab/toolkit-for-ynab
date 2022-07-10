interface DateWithoutTime {
  createForToday(): DateWithoutTime;
  createFromString(input: string, format: string): DateWithoutTime;
  equalsByMonth(input: DateWithoutTime): boolean;
}

interface YNABUtilities {
  DateWithoutTime: DateWithoutTime;
}
