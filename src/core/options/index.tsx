import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { ToolkitOptions } from './toolkit-options';
import 'toolkit/core/common/styles/utils.scss';
import { localToolkitStorage } from '../common/storage';
import { getUserSettings } from '../settings';

getUserSettings().then(() => {
  localToolkitStorage.getStorageItem('toolkit-feature:options.dark-mode').then((darkMode) => {
    // backwards compatible migration from on/off dark mode
    if (typeof darkMode == 'boolean') {
      darkMode = darkMode ? 'dark' : 'light';
    }

    document.querySelector('html')!.dataset['theme'] = darkMode;

    ReactDOM.render(<ToolkitOptions />, document.getElementById('root'));
  });
});
