import * as React from 'react';
import { localToolkitStorage } from 'toolkit/core/common/storage';

export function useDarkModeSetter() {
  function handleDarkModeChanged(_: string, newDarkMode: string) {
    document.querySelector('html').dataset['theme'] = newDarkMode;
  }

  React.useEffect(() => {
    localToolkitStorage.onStorageItemChanged(
      'toolkit-feature:options.dark-mode',
      handleDarkModeChanged
    );

    return () => {
      localToolkitStorage.offStorageItemChanged(
        'toolkit-feature:options.dark-mode',
        handleDarkModeChanged
      );
    };
  });
}
