import {
  EMBER_COMPONENT_TOOLKIT_HOOKS,
  emberComponentToolkitHookKey,
} from 'toolkit/extension/ynab-toolkit';
import { componentLookup } from 'toolkit/extension/utils/ember';

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
  const isDevelopment = ynabToolKit.environment === 'development';
  if (!ynabToolKit.l10nData) {
    if (isDevelopment) {
      console.warn(
        `Localization data not loaded yet for ${key}!!! Make sure to call l10n within lifecycle or render event!`
      );
    }

    return defaultValue;
  }

  const localizedString = ynabToolKit.l10nData[key];
  if (!localizedString) {
    if (isDevelopment) {
      console.warn(`No localization key for ${key}, try running "yarn l10n:update"`);
    }

    return defaultValue;
  }

  return localizedString;
}

export function l10nMonth(monthIndex, short = MonthStyle.Long) {
  if (short === MonthStyle.Short) {
    return l10n(`months.${MONTHS_SHORT[monthIndex]}`, MONTHS_SHORT[monthIndex]);
  }

  return l10n(`months.${MONTHS_LONG[monthIndex]}`, MONTHS_LONG[monthIndex]);
}

export function addToolkitEmberHook(context, componentKey, lifecycleHook, fn) {
  const componentProto = Object.getPrototypeOf(componentLookup(componentKey));

  if (!EMBER_COMPONENT_TOOLKIT_HOOKS.includes(lifecycleHook)) {
    return;
  }

  let hooks = componentProto[emberComponentToolkitHookKey(lifecycleHook)];
  if (!hooks) {
    hooks = [{ context, fn }];
    componentProto[emberComponentToolkitHookKey(lifecycleHook)] = hooks;
  } else if (hooks && !hooks.some(({ fn: fnExists }) => fn === fnExists)) {
    hooks.push({ context, fn });
  }

  ynabToolKit.hookedComponents.add(componentKey);
}
