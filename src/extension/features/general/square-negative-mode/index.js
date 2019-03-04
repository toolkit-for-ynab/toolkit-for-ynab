import { Feature } from 'toolkit/extension/features/feature';

export class SquareNegativeMode extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
