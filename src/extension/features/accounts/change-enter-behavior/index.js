import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class ChangeEnterBehavior extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && !!$('.ynab-grid-body-row.is-editing').length;
  }

  invoke() {
    const $editRows = $('.ynab-grid-body-row.is-editing');
    const $editInputs = $(
      '.ynab-grid-cell-memo input, .ynab-grid-cell-outflow input, .ynab-grid-cell-inflow input',
      $editRows,
    );
    $editInputs.each((_, input) => {
      if (!input.getAttribute('data-toolkit-save-behavior')) {
        input.setAttribute('data-toolkit-save-behavior', true);
        input.addEventListener('keydown', this.applyNewEnterBehavior);
      }
    });
  }

  destroy() {
    const $editInputs = $('input[data-toolkit-save-behavior]');
    $editInputs.each((_, input) => {
      input.removeAttribute('data-toolkit-save-behavior');
      input.removeEventListener('keydown', this.applyNewEnterBehavior);
    });
  }

  applyNewEnterBehavior(event) {
    // This check is added so that there is no conflict with ChangeMemoEnterBehavior
    if ($(this)[0].getAttribute('data-toolkit-memo-behavior')) return;
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      // Trigger blur event so YNAB can apply the value
      $(this).trigger(jQuery.Event('blur'));

      const $saveButton = $('.ynab-grid-actions-buttons .button-save');
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
