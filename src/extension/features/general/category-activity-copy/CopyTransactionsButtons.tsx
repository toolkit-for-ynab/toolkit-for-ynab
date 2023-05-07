import React, { useState } from 'react';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import copyTransactionsToClipboard from './copyTransactionsToClipboard';

interface Props {
  transactions: YNABTransaction[];
}

export default function CopyTransactionsButton({ transactions }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyTransactions = () => {
    copyTransactionsToClipboard(transactions);

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (!(Array.isArray(transactions) && transactions.length > 0)) return null;

  return (
    <button
      id="tk-copy-transactions"
      className="button button-primary"
      onClick={handleCopyTransactions}
    >
      {isCopied ? 'Copied!' : 'Copy Transactions'}
    </button>
  );
}
