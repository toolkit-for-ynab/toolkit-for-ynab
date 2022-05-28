import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const HideClosedButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-closed', true);
  const label = isHidden ? l10n('toolkit.show', 'Show') : l10n('app.hide', 'Hide');

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

  invoke() {
    const initialState = getToolkitStorageKey('hide-closed', true);
    this.setHiddenState(initialState);
    this.onElement('.ynab-new-settings-menu', this.insertHideClosed, {
      guard: '#tk-hide-closed-accounts',
    });
  }

  observe() {
    this.onElement('.ynab-new-settings-menu', this.insertHideClosed, {
      guard: '#tk-hide-closed-accounts',
    });
  }

  destroy() {
    $('#tk-hide-closed-accounts').remove();
    $('body').removeClass('tk-hide-closed');
  }

  insertHideClosed(element) {
    componentAppend(
      <HideClosedButton toggleHiddenState={this.setHiddenState} />,
      element.getElementsByClassName('modal-list')[0]
    );
  }

  setHiddenState = (state) => {
    setToolkitStorageKey('hide-closed', state);
    if (state) {
      $('body').addClass('tk-hide-closed');
    } else {
      $('body').removeClass('tk-hide-closed');
    }
  };
}
