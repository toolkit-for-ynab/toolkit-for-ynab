import {
  EMBER_COMPONENT_TOOLKIT_HOOKS,
  emberComponentToolkitHookKey,
} from 'toolkit/extension/ynab-toolkit';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export const MonthStyle = {
  Short: 0,
  Long: 1,
};

export function getToolkitStorageKey(key, defaultValue) {
  let serializedValue = localStorage.getItem(STORAGE_KEY_PREFIX + key);

  if (serializedValue === null || serializedValue === 'undefined') {
    return defaultValue;
  }

  try {
    return JSON.parse(serializedValue);
  } catch (e) {
    return defaultValue;
  }
}

export function setToolkitStorageKey(key, value) {
  return localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
}

export function removeToolkitStorageKey(key) {
  return localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

export function l10n(key, defaultValue) {
  return (ynabToolKit.l10nData && ynabToolKit.l10nData[key]) || defaultValue;
}

export function l10nMonth(monthIndex, short = MonthStyle.Long) {
  if (short === MonthStyle.Short) {
    return l10n(`months.${MONTHS_SHORT[monthIndex]}`, MONTHS_SHORT[monthIndex]);
  }

  return l10n(`months.${MONTHS_LONG[monthIndex]}`, MONTHS_LONG[monthIndex]);
}

export function addToolkitEmberHook(context, proto, lifecycleHook, fn) {
  const containerKey = proto._debugContainerKey;

  if (!EMBER_COMPONENT_TOOLKIT_HOOKS.includes(lifecycleHook)) {
    return;
  }

  const hooks = proto[emberComponentToolkitHookKey(lifecycleHook)];
  if (!hooks) {
    proto[emberComponentToolkitHookKey(lifecycleHook)] = [{ context, fn }];
  } else if (hooks && !hooks.some(({ fn: fnExists }) => fn === fnExists)) {
    hooks.push({ context, fn });
  }

  const viewRegistry = proto.renderer._viewRegistry;
  for (let key in viewRegistry) {
    if (viewRegistry[key]._debugContainerKey === containerKey) {
      viewRegistry[key].rerender();
    }
  }
}
