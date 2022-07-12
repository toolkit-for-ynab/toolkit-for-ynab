import React from 'react';
import resources from '../resources';
import { TransactionRow } from './TransactionRow';

import type { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

interface TransactionsTableProps {
  transactions: Array<YNABTransaction>;
}

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => (
  <div className="ynab-table-5-col ynab-table tk-mg-b-1">
    <div className="ynab-table-head">
      <div className="ynab-table-col">{resources.transactionAccount}</div>
      <div className="ynab-table-col">{resources.transactionDate}</div>
      <div className="ynab-table-col">{resources.transactionPayee}</div>
      <div className="ynab-table-col">{resources.transactionMemo}</div>
      <div className="ynab-table-col amount-column">{resources.transactionAmount}</div>
    </div>
    <div className="ynab-table-body">
      {transactions.length > 0 &&
        transactions.map((transaction, index) => (
          <TransactionRow key={index} transaction={transaction} />
        ))}
    </div>
  </div>
);
