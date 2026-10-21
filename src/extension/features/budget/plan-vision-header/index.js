import { Feature } from 'toolkit/extension/features/feature';
import { Collections } from 'toolkit/extension/utils/collections';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const PLAN_VISION_CATEGORY_NAME = 'Plan Vision';
const PLAN_VISION_HEADER_ID = 'tk-plan-vision-header';

export class PlanVisionHeader extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    const budgetHeader = document.querySelector('.budget-header');
    const existingHeader = document.getElementById(PLAN_VISION_HEADER_ID);
    const note = this.getPlanVisionNote();

    if (!budgetHeader || !note) {
      existingHeader?.remove();
      return;
    }

    const visionHeader = existingHeader || document.createElement('section');
    visionHeader.id = PLAN_VISION_HEADER_ID;
    visionHeader.className = 'tk-plan-vision-header';
    visionHeader.setAttribute('aria-label', 'Plan Vision');

    const label =
      visionHeader.querySelector('.tk-plan-vision-header__label') ||
      document.createElement('strong');
    label.className = 'tk-plan-vision-header__label';
    label.textContent = 'Plan Vision';

    const content =
      visionHeader.querySelector('.tk-plan-vision-header__content') ||
      document.createElement('div');
    content.className = 'tk-plan-vision-header__content';
    content.textContent = note;

    if (!label.parentElement) {
      visionHeader.appendChild(label);
    }
    if (!content.parentElement) {
      visionHeader.appendChild(content);
    }

    if (visionHeader.previousElementSibling !== budgetHeader) {
      budgetHeader.insertAdjacentElement('afterend', visionHeader);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('budget-header') ||
      changedNodes.has('budget-header-item') ||
      changedNodes.has('inspector-notes') ||
      changedNodes.has('inspector-category-note')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this.destroy();
    }
  }

  onBudgetChanged() {
    this.destroy();
  }

  destroy() {
    document.getElementById(PLAN_VISION_HEADER_ID)?.remove();
  }

  getPlanVisionNote() {
    let note = '';

    Collections.subCategoriesCollection.forEach((category) => {
      if (category.name === PLAN_VISION_CATEGORY_NAME && !category.isTombstone) {
        note = category.note || '';
      }
    });

    return note.trim() ? note : '';
  }
}
