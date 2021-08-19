import * as React from 'react';
import { localToolkitStorage } from 'toolkit/core/common/storage';

export function useDarkModeSetter() {
  function handleDarkModeChanged(_: string, newDarkMode: boolean) {
    if (newDarkMode) {
      document.querySelector('html').dataset['theme'] = 'dark';
    } else {
      document.querySelector('html').dataset['theme'] = '';
    }
  }

  React.useEffect(() => {
    localToolkitStorage.onFeatureSettingChanged('options.dark-mode', handleDarkModeChanged);

    return () => {
      localToolkitStorage.offFeatureSettingChanged('options.dark-mode', handleDarkModeChanged);
    };
  });
}
