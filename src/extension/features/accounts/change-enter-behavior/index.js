import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class ChangeEnterBehavior extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row.is-editing').length;
  }

  invoke() {
    const $editRows = $('.ynab-grid-body-row.is-editing');
    const $editInputs = $(
      '.ynab-grid-cell-memo input, .ynab-grid-cell-outflow input, .ynab-grid-cell-inflow input',
      $editRows
    );
    $editInputs.each((index, input) => {
      if (!input.getAttribute('data-toolkit-ctrl-behavior')) {
        input.setAttribute('data-toolkit-ctrl-behavior', true);
        input.addEventListener('keydown', this.applyNewEnterBehavior);
      }
    });
  }

  applyNewEnterBehavior(event) {
    // This check is added so that there is no conflict with ChangeMemoEnterBehavior
    if ($(this)[0].getAttribute('data-toolkit-memo-behavior')) return;
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      // Added to support CtrlEnterCleared when ChangeEnterBehavior is enabled
      if (
        ynabToolKit.options.CtrlEnterCleared === true &&
        (event.metaKey === true || event.ctrlKey === true)
      ) {
        let $markClearedButton = $('.is-editing .ynab-cleared:not(.is-cleared)');
        if ($markClearedButton.length !== 0) {
          $markClearedButton[0].click();
        }
      }

      const $saveButton = $('.ynab-grid-actions-buttons .button.button-primary');
      $saveButton.trigger('click');
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
