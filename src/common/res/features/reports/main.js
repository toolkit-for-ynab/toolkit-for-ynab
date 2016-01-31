(function poll() {
    if (typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

      ynabToolKit.reports = new function() {

        function updateCanvasSize() {
          // Set the canvas dimensions to the parent element dimensions.
          var container = $('div.scroll-wrap').closest('.ember-view');

          $('#reportCanvas').attr('width', container.innerWidth())
            .attr('height', container.innerHeight());
        }

        function setUpReportsButton() {
          var reportsBtn = '<li> \
            <li class="ember-view navlink-reports"> \
              <a href="#"> \
                <span class="ember-view flaticon stroke document-4"></span>Reports \
              </a> \
            </li> \
          </li>';

          $(".nav-main").append(reportsBtn);

          $(".navlink-reports").on("click", showReports);
        }

        // Remove the content and put our report there instead.
        function showReports() {
          // Update the nav
          $('.navlink-budget, .navlink-accounts').removeClass('active');
          $('.navlink-reports').addClass('active');

          // Get width and height of parent element to set up the canvas
          // Clear out the content and put ours in there instead.
          $('div.scroll-wrap').empty().append('<canvas id="reportCanvas" width="100" height="100"></canvas>');

          updateCanvasSize();

          var ctx = document.getElementById("reportCanvas").getContext("2d");

          var accounts = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result;
          var transactions = accounts.transactionDisplayItemsCollection._internalDataArray;

          var lastLabel = null,
            labels = [],
            assets = [],
            liabilities = [],
            netWorths = [],
            balanceByAccount = {};

          // Bucket the transactions into month buckets, tallying as we go.
          transactions.forEach(function(transaction) {
            if (transaction.displayItemType == "transaction") {

              var date = transaction.date._internalUTCMoment._d;
              var formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date, 'MMM YYYY');

              if (lastLabel == null) lastLabel = formattedDate;

              // If it's time to push the next month's data into the arrays let's
              // go for it.
              if (formattedDate != lastLabel) {
                labels.push(formattedDate);

                var totalAssets = 0,
                  totalLiabilities = 0;

                for (var key in balanceByAccount) {
                  if (balanceByAccount.hasOwnProperty(key)) {

                    if (balanceByAccount[key] > 0) {
                      totalAssets += (balanceByAccount[key] || 0);
                    } else {
                      totalLiabilities += (-balanceByAccount[key] || 0);
                    }
                  }
                }

                assets.push(totalAssets);
                liabilities.push(totalLiabilities);
                netWorths.push(totalAssets - totalLiabilities);

                lastLabel = formattedDate;
              }

              // If we need a holder in balanceByAccount let's get one.
              if (!balanceByAccount.hasOwnProperty(transaction.getAccountName())) {
                balanceByAccount[transaction.getAccountName()] = 0;
              }

              // Tally ho.
              balanceByAccount[transaction.getAccountName()] += transaction.getAmount();
            }
          });

          // Display!

          // This formats the currency on the tooltips.
          Chart.defaults.global.tooltips.callbacks.label = function(tooltipItem) {
            var currency = ynab.YNABSharedLib.currencyFormatter.getCurrency();
            var value = ynab.YNABSharedLib.currencyFormatter.format(tooltipItem.yLabel);

            if (currency.display_symbol && currency.symbol_first) {
              return currency.currency_symbol + value;
            } else if (currency.display_symbol) {
              return value + currency.currency_symbol;
            } else {
              return value;
            }
          }

          var chartData = {
            labels: labels,
            datasets: [{
              label: 'Debts',
              backgroundColor: "rgba(234,106,81,1)",
              data: liabilities
            }, {
              label: 'Assets',
              backgroundColor: "rgba(142,208,223,1)",
              data: assets
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
              data: netWorths
            }]
          };

          ynabToolKit.netWorthReport = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: true,
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
                    callback: function(tickValue) {
                      var currency = ynab.YNABSharedLib.currencyFormatter.getCurrency();
                      var value = ynab.YNABSharedLib.currencyFormatter.format(tickValue);

                      if (currency.display_symbol && currency.symbol_first) {
                        return currency.currency_symbol + value;
                      } else if (currency.display_symbol) {
                        return value + currency.currency_symbol;
                      } else {
                        return value;
                      }
                    }
                  }
                }]
              }
            }
          });
        }

        this.invoke = function() {
          setUpReportsButton();
        };

        this.observe = function(changedNodes) {
          if (changedNodes.has('navlink-budget') || changedNodes.has('navlink-accounts')) {

            if ($('.navlink-budget').hasClass('active') || $('.navlink-accounts').hasClass('active')) {
              // The user has left the reports page.
              $('.navlink-reports').removeClass('active');
            }
          }
        };
      }

      ynabToolKit.reports.invoke();
  } else {
    setTimeout(poll, 250);
  }
})();
