export function controllerLookup(controllerName) {
  return containerLookup(`controller:${controllerName}`);
}

export function componentLookup(componentName) {
  return containerLookup(`component:${componentName}`);
}

export function scheduleOnce(onEvent, handler) {
  Ember.run.scheduleOnce(onEvent, handler);
}

export function getEmberView(viewId) {
  return getViewRegistry()[viewId];
}

export function getCurrentRouteName() {
  let applicationController = controllerLookup('application');
  return applicationController.get('currentRouteName');
}

export function getCategoriesViewModel() {
  return ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel();
}

export function getAllBudgetMonthsViewModel() {
  return ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel();
}

export function getCurrentDate(format) {
  return ynabDate(format, false);
}

export function formatCurrency(value) {
  let userCurrency = ynab.YNABSharedLib.currencyFormatter.getCurrency();
  let currencyFormatter = new ynab.formatters.CurrencyFormatter;
  currencyFormatter.initialize(userCurrency);
  userCurrency = currencyFormatter.getCurrency()

  let formattedCurrency = currencyFormatter.format(value).toString();
  if (userCurrency.symbol_first) {
    if (formattedCurrency.charAt(0) === '-') {
      formattedCurrency = `-${userCurrency.currency_symbol}${formattedCurrency.slice(1)}`;
    } else {
      formattedCurrency = `${userCurrency.currency_symbol}${formattedCurrency}`;
    }
  } else {
    formattedCurrency = `${formattedCurrency}${userCurrency.currency_symbol}`;
  }

  return formattedCurrency;
}

/* Private Functions */
function getViewRegistry() {
  return Ember.Component.create().get('_viewRegistry');
}

function containerLookup(containerName) {
  let viewRegistry = getViewRegistry();
  let viewId = Ember.keys(viewRegistry)[0];
  let view = viewRegistry[viewId];
  return view.container.lookup(containerName);
}

function ynabDate(format) {
  if (typeof format !== 'string') {
    return ynab.YNABSharedLib.dateFormatter.formatDate();
  }

  return ynab.YNABSharedLib.dateFormatter.formatDate(moment(), format);
}
