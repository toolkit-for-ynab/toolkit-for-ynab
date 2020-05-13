import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class RemoveZeroCategories extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    let coverOverbudgetingCategories = $('.modal-budget-overspending .dropdown-list > li');
    coverOverbudgetingCategories.each(function() {
      let t = $(this)
        .find('.category-available')
        .attr('title'); // Category balance text.
      if (t == null) {
        return;
      }
      let categoryBalance = parseInt(t.replace(/[^\d-]/g, ''));
      if (categoryBalance <= 0) {
        $(this).remove();
      }
    });

    coverOverbudgetingCategories = $('.modal-budget-overspending .dropdown-list > li');

    // Remove empty sections.
    for (let i = 0; i < coverOverbudgetingCategories.length - 1; i++) {
      if (
        $(coverOverbudgetingCategories[i]).hasClass('section-item') &&
        $(coverOverbudgetingCategories[i + 1]).hasClass('section-item')
      ) {
        $(coverOverbudgetingCategories[i]).remove();
      }
    }

    // Remove last section empty.
    if (coverOverbudgetingCategories.last().hasClass('section-item')) {
      coverOverbudgetingCategories.last().remove();
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (changedNodes.has('category-item-container')) {
      this.invoke();
    }
  }
}
