import { getRouter } from './ember';
import { isCurrentRouteReportPage } from './ynab';

jest.mock('./ember');

function setRoute(currentRouteName: string | undefined) {
  (getRouter as jest.Mock).mockReturnValue({ currentRouteName });
}

describe('isCurrentRouteReportPage', () => {
  it('matches the current reflect.* report routes', () => {
    setRoute('reflect.income-expense');
    expect(isCurrentRouteReportPage()).toBe(true);
    expect(isCurrentRouteReportPage('any')).toBe(true);
    expect(isCurrentRouteReportPage('income-expense')).toBe(true);
    expect(isCurrentRouteReportPage('net-worth')).toBe(false);
  });

  it('still matches the legacy reports.* routes', () => {
    setRoute('reports.net-worth');
    expect(isCurrentRouteReportPage('any')).toBe(true);
    expect(isCurrentRouteReportPage('net-worth')).toBe(true);
  });

  it('treats the split spending reports as the spending report', () => {
    setRoute('reflect.spending-breakdown');
    expect(isCurrentRouteReportPage('spending')).toBe(true);
    expect(isCurrentRouteReportPage('income-expense')).toBe(false);
  });

  it('does not match non-report routes', () => {
    setRoute('budget.index');
    expect(isCurrentRouteReportPage()).toBe(false);

    setRoute(undefined);
    expect(isCurrentRouteReportPage('any')).toBe(false);
  });
});
