import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import {
  addToolkitEmberHook,
  l10n,
  getToolkitStorageKey,
  setToolkitStorageKey,
} from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const HideClosedButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-closed', true);
  const label = isHidden ? l10n('app.show', 'Show') : l10n('app.hide', 'Hide');

  const toggleHidden = () => {
    toggleHiddenState(!isHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <li onClick={toggleHidden} id="tk-hide-closed-accounts">
      <button>
        <i className="flaticon stroke no" />
        {` ${label}`} Closed Accounts
      </button>
    </li>
  );
};

HideClosedButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};

export class HideClosedAccounts extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  insertHideClosed(element) {
    if ($('#tk-hide-closed-accounts', element).length) {
      return;
    }

    componentAppend(
      <HideClosedButton toggleHiddenState={this.setHiddenState} />,
      element.getElementsByClassName('modal-list')[0]
    );
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-closed', true);
    this.setHiddenState(initialState);
    addToolkitEmberHook(this, 'settings-menu', 'didRender', this.insertHideClosed);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-closed', state);
    if (state) {
      $('body').addClass('tk-hide-closed');
    } else {
      $('body').removeClass('tk-hide-closed');
    }
  };
}
