export function formatCurrency(value, hideSymbol) {
  const {
    currencyFormatter,
  } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
  const userCurrency = currencyFormatter.getCurrency();

  let formattedCurrency = currencyFormatter.format(value).toString();

  if (hideSymbol === true) return formattedCurrency;

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

export function stripCurrency(text) {
  const {
    currencyFormatter,
  } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
  const numberInDollars = currencyFormatter.unformat(text);
  return currencyFormatter.convertToMilliDollars(numberInDollars);
}
