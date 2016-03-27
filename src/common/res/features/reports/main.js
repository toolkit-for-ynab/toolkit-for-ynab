/* jshint multistr: true */

(function poll() {
    if (typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

      ynabToolKit.reports = (function(){

        // Supporting functions,
        // or variables, etc
        $(window).resize(this.updateCanvasSize);

        return {
          netWorth: {
            labels: [],
            assets: [],
            liabilities: [],
            netWorths: []
          },

          updateCanvasSize: function() {
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
              .css({'max-height' : height });

            if (ynabToolKit.reports.netWorthReportChart) {
              ynabToolKit.reports.netWorthReportChart.resize();
            }
          },

          setUpReportsButton: function() {
            if ($('li.navlink-reports').length > 0) {
              // The button already exists. Bail.
              return;
            }

            $('.nav-main').append(
              $('<li>').append(
                $('<li>', { class: 'ember-view navlink-reports' }).append(
                  $('<a>', { href: '#' }).append(
                    $('<span>', { class: 'ember-view flaticon stroke document-4'})
                  ).append(
                    (ynabToolKit.l10nData && ynabToolKit.l10nData['sidebar.reports']) || 'Reports'
                  )
                )
              )
            );

            $(".navlink-reports").on("click", ynabToolKit.reports.showReports);
          },

          debugTransactions: function() {
            ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then(function (transactionsViewModel) {
              var transactionDisplayItems = transactionsViewModel.get('visibleTransactionDisplayItems');

              var transactions = transactionDisplayItems.filter(function(transaction) {
                return transaction.get('displayItemType') == "transaction";
              });

              // Sort the transactions by date. They usually are already, but let's not depend on that:
              transactions.sort(function (a, b) {
                return a.get('date').toNativeDate() - b.get('date').toNativeDate();
              });

              console.log(JSON.stringify(transactions.map(function(transaction) {
                return {
                  date: ynabToolKit.shared.toLocalDate(transaction.get('date')),
                  formattedDate: ynab.YNABSharedLib.dateFormatter.formatDate(ynabToolKit.shared.toLocalDate(transaction.get('date')), 'MMM YYYY'),
                  account: transaction.getAccountName(),
                  amount: transaction.getAmount()
                };
              })));
            });
          },

          calculateNetWorthReport: function() {

            return new Promise(function(resolve, reject) {

              ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then(function (transactionsViewModel) {
                var transactionDisplayItems = transactionsViewModel.get('visibleTransactionDisplayItems');

                var transactions = transactionDisplayItems.filter(function(transaction) {
                  return transaction.get('displayItemType') == 'transaction' &&
                         transaction.get('isTombstone') === false;
                });

                // Sort the transactions by date. They usually are already, but let's not depend on that:
                transactions.sort(function (a, b) {
                  return a.get('date').toNativeDate() - b.get('date').toNativeDate();
                });

                // Clear out the arrays so we know we've got fresh data.
                ynabToolKit.reports.netWorth.labels.length = 0;
                ynabToolKit.reports.netWorth.assets.length = 0;
                ynabToolKit.reports.netWorth.liabilities.length = 0;
                ynabToolKit.reports.netWorth.netWorths.length = 0;

                var lastLabel = null,
                    balanceByAccount = {},
                    date = null,
                    formattedDate = null;

                // Bucket the transactions into month buckets, tallying as we go.
                transactions.forEach(function(transaction) {

                  // Used when we're debugging transactions -----------
                  // date = new Date(transaction.date);
                  // formattedDate = transaction.formattedDate;
                  // transaction.getAccountName = function() {
                  //   return this.account;
                  // };
                  // transaction.getAmount = function () {
                  //   return this.amount;
                  // };
                  // --------------------------------------------------

                  date = ynabToolKit.shared.toLocalDate(transaction.get('date'));
                  formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date, 'MMM YYYY');
                  var year = formattedDate.split(' ')[1];
                  var month = formattedDate.split(' ')[0];
                  month = (ynabToolKit.l10nData && ynabToolKit.l10nData["months." + month]) || month;
                  formattedDate = month + ' ' + year;

                  if (lastLabel === null) lastLabel = formattedDate;

                  // If it's time to push the next month's data into the arrays let's
                  // go for it.
                  if (formattedDate != lastLabel) {
                    ynabToolKit.reports.netWorth.labels.push(lastLabel);

                    var totalAssets = 0, totalLiabilities = 0;

                    for (var key in balanceByAccount) {
                      if (balanceByAccount.hasOwnProperty(key)) {

                        if (balanceByAccount[key] > 0) {
                          totalAssets += (balanceByAccount[key] || 0);
                        } else {
                          totalLiabilities += (-balanceByAccount[key] || 0);
                        }
                      }
                    }

                    ynabToolKit.reports.netWorth.assets.push(totalAssets);
                    ynabToolKit.reports.netWorth.liabilities.push(totalLiabilities);
                    ynabToolKit.reports.netWorth.netWorths.push(totalAssets - totalLiabilities);

                    lastLabel = formattedDate;
                  }

                  // If we need a holder in balanceByAccount let's get one.
                  if (!balanceByAccount.hasOwnProperty(transaction.getAccountName())) {
                    balanceByAccount[transaction.getAccountName()] = 0;
                  }

                  // Tally ho.
                  balanceByAccount[transaction.getAccountName()] += transaction.getAmount();
                });

                // Ensure we've pushed the last month in.
                if (formattedDate != ynabToolKit.reports.netWorth.labels[ynabToolKit.reports.netWorth.labels.length -1]) {
                  ynabToolKit.reports.netWorth.labels.push(formattedDate);

                  var totalAssets = 0, totalLiabilities = 0;

                  for (var key in balanceByAccount) {
                    if (balanceByAccount.hasOwnProperty(key)) {

                      if (balanceByAccount[key] > 0) {
                        totalAssets += (balanceByAccount[key] || 0);
                      } else {
                        totalLiabilities += (-balanceByAccount[key] || 0);
                      }
                    }
                  }

                  ynabToolKit.reports.netWorth.assets.push(totalAssets);
                  ynabToolKit.reports.netWorth.liabilities.push(totalLiabilities);
                  ynabToolKit.reports.netWorth.netWorths.push(totalAssets - totalLiabilities);
                }

                if (transactions.length > 0) {
                  // Fill in any gaps in the months in case they're missing data.
                  var currentIndex = 0;

                  var currentDate = ynabToolKit.shared.toLocalDate(transactions[0].get('date'));
                  var maxDate = ynabToolKit.shared.toLocalDate(transactions[transactions.length - 1].get('date'));

                  // For debugging ----------------------------------------------------
                  // var currentDate = new Date(transactions[0].date);
                  // var maxDate = new Date(transactions[transactions.length - 1].date);
                  // ------------------------------------------------------------------

                  // Ensure we're on the 1st to avoid edge cases like the 31st.
                  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

                  var labels = ynabToolKit.reports.netWorth.labels;
                  var assets = ynabToolKit.reports.netWorth.assets;
                  var liabilities = ynabToolKit.reports.netWorth.liabilities;
                  var netWorths = ynabToolKit.reports.netWorth.netWorths;

                  while (currentDate < maxDate) {
                    formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(currentDate, 'MMM YYYY');
                    var year = formattedDate.split(' ')[1];
                    var month = formattedDate.split(' ')[0];
                    month = (ynabToolKit.l10nData && ynabToolKit.l10nData["months." + month]) || month;
                    formattedDate = month + " " + year;

                    if (labels.indexOf(formattedDate) < 0) {

                      labels.splice(currentIndex + 1, 0, formattedDate);
                      assets.splice(currentIndex + 1, 0, assets[currentIndex]);
                      liabilities.splice(currentIndex + 1, 0, liabilities[currentIndex]);
                      netWorths.splice(currentIndex + 1, 0, netWorths[currentIndex]);
                    }

                    currentIndex++;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                  }
                }

                resolve();
              });
            });
          },

          updateReportWithDateFilter: function() {
            var labels = ynabToolKit.reports.netWorth.labels;
            var liabilities = ynabToolKit.reports.netWorth.liabilities;
            var assets = ynabToolKit.reports.netWorth.assets;
            var netWorths = ynabToolKit.reports.netWorth.netWorths;
            var chart = ynabToolKit.reports.netWorthReportChart;
            var values = [labels[0], labels[0]];

            if ($('#reports-filter').is(':visible')) {
              // Ok, the filter is in use, set the values to the filter values.
              values = document.getElementById('reports-date-filter').noUiSlider.get();
            }

            var startIndex = labels.indexOf(values[0]);
            var endIndex = labels.indexOf(values[1]);

            // Save the date filter values in case they go to another tab and come back.
            sessionStorage.setItem("reportsDateFilter", values);

            chart.data.labels = labels.slice(startIndex, endIndex + 1);
            chart.data.datasets[0].data = liabilities.slice(startIndex, endIndex + 1);
            chart.data.datasets[1].data = assets.slice(startIndex, endIndex + 1);
            chart.data.datasets[2].data = netWorths.slice(startIndex, endIndex + 1);

            chart.update();

            // Set the inspector values to the latest date in the date range.
            $('#reports-inspector-debts').text(ynabToolKit.shared.formatCurrency(liabilities[endIndex]));
            $('#reports-inspector-assets').text(ynabToolKit.shared.formatCurrency(assets[endIndex]));
            $('#reports-inspector-net-worth').text(ynabToolKit.shared.formatCurrency(netWorths[endIndex]));
          },

          // Remove the content and put our report there instead.
          showReports: function() {

            // Don't add another report if it already exists
            if ($('#reports-panel').length) {
              return;
            }

            // Update the nav
            $('.navlink-budget, .navlink-accounts').removeClass('active');
            $('.nav-account-row').removeClass('is-selected');
            $('.navlink-reports').addClass('active');

            $('.navlink-budget, .navlink-accounts, .nav-account-row').on("click", function() {
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

            // Clear out the content and put ours in there instead.
            $('div.scroll-wrap').closest('.ember-view').prepend(
              '<div id="reports-panel"> \
                <div id="reports-header"> \
                  <h2><span class="ember-view flaticon stroke document-4"></span>' +
                  ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.netWorthReport"]) || 'Net Worth Report') + '</h2> \
                </div> \
                <div id="reports-filter"> \
                  <h3>' +
                  ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.filters"]) || 'Filters') + '</h3> \
                  <span class="reports-filter-name">' +
                  ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.timeframe"]) || 'Timeframe') + '</span> \
                  <div id="reports-date-filter"></div> \
                </div> \
                <div id="reports-inspector"> \
                  <div class="reports-inspector-detail"> \
                    <div class="reports-legend-square debts"></div> \
                    <span class="reports-inspector-heading">' +
                    ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.debts"]) || 'Debts') + '</span> \
                    <span id="reports-inspector-debts" class="reports-inspector-value"></span> \
                  </div> \
                  <div class="reports-inspector-divider"></div> \
                  <div class="reports-inspector-detail"> \
                    <div class="reports-legend-square assets"></div> \
                    <span class="reports-inspector-heading">' +
                    ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.assets"]) || 'Assets') + '</span> \
                    <span id="reports-inspector-assets" class="reports-inspector-value"></span> \
                  </div> \
                  <div class="reports-inspector-divider"></div> \
                  <div class="reports-inspector-detail"> \
                    <div class="reports-legend-line net-worth"></div> \
                    <span class="reports-inspector-heading">' +
                    ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.netWorth"]) || 'Net Worth') + '</span> \
                    <span id="reports-inspector-net-worth" class="reports-inspector-value"></span> \
                  </div> \
                </div> \
              </div> \
              <canvas id="reportCanvas" width="100" height="100"></canvas>'
            );

            // The budget header is absolute positioned
            $('.budget-header, .scroll-wrap').hide();

            ynabToolKit.reports.calculateNetWorthReport().then(function() {

              var dateFilter = document.getElementById("reports-date-filter");
              var labels = ynabToolKit.reports.netWorth.labels;

              var start = [labels[0], labels[labels.length - 1]];

              if (start[0] == [start[1]]) {
                // We only have one month. We can't show the filter.
                $('#reports-filter').hide();
              } else {
                // Restore the date filter values in case they've gone to another tab and come back.
                var savedStart = sessionStorage.getItem("reportsDateFilter");

                if (savedStart) {
                  savedStart = savedStart.split(',');

                  if (savedStart.length === 2 && savedStart[0].length > 0 && savedStart[1].length > 0) {
                    start = savedStart;
                  }
                }

                // Set up the date filter.
                noUiSlider.create(dateFilter, {
                  connect: true,
                	start: start,
                	range: {
                		'min': 0,
                		'max': labels.length - 1
                	},
                  step: 1,
                  tooltips: true,
                  format: {
                    to: function(index) {
                      return ynabToolKit.reports.netWorth.labels[Math.round(index)];
                    },
                    from: function(value) {
                      return ynabToolKit.reports.netWorth.labels.indexOf(value);
                    }
                  }
                });

                dateFilter.noUiSlider.on('slide', ynabToolKit.reports.updateReportWithDateFilter);
              }

              // Is the report fully positive? If so we should start the chart at 0.
              // If not, let the chart do its thing so that people can see their negative
              // net worths. liabilities and Assets are always positive, so this only
              // matters with the net worth data points.
              var startAtZero = true;
              ynabToolKit.reports.netWorth.netWorths.forEach(function(netWorth) {
                if (netWorth < 0) {
                  startAtZero = false;
                }
              });

              // If there's only one month's worth of data, then the net worth
              // figure won't be visible, as there's only a dot. Let's set the
              // dot colour in that case.
              var netWorthDotColor = "rgba(255,255,255,0)";

              if (labels.length == 1) {
                netWorthDotColor = "rgba(102,147,176,1)";
              }

              var chartData = {
                labels: labels,
                datasets: [
                {
                  label: (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.debts"]) || 'Debts',
                  backgroundColor: "rgba(234,106,81,1)",
                  data: ynabToolKit.reports.netWorth.liabilities
                }, {
                  label: (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.assets"]) || 'Assets',
                  backgroundColor: "rgba(142,208,223,1)",
                  data: ynabToolKit.reports.netWorth.assets
                }, {
                  type: 'line',
                  label: (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.netWorth"]) || 'Net Worth',
                  fill: true,
                  tension: 0,
                  borderColor: "rgba(102,147,176,1)",
                  backgroundColor: "rgba(244,248,226,0.3)",
                  pointBorderColor: netWorthDotColor,
                  pointBackgroundColor: netWorthDotColor,
                  pointBorderWidth: 5,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: netWorthDotColor,
                  pointHoverBorderColor: netWorthDotColor,
                  pointHoverBorderWidth: 5,
                  data: ynabToolKit.reports.netWorth.netWorths
                }]
              };

              ynabToolKit.reports.updateCanvasSize();

              var ctx = document.getElementById("reportCanvas").getContext("2d");

              ynabToolKit.reports.netWorthReportChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                  responsive: false,
                  responsiveAnimationDuration: 2500,
                  maintainAspectRatio: false,
                  legend: {
                    display: false
                  },
                  hover: {
                    onHover: function(points) {
                      // This is an array with 3 values in it if they're moused over an
                      // actual value. The point along the X axis is always the same
                      // for all 3 values for us, so just grab the first one then populate
                      // the inspector.
                      if (points.length > 0) {
                        var index = points[0]._index;

                        // Need to calculate the adjusted index for the date filter if it's applied.
                        if ($('#reports-filter').is(':visible')) {
                          var values = document.getElementById('reports-date-filter').noUiSlider.get();
                          index += ynabToolKit.reports.netWorth.labels.indexOf(values[0]);
                        }

                        var liabilities = ynabToolKit.reports.netWorth.liabilities[index];
                        var assets = ynabToolKit.reports.netWorth.assets[index];
                        var netWorth = ynabToolKit.reports.netWorth.netWorths[index];

                        $('#reports-inspector-debts').text(ynabToolKit.shared.formatCurrency(liabilities));
                        $('#reports-inspector-assets').text(ynabToolKit.shared.formatCurrency(assets));
                        $('#reports-inspector-net-worth').text(ynabToolKit.shared.formatCurrency(netWorth));
                      }
                    }
                  },
                  tooltips: {
                    enabled: false
                  },
                  scales: {
                    xAxes: [{
                      gridLines: {
                        display: false
                      },
                      labels: {
                        show: true,
                        fontFamily: "'Lato',Arial,'Helvetica Neue',Helvetica,sans-serif"
                      },
                    }],
                    yAxes: [{
                      ticks: {
                        beginAtZero: startAtZero,
                        // This formats the currency on the Y axis (to the left of the chart)
                        callback: function(value) { return ynabToolKit.shared.formatCurrency(value); }
                      }
                    }]
                  }
                }
              });

              ynabToolKit.reports.updateReportWithDateFilter();
            });
          },

          invoke: function() {
            ynabToolKit.reports.setUpReportsButton();
          },

          observe: function(changedNodes) {
            // Did they switch budgets?
            if (changedNodes.has('pure-g layout user-logged-in')) {
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
          }
        };
      })(); // Keep feature functions contained within this object

      ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
})();
