import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export const ShowMemoButton = ({ defaultIsShown, toggleState }) => {
  const toggleHidden = () => {
    toggleState(!defaultIsShown);
    controllerLookup('application').send('closeModal');
  };

  return (
    <div className="modal-account-view-menu">
      <button
        onClick={toggleHidden}
        aria-label={l10n('toolkit.checkShowMenuColumn', 'Check Show Memo Column')}
        role="checkbox"
      >
        <div
          className={`flaticon stroke ynab-checkbox-button-square ${
            defaultIsShown ? 'is-checked' : ''
          }`}
        ></div>
      </button>
      <label onClick={toggleHidden} className="label-checkbox">
        &nbsp;{l10n('toolkit.showMemoColumn', 'Show Memo Column')}
      </label>
    </div>
  );
};

ShowMemoButton.propTypes = {
  defaultIsShown: PropTypes.bool.isRequired,
  toggleState: PropTypes.func.isRequired,
};

export class ToggleAccountColumns extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-generic modal-account-view-menu modal-overlay')) {
      componentAppend(
        <ShowMemoButton
          defaultIsShown={this.getShowMemoState()}
          toggleState={this.updateShowMemoState}
        />,
        document.getElementsByClassName('modal-content')[0]
      );
    }
  }

  invoke() {
    this.updateShowMemoState(this.getShowMemoState());
  }

  getShowMemoState = () => {
    const { selectedAccountId } = controllerLookup('accounts');
    if (!selectedAccountId) {
      return true;
    }

    return getToolkitStorageKey(`show-memo-column-${selectedAccountId}`, true);
  };

  updateShowMemoState = state => {
    const { selectedAccountId } = controllerLookup('accounts');
    if (!selectedAccountId) {
      return;
    }

    setToolkitStorageKey(`show-memo-column-${selectedAccountId}`, state);

    if (!state) {
      $('body').addClass('toolkit-hide-memos');
    } else {
      $('body').removeClass('toolkit-hide-memos');
    }
  };

  onRouteChanged() {
    if (!isCurrentRouteAccountsPage()) {
      return;
    }

    this.invoke();
  }
}
