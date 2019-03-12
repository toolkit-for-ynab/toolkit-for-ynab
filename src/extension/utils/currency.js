export function formatCurrency(value) {
  const {
    currencyFormatter,
  } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
  const userCurrency = currencyFormatter.getCurrency();

  let formattedCurrency = currencyFormatter.format(value).toString();
  if (userCurrency.display_symbol) {
    if (userCurrency.symbol_first) {
      if (formattedCurrency.charAt(0) === '-') {
        formattedCurrency = `-${userCurrency.currency_symbol}${formattedCurrency.slice(1)}`;
      } else {
        formattedCurrency = `${userCurrency.currency_symbol}${formattedCurrency}`;
      }
    } else {
      formattedCurrency = `${formattedCurrency}${userCurrency.currency_symbol}`;
    }
  }

  return formattedCurrency;
}
