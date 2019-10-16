import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class ChangeMemoEnterBehavior extends Feature {
  shouldInvoke() {
    return (
      isCurrentRouteAccountsPage() &&
      $('.ynab-grid-body-row.is-adding, .ynab-grid-body-row.is-editing').length
    );
  }

  invoke() {
    const $addEditRow = $('.ynab-grid-body-row.is-adding, .ynab-grid-body-row.is-editing');
    const $memoInput = $('.ynab-grid-cell-memo input', $addEditRow);

    if (!$memoInput[0].getAttribute('data-toolkit-memo-behavior')) {
      $memoInput[0].setAttribute('data-toolkit-memo-behavior', true);
      $memoInput.keydown(this.applyNewEnterBehavior);
    }
  }

  applyNewEnterBehavior(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      const $addEditRow = $('.ynab-grid-body-row.is-adding, .ynab-grid-body-row.is-editing');
      const $memoColumn = $('.ynab-grid-cell-memo', $addEditRow);
      const $columns = $addEditRow.children();
      const $nextColumn = $($columns.get($columns.index($memoColumn) + 1));

      $nextColumn.find('input').focus();
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
