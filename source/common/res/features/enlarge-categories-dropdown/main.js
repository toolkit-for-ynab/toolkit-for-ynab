(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.enlargeCategoriesDropdown = (function () {
      return {
        invoke() {
          var defaultAdditionalHeight = 100; // 4 pixels of padding
          var bottomOfPagePadding = 4;
          var totalAdditionalHeight = defaultAdditionalHeight + bottomOfPagePadding;

          var modal = $('.categories-dropdown-container .dropdown-modal');
          var currentTop = parseInt(modal.css('top'));
          var spaceAvailableAboveModal = $(window).height() - (modal.offset().top - modal.outerHeight());
          var spaceAvailableBelowModal = $(window).height() - (modal.offset().top + modal.outerHeight());

          // modal is shown above autocomplete
          if (currentTop < 0) {
            if (spaceAvailableAboveModal < totalAdditionalHeight) {
              // pad the bottom of the screen with 4 pixels here.
              modal.css({
                height: '+=' + (spaceAvailableAboveModal - bottomOfPagePadding),
                top: '-=' + (spaceAvailableAboveModal - bottomOfPagePadding)
              });
            } else if (spaceAvailableAboveModal >= totalAdditionalHeight) {
              modal.css({
                height: '+=' + defaultAdditionalHeight,
                top: '-=' + defaultAdditionalHeight
              });
            }
          } else { // modal is shown below autocomplete
            if (spaceAvailableBelowModal < totalAdditionalHeight) {
              modal.css({ height: '+=' + (spaceAvailableBelowModal - bottomOfPagePadding) });
            } else if (spaceAvailableBelowModal >= totalAdditionalHeight) {
              modal.css({ height: '+=' + defaultAdditionalHeight });
            }
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('dropdown-container categories-dropdown-container')) {
            ynabToolKit.enlargeCategoriesDropdown.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
