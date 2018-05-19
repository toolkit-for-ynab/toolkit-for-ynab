import { Feature } from 'toolkit/extension/features/feature';

import '../../../legacy/features/budget-category-info/main';

export class GoalWarningColor extends Feature {
  injectCSS() { return require('./index.css'); }
}
