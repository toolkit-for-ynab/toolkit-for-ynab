import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { componentLookup } from 'toolkit/extension/utils/ember';
import { l10nMonth, MonthStyle } from 'toolkit/extension/utils/toolkit';

export class StealingFromFuture extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('budget-header', 'didRender', this.updateReadyToAssign);
    $('.to-be-budgeted').each((_, el) => this.updateReadyToAssign(el));
  }

  destroy() {
    const toBeBudgeted = $('.to-be-budgeted');
    $(toBeBudgeted).removeClass('is-negative');
    $('.tk-stealing-from-future', toBeBudgeted).remove();
    $('.to-be-budgeted-label', toBeBudgeted).css('display', 'initial');
  }

  updateReadyToAssign(header) {
    $('.tk-stealing-from-future', header).remove();

    const budgetBreakdown = componentLookup('budget-breakdown');
    if (!budgetBreakdown) return;

    const { negativeFutureBudgetedMonth } = budgetBreakdown;
    if (
      negativeFutureBudgetedMonth &&
      budgetBreakdown.month.isBeforeMonth(negativeFutureBudgetedMonth.month)
    ) {
      $('.budget-header-totals', header).after(
        $(`<div class="budget-header-item tk-stealing-from-future is-negative">
            <div class="to-be-budgeted is-negative">
              <button>
                <div class="to-be-budgeted-amount">
                  <span class="user-data currency negative">${formatCurrency(
                    negativeFutureBudgetedMonth.available
                  )}</span>
                </div>
                <div class="to-be-budgeted-label">in ${l10nMonth(
                  negativeFutureBudgetedMonth.month.getMonth(),
                  MonthStyle.Long
                )}</div>
              </button>
            </div>
          </div>`)
      );

      $('.tk-stealing-from-future button').on('click', () => {
        componentLookup('budget-breakdown')?.send('goToFutureMonth');
      });
    }
  }
}
