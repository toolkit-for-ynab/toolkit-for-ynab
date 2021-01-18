import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import {
  addToolkitEmberHook,
  l10n,
  getToolkitStorageKey,
  setToolkitStorageKey,
} from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export const ShowMemoButton = ({ defaultIsShown, id, toggleState }) => {
  const toggleHidden = () => {
    toggleState(!defaultIsShown);
    controllerLookup('application').send('closeModal');
  };

  return (
    <div className="modal-account-view-menu" id={id}>
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
  id: PropTypes.string.isRequired,
  toggleState: PropTypes.func.isRequired,
};

export class ToggleAccountColumns extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(this, 'modals/register/view-menu', 'didRender', this.insertToggles);
  }

  insertToggles(element) {
    if (element.querySelector('#tk-show-memo') === null) {
      componentAppend(
        <ShowMemoButton
          id="tk-show-memo"
          defaultIsShown={this.getShowMemoState()}
          toggleState={this.updateShowMemoState}
        />,
        element.getElementsByClassName('modal-content')[0]
      );
    }
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
    if (isCurrentRouteAccountsPage()) {
      this.updateShowMemoState(this.getShowMemoState());
    }
  }
}
