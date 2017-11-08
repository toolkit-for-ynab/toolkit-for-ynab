import { Feature } from 'toolkit/core/feature';

export class MasterToggle extends Feature {
  invoke() {
    console.log('MasterToggle invoked!');
    console.log('MasterToggle: this: ', this);
    console.log('MasterToggle: this.constructor.name: ', this.constructor.name);
  }
}
