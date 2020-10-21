import { Feature } from 'toolkit/extension/features/feature';
import {
  addToolkitEmberHook,
  getToolkitStorageKey,
  setToolkitStorageKey,
} from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const defaultFlags = {
  red: {
    label: 'Red',
    color: '#d43d2e',
  },
  orange: {
    label: 'Orange',
    color: '#ff7b00',
  },
  yellow: {
    label: 'Yellow',
    color: '#f8e136',
  },
  green: {
    label: 'Green',
    color: '#9ac234',
  },
  blue: {
    label: 'Blue',
    color: '#0082cb',
  },
  purple: {
    label: 'Purple',
    color: '#9384b7',
  },
};

export class CustomFlagNames extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'modals/accounts/transaction-flags',
      'didRender',
      this.injectEditFlags
    );

    addToolkitEmberHook(this, 'register/grid-row', 'didRender', this.applyFlagTitle);
  }

  applyFlagTitle(element) {
    const flags = getToolkitStorageKey('flags', defaultFlags);

    ['red', 'blue', 'orange', 'yellow', 'green', 'purple'].forEach(color => {
      const flag = element.querySelector(`.ynab-flag-${color}`);
      if (flag === null) {
        return;
      }

      flag.parentElement.setAttribute('title', flags[color].label);
    });
  }

  injectEditFlags(element) {
    const flags = getToolkitStorageKey('flags', defaultFlags);

    $('.ynab-flag-red .label').text(flags.red.label);
    $('.ynab-flag-blue .label').text(flags.blue.label);
    $('.ynab-flag-orange .label').text(flags.orange.label);
    $('.ynab-flag-yellow .label').text(flags.yellow.label);
    $('.ynab-flag-green .label').text(flags.green.label);
    $('.ynab-flag-purple .label').text(flags.purple.label);

    if (element.querySelector('#tk-edit-flags') === null) {
      $('.modal', element).append(
        $('<div>', { id: 'tk-edit-flags' }).append(
          $('<button>', {
            id: 'flags-edit',
            class: 'button button-primary',
          })
            .append('Edit Flag Names ')
            .append($('<i>', { class: 'flaticon stroke compose-3' }))
            .on('click', this.showEditFlags)
        )
      );
    }
  }

  showEditFlags = () => {
    const flags = getToolkitStorageKey('flags', defaultFlags);

    $('.modal-account-flags .modal-list').empty();

    for (let key in flags) {
      let flag = flags[key];

      $('.modal-account-flags .modal-list').append(
        $('<li>').append(
          $('<input>', {
            id: key,
            type: 'text',
            class: 'tk-flag-input',
            value: flag.label,
            placeholder: defaultFlags[key].label,
          })
            .css({
              fill: flag.color,
              'background-color': flag.color,
            })
            .on('change', event => {
              const { value } = event.currentTarget;

              if (value) {
                flags[key].label = event.currentTarget.value;
              } else {
                flags[key].label = defaultFlags[key].value;
              }
            })
        )
      );
    }

    $('#tk-edit-flags')
      .empty()
      .append(
        $('<button>', {
          id: 'tk-flags-close',
          class: 'button button-primary',
        })
          .append('Ok ')
          .append(
            $('<i>', {
              class: 'flaticon stroke checkmark-2',
            })
          )
          .on('click', () => {
            setToolkitStorageKey('flags', flags);
            controllerLookup('application').send('closeModal');

            ['red', 'blue', 'orange', 'yellow', 'green', 'purple'].forEach(color => {
              $(`.ynab-flag-${color}`)
                .parent()
                .attr('title', flags[color].label);
            });
          })
      );
  };
}
