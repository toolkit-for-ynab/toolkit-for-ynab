(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.splitKeyboardShortcut = (function () {
      return {
        observe(changedNodes) {
          if (/accounts/.test(window.location.href)) {
            if (changedNodes.regex(/^(?=.*\smodal-account-categories\s)(?=.*?\sactive)((?!closing).)*$/gm)) {
              var splitButton = $('.button.button-primary.modal-account-categories-split-transaction');

              // return if we are already inside a split subtransaction
              if (splitButton.length < 1) return false;

              var splitIcon = splitButton.html();
              var categoryList = $('.modal-account-categories .modal-list');
              var liElement = $(`<li class="user-data">
                                      <button class="button-list ">
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
                    splitButton.mousedown();
                  }
                }
              }).on('keyup', function () {
                const categoryInputString = new RegExp('^' + $(this).val());
                if (categoryInputString.test('split') && categoryList.find('.no-button').length === 1) {
                  // highlight new split button if input contains part of
                  // 'split' and there are no other categories available
                  liElement.find('.button-list').addClass('is-highlighted');
                } else {
                  liElement.find('.button-list').removeClass('is-highlighted');
                }
              });

              liElement.on('mousedown', function () {
                splitButton.mousedown();
              });
            }
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
