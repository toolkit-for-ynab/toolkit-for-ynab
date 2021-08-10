module.exports = {
  name: 'ConfirmEditTransactionCancellation',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Confirm keyboard-initiated transaction cancellation',
  description:
    'Displays a pop-up confirmation prompt when transaction row\'s "Cancel" action is triggered by keyboard press ("Enter"). This guards against inadvertent discarding of complex split transaction entries in keyboard driven entry workflows.',
};
