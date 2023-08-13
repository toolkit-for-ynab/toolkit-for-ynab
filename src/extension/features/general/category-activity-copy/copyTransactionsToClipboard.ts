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
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join('\t')
  );
  csv.unshift(header.join('\t'));
  navigator.clipboard.writeText(csv.join('\r\n'));
}
