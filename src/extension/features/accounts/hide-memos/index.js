import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export const HideMemosButton = ({ toggleHiddenState }) => {
  const notHidden = getToolkitStorageKey('hide-memos', true);
  const label = notHidden ? 'is-checked' : 'not-checked';

  const toggleHidden = () => {
    toggleHiddenState(!notHidden);
    controllerLookup('application').send('closeModal');
  };

  return (
    <div className="modal-account-view-menu">
      <button onClick={toggleHidden} aria-label="Check Hide Memo Column" role="checkbox">
        <div className={`flaticon stroke ynab-checkbox-button-square ${label}`}></div>
      </button>
      <label className="label-checkbox">
        {` `}
        {l10n('toolkit.hideMemoColumn', 'Show Memo Column')}
      </label>
    </div>
  );
};

HideMemosButton.propTypes = {
  toggleHiddenState: PropTypes.func.isRequired,
};

export class HideMemos extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-generic modal-account-view-menu modal-overlay')) {
      componentAppend(
        <HideMemosButton toggleHiddenState={this.setHiddenState} />,
        document.getElementsByClassName('modal-content')[0]
      );
    }
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-memos', false);
    this.setHiddenState(initialState);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-memos', state);
    if (!state) {
      $('body').addClass('toolkit-hide-memos');
    } else {
      $('body').removeClass('toolkit-hide-memos');
    }
  };
}
