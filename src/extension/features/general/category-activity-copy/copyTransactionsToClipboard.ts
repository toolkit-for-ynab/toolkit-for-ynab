import { getEntityManager } from 'toolkit/extension/utils/ynab';
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
    const parentEntityId = transaction.get('parentEntityId');
    let payeeId = transaction.get('payeeId');

    if (parentEntityId) {
      payeeId = entityManager.transactionsCollection
        .findItemByEntityId(parentEntityId)
        .get('payeeId');
    }

    const payee = entityManager.payeesCollection.findItemByEntityId(payeeId);
    return {
      Account: transaction.get('accountName'),
      Date: ynab.formatDateLong(transaction.get('date').toString()),
      Payee: payee && payee.get('name') ? payee.get('name') : 'Unknown',
      Category: transaction.get('subCategoryNameWrapped'),
      Memo: transaction.get('memo'),
      Amount: ynab.formatCurrency(transaction.get('amount')),
    };
  });

  const replacer = (_key: string, value: null | string) => (value === null ? '' : value);
  const header = Object.keys(activities[0]) as (keyof Activities)[];
  let csv = activities.map((row) =>
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join('\t')
  );
  csv.unshift(header.join('\t'));
  navigator.clipboard.writeText(csv.join('\r\n'));
}
