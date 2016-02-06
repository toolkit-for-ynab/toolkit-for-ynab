(function poll() {
    if (typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

      ynabToolKit.reports = new function() {

        this.netWorth = {
          labels: [],
          assets: [],
          liabilities: [],
          netWorths: []
        };

        function updateCanvasSize() {
          // Set the canvas dimensions to the parent element dimensions.
          var container = $('div.scroll-wrap').closest('.ember-view');
          var reportsPanel = $('#reports-panel');

          $('#reportCanvas')
            .attr('width', container.innerWidth())
            .attr('height', container.innerHeight() - reportsPanel.innerHeight() - 20);
        }

        function setUpReportsButton() {
          var reportsBtn =
          '<li> \
            <li class="ember-view navlink-reports"> \
              <a href="#"> \
                <span class="ember-view flaticon stroke document-4"></span>Reports \
              </a> \
            </li> \
          </li>';

          $(".nav-main").append(reportsBtn);

          $(".navlink-reports").on("click", showReports);

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
        }

        function calculateNetWorthReport() {
          var accounts = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result;
          var transactions = accounts.transactionDisplayItemsCollection._internalDataArray.filter(function(transaction) {
            return transaction.displayItemType == "transaction";
          });

          // Sort the transactions by date. They usually are already, but let's not depend on that:
          transactions.sort(function (a, b) {
            return a.date._internalUTCMoment._d - b.date._internalUTCMoment._d;
          });

          // TODO: Fill in any gaps in months

          ynabToolKit.reports.netWorth.labels.length = 0;
          ynabToolKit.reports.netWorth.assets.length = 0;
          ynabToolKit.reports.netWorth.liabilities.length = 0;
          ynabToolKit.reports.netWorth.netWorths.length = 0;

          var lastLabel = null,
              balanceByAccount = {};

          // Bucket the transactions into month buckets, tallying as we go.
          transactions.forEach(function(transaction) {
            var date = transaction.date._internalUTCMoment._d;
            var formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date, 'MMM YYYY');

            if (lastLabel == null) lastLabel = formattedDate;

            // If it's time to push the next month's data into the arrays let's
            // go for it.
            if (formattedDate != lastLabel) {
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

              lastLabel = formattedDate;
            }

            // If we need a holder in balanceByAccount let's get one.
            if (!balanceByAccount.hasOwnProperty(transaction.getAccountName())) {
              balanceByAccount[transaction.getAccountName()] = 0;
            }

            // Tally ho.
            balanceByAccount[transaction.getAccountName()] += transaction.getAmount();
          });
        }

        function updateReportWithDateFilter() {
          var values = document.getElementById('reports-date-filter').noUiSlider.get();
          var labels = ynabToolKit.reports.netWorth.labels;
          var liabilities = ynabToolKit.reports.netWorth.liabilities;
          var assets = ynabToolKit.reports.netWorth.assets;
          var netWorths = ynabToolKit.reports.netWorth.netWorths;
          var chart = ynabToolKit.reports.netWorthReportChart;

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
        }

        // Remove the content and put our report there instead.
        function showReports() {
          // Update the nav
          $('.navlink-budget, .navlink-accounts').removeClass('active');
          $('.nav-account-row').removeClass('is-selected');
          $('.navlink-reports').addClass('active');

          // Clear out the content and put ours in there instead.
          $('div.scroll-wrap').closest('.ember-view').prepend(
            '<div id="reports-panel"> \
              <div id="reports-filter"> \
                <h3>Filters</h3> \
                <span class="reports-filter-name">Timeframe</span> \
                <div id="reports-date-filter"></div> \
              </div> \
              <div id="reports-inspector"> \
                <div class="reports-inspector-detail"> \
                  <div class="reports-legend-square debts"></div> \
                  <span class="reports-inspector-heading">Debts</span> \
                  <span id="reports-inspector-debts" class="reports-inspector-value"></span> \
                </div> \
                <div class="reports-inspector-divider"></div> \
                <div class="reports-inspector-detail"> \
                  <div class="reports-legend-square assets"></div> \
                  <span class="reports-inspector-heading">Assets</span> \
                  <span id="reports-inspector-assets" class="reports-inspector-value"></span> \
                </div> \
                <div class="reports-inspector-divider"></div> \
                <div class="reports-inspector-detail"> \
                  <div class="reports-legend-line net-worth"></div> \
                  <span class="reports-inspector-heading">Net Worth</span> \
                  <span id="reports-inspector-net-worth" class="reports-inspector-value"></span> \
                </div> \
              </div> \
            </div> \
            <canvas id="reportCanvas" width="100" height="100"></canvas>'
          );

          // The budget header is absolute positioned
          $('.budget-header').hide();

          updateCanvasSize();

          calculateNetWorthReport();

          var dateFilter = document.getElementById("reports-date-filter");
          var labels = ynabToolKit.reports.netWorth.labels;

          var start = [labels[0], labels[labels.length - 1]];

          // Restore the date filter values in case they've gone to another tab and come back.
          var savedStart = sessionStorage.getItem("reportsDateFilter");

          if (savedStart) {
            start = savedStart.split(',');
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
                return ynabToolKit.reports.netWorth.labels[index];
              },
              from: function(value) {
                return ynabToolKit.reports.netWorth.labels.indexOf(value);
              }
            }
          });

          dateFilter.noUiSlider.on('slide', updateReportWithDateFilter);

          var chartData = {
            labels: labels,
            datasets: [
            {
              label: 'Debts',
              backgroundColor: "rgba(234,106,81,1)",
              data: ynabToolKit.reports.netWorth.liabilities
            }, {
              label: 'Assets',
              backgroundColor: "rgba(142,208,223,1)",
              data: ynabToolKit.reports.netWorth.assets
            }, {
              type: 'line',
              label: 'Net Worth',
              fill: true,
              tension: 0,
              borderColor: "rgba(102,147,176,1)",
              backgroundColor: "rgba(244,248,226,0.3)",
              pointBorderColor: "rgba(255,255,255,0)",
              pointBackgroundColor: "rgba(255,255,255,0)",
              pointBorderWidth: 5,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(255,255,255,0)",
              pointHoverBorderColor: "rgba(255,255,255,0)",
              pointHoverBorderWidth: 5,
              data: ynabToolKit.reports.netWorth.netWorths
            }]
          };

          var ctx = document.getElementById("reportCanvas").getContext("2d");

          ynabToolKit.reports.netWorthReportChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: true,
              responsiveAnimationDuration: 2500,
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
                    // This formats the currency on the Y axis (to the left of the chart)
                    callback: function(value) { return ynabToolKit.shared.formatCurrency(value); }
                  }
                }]
              }
            }
          });

          updateReportWithDateFilter();
        }

        this.invoke = function() {
          setUpReportsButton();
        };

        this.observe = function(changedNodes) {
          if (changedNodes.has('navlink-budget') ||
              changedNodes.has('navlink-accounts') ||
              changedNodes.has('nav-account-row')) {

            if ($('.navlink-budget').hasClass('active') ||
                $('.navlink-accounts').hasClass('active') ||
                $('.nav-account-row').hasClass('is-selected')) {
              // The user has left the reports page.
              // We're no longer the active page.
              $('.navlink-reports').removeClass('active');

              // Get rid of our UI
              $('#reports-panel, #reports-inspector, #reportCanvas').remove();

              // And restore the budget header we hid earlier
              $('.budget-header').show();
            }
          }
        };
      }

      ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
})();
