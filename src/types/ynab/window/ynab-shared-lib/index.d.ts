interface YNABSharedLibInstance {
  entityManager: YNABEntityManager;
}

interface YNABDateFormatter {
  formatDate(date?: Date | DateWithoutTime | string, format?: string): string;
  formatDateLong(date?: Date | DateWithoutTime | string): string;
}

interface YNABSharedLib {
  dateFormatter: YNABDateFormatter;
  defaultInstance: YNABSharedLibInstance;
}
