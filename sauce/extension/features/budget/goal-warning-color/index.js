import { Feature } from 'toolkit/core/extension/feature';

export class GoalWarningColor extends Feature {
  injectCSS() { return require('./index.css'); }
}
