import type { YNABEntityManager } from '../ynab-entity-manager';
import type { DateWithoutTime } from '../ynab-utilities';

interface YNABSharedLibInstance {
  entityManager: YNABEntityManager;
}

interface YNABDateFormatter {
  formatDate(date?: DateWithoutTime | string | Date, format?: string): string;
  formatDateLong(date?: DateWithoutTime | string): string;
}

interface YNABSharedLib extends Record<string, any> {
  dateFormatter: YNABDateFormatter;
  defaultInstance: YNABSharedLibInstance;
}
