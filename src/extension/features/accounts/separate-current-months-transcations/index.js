import { Feature } from 'toolkit/extension/features/feature';

export class MyCoolFeature extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    console.log('MyCoolFeature is working!');
  }
}
