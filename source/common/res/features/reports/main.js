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
      let onBudgetAccounts;
      let offBudgetAccounts;
      let allTransactions;
      let monthLabels = [];
      let selectedAccounts = [];

      function setUpReportsButton() {
        if ($('li.navlink-reports').length > 0) return;

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

        $('.navlink-reports').on('click', showReports);
      }

      function buildReportsPage($pane) {
        if ($('.ynabtk-reports').length) return;

        updateNavigation();

        $pane.append(
          $('<div class="ynabtk-reports"></div>')
            .append(generateReportNavigation())
            .append(
              $('<div class="ynabtk-reports-filters"></div>')
                .append(
                  `<h3>
                    ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.filters']) || 'Filters')}
                  </h3>
                  <div class="ynabtk-filter-group date-filter">
                    <span class="reports-filter-name">
                      ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.timeframe']) || 'Timeframe')}:
                    </span>
                    <div id="ynabtk-date-filter" class="ynabtk-date-filter-slider"></div>
                  </div>
                  <div class="ynabtk-filter-group">
                    <span class="reports-filter-name">
                      ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.accounts']) || 'Accounts')}:
                    </span>
                    <select id="ynabtk-report-accounts" class="accounts-text-field dropdown-text-field ynabtk-account-select">
                      <option value="all">All Budget Accounts</option>
                    </select>
                    <div id="selected-account-list" class="ynabtk-account-chips"></div>
                  </div>`
                )
            )
            .append('<div class="ynabtk-reports-headers"></div>')
            .append('<div class="ynabtk-reports-data"></div>')
        );

        generateDateSlider();
      }

      function updateNavigation() {
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
      }

      function generateReportNavigation() {
        let $reportsHeader = $(
          `<div class="ynabtk-reports-nav">
            <h2>
              <span><i class="flaticon stroke document-4"></i></span>
            </h2>
            <ul class="nav-reports"></ul>
          </div>`);

        supportedReports.forEach((report) => {
          $('.nav-reports', $reportsHeader).append(
            $('<li>', { class: 'nav-reports-navlink' }).append(
              $('<a>', { href: '#' }).append(
                report.name
              ).click(() => {
                onReportSelected(report.toolkitId);
              })
            )
          );
        });

        return $reportsHeader;
      }

      function generateDateSlider() {
        let dateFilterContainer = document.getElementById('ynabtk-date-filter');

        allTransactions.forEach((transaction) => {
          let monthLabel = ynabToolKit.reports.formatTransactionDatel8n(transaction);
          if (monthLabels.indexOf(monthLabel) === -1) {
            monthLabels.push(monthLabel);
          }
        });

        if (monthLabels.length < 2) {
          $('.ynabtk-filter-group.date-filter').hide();
        } else {
          noUiSlider.create(dateFilterContainer, {
            connect: true,
            start: [monthLabels[0], monthLabels[monthLabels.length - 1]],
            range: {
              min: 0,
              max: monthLabels.length - 1
            },
            step: 1,
            tooltips: true,
            format: {
              to(index) {
                return monthLabels[Math.round(index)];
              },
              from(value) {
                return monthLabels.indexOf(value);
              }
            }
          });
        }

        dateFilterContainer.noUiSlider.on('slide', filterTransactionsAndBuildChart);
      }

      function generateAccountSelect(availableAccountTypes) {
        let $select = $('#ynabtk-report-accounts');
        let $accountList = $('#selected-account-list');

        // clear both lists before generating the options
        $select.empty();
        $accountList.empty();

        switch (availableAccountTypes) {
          case 'onbudget':
            $select.append('<option value="onbudget">All Budget Accounts</option>');
            onBudgetAccounts.forEach((account) => {
              $select.append(`<option value=${account.get('entityId')}>${account.get('accountName')}</option>`);
            });
            break;
          case 'offbudget':
            $select.append('<option value="offbudget">All Tracking Accounts</option>');
            offBudgetAccounts.forEach((account) => {
              $select.append(`<option value=${account.get('entityId')}>${account.get('accountName')}</option>`);
            });
            break;
          case 'all':
          default:
            $select.append('<option value="all">All Accounts</option>');
            $select.append('<option value="onbudget">All Budget Accounts</option>');
            $select.append('<option value="offbudget">All Tracking Accounts</option>');
            onBudgetAccounts.concat(offBudgetAccounts).forEach((account) => {
              $select.append(`<option value=${account.get('entityId')}>${account.get('accountName')}</option>`);
            });
            break;
        }

        $select.change(function () {
          if (['all', 'onbudget', 'offbudget'].indexOf($select.val()) !== -1) {
            selectedAccounts = [];
          } else if (selectedAccounts.indexOf(this.value) === -1) {
            selectedAccounts.push(this.value);
          }

          updateAccountList();
          filterTransactionsAndBuildChart();
        });

        function updateAccountList() {
          $accountList.empty();

          if (selectedAccounts.length === 0) {
            // if the selected accounts are empty and we didn't just click one of the "all" options
            // then go ahead and set the select to whatever our default is.
            if (['all', 'onbudget', 'offbudget'].indexOf($select.val()) === -1) {
              $select.val(availableAccountTypes);
            }
          }

          selectedAccounts.forEach((accountId) => {
            let accountData = onBudgetAccounts.find((account) => accountId === account.get('entityId')) ||
                              offBudgetAccounts.find((account) => accountId === account.get('entityId'));
            $accountList
              .append(
                $(`<div class="account-chip" title="${accountData.get('accountName')}">${accountData.get('accountName')}</div>`)
                  .click(() => {
                    let index = selectedAccounts.indexOf(accountId);
                    selectedAccounts.splice(index, 1);
                    updateAccountList();
                  })
              );
          });
        }
      }

      function onReportSelected(toolkitId) {
        // change the current report in local storage.
        ynabToolKit.shared.setToolkitStorageKey('current-report', toolkitId);

        // show the report.
        let toolkitReport = ynabToolKit[toolkitId];
        $('.ynabtk-reports-headers').html(toolkitReport.reportHeaders());

        generateAccountSelect(toolkitReport.availableAccountTypes);
        filterTransactionsAndBuildChart();
      }

      function filterTransaction(transaction, toolkitReport) {
        let filterType;

        // if the transaction isTombstone, go ahead and stop now...
        if (transaction.get('isTombstone') === true) {
          return false;
        }

        // should we filter for all, on, or off budget accounts?
        let transactionAccountId = transaction.get('accountId');
        if (selectedAccounts.length === 0) {
          let $accountSelect = $('#ynabtk-report-accounts');
          filterType = $accountSelect.val();
        }

        // filter based on account type
        switch (filterType) {
          case 'onbudget':
            if (!onBudgetAccounts.find((account) => transactionAccountId === account.get('entityId'))) {
              return false;
            }
            break;
          case 'offbudget':
            if (!offBudgetAccounts.find((account) => transactionAccountId === account.get('entityId'))) {
              return false;
            }
            break;
          case 'all':
            // no filtering needed -- continue
            break;
          default: // specific accounts selected.
            if (selectedAccounts.indexOf(transactionAccountId) === -1) {
              return false;
            }
            break;
        }

        let dateFilterRange = document.getElementById('ynabtk-date-filter').noUiSlider.get();
        let indexStart = monthLabels.indexOf(dateFilterRange[0]);
        let indexEnd = monthLabels.indexOf(dateFilterRange[1]) + 1;
        let allowedDates = monthLabels.slice(indexStart, indexEnd);
        let transactionDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);
        if (allowedDates.indexOf(transactionDate) === -1) {
          return false;
        }

        if (toolkitReport.filterTransaction) {
          return toolkitReport.filterTransaction(transaction);
        }

        return true;
      }

      function filterTransactionsAndBuildChart() {
        let toolkitId = ynabToolKit.shared.getToolkitStorageKey('current-report');
        let toolkitReport = ynabToolKit[toolkitId];
        let filtered = allTransactions.filter((transaction) => {
          return filterTransaction(transaction, toolkitReport);
        });
        toolkitReport.calculate(filtered).then(() => {
          toolkitReport.createChart($('.ynabtk-reports-data'));
        });
      }

      function showReports() {
        ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then((transactionsViewModel) => {
          ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel().then((sideBarViewModel) => {
            onBudgetAccounts = sideBarViewModel.get('onBudgetAccounts');
            offBudgetAccounts = sideBarViewModel.get('offBudgetAccounts');

            allTransactions = transactionsViewModel.get('visibleTransactionDisplayItems');

            // Sort the transactions by date. They usually are already, but let's not depend on that:
            allTransactions.sort(function (a, b) {
              return a.get('date').toNativeDate() - b.get('date').toNativeDate();
            });

            // Clear out the content and put ours in there instead.
            buildReportsPage($('div.scroll-wrap').closest('.ember-view'));

            // The budget header is absolute positioned
            $('.budget-header, .scroll-wrap').hide();
          });
        });
      }

      return {
        invoke() {
          setUpReportsButton();
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

            $('.ynabtk-reports').remove();

            // And restore the YNAB stuff we hid earlier
            $('.budget-header, .scroll-wrap').show();
          }

          // if YNAB overwrites the sidebar-contents just make sure the report button
          // doesn't get deleted
          if (changedNodes.has('sidebar-contents')) {
            setUpReportsButton();
          }
        },

        formatTransactionDatel8n(transaction) {
          // first, we get the date
          let transactionDate = ynabToolKit.shared.toLocalDate(transaction.get('date'));
          let formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(transactionDate, 'MMM YYYY');

          // now split it with year and month so that we can get the localized version of the month
          let year = formattedDate.split(' ')[1];
          let month = formattedDate.split(' ')[0];
          month = (ynabToolKit.l10nData && ynabToolKit.l10nData['months.' + month]) || month;
          formattedDate = month + ' ' + year;

          // finally, return the l8n date.
          return formattedDate;
        }
      };
    }());

    ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
