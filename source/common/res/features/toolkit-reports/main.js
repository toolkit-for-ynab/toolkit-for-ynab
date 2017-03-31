/* eslint-disable no-multi-str */

(function poll() {
  let allReportsReady = true;
  const supportedReports = [{
    name: 'Net Worth',
    toolkitId: 'netWorthReport'
  }, {
    name: 'Spending By Category',
    toolkitId: 'spendingByCategory'
  }, {
    name: 'Spending By Payee',
    toolkitId: 'spendingByPayee'
  }, {
    name: 'Income vs. Expense',
    toolkitId: 'incomeVsExpense'
  }];

  // ynabToolKit[report.toolkitId] should be undefined if the report hasn't finished
  // loading yet. if that's the case set allReportsReady to false to avoid silly race conditions
  supportedReports.forEach(function (report) {
    if (!ynabToolKit[report.toolkitId]) {
      allReportsReady = false;
    }
  });

  // if all the reports have finished loading (and so have their deps) then we're good to go!
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true && allReportsReady) {
    ynabToolKit.reports = (function () {
      let onBudgetAccounts;
      let offBudgetAccounts;
      let allTransactions;
      let monthLabels = [];
      let selectedAccounts = [];

      // throw our reports button into the left-hand navigation pane so they can click it!
      function setUpReportsButton() {
        if ($('li.ynabtk-navlink-reports').length > 0) return;

        $('.nav-main > li:eq(1)').after(
          $('<li>').append(
            $('<li>', { class: 'ember-view ynabtk-navlink-reports' }).append(
              $('<a>', { href: '#' }).append(
                $('<span>', { class: 'ember-view flaticon stroke document-4' })
              ).append(
                (ynabToolKit.l10nData && ynabToolKit.l10nData['sidebar.reports']) || 'Toolkit Reports'
              )
            )
          )
        );

        $('.ynabtk-navlink-reports').on('click', showReports);
      }

      function buildReportsPage($pane, transactionsViewModel) {
        if ($('.ynabtk-reports').length) return;

        updateNavigation();

        // append the entire page to the .scroll-wrap pane in YNAB (called by showReports)
        $pane.append(
          $('<div class="ynabtk-reports"></div>')
            // append the navigation (list of supportedReports)
            .append(generateReportNavigation())
            // append the filters and containers for report headers/report data
            .append(
              $('<div class="ynabtk-reports-filters"></div>')
                .append(
                  `<h3>
                    ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.filters']) || 'Filters')}
                  </h3>
                  <div class="ynabtk-filter-group date-filter">
                    <span class="reports-filter-name timeframe">
                      ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.timeframe']) || 'Timeframe')}:
                    </span>
                    <select class="ynabtk-filter-select ynabtk-quick-date-filters">
                      <option value="none" disabled selected>Quick Filter...</option>
                    </select>
                    <div id="ynabtk-date-filter" class="ynabtk-date-filter-slider"></div>
                  </div>
                  <div class="ynabtk-filter-group">
                    <span class="reports-filter-name">
                      ${((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.accounts']) || 'Accounts')}:
                    </span>
                    <select id="ynabtk-report-accounts" class="ynabtk-filter-select">
                      <option value="all">All Budget Accounts</option>
                    </select>
                    <div id="selected-account-list" class="ynabtk-account-chips"></div>
                  </div>`
                )
            )
            .append('<div class="ynabtk-reports-headers"></div>')
            .append('<div class="ynabtk-reports-data"></div>')
        );

        generateDateSlider(transactionsViewModel);
        generateQuickDateFilters();
      }

      function updateNavigation() {
        // remove the active class from all navigation items and add active to our guy
        $('.navlink-budget, .navlink-accounts').removeClass('active');
        $('.nav-account-row').removeClass('is-selected');
        $('.ynabtk-navlink-reports').addClass('active');

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
        // create the reports header
        let $reportsHeader = $(
          `<div class="ynabtk-reports-nav">
            <h2>
              <span><i class="flaticon stroke document-4"></i></span>
            </h2>
            <ul class="nav-reports"></ul>
          </div>`);

        // now populate the reports header!
        supportedReports.forEach((report) => {
          $('.nav-reports', $reportsHeader).append(
            $('<li>', { class: 'nav-reports-navlink' }).append(
              $('<a>', { id: report.toolkitId, href: '#' }).text(
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
        monthLabels = ynabToolKit.reports.generateMonthLabelsFromFirstOfTransactions(allTransactions);

        // if we only have one or no months of data that we should just hide the slider
        // return early so we don't even try to initialize the slider
        if (monthLabels.length < 2) {
          return $('.ynabtk-filter-group.date-filter').hide();
        }

        // default the start to the full range of dates, if there's a current-date-filter in localStorage
        // then make sure it's valid for our set of dates and use it.
        let start = [monthLabels[0], monthLabels[monthLabels.length - 1]];
        let storedStart = ynabToolKit.shared.getToolkitStorageKey('current-date-filter');
        if (storedStart && storedStart !== 'null' && storedStart !== 'undefined') {
          storedStart = storedStart.split(',');

          // they might have switched to a budget that doesn't have the dates in the stored value,
          // so make sure the values exist in our month labels. if they do, let it happen.
          if (storedStart.length === 2 && monthLabels.indexOf(storedStart[0]) !== -1 && monthLabels.indexOf(storedStart[1]) !== -1) {
            start = storedStart;
          }
        }

        let dateFilterContainer = document.getElementById('ynabtk-date-filter');
        noUiSlider.create(dateFilterContainer, {
          connect: true,
          start,
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

        // on slide, set the new values in local storage and call filterTransactionsAndBuildChart!
        dateFilterContainer.noUiSlider.on('slide', function () {
          $('.ynabtk-quick-date-filters').val('none');

          let slideValue = dateFilterContainer.noUiSlider.get();
          ynabToolKit.shared.setToolkitStorageKey('current-date-filter', slideValue);
          filterTransactionsAndBuildChart();
        });
      }

      function generateQuickDateFilters() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const todayFormatted = ynabToolKit.reports.formatDatel8n(new Date(currentYear, currentMonth));
        const dateFilter = document.getElementById('ynabtk-date-filter');

        if (!dateFilter.noUiSlider) return;

        const quickFilters = [{
          name: 'This Month',
          filter: [todayFormatted, todayFormatted]
        }, {
          name: 'Last Month',
          filter: [ynabToolKit.reports.formatDatel8n(new Date(currentYear, currentMonth - 1)), ynabToolKit.reports.formatDatel8n(new Date(currentYear, currentMonth - 1))]
        }, {
          name: 'Latest Three Months',
          filter: [ynabToolKit.reports.formatDatel8n(new Date(currentYear, currentMonth - 2)), todayFormatted]
        }, {
          name: 'This Year',
          filter: [ynabToolKit.reports.formatDatel8n(new Date(currentYear, 0)), todayFormatted]
        }, {
          name: 'Last Year',
          filter: [ynabToolKit.reports.formatDatel8n(new Date(currentYear - 1, 0)), ynabToolKit.reports.formatDatel8n(new Date(currentYear - 1, 11))]
        }, {
          name: 'All Dates',
          filter: [monthLabels[0], monthLabels[monthLabels.length - 1]]
        }];

        quickFilters.forEach((quickFilter, index) => {
          let disabled = false;
          // if we can't meet the end filter, then the button should be disabled
          if (monthLabels.indexOf(quickFilter.filter[1]) === -1) {
            disabled = true;
          } else if (monthLabels.indexOf(quickFilter.filter[0]) === -1) {
            // if we can't meet the start filter, just set the dates to the first available
            quickFilter[0] = monthLabels[0];
          }

          $('.ynabtk-quick-date-filters')
            .append($('<option>', {
              value: index,
              disabled: disabled
            })
            .text(quickFilter.name));
        });

        $('.ynabtk-quick-date-filters').change(function () {
          let quickFilterIndex = parseInt($(this).val());
          let quickFilterValue = quickFilters[quickFilterIndex].filter;
          dateFilter.noUiSlider.set(quickFilterValue);
          ynabToolKit.shared.setToolkitStorageKey('current-date-filter', quickFilterValue);
          filterTransactionsAndBuildChart();
        });
      }

      function generateAccountSelect(availableAccountTypes) {
        let nonAccountOptions = ['all', 'onbudget', 'offbudget', 'custom'];

        // grab handles to the drop down and the list of selected accounts first
        let $select = $('#ynabtk-report-accounts');
        let $accountList = $('#selected-account-list');

        // clear both lists before generating the options
        $select.empty();
        $accountList.empty();

        $select.append('<option disabled value="custom">Select Specific Account...</option>');

        // based on the available account types for the report we're generating, add options
        // to the drop down. for 'all', add options to filter on on/off budget accounts as well
        switch (availableAccountTypes) {
          case 'onbudget':
            $select.append('<option value="onbudget">All Budget Accounts</option>');
            onBudgetAccounts.forEach((account) => {
              $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
            });
            break;
          case 'offbudget':
            $select.append('<option value="offbudget">All Tracking Accounts</option>');
            offBudgetAccounts.forEach((account) => {
              $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
            });
            break;
          case 'all':
          default:
            $select.append('<option value="all">All Accounts</option>');
            $select.append('<option value="onbudget">All Budget Accounts</option>');
            $select.append('<option value="offbudget">All Tracking Accounts</option>');
            onBudgetAccounts.concat(offBudgetAccounts).forEach((account) => {
              $select.append($('<option>', { value: account.get('entityId'), text: account.get('accountName') }));
            });
            break;
        }

        // once the user changes the select find out if it's one of the "grouped" options (all/on/off) if it
        // is, then get rid of the selected accounts array, if it's not then add it to the selected accounts array
        $select.change(function () {
          if (nonAccountOptions.indexOf($select.val()) !== -1) {
            selectedAccounts = [];
          } else if (selectedAccounts.indexOf(this.value) === -1) {
            selectedAccounts.push(this.value);
          }

          updateAccountList();
          filterTransactionsAndBuildChart();
        });

        // this function updates the "chips" on the page every time the user changes the select
        function updateAccountList() {
          // remove them all first
          $accountList.empty();

          if (selectedAccounts.length === 0) {
            // if the selected accounts are empty and we didn't just click one of the "all" options
            // then go ahead and set the select to whatever our default for the report is.
            if (nonAccountOptions.indexOf($select.val()) === -1) {
              $select.val(availableAccountTypes);
            }
          } else {
            setTimeout(function () {
              $select.val('custom');
            }, 0);
          }

          // for each selected account, add a chip to the page when someone clicks the chip, it will get
          // removed from the list of chips. if they've clicked the last chip then the above code will default
          // us to whatever the default option of the report is
          selectedAccounts.forEach((accountId) => {
            let accountData = onBudgetAccounts.find((account) => accountId === account.get('entityId')) ||
                              offBudgetAccounts.find((account) => accountId === account.get('entityId'));
            $accountList
              .append(
                $('<div>', {
                  class: 'ynabtk-chip',
                  title: accountData.get('accountName'),
                  text: accountData.get('accountName')
                })
                .click(() => {
                  let index = selectedAccounts.indexOf(accountId);
                  selectedAccounts.splice(index, 1);
                  updateAccountList();
                  filterTransactionsAndBuildChart();
                })
              );
          });
        }

        updateAccountList();
      }

      function onReportSelected(toolkitId) {
        // change the current report in local storage so we can show it if they come back
        ynabToolKit.shared.setToolkitStorageKey('current-report', toolkitId);

        // grab the report, get any headers that the report may want to build
        let toolkitReport = ynabToolKit[toolkitId];
        $('.ynabtk-reports-headers').html(toolkitReport.reportHeaders());

        // update the report navigation to highlight the current active report
        $('.nav-reports .active').removeClass('active');
        $('#' + toolkitId, '.nav-reports').addClass('active');

        // generate the account filter options for our report
        generateAccountSelect(toolkitReport.availableAccountTypes);

        // finally, filter all the transactions for the report and call report.createChart()
        filterTransactionsAndBuildChart();
      }

      function filterTransaction(transaction, allowedDates, toolkitReport) {
        let filterType;

        // if the transaction isTombstone, or a scheduledTransaction then filter it out...
        if (transaction.get('isTombstone') || transaction.get('isScheduledTransaction')) {
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

        // make sure the transaction date is in the slice of the above array
        if (!toolkitReport.ignoreDateFilter) {
          let transactionDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);
          if (allowedDates.indexOf(transactionDate) === -1) {
            return false;
          }
        }

        // now that we've filtered by account and date, make sure there's no extra filtering required
        // by our report. if there is, return the value of that function, otherwise, return true, she's a keeper!
        if (toolkitReport.filterTransaction) {
          return toolkitReport.filterTransaction(transaction);
        }

        return true;
      }

      function filterTransactionsAndBuildChart() {
        // grab the toolkitReport based of the current-report in local storage
        let toolkitId = ynabToolKit.shared.getToolkitStorageKey('current-report');
        let toolkitReport = ynabToolKit[toolkitId];

        // default our date filter to all dates int the monthLabels array
        let indexStart = 0;
        let indexEnd = monthLabels.length;

        // grab the slider from the page, if it's initialized then make sure we get the current
        // dates set by the user. if it's not then our above default will suffice
        let sliderElement = document.getElementById('ynabtk-date-filter');
        if (sliderElement.noUiSlider && typeof sliderElement.noUiSlider.get === 'function') {
          // noUiSlider.get() returns the string representations of the items in the labels, so grab the
          // index of those elements afterwards. add one to the index end of self-explanatory array indexing reasons
          let dateFilterRange = document.getElementById('ynabtk-date-filter').noUiSlider.get();
          indexStart = monthLabels.indexOf(dateFilterRange[0]);
          indexEnd = monthLabels.indexOf(dateFilterRange[1]) + 1;
        }

        // now that we have a start and end index, we know what slice of the array to take
        ynabToolKit.reports.allowedDateStart = indexStart;
        ynabToolKit.reports.allowedDateEnd = indexEnd;
        let allowedDates = monthLabels.slice(indexStart, indexEnd);

        // filter out the transactions
        let filtered = allTransactions.filter((transaction) => {
          return filterTransaction(transaction, allowedDates, toolkitReport);
        });

        // call calculate. all reports should return us a promise for calculate just in case
        // they need to grab all categories or some item that's returned to us through a promise.
        toolkitReport.calculate(filtered).then(() => {
          // send the ynabtk-reports-data container into createChart so it knows where to build the data
          toolkitReport.createChart($('.ynabtk-reports-data'));
        });
      }

      function showReports() {
        // If we're not on the budget tab, then we need to be for the drill down detail
        // dialog to work. Go ahead and ask to be there.
        let router = ynabToolKit.shared.containerLookup('router:main');

        if (router.currentRouteName !== 'budget.select') {
          $('.navlink-budget a').click();
        }

        // grab all the transactions...
        ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then((transactionsViewModel) => {
          // then grab the sidebar so we can get all the accounts...
          ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel().then((sideBarViewModel) => {
            // store the accounts/transactions off on their own variables so we can use them later
            let closedAccounts = sideBarViewModel.get('closedAccounts');
            onBudgetAccounts = sideBarViewModel.get('onBudgetAccounts').concat(closedAccounts.filter((account) => account.get('onBudget')));
            offBudgetAccounts = sideBarViewModel.get('offBudgetAccounts').concat(closedAccounts.filter((account) => !account.get('onBudget')));
            allTransactions = transactionsViewModel.get('visibleTransactionDisplayItems');

            // sort the transactions by date. They usually are already, but let's not depend on that:
            allTransactions.sort(function (a, b) {
              return a.get('date').toNativeDate() - b.get('date').toNativeDate();
            });

            // clear out the content and put ours in there instead.
            buildReportsPage($('div.scroll-wrap').closest('.ember-view'), transactionsViewModel);

            // The budget header is absolute positioned
            $('.budget-header, .scroll-wrap').hide();

            // grab the value of the current-report inside localStorage
            let storedCurrentReport = ynabToolKit.shared.getToolkitStorageKey('current-report');

            // make sure whatever it is is actually a supported report (might be 'null' or 'undefined') because
            // string storage of values is a cool thing, ya know?
            let currentReport = supportedReports.find((report) => report.toolkitId === storedCurrentReport);

            // if it's a valid report, then go ahead and show it, if it's not then show the first available report
            if (currentReport) {
              onReportSelected(currentReport.toolkitId);
            } else {
              onReportSelected(supportedReports[0].toolkitId);
            }
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
              changedNodes.has('navlink-reports active') ||
              changedNodes.has('active navlink-reports') ||
              changedNodes.has('nav-account-row is-selected')) {
            // The user has left the reports page.
            // We're no longer the active page.
            $('.ynabtk-navlink-reports').removeClass('active');

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
          return this.formatDatel8n(transaction.get('date'));
        },

        formatDatel8n(date) {
          // Ensure we're always dealing with moment objects.
          date = typeof date.format === 'function' ? date : moment(date);

          // Get the English name for the date.
          let formattedDate = date.format('MMM YYYY');

          // now split it with year and month so that we can get the localized version of the month
          let year = formattedDate.split(' ')[1];
          let month = formattedDate.split(' ')[0];
          month = (ynabToolKit.l10nData && ynabToolKit.l10nData['months.' + month]) || month;

          // finally, return the l8n date.
          return `${month} ${year}`;
        },

        generateMonthLabelsFromFirstOfTransactions(transactions, endWithLastTransaction) {
          let monthLabelsForTransaction = [];
          // grab the current month, this is the last label of our slider
          let endMonth = new Date().getMonth();
          let endYear = new Date().getFullYear();

          if (endWithLastTransaction) {
            let lastTransactionDate = transactions[transactions.length - 1].get('date');
            endMonth = lastTransactionDate ? lastTransactionDate.getMonth() : endMonth;
            endYear = lastTransactionDate ? lastTransactionDate.getYear() : endYear;
          }

          let firstTransactionDate = transactions[0].get('date');
          let currentLabelMonth = firstTransactionDate ? firstTransactionDate.getMonth() : endMonth;
          let currentLabelYear = firstTransactionDate ? firstTransactionDate.getYear() : endYear;

          // start with the month/year on the very first transaction, we should create the labels needed
          // for our slider until the current month/year. use a while loop to do this because there's no need
          // to loop over every transaction. we get the current and end values from date objects which are
          // all 0-indexed but when this loop runs, we increment currentMonth at the very end which means
          // we're going to need to check currentLabelMonth - 1 in our while condition. this isn't a bad thing
          // because it means we'll also always insert our last month in the while loop and there's no need for
          // extra lines of code after. just extra lines of comments before :D
          while (!(currentLabelYear === endYear && currentLabelMonth - 1 === endMonth)) {
            if (currentLabelMonth === 12) {
              currentLabelMonth = 0;
              currentLabelYear++;
            }

            let labelDate = new Date(currentLabelYear, currentLabelMonth);
            let labelDateFormatted = ynabToolKit.reports.formatDatel8n(labelDate);
            monthLabelsForTransaction.push(labelDateFormatted);

            currentLabelMonth++;
          }

          return monthLabelsForTransaction;
        }
      };
    }());

    ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
