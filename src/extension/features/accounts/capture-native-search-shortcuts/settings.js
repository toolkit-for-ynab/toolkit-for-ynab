module.exports = {
  name: 'CaptureNativeSearchShortcuts',
  type: 'checkbox',
  default: false,
  section: 'accounts',
  title: 'Capture native search shortcuts',
  description:
    "Make pressing default browser search shortcuts (Ctrl+F/Cmd+F) focus in YNAB's account transaction input field. Restoring focus back to previously active element or field can be done by pressing Escape",
};
