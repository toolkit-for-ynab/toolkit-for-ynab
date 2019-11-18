export function formatCurrency(valueInMilliDollars, hideSymbol) {
  const {
    currencyFormatter,
  } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
  const userCurrency = currencyFormatter.getCurrency();

  let formattedCurrency = currencyFormatter.format(valueInMilliDollars).toString();

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

export function stripCurrency(formattedCurrencyText) {
  const {
    currencyFormatter,
  } = ynab.YNABSharedLibWebInstance.firstInstanceCreated.formattingManager;
  const numberInDollars = currencyFormatter.unformat(formattedCurrencyText);
  return currencyFormatter.convertToMilliDollars(numberInDollars);
}
