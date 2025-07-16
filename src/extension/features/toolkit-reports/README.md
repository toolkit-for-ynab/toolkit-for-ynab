# Toolkit Reports URL Navigation

This feature adds URL-based navigation to the Toolkit Reports, allowing users to navigate directly to specific report tabs and share links to reports.

## URL Format

The URL format follows the pattern:

```
https://app.ynab.com/{budgetId}/budget#toolkit-reports/{reportTab}
```

Where:

- `{budgetId}` is the UUID of the current budget
- `{reportTab}` is the URL-encoded name of the report tab (optional)

## Supported Report Tabs

The following report tabs are supported with their corresponding URL paths:

| Report Name          | URL Path               |
| -------------------- | ---------------------- |
| Net Worth            | `net-worth`            |
| Inflow/Outflow       | `inflow-outflow`       |
| Spending By Category | `spending-by-category` |
| Spending By Payee    | `spending-by-payee`    |
| Income vs. Expense   | `income-vs-expense`    |
| Income Breakdown     | `income-breakdown`     |
| Balance Over Time    | `balance-over-time`    |
| Outflow Over Time    | `outflow-over-time`    |
| Forecast             | `forecast`             |

## Examples

- Navigate to Toolkit Reports (default tab): `https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports`
- Navigate to Net Worth report: `https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/net-worth`
- Navigate to Forecast report: `https://app.ynab.com/12345678-1234-1234-1234-123456789012/budget#toolkit-reports/forecast`

## Features

### Automatic URL Updates

When a user clicks on a report tab, the URL automatically updates to reflect the current report.

### Browser Navigation Support

Users can use browser back/forward buttons to navigate between different report tabs.

### Direct URL Access

Users can navigate directly to a specific report tab by entering the URL in the browser address bar.

### Fallback Behavior

If an invalid report tab is specified in the URL, the system falls back to the last accessed report tab or the default (Net Worth).

### State Persistence

The last accessed report tab is stored and will be used when navigating to the base toolkit reports URL.

## Implementation Details

### URL Navigation Utilities (`utils/url-navigation.ts`)

- `isToolkitReportsURL()`: Checks if a URL is a toolkit reports URL
- `parseToolkitReportsURL()`: Parses toolkit reports URLs to extract budget ID and report tab
- `buildToolkitReportsURL()`: Builds toolkit reports URLs
- `navigateToToolkitReports()`: Programmatically navigates to toolkit reports
- `isValidReportTab()`: Validates report tab names
- `getDefaultReportTab()`: Returns the default report tab

### Integration Points

- **ToolkitReports Feature**: Handles URL-based navigation and browser events
- **Report Context Provider**: Manages report state and URL synchronization
- **Report Selector**: Updates URLs when report tabs are clicked

### Event Handling

- `popstate` events: Handle browser back/forward navigation
- `toolkit-reports-url-changed` events: Handle programmatic URL changes

## Browser Compatibility

This feature uses the HTML5 History API (`pushState`, `popstate`) and is compatible with all modern browsers that support YNAB.

## Error Handling

- Invalid URLs are gracefully handled with fallback to default behavior
- Missing budget IDs result in console errors but don't break functionality
- Invalid report tabs fall back to the last accessed tab or default
