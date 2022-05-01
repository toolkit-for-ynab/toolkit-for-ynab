import { Feature } from 'toolkit/extension/features/feature';

const STRIPED_ROW_CLASS = 'tk-striped-transaction-row';

export class AccountsStripedRows extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('register/grid-row', 'didRender', this.addStripes);
    this.addToolkitEmberHook('register/grid-sub', 'didRender', this.addStripes);
  }

  destroy() {
    $(`.${STRIPED_ROW_CLASS}`).removeClass(STRIPED_ROW_CLASS);
  }

  isStriped(row) {
    let offset = 0;
    let currentRow = row;
    while (currentRow.previousElementSibling) {
      offset++;
      if (currentRow.previousElementSibling.classList.contains(STRIPED_ROW_CLASS)) {
        return offset % 2 === 0;
      }
      currentRow = currentRow.previousElementSibling;
    }

    offset = 0;
    currentRow = row;
    while (currentRow.nextElementSibling) {
      offset++;
      if (currentRow.nextElementSibling.classList.contains(STRIPED_ROW_CLASS)) {
        return offset % 2 === 0;
      }
      currentRow = currentRow.nextElementSibling;
    }

    return true;
  }

  addStripes(row) {
    if (this.isStriped(row)) {
      row.classList.add(STRIPED_ROW_CLASS);
    } else {
      row.classList.remove(STRIPED_ROW_CLASS);
    }
  }
}
