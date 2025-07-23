import {
  isToolkitReportsURL,
  parseToolkitReportsURL,
  buildToolkitReportsURL,
  navigateToToolkitReports,
  getCurrentBudgetId,
  isValidReportTab,
  getDefaultReportTab,
  urlToReportKey,
} from './url-navigation';
import { ReportKeys } from '../common/constants/report-types';

// Mock the toolkit storage module
jest.mock('toolkit/extension/utils/toolkit', () => ({
  getToolkitStorageKey: jest.fn(),
}));

// Mock window.location for testing
const mockLocation = {
  origin: 'https://app.ynab.com',
  href: 'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget',
  pathname: '/12345678-1234-1234-1234-123456789012/budget',
};

// Mock console.error to suppress error logs during tests
const originalConsoleError = console.error;

// Mock window.location before each test
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  // Suppress console.error during tests
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console.error after each test
  console.error = originalConsoleError;
});

describe('URL Navigation Utilities', () => {
  describe('isToolkitReportsURL', () => {
    it('should return true for toolkit reports URLs', () => {
      expect(isToolkitReportsURL('https://app.ynab.com/budget-id/budget#toolkit-reports')).toBe(
        true,
      );
      expect(
        isToolkitReportsURL('https://app.ynab.com/budget-id/budget#toolkit-reports/net-worth'),
      ).toBe(true);
    });

    it('should return false for non-toolkit reports URLs', () => {
      expect(isToolkitReportsURL('https://app.ynab.com/budget-id/budget')).toBe(false);
      expect(isToolkitReportsURL('https://app.ynab.com/budget-id/accounts')).toBe(false);
    });
  });

  describe('parseToolkitReportsURL', () => {
    it.each([
      {
        url: 'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports',
        expected: {
          budgetId: '12345678-1234-1234-1234-123456789012',
          reportTab: null,
        },
      },
      {
        url: 'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/net-worth',
        expected: {
          budgetId: '12345678-1234-1234-1234-123456789012',
          reportTab: 'net-worth',
        },
      },
      {
        url: 'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/forecast',
        expected: {
          budgetId: '12345678-1234-1234-1234-123456789012',
          reportTab: 'forecast',
        },
      },
      {
        url: 'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget',
        expected: null,
      },
    ])('should parse "%s" correctly', ({ url, expected }) => {
      const result = parseToolkitReportsURL(url);
      expect(result).toEqual(expected);
    });

    it('should return null for invalid URLs', () => {
      const result = parseToolkitReportsURL('not-a-valid-url');
      expect(result).toBe(null);
    });

    it('should return null for URLs without toolkit-reports hash', () => {
      const result = parseToolkitReportsURL('https://app.ynab.com/budget-id/budget#other-hash');
      expect(result).toBe(null);
    });

    it('should return null for URLs with hash that does not start with toolkit-reports', () => {
      const result = parseToolkitReportsURL('https://app.ynab.com/budget-id/budget#something-else');
      expect(result).toBe(null);
    });

    it('should return null for URLs with hash starting with different prefix', () => {
      const result = parseToolkitReportsURL(
        'https://app.ynab.com/budget-id/budget#other-toolkit-reports',
      );
      expect(result).toBe(null);
    });

    it('should return null for URLs with no hash', () => {
      const result = parseToolkitReportsURL('https://app.ynab.com/budget-id/budget');
      expect(result).toBe(null);
    });

    it('should return null for URLs with hash starting with different prefix', () => {
      const result = parseToolkitReportsURL(
        'https://app.ynab.com/budget-id/budget#completely-different',
      );
      expect(result).toBe(null);
    });
  });

  describe('buildToolkitReportsURL', () => {
    it('should build URL without report tab', () => {
      const result = buildToolkitReportsURL();
      expect(result).toBe(
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports',
      );
    });

    it('should build URL with report tab', () => {
      const result = buildToolkitReportsURL('net-worth');
      expect(result).toBe(
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/net-worth',
      );
    });

    it('should return current href when no budgetId is available', () => {
      // Mock window.location with empty pathname
      Object.defineProperty(window, 'location', {
        value: {
          ...mockLocation,
          pathname: '/',
          href: 'https://app.ynab.com/',
        },
        writable: true,
      });

      const result = buildToolkitReportsURL('net-worth');
      expect(result).toBe('https://app.ynab.com/');
    });
  });

  describe('navigateToToolkitReports', () => {
    let mockPushState: jest.Mock;
    let mockDispatchEvent: jest.Mock;
    let mockGetToolkitStorageKey: jest.Mock;

    beforeEach(() => {
      // Mock window.history.pushState
      mockPushState = jest.fn();
      Object.defineProperty(window.history, 'pushState', {
        value: mockPushState,
        writable: true,
      });

      // Mock window.dispatchEvent
      mockDispatchEvent = jest.fn();
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatchEvent,
        writable: true,
      });

      // Get the mocked function
      const toolkitUtils = require('toolkit/extension/utils/toolkit');
      mockGetToolkitStorageKey = toolkitUtils.getToolkitStorageKey;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should navigate with provided report tab', () => {
      navigateToToolkitReports('net-worth');

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/net-worth',
      );

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toolkit-reports-url-changed',
          detail: { reportTab: 'net-worth' },
        }),
      );
    });

    it('should use stored report tab when none provided', () => {
      mockGetToolkitStorageKey.mockReturnValue('stored-tab');

      navigateToToolkitReports();

      expect(mockGetToolkitStorageKey).toHaveBeenCalledWith('active-report', 'net-worth');
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/stored-tab',
      );
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toolkit-reports-url-changed',
          detail: { reportTab: 'stored-tab' },
        }),
      );
    });

    it('should use default report tab when storage returns null', () => {
      mockGetToolkitStorageKey.mockReturnValue(null);

      navigateToToolkitReports();

      expect(mockGetToolkitStorageKey).toHaveBeenCalledWith('active-report', 'net-worth');
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports',
      );
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toolkit-reports-url-changed',
          detail: { reportTab: null },
        }),
      );
    });

    it('should use default report tab when storage returns undefined', () => {
      mockGetToolkitStorageKey.mockReturnValue(undefined);

      navigateToToolkitReports();

      expect(mockGetToolkitStorageKey).toHaveBeenCalledWith('active-report', 'net-worth');
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports',
      );
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toolkit-reports-url-changed',
          detail: { reportTab: undefined },
        }),
      );
    });

    it('should handle different report tabs correctly', () => {
      navigateToToolkitReports('forecast');

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        '',
        'https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/forecast',
      );
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'toolkit-reports-url-changed',
          detail: { reportTab: 'forecast' },
        }),
      );
    });
  });

  describe('getCurrentBudgetId', () => {
    it('should extract budget ID from pathname', () => {
      const result = getCurrentBudgetId();
      expect(result).toBe('12345678-1234-1234-1234-123456789012');
    });

    it('should return null for empty pathname', () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...mockLocation,
          pathname: '',
        },
        writable: true,
      });

      const result = getCurrentBudgetId();
      expect(result).toBe(null);
    });

    it('should handle pathname parsing errors', () => {
      // Mock window.location to cause an error
      Object.defineProperty(window, 'location', {
        value: null,
        writable: true,
      });

      const result = getCurrentBudgetId();
      expect(result).toBe(null);
    });
  });

  describe('isValidReportTab', () => {
    it('should return true for valid report tabs', () => {
      expect(isValidReportTab('net-worth')).toBe(true);
      expect(isValidReportTab('forecast')).toBe(true);
      expect(isValidReportTab('income-vs-expense')).toBe(true);
    });

    it('should return false for invalid report tabs', () => {
      expect(isValidReportTab('invalid-tab')).toBe(false);
      expect(isValidReportTab('')).toBe(false);
    });
  });

  describe('getDefaultReportTab', () => {
    it('should return NetWorth as default', () => {
      expect(getDefaultReportTab()).toBe(ReportKeys.NetWorth);
    });
  });

  describe('urlToReportKey', () => {
    it('should convert URL paths to report keys', () => {
      expect(urlToReportKey('net-worth')).toBe(ReportKeys.NetWorth);
      expect(urlToReportKey('inflow-outflow')).toBe(ReportKeys.InflowOutflow);
      expect(urlToReportKey('spending-by-category')).toBe(ReportKeys.SpendingByCategory);
      expect(urlToReportKey('spending-by-payee')).toBe(ReportKeys.SpendingByPayee);
      expect(urlToReportKey('income-vs-expense')).toBe(ReportKeys.IncomeVsExpense);
      expect(urlToReportKey('income-breakdown')).toBe(ReportKeys.IncomeBreakdown);
      expect(urlToReportKey('balance-over-time')).toBe(ReportKeys.BalanceOverTime);
      expect(urlToReportKey('outflow-over-time')).toBe(ReportKeys.OutflowOverTime);
      expect(urlToReportKey('forecast')).toBe(ReportKeys.Forecast);
    });

    it('should return null for unknown URL paths', () => {
      expect(urlToReportKey('unknown-path')).toBe(null);
      expect(urlToReportKey('')).toBe(null);
    });
  });
});
