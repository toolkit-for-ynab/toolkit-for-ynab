(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.resizeAccountColumns = (function () {
      const minimumWidth = 50;
      const localStoragePrefix = 'resizable-columns-';
      const resizableColumns = [
        'ynab-grid-cell-payeeName',
        'ynab-grid-cell-subCategoryName',
        'ynab-grid-cell-memo'
      ];

      let dragging = false;

      function preventEverything(event) {
        event.preventDefault();
        event.stopPropagation();
      }

      function setWidthForHeaderAndRows(className, width) {
        $('.ynab-grid-header-row .' + className).width(width);
        $('.ynab-grid-body .ynab-grid-body-row-top .' + className).width(width);
      }

      function applyPersistedSettings() {
        resizableColumns.forEach((className) => {
          let persistedWidth = parseFloat(ynabToolKit.shared.getLocalStorageItem(localStoragePrefix + className));
          if (persistedWidth) {
            setWidthForHeaderAndRows(className, persistedWidth);
          }
        });
      }

      function addResizable(className) {
        // if we already have a resizer then we can get out of here, but if the column just
        // got sorted, it might have lost the relative position, double check that right quick
        if ($('.ynab-grid-header-row .' + className + ' > .resizer').length) {
          // if the relative class is gone, just add it back and then return
          if (!$('.ynab-grid-header-row .' + className).hasClass('ynab-toolkit-resize-relative')) {
            $('.ynab-grid-header-row .' + className).addClass('ynab-toolkit-resize-relative');
          }

          return;
        }

        $('.ynab-grid-header-row .' + className).addClass('ynab-toolkit-resize-relative').click(function (event) {
          // if we clicked the header after dragging (dragged our cursor into the header)
          // then prevent the click from making it through, we're not trying to sort.
          if (dragging) {
            event.preventDefault();
            event.stopPropagation();
          }
        })
        .prepend($('<div class="resizer"></div>').click(preventEverything))
        .resizable({
          resizeHeight: false,
          onDragStart(e) {
            if (!$(e.target).hasClass('resizer')) return false;

            dragging = true;

            return true;
          },

          onDrag(e, $el) {
            let newWidth = $el.width();

            if (newWidth < minimumWidth) {
              setWidthForHeaderAndRows(className, minimumWidth);
              ynabToolKit.shared.setLocalStorageItem(localStoragePrefix + className, minimumWidth);
            } else {
              $('.ynab-grid-body .ynab-grid-body-row-top .' + className).width(newWidth);
              ynabToolKit.shared.setLocalStorageItem(localStoragePrefix + className, newWidth);
            }
          },

          onDragEnd() {
            // set dragging to false in 100ms so that the click doesn't persist through
            setTimeout(function () {
              dragging = false;
            }, 200);
          }
        });
      }

      return {
        invoke() {
          resizableColumns.forEach(function (className) {
            addResizable(className);
          });
        },

        observe(changedNodes) {
          let isSortingResizableRow = false;
          resizableColumns.forEach((className) => {
            if (changedNodes.has('ynab-grid-header-cell is-sorting ' + className)) {
              isSortingResizableRow = true;
            }
          });

          if (isSortingResizableRow || changedNodes.has('ynab-grid-header-row')) {
            applyPersistedSettings();
            ynabToolKit.resizeAccountColumns.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.resizeAccountColumns.invoke(); // Run itself once
  } else {
    setTimeout(poll, 250);
  }
}());
