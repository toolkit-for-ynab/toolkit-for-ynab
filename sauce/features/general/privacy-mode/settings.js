module.exports = {
  name: 'PrivacyMode',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Privacy Mode',
  description: 'Obscures dollar amounts everywhere until hovered.',
  options: [
    { 'name': 'Disabled', 'value': '0' },
    { 'name': 'Always On', 'value': '1' },
    { 'name': 'Add Toggle Button', 'value': '2' }
  ]
};
