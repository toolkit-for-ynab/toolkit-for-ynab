(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.accountsRowHeight = (function () {
      // Setup and display the drop-down menu modal.
      function showRowHeightModal() {
        let btnLeft = parseFloat($('.ynab-u.sidebar').css('width'));

        $('.accounts-toolbar-left > button, .accounts-toolbar-left > span').each(function () {
          btnLeft += parseInt($(this).css('width'));

          if ($(this).attr('id') === 'toolkitRowHeight') {
            let t1 = parseInt($(this).css('width'));

            // The following is hardcoded because our modal div doesn't exist in the DOM yet
            // so we can't get its rendered width.
            let t2 = 151;// parseInt($('#toolkitRowHeightIDiv').css('width'));

            btnLeft -= (t1 + ((t2 - t1) / 2));

            return false; // not interested in any button to our right, we're outta here!
          }
        });

        let btnTop = $('.scroll-wrap').outerHeight() + 8; // arbitrary value but seems to work. TODO: determine how to calculate what it should be
        let $modal = $('<div id=toolkitRowHeightODiv class="ember-view">' +
                        '<div id="toolkitRowHeightModal" class="ynab-u modal-popup modal-adjust-row-height ember-view modal-overlay active">' +
                         '<div id=toolkitRowHeightIDiv class="modal" style="left: ' + btnLeft + 'px; top: ' + btnTop + 'px;">' +
                          '<ul class="modal-list">' +
                            '<li><button id="toolkitRowHeightDefaultBtn" class="button-list"><i id=toolkitRowHeightDefaultImg class="ember-view flaticon stroke checkmark-1"/>Default Height</button></li>' +
                            '<li><button id="toolkitRowHeightCompactBtn" class="button-list"><i id=toolkitRowHeightCompactImg class="ember-view flaticon stroke checkmark-1"/>Compact Rows</button></li>' +
                            '<li><button id="toolkitRowHeightSlimBtn" class="button-list"><i id=toolkitRowHeightSlimImg class="ember-view flaticon stroke checkmark-1"/>Slim Rows</button></li>' +
                          '</ul>' +
                          '<div class="modal-arrow" style="position:absolute;width: 0;height: 0;bottom: 100%;left: 60px;border: solid transparent;border-color: transparent;border-width: 15px;border-bottom-color: #fff"></div>' +
                         '</div>' +
                        '</div>' +
                       '</div>');
        let hideImage = 'toolkit-modal-item-hide-image';

        let $defimg = $modal.find('#toolkitRowHeightDefaultImg');
        let $defbtn = $modal.find('#toolkitRowHeightDefaultBtn');
        $defbtn.click(() => {
          setRowHeight(0); // new row height after click event
        });

        let $cmpimg = $modal.find('#toolkitRowHeightCompactImg');
        let $cmpbtn = $modal.find('#toolkitRowHeightCompactBtn');
        $cmpbtn.click(() => {
          setRowHeight(1);  // new row height after click event
        });

        let $slmimg = $modal.find('#toolkitRowHeightSlimImg');
        let $slmbtn = $modal.find('#toolkitRowHeightSlimBtn');
        $slmbtn.click(() => {
          setRowHeight(2);  // new row height after click event
        });

        // Handle dismissal of modal via the ESC key
        $(document).one('keydown', (e) => {
          if (e.keyCode === 27) { // ESC key?
            $(document).off('click.toolkitRowHeight');
            $('#toolkitRowHeightODiv').remove();
          }
        });

        // Handle mouse clicks outside the drop-down modal. Namespace the
        // click event so we can remove our specific instance.
        $(document).on('click.toolkitRowHeight', (e) => {
          if (e.target.id === 'toolkitRowHeightModal') {
            $(document).off('click.toolkitRowHeight');
            $('#toolkitRowHeightODiv').remove();
          }
        });

        // Determine which menu item is disabled (cuurent height) and which
        // items are enabled. The current height will display a checkmark
        // while the others heights will display nothing.
        switch (ynabToolKit.accountsRowHeight.rowHeight) { // current row height!
          case 0:
            $defbtn.prop('disabled', true);
            $defbtn.addClass('button-disabled');
            $defimg.removeClass(hideImage);

            $cmpbtn.prop('disabled', false);
            $cmpbtn.removeClass('button-disabled');
            $cmpimg.addClass(hideImage);

            $slmbtn.prop('disabled', false);
            $slmbtn.removeClass('button-disabled');
            $slmimg.addClass(hideImage);

            break;
          case 1:
            $defbtn.prop('disabled', false);
            $defbtn.removeClass('button-disabled');
            $defimg.addClass(hideImage);

            $cmpbtn.prop('disabled', true);
            $cmpbtn.addClass('button-disabled');
            $cmpimg.removeClass(hideImage);

            $slmbtn.prop('disabled', false);
            $slmbtn.removeClass('button-disabled');
            $slmimg.addClass(hideImage);

            break;
          case 2:
            $defbtn.prop('disabled', false);
            $defbtn.removeClass('button-disabled');
            $defimg.addClass(hideImage);

            $cmpbtn.prop('disabled', false);
            $cmpbtn.removeClass('button-disabled');
            $cmpimg.addClass(hideImage);

            $slmbtn.prop('disabled', true);
            $slmbtn.addClass('button-disabled');
            $slmimg.removeClass(hideImage);

            break;
          default:
            // NOP
        }

        $('.layout').append($modal);
      }

      function setRowHeight(height) {
        if (height > -1) {
          ynabToolKit.accountsRowHeight.rowHeight = height;
        }

        let rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        let gridView = rowView.get('gridView');

        if (ynabToolKit.accountsRowHeight.rowHeight === 0) {
          gridView.set('recordHeight', 30);
          setTopRowClass(false);

          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/compact.css"]').prop('disabled', true);
          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/slim.css"]').prop('disabled', true);
        } else if (ynabToolKit.accountsRowHeight.rowHeight === 1) {
          gridView.set('recordHeight', 25);
          setTopRowClass(true);

          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/compact.css"]').prop('disabled', false);
          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/slim.css"]').prop('disabled', true);
        } else if (ynabToolKit.accountsRowHeight.rowHeight === 2) {
          gridView.set('recordHeight', 20);
          setTopRowClass(true);

          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/compact.css"]').prop('disabled', true);
          $('link[rel=stylesheet][href$="/res/features/accounts-row-height/slim.css"]').prop('disabled', false);
        }

        // Save the users current selection for future page loads.
        ynabToolKit.shared.setToolkitStorageKey('accounts-row-height', height);

        // Remove our click event handler and the modal div.
        $(document).off('click.toolkitRowHeight');
        $('#toolkitRowHeightODiv').remove();
      }

      function setTopRowClass(addClass) {
        if (addClass) {
          $('.ynab-grid-body-row-top > .ynab-grid-cell').addClass('toolkit-ynab-grid-cell');
        } else {
          $('.ynab-grid-body-row-top > .ynab-grid-cell').removeClass('toolkit-ynab-grid-cell');
        }
      }

      return {
        rowHeight: 0,
        invoke: function invoke() {
          let height = ynabToolKit.shared.getToolkitStorageKey('accounts-row-height');

          if (!$('#toolkitRowHeight').length) {
            if (typeof height !== 'undefined' && height !== null) {
              ynabToolKit.accountsRowHeight.rowHeight = parseInt(height);
            }

            $('link[rel=stylesheet][href$="/res/features/accounts-row-height/compact.css"]').prop('disabled', true);
            $('link[rel=stylesheet][href$="/res/features/accounts-row-height/slim.css"]').prop('disabled', true);

            let buttonText = ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.accountRowHeight'] || 'Row Height';

            // Add a new button to the right of the "undo-redo" button. Note that if the
            // toggle-splits feature is active it will affect where this button is placed.
            // That's because both features have the same .insertAfter() code. If it gets
            // to be a problem we can figure out a set order....until more features that
            // add a button come along. Doh!
            $('<button>', { id: 'toolkitRowHeight', class: 'ember-view button' })
              .append(buttonText + ' ')
              .append($('<i>', { class: 'ember-view flaticon stroke down' }))
              .click(() => {
                showRowHeightModal();
              })
              .insertAfter('.accounts-toolbar .undo-redo-container');

            setTopRowClass(true);
          }

          setRowHeight(ynabToolKit.accountsRowHeight.rowHeight);
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            ynabToolKit.accountsRowHeight.invoke();
            setTopRowClass(true);
          }
        }
      };
    }()); // Keep feature functions contained within this object

    // Run once on page load. Note that fast scrolling will cause multiple page loads!
    ynabToolKit.accountsRowHeight.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
