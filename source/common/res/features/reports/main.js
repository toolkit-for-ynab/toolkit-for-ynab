/* eslint-disable no-multi-str */

(function poll() {
  let allReportsReady = true;
  const supportedReports = [{
    name: 'Net Worth',
    toolkitId: 'netWorthReport'
  }, {
    name: 'Spending By Category',
    toolkitId: 'spendingByCategory'
  }];

  supportedReports.forEach(function (report) {
    if (!ynabToolKit[report.toolkitId]) {
      allReportsReady = false;
    }
  });

  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true && allReportsReady) {
    ynabToolKit.reports = (function () {
      return {
        updateCanvasSize() {
          // Set the canvas dimensions to the parent element dimensions.
          var width = $('div.scroll-wrap').closest('.ember-view').innerWidth() - 10;
          var height = $(window).height() - $('#reports-panel').height() - 20;

            // If we just set the width and height of the canvas, not max-height,
            // the chart resizes off the bottom of the screen because it calculates
            // based on an aspect ratio and the width. It will respect the max-height
            // CSS value though, so whatever, just set both.
          $('#reportCanvas')
            .attr('width', width)
            .attr('height', height)
            .css({ 'max-height': height });

          supportedReports.forEach((report) => {
            if (report.chart) report.chart.resize();
          });
        },

        setUpReportsButton() {
          if ($('li.navlink-reports').length > 0) {
              // The button already exists. Bail.
            return;
          }

          $('.nav-main').append(
            $('<li>').append(
              $('<li>', { class: 'ember-view navlink-reports' }).append(
                $('<a>', { href: '#' }).append(
                  $('<span>', { class: 'ember-view flaticon stroke document-4' })
                ).append(
                  (ynabToolKit.l10nData && ynabToolKit.l10nData['sidebar.reports']) || 'Reports'
                )
              )
            )
          );

          $('.navlink-reports').on('click', ynabToolKit.reports.showReports);
        },

        bindToResizeEvent() {
          // We also want to make sure we bind to the window resize event.
          // We only want to do this once though.
          if (ynabToolKit.reports.boundToResizeEvent !== true) {
            $(window).resize(this.updateCanvasSize);
            ynabToolKit.reports.boundToResizeEvent = true;
          }
        },

        debugTransactions() {
          ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then(function (transactionsViewModel) {
            var transactionDisplayItems = transactionsViewModel.get('visibleTransactionDisplayItems');

            var transactions = transactionDisplayItems.filter(function (transaction) {
              return transaction.get('displayItemType') === 'transaction';
            });

            // Sort the transactions by date. They usually are already, but let's not depend on that:
            transactions.sort(function (a, b) {
              return a.get('date').toNativeDate() - b.get('date').toNativeDate();
            });

            console.log(JSON.stringify(transactions.map(function (transaction) {
              return {
                date: ynabToolKit.shared.toLocalDate(transaction.get('date')),
                formattedDate: ynab.YNABSharedLib.dateFormatter.formatDate(ynabToolKit.shared.toLocalDate(transaction.get('date')), 'MMM YYYY'),
                account: transaction.getAccountName(),
                amount: transaction.getAmount()
              };
            })));
          });
        },

        // Remove the content and put our report there instead.
        showReports() {
          // Don't add another report if it already exists
          if ($('#reports-panel').length) {
            return;
          }

          // Update the nav
          $('.navlink-budget, .navlink-accounts').removeClass('active');
          $('.nav-account-row').removeClass('is-selected');
          $('.navlink-reports').addClass('active');

          $('.navlink-budget, .navlink-accounts, .nav-account-row').on('click', function () {
            // They're trying to navigate away.
            // Restore the highlight on whatever they're trying to click on.
            // For example, if they were on the Budget tab, then clicked on Reports, clicking on
            // Budget again wouldn't do anything as YNAB thinks they're already there. This switches
            // the correct classes back on and triggers our .observe below.
            if ($(this).hasClass('navlink-budget') || $(this).hasClass('navlink-accounts')) {
              $(this).addClass('active');
            } else if ($(this).hasClass('nav-account-row')) {
              $(this).addClass('is-selected');
            }
          });

          let $reportsHeader = $('<div id="reports-header"><h2><span><i class="flaticon stroke document-4"><i/></span></h2><ul class="nav-reports"></ul></div>');

          ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then(function (transactionsViewModel) {
            let transactionDisplayItems = transactionsViewModel.get('visibleTransactionDisplayItems');
            let transactions = transactionDisplayItems.filter(function (transaction) {
              return transaction.get('displayItemType') === 'transaction' &&
                     transaction.get('isTombstone') === false;
            });

              // Sort the transactions by date. They usually are already, but let's not depend on that:
            transactions.sort(function (a, b) {
              return a.get('date').toNativeDate() - b.get('date').toNativeDate();
            });

            supportedReports.forEach((report) => {
              $('.nav-reports', $reportsHeader).append(
                $('<li>', { class: 'nav-reports-navlink' }).append(
                  $('<a>', { href: '#' }).append(
                    report.name
                  ).click(() => {
                    showReport(report.toolkitId);
                  })
                )
              );
            });

              // Clear out the content and put ours in there instead.
            $('div.scroll-wrap').closest('.ember-view').prepend(
              $('<div id="reports-panel">')
                .append($reportsHeader)
                .append(
                   `<div id="reports-filter">
                      <h3>
                        ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.filters']) || 'Filters')}
                      </h3>
                      <span class="reports-filter-name"> +
                        ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.timeframe']) || 'Timeframe')}
                      </span>
                      <div id="reports-date-filter"></div>
                    </div>
                    <div id="report-headers"></div>
                  <div>`
                )
            );

            // The budget header is absolute positioned
            $('.budget-header, .scroll-wrap').hide();

            function showReport(toolkitId) {
              let toolkitReport = ynabToolKit[toolkitId];
              $('#report-headers').html(toolkitReport.reportHeaders());
              toolkitReport.calculate(transactions);
              toolkitReport.createChart($('#reports-panel'));
            }
          });
        },

        invoke() {
          ynabToolKit.reports.setUpReportsButton();
          ynabToolKit.reports.bindToResizeEvent();
        },

        observe(changedNodes) {
          // Did they switch budgets?
          if (changedNodes.has('layout user-logged-in')) {
            if ($('.nav-main').length) {
              ynabToolKit.reports.invoke();
            }
          }

            // Did they switch away from our tab?
          if (changedNodes.has('navlink-budget active') ||
                changedNodes.has('navlink-accounts active') ||
                changedNodes.has('nav-account-row is-selected')) {
              // The user has left the reports page.
              // We're no longer the active page.
            $('.navlink-reports').removeClass('active');

              // Get rid of our UI
            ynabToolKit.reports.netWorthReportChart.destroy();
            ynabToolKit.reports.netWorthReportChart = null;

            $('#reports-panel, #reports-inspector, #reportCanvas').remove();

              // And restore the YNAB stuff we hid earlier
            $('.budget-header, .scroll-wrap').show();
          }

          // if YNAB overwrites the sidebar-contents just make sure the report button
          // doesn't get deleted
          if (changedNodes.has('sidebar-contents')) {
            ynabToolKit.reports.setUpReportsButton();
          }

          // They've collapsed the collapsible nav. Resize.
          if (changedNodes.has('navlink-collapse expanded') ||
              changedNodes.has('navlink-collapse collapsed')) {
            ynabToolKit.reports.updateCanvasSize();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
