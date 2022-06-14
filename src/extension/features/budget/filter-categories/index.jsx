import React from 'react';
import fuzzysort from 'fuzzysort';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { componentPrepend } from 'toolkit/extension/utils/react';

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
      <i className="tk-categories-filter-icon flaticon stroke magnifying-glass-1"></i>
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
        className="flaticon solid x-1 button tk-categories-filter-cancel-icon"
        onClick={() => handleSetValue('')}
      ></button>
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
    this.addToolkitEmberHook('budget-table', 'didRender', this.handleTableRender);
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
        const masterCategoryRow = $(el).prevUntil('.is-master-category').last().prev();

        if (masterCategoryRow) {
          masterCategoryRow.removeClass('tk-categories-filter-hidden');
        }
      }
    });
  };

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    let budgetClasses = [
      'budget-table-row js-budget-table-row is-sub-category budget-table-last-row',
      'budget-header-flexbox',
      'budget-header-item budget-header-days tk-days-of-buffering',
      'budget-header-days-age',
      'budget-table-cell-activity budget-table-cell-flexed tk-activity-upcoming',
      'budget-table-cell-collapse',
    ];

    let found = false;
    for (let i = 0; i < budgetClasses.length; i++) {
      if (changedNodes.has(budgetClasses[i])) {
        found = true;
      }
    }
    if (found) {
      this.invoke();
    }
  }

  handleTableRender = (e) => {
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
