import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
const NUM_CONFETTI = 100;
const RECONCILE_SUCCESS_MODAL_CLASS = 'modal-account-reconcile-reconciled';

export class ReconcileConfetti extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {}

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.throwConfetti();
    }
  }

  throwConfetti() {
    const container = $(`.${RECONCILE_SUCCESS_MODAL_CLASS}`);
    if (container.length === 0) {
      return;
    }
    const parentNode = container.parent();
    for (let i = 0; i < NUM_CONFETTI; i++) {
      const xPos = Math.random() * 300 - 150;
      const yPos = Math.random() * 150 - 150;
      const rot = Math.random() * 360;
      const color = Math.random() * 360;

      const e = document.createElement('i');
      e.classList.add('confetti');
      e.style.cssText = `transform: translate3d(${xPos}px, ${yPos}px, 0) rotate(${rot}deg);
        background: hsla(${color}, 100%, 50%, 1.0);
        animation: confetti 800ms cubic-bezier(.15, .75, .50, 1) forwards, falldown 400ms ease-in 600ms forwards;`;
      parentNode.append(e);
    }
  }

  injectCSS() {
    return require('./index.css');
  }
}
