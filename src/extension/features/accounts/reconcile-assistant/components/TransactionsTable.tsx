import React from 'react';
import { TransactionRow } from './TransactionRow';

interface TransactionsTableProps {
  transactions: Array<Transaction>;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  return (
    <div className="ynab-table-5-col ynab-table tk-mg-b-1">
      <div className="ynab-table-head">
        <div className="ynab-table-col">Account</div>
        <div className="ynab-table-col">Date</div>
        <div className="ynab-table-col">Payee</div>
        <div className="ynab-table-col">Memo</div>
        <div className="ynab-table-col amount-column">Amount</div>
      </div>
      <div className="ynab-table-body">
        {transactions.length > 0 &&
          transactions.map((txn, index) => <TransactionRow key={index} transaction={txn} />)}
      </div>
    </div>
  );
};
