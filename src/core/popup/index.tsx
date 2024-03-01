import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { ToolkitPopup } from './toolkit-popup';

localToolkitStorage.getStorageItem('toolkit-feature:options.dark-mode').then((darkMode) => {
  // backwards compatible migration from on/off dark mode
  if (typeof darkMode == 'boolean') {
    darkMode = darkMode ? 'dark' : 'light';
  }

  document.querySelector('html')!.dataset['theme'] = darkMode;

  ReactDOM.createRoot(document.getElementById('root')!).render(<ToolkitPopup />);
});
