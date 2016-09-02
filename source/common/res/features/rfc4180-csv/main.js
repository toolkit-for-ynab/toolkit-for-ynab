(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageRead === true) {
    
    function exportData () {
    }
    
    return {
      invoke() {
        // Does nothing for now.
        // Should perform any setup.
      }
      
      observe(changedNodes) {
        if (changedNodes.has('layout user-logged-in')) {
          // Budget was changed or Budget Button was changed.
          if (changedNodes.has('ynab-u modal-popup modal-select-budget ember-view modal-overlay active')) {
            if ($('button.modal-select-budget-export-safe-csv').length > 0) return;
              $('.modal-list').append(
                $('<li>').append(
                  $('<button>', { class: 'modal-select-budget-export-safe-csv' }).append(
                    $('<i>', {class: 'ember-view flaticon stroke download-1' }).append(
                  ).append(
                    (ynabToolKit.l10nData && ynabToolKit.l10nData['sidebar.safeCSV']) || 'Safe CSV'
                  )
                )
              )
            )
          }
        }

        // Does nothing for now.
        // Should perform any actions related to changed nodes.
      }
      
      // Functions accessible from elsewhere.
    }
  }
  else {
    setTimeout(poll, 250);
  }
}());
