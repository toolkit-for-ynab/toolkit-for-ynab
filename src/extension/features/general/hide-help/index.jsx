import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import {
  addToolkitEmberHook,
  l10n,
  getToolkitStorageKey,
  setToolkitStorageKey,
} from 'toolkit/extension/utils/toolkit';

const HideHelpButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-help', true);
  const label = isHidden ? l10n('app.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <li onClick={toggleHidden} id="tk-hide-help">
      <button>
        <i className="flaticon stroke help-2" />
        {` ${label}`} Help Button
      </button>
    </li>
  );
};

HideHelpButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};

export class HideHelp extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  insertHideHelp(element) {
    if ($('#tk-hide-help', element).length) {
      return;
    }

    componentAppend(
      <HideHelpButton toggleHiddenState={this.setHiddenState} />,
      element.getElementsByClassName('modal-list')[0]
    );
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-help', true);
    this.setHiddenState(initialState);
    addToolkitEmberHook(this, 'settings-menu', 'didRender', this.insertHideHelp);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-help', state);
    if (state) {
      $('body').addClass('toolkit-hide-help');
    } else {
      $('body').removeClass('toolkit-hide-help');
    }
  };
}
