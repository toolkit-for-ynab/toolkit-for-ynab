import { YNABEntityManager } from '../ynab-entity-manager';

interface YNABSharedLibInstance {
  entityManager: YNABEntityManager;
}

interface YNABDateFormatter {
  formatDate(date?: DateWithoutTime | string, format?: string): string;
  formatDateLong(date?: DateWithoutTime | string): string;
}

interface YNABSharedLib {
  dateFormatter: YNABDateFormatter;
  defaultInstance: YNABSharedLibInstance;
}
