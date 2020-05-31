import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class CtrlEnterCleared extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row.is-adding').length;
  }

  invoke() {
    const $addRow = $('.ynab-grid-body-row.is-adding');
    const $memoInput = $('.ynab-grid-cell-memo input', $addRow);
    const $outflowInput = $('.ynab-grid-cell-outflow input', $addRow);
    const $inflowInput = $('.ynab-grid-cell-inflow input', $addRow);

    if (!$memoInput[0].getAttribute('data-toolkit-ctrl-behavior')) {
      $memoInput[0].setAttribute('data-toolkit-ctrl-behavior', true);
      $memoInput.keydown(this.applyCtrlEnter);
    }

    if (!$outflowInput[0].getAttribute('data-toolkit-ctrl-behavior')) {
      $outflowInput[0].setAttribute('data-toolkit-ctrl-behavior', true);
      $outflowInput.keydown(this.applyCtrlEnter);
    }

    if (!$inflowInput[0].getAttribute('data-toolkit-ctrl-behavior')) {
      $inflowInput[0].setAttribute('data-toolkit-ctrl-behavior', true);
      $inflowInput.keydown(this.applyCtrlEnter);
    }
  }

  applyCtrlEnter(event) {
    if (event.keyCode === 13 && (event.metaKey === true || event.ctrlKey === true)) {
      let $markClearedButton = $('.is-adding .ynab-cleared:not(.is-cleared)');
      if ($markClearedButton.length !== 0) {
        $markClearedButton[0].click();
      }
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-add-rows')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
