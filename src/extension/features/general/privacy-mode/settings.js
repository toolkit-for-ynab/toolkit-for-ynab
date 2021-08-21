module.exports = {
  name: 'PrivacyMode',
  type: 'select',
  default: false,
  section: 'general',
  title: 'Privacy Mode',
  description:
    'Obscure dollar amounts everywhere until hovered. In toggle mode, a lock icon will appear in the lower left corner of YNAB. Click to enable or disable privacy mode.',
  options: [
    { name: 'Always On', value: '1' },
    { name: 'Add Toggle Button', value: '2' },
  ],
};
