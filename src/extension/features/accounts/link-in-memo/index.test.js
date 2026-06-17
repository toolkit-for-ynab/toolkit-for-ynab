import { linkifyMemoCell } from './utils';

describe('linkifyMemoCell', () => {
  const insecureLink = 'http://example.com/demo';

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function buildMemoCell({ title, text }) {
    const memo = document.createElement('div');
    memo.className = 'ynab-grid-cell-memo';
    memo.setAttribute('title', title);

    const span = document.createElement('span');
    span.textContent = text;
    memo.appendChild(span);

    document.body.appendChild(memo);
    return memo;
  }

  it('converts https memo text into a safe hyperlink', () => {
    const memo = buildMemoCell({
      title: 'https://example.com/demo',
      text: 'https://example.com/demo',
    });

    linkifyMemoCell(memo);

    const link = memo.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com/demo');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.textContent).toBe('https://example.com/demo');
  });

  it('ignores memos whose content is not a safe https URL', () => {
    const memo = buildMemoCell({
      title: 'https://example.com/demo',
      text: insecureLink,
    });

    linkifyMemoCell(memo);

    expect(memo.querySelector('a')).toBeNull();
    expect(memo.textContent).toBe(insecureLink);
  });
});
