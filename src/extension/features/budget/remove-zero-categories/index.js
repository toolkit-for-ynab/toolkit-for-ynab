import { Feature } from 'toolkit/extension/features/feature';

export class RemoveZeroCategories extends Feature {
  destroy() {
    $('.modal-budget-overspending .dropdown-list > li').removeClass('tk-hidden');
  }

  observe(changedNodes) {
    if (changedNodes.has('dropdown-container categories-dropdown-container')) {
      this.hideEmpties();
    }
  }

  hideEmpties() {
    let lastSectionItem = null;
    let hideSectionItem = true;

    Array.from(document.querySelectorAll('.modal-budget-overspending .dropdown-list > li')).forEach(
      (element) => {
        if (element.classList.contains('section-item')) {
          if (lastSectionItem && hideSectionItem) {
            lastSectionItem.classList.add('tk-hidden');
          }

          lastSectionItem = element;
          hideSectionItem = true;
        }

        const availableTitle = element.querySelector('.category-available')?.getAttribute('title');
        if (!availableTitle) {
          return;
        }

        let categoryBalance = ynab.unformat(availableTitle);
        if (categoryBalance <= 0) {
          element.classList.add('tk-hidden');
        } else {
          hideSectionItem = false;
        }
      }
    );

    if (lastSectionItem && hideSectionItem) {
      lastSectionItem.classList.add('tk-hidden');
    }
  }
}
