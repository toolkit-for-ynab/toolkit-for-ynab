export function linkifyMemoCell(memo) {
  if (memo.dataset.isLink === 'true' || memo.dataset.isLink === true) {
    return;
  }

  const title = memo.getAttribute('title');
  if (typeof title !== 'string' || !title.toLowerCase().startsWith('https://')) {
    return;
  }

  const span = memo.querySelector('span');
  if (!span) {
    return;
  }

  const sanitizedHref = sanitizeLink(span.textContent);
  if (!sanitizedHref) {
    return;
  }

  const link = document.createElement('a');
  link.setAttribute('href', sanitizedHref);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  link.textContent = sanitizedHref;

  span.textContent = '';
  span.appendChild(link);
  memo.dataset.isLink = true;
}

export function sanitizeLink(rawValue) {
  if (typeof rawValue !== 'string') {
    return null;
  }

  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (parsedUrl.protocol !== 'https:') {
      return null;
    }

    return parsedUrl.href;
  } catch (_error) {
    return null;
  }
}
