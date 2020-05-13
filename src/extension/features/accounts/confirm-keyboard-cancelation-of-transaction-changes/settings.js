module.exports = {
  name: 'ConfirmKeyboardCancelationOfTransactionChanges',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Confirm keyboard-initiated transaction cancelation',
  description:
    'Displays a pop-up confirmation prompt when transaction row\'s "Cancel" action is triggered by keyboard press ("Enter"). This guards against inadvertent discarding of complex split transaction entries in keyboard driven entry workflows.',
};
