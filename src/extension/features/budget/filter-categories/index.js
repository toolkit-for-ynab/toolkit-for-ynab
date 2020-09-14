import fuzzysort from 'fuzzysort';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class FilterCategories extends Feature {
  shouldInvoke = () => {
    return isCurrentRouteBudgetPage() && $('.tk-categories-filter-wrapper').length === 0;
  };

  injectCSS = () => {
    return require('./index.css');
  };

  observe = () => {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  };

  filterCategories = text => {
    $('.tk-categories-filter-hidden').removeClass('tk-categories-filter-hidden');
    if (!text) {
      return;
    }

    $('.budget-table-container .is-master-category').addClass('tk-categories-filter-hidden');

    $('.budget-table-container .is-sub-category').each((_, el) => {
      const { category } = getEmberView(el.id);
      if (!category) {
        return;
      }

      let searchResult = fuzzysort.go(text, [category.displayName], {
        threshold: -40000,
      });

      if (searchResult.total === 0) {
        el.classList.add('tk-categories-filter-hidden');
      } else {
        const masterCategoryRow = $(el)
          .prevUntil('.is-master-category')
          .last()
          .prev();

        if (masterCategoryRow) {
          masterCategoryRow.removeClass('tk-categories-filter-hidden');
        }
      }
    });
  };

  _keyUpHandler = e => {
    this.filterCategories(e.target.value);
  };

  _clear = () => {
    $('#tk-categories-filter-input').val('');
    this.filterCategories('');
  };

  invoke = () => {
    let $textbox = $(`<div class="tk-categories-filter-wrapper">
        <i class="tk-categories-filter-icon flaticon stroke magnifying-glass-1"></i>
        <input id="tk-categories-filter-input" spellcheck="false"
        placeholder="${l10n('toolkit.filterCategories', 'Filter categories...')}"
        title="${l10n(
          'toolkit.filterCategoriesTooltip',
          "Find the categories you're looking for..."
        )}"
        autocomplete="off" type="text" class="tk-categories-filter-input ember-view ember-text-field">
        <button class="flaticon solid x-1 button tk-categories-filter-cancel-icon"></button>
    </div>`);

    $textbox.find('#tk-categories-filter-input').on('keyup', this._keyUpHandler);
    $textbox.find('.tk-categories-filter-cancel-icon').on('click', this._clear);
    $('.budget-toolbar').prepend($textbox);
  };
}
