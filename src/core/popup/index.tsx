import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { ToolkitPopup } from './toolkit-popup';

localToolkitStorage.getFeatureSetting('options.dark-mode').then((isDarkModeEnabled) => {
  if (isDarkModeEnabled) {
    document.querySelector('html').dataset['theme'] = 'dark';
  }

  ReactDOM.render(<ToolkitPopup />, document.getElementById('root'));
});
