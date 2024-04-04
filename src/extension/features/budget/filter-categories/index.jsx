import React from 'react';
import fuzzysort from 'fuzzysort';
import debounce from 'debounce';
import { Feature } from 'toolkit/extension/features/feature';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { componentPrepend } from 'toolkit/extension/utils/react';
import { getBudgetMonthDisplaySubCategory } from '../utils';

function CategorySearchInput({ applySearch }) {
  const [value, setValue] = React.useState('');
  const handleSetValue = React.useCallback(
    (newValue) => {
      setValue(newValue);
      applySearch(newValue);
    },
    [applySearch]
  );

  React.useEffect(() => {
    applySearch(value);
  }, []);

  return (
    <div id="tk-categories-filter" className="tk-categories-filter-wrapper">
      <div style={{ position: 'absolute', left: '8px', top: '8px' }}>
        <svg className="ynab-new-icon" width="16" height="16">
          <use href="#icon_sprite_search" />
        </svg>
      </div>
      <input
        id="tk-categories-filter-input"
        spellCheck={false}
        placeholder={l10n('toolkit.filterCategories', 'Filter categories...')}
        title={l10n('toolkit.filterCategoriesTooltip', "Find the categories you're looking for...")}
        autoComplete="off"
        type="text"
        className="tk-categories-filter-input ember-view ember-text-field"
        onChange={(event) => handleSetValue(event.target.value)}
        value={value}
      />
      <button
        className="button tk-categories-filter-cancel-icon"
        onClick={() => handleSetValue('')}
      >
        <svg className="ynab-new-icon" width="12" height="12">
          <use href="#icon_sprite_close" />
        </svg>
      </button>
    </div>
  );
}

export class FilterCategories extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    const table = document.querySelector('.budget-table');
    if (!table) return;
    this.handleTableRender();
  }

  debouncedInvoke = debounce(this.invoke, 200);

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-table')) {
      this.debouncedInvoke();
    }
  }

  destroy() {
    $('.tk-categories-filter-wrapper').remove();
    $('.tk-categories-filter-hidden').removeClass('tk-categories-filter-hidden');
  }

  applySearch = (text) => {
    $('.tk-categories-filter-hidden').removeClass('tk-categories-filter-hidden');

    if (!text) {
      return;
    }

    if (/^underfunded$/.test(text)) {
      $('.budget-table-container .is-sub-category').each((_, el) => {
        const category = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
        if (category.goalUnderFundedAmount === 0) {
          $(`#${el.id}`).addClass('tk-categories-filter-hidden');
        }
      });

      $('.budget-table-container .is-master-category').addClass('tk-categories-filter-hidden');

      return;
    }

    if (/^-available$/g.test(text)) {
      $('.budget-table-container .is-sub-category').each((_, el) => {
        const category = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
        if (category.available === 0) {
          $(`#${el.id}`).addClass('tk-categories-filter-hidden');
          $(`#${el.id}`)
            .prev('.budget-table-container .is-master-category')
            .addClass('tk-categories.filter-hidden');
        }
      });
      return;
    }

    if (/^available$/g.test(text)) {
      $('.budget-table-container .is-sub-category').each((_, el) => {
        const category = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
        if (category.available <= 0) {
          $(`#${el.id}`).addClass('tk-categories-filter-hidden');
          $(`#${el.id}`)
            .prev('.budget-table-container .is-master-category')
            .addClass('tk-categories.filter-hidden');
        }
      });
      return;
    }

    if (/^goal$/g.test(text)) {
      $('.budget-table-container .is-sub-category').each((_, el) => {
        const category = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
        if (category.goalTargetAmount === 0) {
          $(`#${el.id}`).addClass('tk-categories-filter-hidden');
        }
      });

      return;
    }

    if (/^-goal$/g.test(text)) {
      $('.budget-table-container .is-sub-category').each((_, el) => {
        const category = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
        if (category.goalTargetAmount !== 0) {
          $(`#${el.id}`).addClass('tk-categories-filter-hidden');
        }
      });

      return;
    }

    $('.budget-table-container .is-master-category').addClass('tk-categories-filter-hidden');

    $('.budget-table-container .is-sub-category').each((_, el) => {
      const { category } = getBudgetMonthDisplaySubCategory(el.dataset.entityId);
      if (!category) {
        return;
      }

      let searchResult = fuzzysort.go(text, [category.displayName], {
        threshold: -40000,
      });

      if (searchResult.total === 0) {
        el.classList.add('tk-categories-filter-hidden');
      } else {
        const masterCategoryRow = $(el).prevUntil('.is-master-category').last().prev();

        if (masterCategoryRow) {
          masterCategoryRow.removeClass('tk-categories-filter-hidden');
        }
      }
    });
  };

  handleTableRender = () => {
    if (document.querySelector('#tk-categories-filter') === null) {
      componentPrepend(
        <CategorySearchInput applySearch={this.applySearch} />,
        document.querySelector('.budget-toolbar')
      );
    }

    const input = document.querySelector('#tk-categories-filter-input');
    if (input) {
      this.applySearch(input.getAttribute('value'));
    }
  };
}
