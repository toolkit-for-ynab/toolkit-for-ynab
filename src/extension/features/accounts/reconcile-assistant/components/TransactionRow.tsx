import React from 'react';
import { formatCurrency } from 'toolkit/extension/utils/currency';

import type { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

interface TransactionRowProps {
  transaction: YNABTransaction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => (
  <div className="ynab-table-row">
    <div className="ynab-table-col">{transaction.account.accountName}</div>
    <div className="ynab-table-col">
      {ynab.YNABSharedLib.dateFormatter.formatDate(transaction.date)}
    </div>
    <div className="ynab-table-col">
      {transaction.payee && transaction.payee.name ? transaction.payee.name : ''}
    </div>
    <div className="ynab-table-col">{transaction.memo}</div>
    <div className="ynab-table-col amount-column">{formatCurrency(transaction.amount)}</div>
  </div>
);
