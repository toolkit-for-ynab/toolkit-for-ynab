import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { isSafariBrowser } from 'toolkit/core/common/web-extensions';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

interface Activities {
  Account: string;
  Date: string;
  Payee: any;
  Category: string;
  Memo: string;
  Amount: string;
}

export default function copyTransactionsToClipboard(transactions: YNABTransaction[]) {
  const entityManager = getEntityManager();
  const activities = transactions.map<Activities>((transaction) => {
    const parentEntityId = transaction?.parentEntityId;
    let payeeId = transaction?.payeeId;

    if (parentEntityId) {
      payeeId = entityManager.transactionsCollection.findItemByEntityId(parentEntityId)?.payeeId;
    }

    const payee = entityManager.payeesCollection.findItemByEntityId(payeeId);
    return {
      Account: transaction?.accountName,
      Date: ynab.formatDateLong(transaction?.date.toString()),
      Payee: payee?.name ?? 'Unknown',
      Category: transaction?.subCategoryNameWrapped,
      Memo: transaction?.memo,
      Amount: ynab.formatCurrency(transaction?.amount),
    };
  });

  const replacer = (_key: string, value: null | string) => (value === null ? '' : value);
  const header = Object.keys(activities[0]) as (keyof Activities)[];
  let csv = activities.map((row) =>
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join('\t'),
  );
  csv.unshift(header.join('\t'));

  const csvContent = csv.join('\r\n');
  const clipboardApiAvailable = typeof navigator !== 'undefined' && navigator.clipboard?.writeText;

  if (clipboardApiAvailable && !isSafariBrowser()) {
    navigator.clipboard.writeText(csvContent);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = csvContent;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

  textarea.select();
  document.execCommand('copy');

  document.body.removeChild(textarea);

  if (selectedRange && selection) {
    selection.removeAllRanges();
    selection.addRange(selectedRange);
  }
}
