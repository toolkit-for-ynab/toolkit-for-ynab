import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const BUDGET_CATEGORIES_DROPDOWN_NODE = 'ynab-u modal-popup modal-account-dropdown modal-account-categories ember-view modal-overlay active';

export class SplitKeyboardShortcut extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes) {
    if (isCurrentRouteAccountsPage()) {
      if (changedNodes.has(BUDGET_CATEGORIES_DROPDOWN_NODE)) {
        const splitButton = $('.button.button-primary.modal-account-categories-split-transaction');

        // return if we are already inside a split subtransaction
        if (splitButton.length < 1) return false;

        const splitIcon = splitButton.html();
        const categoryList = $('.modal-account-categories .modal-list');
        const liElement = $(`<li class="user-data">
                              <button class="button-list">
                                <div class="modal-account-categories-category" title="Split Transaction">
                                  <span class="modal-account-categories-category-name"></span>
                                </div>
                              </button>
                            </li>`);

        liElement.find('.modal-account-categories-category-name').html(splitIcon);
        categoryList.append('<li class="user-data"><strong class="modal-account-categories-section-item">Actions:</strong></li>');
        categoryList.append(liElement);

        $('.ynab-grid-cell-subCategoryName input').on('keydown', function (e) {
          if (e.which === 13 || e.which === 9) {
            // Enter or Tab
            if (liElement.find('.button-list').hasClass('is-highlighted')) {
              e.preventDefault();
              splitButton.click();
            }
          }
        }).on('keyup', function () {
          const categoryInputString = new RegExp('^s(?:p|$)(?:l|$)(?:i|$)(?:t|$)', 'i');
          if (categoryInputString.test($(this).val()) && categoryList.find('li').length === 3) {
            // highlight new split button if input contains part of
            // 'split' and there are no other categories available
            categoryList.addClass('toolkit-hide-firstchild');
            liElement.find('.button-list').addClass('is-highlighted');
          } else {
            categoryList.removeClass('toolkit-hide-firstchild');
            liElement.find('.button-list').removeClass('is-highlighted');
          }
        });

        liElement.on('click', function () {
          splitButton.click();
        });
      }
    }
  }
}
