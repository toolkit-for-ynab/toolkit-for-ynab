import { isTransfer } from '../../../helpers/transaction';

const isValidPayee = (payee) => {
  if (payee === null) {
    return true;
  }

  return payee.internalName !== 'StartingBalancePayee';
};

const isValidDate = (transactionTime, currentTime, historyLookupMonths) => {
  if (historyLookupMonths !== 0) {
    return (currentTime - transactionTime) / 3600 / 24 / 1000 / (365 / 12) < historyLookupMonths;
  }
  return true;
};


export default function filter(historyLookupMonths) {
  const dateNow = Date.now();

  return (transaction) => (
    !transaction.isTombstone &&
      transaction.transferAccountId === null &&
      transaction.amount < 0 &&
      isValidPayee(transaction.getPayee()) &&
      transaction.getAccount().onBudget &&
      !isTransfer(transaction) &&
      isValidDate(transaction.getDate().getUTCTime(), dateNow, historyLookupMonths)
  );
}
