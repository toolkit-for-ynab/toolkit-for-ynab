export function userAgent() {
  return window.navigator.userAgent;
}

export function isPlatformMac() {
  // Matchers adapted from https://github.com/bestiejs/platform.js/blob/efa9ac0e4f4aec19f10280c90fcf8dd47fa67a2f/platform.js#L483-L485
  const macRegexp = /\b(?:Mac OS X|Macintosh|Mac)\b/gi;

  return userAgent().match(macRegexp).length > 0;
}
