module.exports = {
  name: 'ConfirmEditTransactionCancellation',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Confirm Transaction Edit Cancellation',
  description: `Display a confirmation prompt when transaction cancelling a transaction edit by pressing "Enter" guarding against accidentely discarding complex split transactions.`,
};
