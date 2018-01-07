import { Feature } from 'toolkit/extension/features/feature';
import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class CollapseSideMenu extends Feature {
  collapseBtn = '';
  originalButtons = {}
  originalSizes = {
    sidebarWidth: 0,
    contentLeft: 0,
    headerLeft: 0,
    contentWidth: 0,
    inspectorWidth: 0
  }

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.collapseBtn =
      $('<li>', { class: 'ember-view ynabtk-navlink-collapse' }).append(
        $('<a>', { class: 'ynabtk-collapse-link' }).append(
          $('<span>', { class: 'ember-view flaticon stroke left-circle-4' })).append(
          toolkitHelper.i10n('toolkit.collapse', 'Collapse')));

    this.setupBtns();
  }

  observe(changedNodes) {
    if (changedNodes.has('layout user-logged-in')) {
      if ($('.nav-main').length) {
        this.setupBtns();
      }
    }

    if (changedNodes.has('nav-main')) {
      let numNavLinks = $('.nav-main').children().length;
      let collapseIndex = $('.nav-main').children().index($('.ynabtk-navlink-collapse'));
      let numCollapsedLinks = $('.collapsed-buttons').children().length;

      if (numNavLinks > (collapseIndex + 1) || numNavLinks > numCollapsedLinks) {
        $('.ynabtk-navlink-collapse').remove();

        this.setUpCollapseBtn();
        this.setUpCollapsedButtons();
      }
    }
  }

  setOriginalSizes() {
    this.originalSizes = ({
      sidebarWidth: $('.sidebar').width(),
      contentLeft: $('.content').css('left'),
      headerLeft: $('.budget-header, .accounts-header').css('left'),
      contentWidth: $('.budget-content').outerWidth(),
      inspectorWidth: $('.budget-inspector').outerWidth()
    });
  }

  // Add buttons and handlers to screen
  setupBtns() {
    // Don't proceed if buttons already exist
    if ($('.ynabtk-navlink-collapse').is(':visible') || $('.navbar-expand').is(':visible')) {
      return;
    }

    this.setUpCollapseBtn();
    this.setUpCollapsedButtons();
  }

  setUpCollapseBtn() {
    let _this = this;
    $('.nav-main').append(this.collapseBtn);
    $('body').on('click', '.ynabtk-navlink-collapse', _this, this.collapseMenu);
  }

  setUpCollapsedButtons() {
    let expandBtns = this.getUnCollapseBtnGroup();

    $('.sidebar').prepend(expandBtns);

    if ($('.sidebar-contents').is(':visible')) {
      $('.collapsed-buttons').hide();
    }
  }

  getUnCollapseBtnGroup() {
    let navChildren = $('.nav-main').children();
    let navChildrenLength = navChildren.length;
    let collapsedBtnContainer = $('.collapsed-buttons');

    if (collapsedBtnContainer.length) {
      collapsedBtnContainer.children().remove();
      collapsedBtnContainer.hide();
    } else {
      collapsedBtnContainer = $('<div>', { class: 'collapsed-buttons', style: 'display: none' });
    }

    var clickFunction = function (event) {
      const _this = event.data; // the feature
      let linkClass = this.className.replace(' active', '').trim();

      $(_this.originalButtons[linkClass]).click();
      _this.deactivateCollapsedActive();
      $(this).addClass('active');
    };

    for (let i = 0; i < navChildrenLength; i++) {
      let child = navChildren[i];

      // If this is the collapse button, skip
      if (child.className.indexOf('ynabtk-navlink-collapse') > -1) {
        continue;
      }

      let span = $(child).find('span')[0];

      // Don't process if not actually a button
      if (!span) {
        continue;
      }

      let btnClasses = span.className;
      let button = $('<button>');
      button.addClass(btnClasses);
      button.addClass('button button-prefs');

      let listItem = $(child).find('li')[0] || child;
      let linkClass = listItem.className.replace(' active', '').trim();

      let link = $('<a>');
      link.attr('href', '#');
      link.addClass(linkClass);
      link.html(button);
      link.click(this, clickFunction);

      this.originalButtons[linkClass] = 'ul.nav-main li.' + linkClass + ' a';

      // Set proper class so the active styling can be applied
      if (btnClasses.indexOf('mail-1') > -1) {
        button.addClass('collapsed-budget');
      } else if (btnClasses.indexOf('graph-1') > -1) {
        button.addClass('collapsed-reports');
      } else if (btnClasses.indexOf('government-1') > -1) {
        button.addClass('collapsed-account');
      } else {
        // Fallback if we don't know what the button is.
        button.addClass('collapsed');
      }

      collapsedBtnContainer.append(link);
    }

    // Add uncollapse button
    let collapseBtn = $('<button>', { class: 'button button-prefs flaticon stroke right-circle-4 navbar-expand' });

    collapsedBtnContainer.append(collapseBtn);

    $('body').on('click', '.navbar-expand', this, this.expandMenu);

    return collapsedBtnContainer;
  }

  // Handle clicking expand button. Puts things back to original sizes
  expandMenu(event) {
    let originalSizes = event.data.originalSizes;

    $('.collapsed-buttons').hide();
    $('.sidebar > .ember-view').fadeIn();
    $('.ynabtk-navlink-collapse').show();

    $('.sidebar').animate({ width: originalSizes.sidebarWidth });
    $('.content').animate({ left: originalSizes.contentLeft }, function () {
      $('.layout').removeClass('collapsed');
    });

    $('.budget-header').animate({ left: originalSizes.headerLeft });
    if ($('.budget-content').is(':visible')) {
      if (ynabToolKit.options.InspectorWidth !== '0') {
        $('.budget-inspector')[0].style.setProperty('--toolkit-inspector-minwidth', 'inherit');
      }
    }
  }

  // Handle clicking the collapse button
  collapseMenu(event) {
    let _this = event.data;
    // resize-inspector feature could have changed these so fetch current sizes.
    _this.setOriginalSizes();
    _this.setActiveButton($('.nav-main li.active').attr('class'));
    $('.ynabtk-navlink-collapse').hide();
    $('.sidebar > .ember-view').hide();
    $('.collapsed-buttons').fadeIn();

    $('.sidebar').animate({ width: '40px' });
    $('.content').animate({ left: '40px' }, 400, 'swing', function () {
      // Need to remove width after animation completion
      $('.ynab-grid-header').removeAttr('style');

      // We don't use these in our CSS, it's mostly so other features can observe
      // for collapse/expand and update sizes / do whatever. E.g. reports needs
      // to resize its canvas when this happens.
      $('.ynabtk-navlink-collapse').removeClass('expanded').addClass('collapsed');
      $('.layout').addClass('collapsed');
    });

    $('.budget-header').animate({ left: '40px' });
    if ($('.budget-content').is(':visible')) {
      if (ynabToolKit.options.InspectorWidth !== '0') {
        $('.budget-inspector')[0].style.setProperty('--toolkit-inspector-minwidth', '276 px');
      }
    }
  }

  // Add the active style to correct button
  setActiveButton(button) {
    if (typeof button !== 'undefined') {
      this.deactivateCollapsedActive();
      button = button.replace('active', '').replace('ember-view', '').trim();
      $('.collapsed-buttons a.' + button).addClass('active');
    } else {
      $('.collapsed-buttons a').removeClass('active');
    }
  }

  // Deactivate collapsed buttons
  deactivateCollapsedActive() {
    $('.collapsed-buttons a').removeClass('active');
  }
}
