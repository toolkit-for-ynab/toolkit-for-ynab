import Feature from 'core/feature';

export default class ShowCategoryBalance extends Feature {
  constructor() {
    super();
  }

  invoke() {
    console.log(this.settings);
  }

  onRouteChanged(route) {
    if (route.indexOf('account') === -1) return;

    
  }
}
