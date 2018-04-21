import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { i10n } from 'toolkit/extension/utils/toolkit';

function isNotSubTransaction(transaction) {
  const displayItemType = transaction.get('displayItemType');
  return displayItemType !== ynab.constants.TransactionDisplayItemType.SubTransaction &&
          displayItemType !== ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction;
}

export class ToggleSplits extends Feature {
  expanded = false;

  get idName() {
    return 'toggle-splits';
  }

  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('account') !== -1 && !$(`#${this.idName}`).length;
  }

  invoke() {
    this.accountsController = controllerLookup('accounts');

    const buttonText = i10n('toolkit.toggleSplits', 'Toggle Splits');
    this.$button = $('<button>', { id: this.idName, class: 'ember-view button' })
      .append($('<i>', { class: 'ember-view flaticon stroke right' }).toggle(!this.expanded))
      .append($('<i>', { class: 'ember-view flaticon stroke down' }).toggle(this.expanded))
      .append(buttonText)
      .insertAfter('.accounts-toolbar .undo-redo-container');

    $('.accounts-toolbar-left').addClass('toolkit-accounts-toolbar-left');

    this.$button.click(() => this.toggle());

    // Only want to wrap contentResults once
    if (typeof this.accountsController.get('toolkitShowSubTransactions') === 'undefined') {
      const ynabContentResults = this.accountsController.contentResults;
      this.accountsController.reopen({
        toolkitShowSubTransactions: this.expanded,
        toolkitShowSubTransactionsChanged: Ember.observer('toolkitShowSubTransactions', function () {
          Ember.run.debounce(() => {
            this.notifyPropertyChange('contentResults');
          }, 25);
        }),
        contentResults: Ember.computed(...ynabContentResults._dependentKeys, {
          get: function () {
            let contentResults = ynabContentResults._getter.apply(this);
            if (!this.get('toolkitShowSubTransactions')) {
              contentResults = contentResults.filter(isNotSubTransaction);
            }
            return contentResults;
          },
          set: function (_key, val) {
            return val;
          }
        })
      });
    }

    // Trigger default state
    this.accountsController.notifyPropertyChange('contentResults');
  }

  onserve(changedNodes) {
    if (changedNodes.has('ynab-grid-body') && this.shouldInvoke()) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  toggle() {
    this.accountsController.set('toolkitShowSubTransactions', this.expanded = !this.expanded);
    $('> i', this.$button).toggle();
  }
}
