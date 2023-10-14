import { getBrowser } from 'toolkit/core/common/web-extensions';
const script = document.createElement('script');
script.setAttribute('id', 'ynab-toolkit-ember-boot');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', getBrowser().runtime.getURL('web-accessibles/enable-ember-debug.js'));
document.documentElement.appendChild(script);
