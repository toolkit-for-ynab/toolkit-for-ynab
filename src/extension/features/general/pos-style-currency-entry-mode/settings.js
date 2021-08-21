module.exports = {
  name: 'POSStyleCurrencyEntryMode',
  type: 'checkbox',
  default: false,
  section: 'general',
  title: 'POS-style Currency Entry',
  description:
    'Allow entry of currency values without decimal separators (as done in real-life on POS terminals). For example, entering a figure of "500" will expand to "5.00". Values containing decimal separators will be left unmodified (e.g. "50.00" will stay "50.00"). As a shorthand, values ending with "-" will be expanded to full monetary unit (e.g. "50-" will result in "50.00"). Math operations are supported as well (e.g. "50*5" becomes "2.50").',
};
