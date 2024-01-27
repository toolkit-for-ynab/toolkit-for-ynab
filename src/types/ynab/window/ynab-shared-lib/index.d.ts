import { YNABEntityManager } from '../ynab-entity-manager';

interface YNABSharedLibInstance {
  entityManager: YNABEntityManager;
}

interface YNABDateFormatter {
  formatDate(date?: DateWithoutTime | string, format?: string): string;
  formatDateLong(date?: DateWithoutTime | string): string;
}

interface YNABSharedLibImpl {
  dateFormatter: YNABDateFormatter;
  defaultInstance: YNABSharedLibInstance;
}

type ExtendWithAny<T extends {}> = { [key: string]: any } & T;

type YNABSharedLib = ExtendWithAny<YNABSharedLibImpl>;
