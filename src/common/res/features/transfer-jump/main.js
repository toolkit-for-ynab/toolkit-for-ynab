(function ynab_transfer_jump() {
	if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined') {
		(function($) {
			$.event.special.destroyed = {
				remove: function(o) {
					if (o.handler) {
						o.handler();
					}
				},
			};
		})(jQuery);

		DEBUG = false;

		TransactionAmountTypes = {
			INFLOW: 0,
			OUTFLOW: 1
		}

		function get_jump_transaction(entry_date, amount) {
			if (DEBUG) {
				console.log('Entering get_jump_transaction()...');
				console.log('var dump: entry_date');
				console.log(entry_date);
				console.log('var dump: amount');
				console.log(amount);
			}

			var transaction = null;
			if (amount['type'] === TransactionAmountTypes.INFLOW) {
				transaction = $('div.ynab-grid-body-row').
					has("div.ynab-grid-cell-date:contains('" + entry_date + "')").
					has("div.ynab-grid-cell-outflow:contains('" + amount['amount'] + "')")
			}
			else {
				transaction = $('div.ynab-grid-body-row').
					has("div.ynab-grid-cell-date:contains('" + entry_date + "')").
					has("div.ynab-grid-cell-inflow:contains('" + amount['amount'] + "')")
			}

			if (DEBUG) {
				console.log('var dump: transaction');
				console.log(transaction);
				console.log('Exiting get_jump_transaction()...');
			}

			return transaction;
		}

		function get_transaction_data(clicked_jump_element) {
			if (DEBUG) {
				console.log('Entering get_jump_transaction()...');
				console.log('var dump: clicked_jump_element');
				console.log(clicked_jump_element);
			}

			var entry = clicked_jump_element.closest('div.ynab-grid-cell-payeeName');
			var account_name = entry.attr('title').split(': ')[1];
			var account_selector_id = $("div.nav-account-name[title='" + account_name + "']").parent().attr('id');
			var entry_date = entry.siblings('div.ynab-grid-cell-date').text();
			var entry_inflow = entry.siblings('div.ynab-grid-cell-inflow').text();
			var entry_outflow = entry.siblings('div.ynab-grid-cell-outflow').text();
			var transaction = {
				'account_name': account_name,
				'account_selector_id': account_selector_id,
				'date': entry_date,
				'inflow_amount': $.trim(entry_inflow),
				'outflow_amount': $.trim(entry_outflow)
			};

			if (DEBUG) {
				console.log('var dump: transaction');
				console.log(transaction);
				console.log('Exiting get_jump_transaction()...');
			}

			return transaction;
		}

		$('.transfer-jump').off().on('click', function(){
			if (DEBUG) {
				console.log('Entering click event...');
			}

			var entry = get_transaction_data($(this));

			var transaction_amount = {};
			if (entry['inflow_amount'] !== '$0.00') {
				transaction_amount['amount'] = entry['inflow_amount'];
				transaction_amount['type'] = TransactionAmountTypes.INFLOW;
			}
			else {
				transaction_amount['amount'] = entry['outflow_amount'];
				transaction_amount['type'] = TransactionAmountTypes.OUTFLOW;
			}

			if (DEBUG) {
				console.log('var dump: transaction_amount');
				console.log(transaction_amount);
			}

			// Simulate a click on the target account (i.e., the "other side")
			// of the transfer:
			$('div#' + entry['account_selector_id']).trigger('click');

			setTimeout(function() {
				var jump_transaction = get_jump_transaction(entry['date'], transaction_amount);
				if (jump_transaction) {
					var grid = jump_transaction.parent();
					grid.scrollTop(jump_transaction.offset().top);
					jump_transaction.addClass('is-checked');
				}
			}, 100);
			return false;
		});

		var transfer_cells = $("div.ynab-grid-cell-payeeName[title*='Transfer']");
		if (transfer_cells.length) {
			transfer_cells.each(function() {
				var _this = $(this);
				var id = _this.parent().attr('id') + '_jump';
				var jump_icon = '<button id="' + id + '" class="transfer-jump"><span>&#8646;</span></button>';

				if (!$('button#' + id).length) {
					_this.prepend(jump_icon);
				}
			});
		}
	}

	setTimeout(ynab_transfer_jump, 10);
})()

