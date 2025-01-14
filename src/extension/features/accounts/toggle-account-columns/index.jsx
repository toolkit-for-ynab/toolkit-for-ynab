import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import {
  getAccountsService,
  getModalService,
  isCurrentRouteAccountsPage,
} from 'toolkit/extension/utils/ynab';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const ShowMemoButton = ({ defaultIsShown, id, toggleState }) => {
  const toggleHidden = () => {
    toggleState(!defaultIsShown);
    getModalService()?.closeModal();
  };

  return (
    <li>
      <div className="modal-account-view-menu" id={id}>
        <button
          className={`ynab-checkbox ynab-checkbox-button modal-account-view-options-show-flag ${
            defaultIsShown ? 'is-checked' : ''
          }`}
          onClick={toggleHidden}
          role="checkbox"
          type="button"
        >
          <svg
            className={`ynab-new-icon ynab-checkbox-button-square ${
              defaultIsShown ? 'is-checked' : ''
            }`}
            width="13"
            height="13"
          >
            <use href="#icon_sprite_check"></use>
          </svg>
          <div class="label-checkbox">
            {l10n('toolkit.showMemoColumn', 'Show Memo Column')}
          </div>
        </button>
      </div>
    </li>
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

  observe(changedNodes) {
    if (changedNodes.has('modal-overlay active ynab-u modal-generic modal-account-view-options')) {
      this.insertToggles(document.querySelector('.modal-account-view-options'));
    }
  }

  destroy() {
    $('body').removeClass('tk-hide-memos');
  }

  insertToggles(element) {
    if (element.querySelector('#tk-show-memo') === null) {
      componentAppend(
        <ShowMemoButton
          id="tk-show-memo"
          defaultIsShown={this.getShowMemoState()}
          toggleState={this.updateShowMemoState}
        />,
        element.getElementsByClassName('modal-account-view-options-status')[0]
      );
    }
  }

  getShowMemoState = () => {
    const { selectedAccountId } = getAccountsService();
    if (!selectedAccountId) {
      return true;
    }

    return getToolkitStorageKey(`show-memo-column-${selectedAccountId}`, true);
  };

  updateShowMemoState = (state) => {
    const { selectedAccountId } = getAccountsService();
    if (!selectedAccountId) {
      return;
    }

    setToolkitStorageKey(`show-memo-column-${selectedAccountId}`, state);

    if (!state) {
      $('body').addClass('tk-hide-memos');
    } else {
      $('body').removeClass('tk-hide-memos');
    }
  };

  onRouteChanged() {
    if (isCurrentRouteAccountsPage()) {
      this.updateShowMemoState(this.getShowMemoState());
    }
  }
}
