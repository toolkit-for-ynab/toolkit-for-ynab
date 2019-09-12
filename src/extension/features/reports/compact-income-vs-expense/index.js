import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class CompactIncomeVsExpense extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return getCurrentRouteName().includes('reports.income-expense');
  }

  invoke() {
    let viewWidth = $('.reports-content').width();
    let columnCount = $('.income-expense-column.income-expense-column-header').length;
    let tableWidth = columnCount * 115 + 200 + 32;
    let percentage = Math.ceil((tableWidth / viewWidth) * 100);

    $('.income-expense-table').css({ width: percentage + '%' });

    // Strip away YNAB's default scroll behavior
    $('.reports-income-expense').off('scroll');

    // Re-implement default behavior, but with modifications to the fixed-position header
    $('.reports-income-expense').scroll(function(e) {
      var r = $('.income-expense-header');
      var scrollTop = $('.ember-view.reports-income-expense').scrollTop();
      var scrollLeft = $('.ember-view.reports-income-expense').scrollLeft();
      if (scrollLeft < 40) {
        $('.income-expense-first-column').css({
          position: 'static',
          maxWidth: 'auto',
          left: 0,
          borderRight: 'none',
        });
      } else {
        $('.income-expense-first-column').css({
          position: 'relative',
          maxWidth:
            $(
              '.income-expense-level2 .income-expense-row .income-expense-column:first-child'
            ).outerWidth() || 200,
          left:
            e.currentTarget.scrollLeft - parseFloat($('.reports-content').css('padding-left') || 0),
          borderRight: '1px solid #dfe4e9',
        });
        $('.income-expense-h1 .income-expense-first-column').css('borderRight', 'none');
      }
      if (scrollTop < 40) {
        r.css({
          position: 'static',
          width: 'auto',
          marginLeft: 0,
          paddingRight: 0,
        });
        $('.income-expense-table').css('padding-top', 0);
      } else {
        var leftPos = $('.income-expense-income').offset().left;
        r.css({
          position: 'fixed',
          top: $('.reports-header').outerHeight() + $('.reports-controls').outerHeight(),
          width: $('.income-expense-income').width(),
          marginLeft: -($(e).scrollLeft() || 0),
          left: leftPos,
        });
        $('.income-expense-table').css('padding-top', $('.reports-header').outerHeight());
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('income-expense-row') ||
      changedNodes.has('income-expense-column income-expense-number') ||
      changedNodes.has('income-expense-header')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
