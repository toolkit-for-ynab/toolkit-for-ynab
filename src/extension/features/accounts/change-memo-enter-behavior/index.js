import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class ChangeMemoEnterBehavior extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && !!$('.ynab-grid-body-row.is-editing').length;
  }

  invoke() {
    const $editRows = $('.ynab-grid-body-row.is-editing');
    const $memoInputs = $('.ynab-grid-cell-memo input', $editRows);
    $memoInputs.each((_, input) => {
      if (!input.getAttribute('data-toolkit-memo-behavior')) {
        input.setAttribute('data-toolkit-memo-behavior', true);
        input.addEventListener('keydown', this.applyNewEnterBehavior);
      }
    });
  }

  destroy() {
    const $editInputs = $('input[data-toolkit-memo-behavior]');
    $editInputs.each((_, input) => {
      input.removeAttribute('data-toolkit-memo-behavior');
      input.removeEventListener('keydown', this.applyNewEnterBehavior);
    });
  }

  applyNewEnterBehavior(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      const $closestAddEditRow = $(this).closest(
        $('.ynab-grid-body-row.is-adding, .ynab-grid-body-row.is-editing'),
      );
      const $memoColumn = $('.ynab-grid-cell-memo', $closestAddEditRow);
      const $columns = $closestAddEditRow.children();
      const $nextColumn = $($columns.get($columns.index($memoColumn) + 1));

      $nextColumn.find('input').trigger('focus');
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
