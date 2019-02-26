import fuzzysort from 'fuzzysort';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class FilterCategories extends Feature {
  TEXTBOX = `<div class="toolkit-categories-filter-wrapper">
                <i class="toolkit-categories-filter-icon flaticon stroke magnifying-glass-1"></i>
                <input id="toolkit-categories-filter-input" spellcheck="false" 
                placeholder="${ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.CategoriesFilterPlaceholder'] || 'Filter categories'}"
                 title="${ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.CategoriesFilterTitle'] || "Find the categories you're looking for..."}" 
                 autocomplete="off" type="text" class="toolkit-categories-filter-input ember-view ember-text-field">
                <button class="flaticon solid x-1 button toolkit-categories-filter-cancel-icon"></button>
             </div>`;

  shouldInvoke = () => {
    return isCurrentRouteBudgetPage() && $('.toolkit-categories-filter-wrapper:visible').length === 0;
  };

  injectCSS = () => {
    return require('./index.css');
  };

  observe = () => {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  };

  filterCategories = (text) => {
    $('.toolkit-categories-filter-hidden').removeClass('toolkit-categories-filter-hidden');
    if (!text) return;
    $('.budget-table-container .is-master-category').addClass('toolkit-categories-filter-hidden');
    $('.budget-table-container .is-sub-category').each((ind, el) => {
      let $el = $(el);
      let categoryName = $el.find('.budget-table-cell-name .user-entered-text').text().trim();
      let searchResult = fuzzysort.go(text, [categoryName], {
        threshold: -40000
      });
      if (searchResult.total === 0) {
        $el.addClass('toolkit-categories-filter-hidden');
      }
    });
  };

  _keyUpHandler = (e) => {
    this.filterCategories(e.target.value);
  };

  _clear = (e) => {
    $(e.target).parents('.toolkit-categories-filter-wrapper').find('input').val('');
    this.filterCategories('');
  };

  invoke = () => {
    let $textbox = $(this.TEXTBOX);
    $textbox.find('#toolkit-categories-filter-input').on('keyup', this._keyUpHandler);
    $textbox.find('.toolkit-categories-filter-cancel-icon').on('click', this._clear);
    if ($('.toolkit-budget-toolbar-buttons').length === 0) {
      $('.budget-toolbar').append('<div class="toolkit-budget-toolbar-buttons"></div>');
    }
    $('.toolkit-budget-toolbar-buttons').prepend($textbox);
  }
}
