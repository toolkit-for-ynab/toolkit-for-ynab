module.exports = {
  name: 'PrivacyMode',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Privacy Mode',
  description:
    'Obscures dollar amounts everywhere until hovered. In toggle mode, a lock icon will appear in the lower left corner of YNAB. Click to enable or disable privacy mode.',
  options: [
    { name: 'Disabled', value: '0' },
    { name: 'Always On', value: '1' },
    { name: 'Add Toggle Button', value: '2' },
  ],
};
