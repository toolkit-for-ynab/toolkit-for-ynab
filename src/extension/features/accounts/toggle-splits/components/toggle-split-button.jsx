import * as React from 'react';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export class ToggleSplitButton extends React.Component {
  state = {
    areAllSplitsExpanded: getToolkitStorageKey('are-all-splits-expanded', true),
  };

  componentDidMount() {
    if (this.state.areAllSplitsExpanded) {
      this.showAllSplits();
    } else {
      this.hideAllSplits();
    }
  }

  render() {
    return (
      <button className="button tk-toggle-splits" onClick={this.toggleSplits}>
        {this.state.areAllSplitsExpanded && <i className="flaticon stroke down" />}
        {!this.state.areAllSplitsExpanded && <i className="flaticon stroke right" />}
        {l10n('toolkit.toggleSplits', 'Toggle Splits')}
      </button>
    );
  }

  toggleSplits = () => {
    let newAreAllSplitsExpanded = !this.state.areAllSplitsExpanded;
    if (newAreAllSplitsExpanded) {
      this.showAllSplits();
    } else {
      this.hideAllSplits();
    }

    setToolkitStorageKey('are-all-splits-expanded', newAreAllSplitsExpanded);
    this.setState({ areAllSplitsExpanded: newAreAllSplitsExpanded });
  };

  hideAllSplits = () => {
    const { scheduledTransactionsCollection, transactionsCollection } = getEntityManager();
    const collapsedSplitsMap = {};

    [scheduledTransactionsCollection, transactionsCollection].forEach(collection => {
      collection.reduce((reduced, transaction) => {
        if (transaction.getIsSplit()) {
          reduced[transaction.get('entityId')] = true;
        }

        return reduced;
      }, collapsedSplitsMap);
    });

    const emberView = getEmberView($('.ynab-grid').attr('id'));
    if (emberView) {
      emberView.set('collapsedSplits', collapsedSplitsMap);
    }
  };

  showAllSplits = () => {
    const emberView = getEmberView($('.ynab-grid').attr('id'));
    if (emberView) {
      emberView.set('collapsedSplits', {});
    }
  };
}
