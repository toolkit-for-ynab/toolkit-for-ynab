import * as React from 'react';
import * as PropTypes from 'prop-types';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const HideHelpButton = ({ toggleHiddenState }) => {
  const isHidden = getToolkitStorageKey('hide-help', true);
  const label = isHidden ? l10n('toolkit.show', 'Show') : l10n('app.hide', 'Hide');

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

  invoke() {
    const initialState = getToolkitStorageKey('hide-help', true);
    this.setHiddenState(initialState);
    this.onElement('.ynab-new-settings-menu', this.insertHideHelp, { guard: '#tk-hide-help' });
  }

  observe() {
    this.onElement('.ynab-new-settings-menu', this.insertHideHelp, { guard: '#tk-hide-help' });
  }

  destroy() {
    $('#tk-hide-help').remove();
    $('body').removeClass('toolkit-hide-help');
  }

  insertHideHelp(element) {
    componentAppend(
      <HideHelpButton toggleHiddenState={this.setHiddenState} />,
      element.getElementsByClassName('modal-list')[0]
    );
  }

  setHiddenState = (state) => {
    setToolkitStorageKey('hide-help', state);
    if (state) {
      $('body').addClass('toolkit-hide-help');
    } else {
      $('body').removeClass('toolkit-hide-help');
    }
  };
}
