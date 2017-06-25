const storageKeyPrefix = 'ynab-toolkit-';

export function controllerLookup(controllerName) {
  return containerLookup(`controller:${controllerName}`);
}

export function componentLookup(componentName) {
  return containerLookup(`component:${componentName}`);
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
  userCurrency = currencyFormatter.getCurrency();

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

export function getToolkitStorageKey(key, type) {
  let value = localStorage.getItem(storageKeyPrefix + key);

  switch (type) {
    case 'boolean': return value === 'true';
    case 'number': return Number(value);
    default: return value;
  }
}

export function setToolkitStorageKey(key, value) {
  return localStorage.setItem(storageKeyPrefix + key, value);
}

export function removeToolkitStorageKey(key) {
  return localStorage.removeItem(storageKeyPrefix + key);
}

export function transitionTo() {
  const router = containerLookup('router:main');
  router.transitionTo(...arguments);
}

/* Private Functions */
function getViewRegistry() {
  return Ember.Component.create().get('_viewRegistry');
}

function containerLookup(containerName) {
  const viewRegistry = getViewRegistry();
  const viewId = Ember.keys(viewRegistry)[0];
  const view = viewRegistry[viewId];

  let container;
  try {
    container = view.container.lookup(containerName);
  } catch (e) {
    container = view.container.factoryCache[containerName];
  }

  return container;
}

function ynabDate(format) {
  if (typeof format !== 'string') {
    return ynab.YNABSharedLib.dateFormatter.formatDate();
  }

  return ynab.YNABSharedLib.dateFormatter.formatDate(moment(), format);
}
