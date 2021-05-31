import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const YNAB_THEME_SWITCHER = 'js-ynab-new-theme-switcher-themes';
const TK_COLOUR_BLIND_OPTION = 'tk-colour-blind-option';

function hslToRgb(h, s, l) {
  var c = (1 - Math.abs(l * 2 - 1)) * s;
  var x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  var m = l - c / 2;

  var r = 0;
  var g = 0;
  var b = 0;

  h = (h * 6) % 6;
  if (h >= 0 && h < 1) {
    r = c;
    g = x;
  } else if (h >= 1 && h < 2) {
    r = x;
    g = c;
  } else if (h >= 2 && h < 3) {
    g = c;
    b = x;
  } else if (h >= 3 && h < 4) {
    g = x;
    b = c;
  } else if (h >= 4 && h < 5) {
    r = x;
    b = c;
  } else if (h >= 5 && h < 6) {
    r = c;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var chroma = max - min;

  var h = 0;
  if (chroma !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / chroma) % 6;
        if (h < 0) h += 6;
        break;
      case g:
        h = (b - r) / chroma + 2;
        break;
      case b:
        h = (r - g) / chroma + 4;
        break;
    }
    h /= 6;
  }

  var l = (max + min) / 2;

  var s = 0;
  if (l !== 0 && l !== 1) {
    s = chroma / (1 - Math.abs(2 * l - 1));
  }

  return [h, s, l];
}

function rgbToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  return (
    '#' +
    (r.length === 2 ? r : '0' + r) +
    (g.length === 2 ? g : '0' + g) +
    (b.length === 2 ? b : '0' + b)
  );
}

function hexToRgb(hex) {
  if (hex.length !== 7) {
    return [0, 0, 0];
  }

  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);

  return [Number.isNaN(r) ? 0 : r, Number.isNaN(g) ? 0 : g, Number.isNaN(b) ? 0 : b];
}

function hexToHsl(hex) {
  return rgbToHsl(...hexToRgb(hex));
}

function hslToHex(h, s, l) {
  return rgbToHex(...hslToRgb(h, s, l));
}

export class ColourBlindMode extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    var optionMenu = $(`.${TK_COLOUR_BLIND_OPTION}`);
    return optionMenu.length === 0;
  }

  calculateAccents(hex) {
    var hsl = hexToHsl(hex);

    var darkest = hslToHex(hsl[0], hsl[1], hsl[2] * 0.2);
    var darker = hslToHex(hsl[0], hsl[1], hsl[2] * 0.6);
    var lighter = hslToHex(hsl[0], hsl[1], Math.min(hsl[2] + 0.05, 1));
    var lightest = hslToHex(hsl[0], hsl[1], hsl[2] + (1 - hsl[2]) * 0.85);

    return {
      darkest: darkest,
      darker: darker,
      lighter: lighter,
      lightest: lightest,
    };
  }

  setColour(name, hex) {
    if (hex) {
      var accents = this.calculateAccents(hex);
      document.body.style.setProperty(`--tk-colour-blind-${name}`, hex);
      document.body.style.setProperty(`--tk-colour-blind-${name}-darkest`, accents.darkest);
      document.body.style.setProperty(`--tk-colour-blind-${name}-darker`, accents.darker);
      document.body.style.setProperty(`--tk-colour-blind-${name}-lighter`, accents.lighter);
      document.body.style.setProperty(`--tk-colour-blind-${name}-lightest`, accents.lightest);
    } else {
      document.body.style.removeProperty(`--tk-colour-blind-${name}`);
      document.body.style.removeProperty(`--tk-colour-blind-${name}-darkest`);
      document.body.style.removeProperty(`--tk-colour-blind-${name}-darker`);
      document.body.style.removeProperty(`--tk-colour-blind-${name}-lighter`);
      document.body.style.removeProperty(`--tk-colour-blind-${name}-lightest`);
    }
  }

  getColour(name) {
    return getComputedStyle(document.body)
      .getPropertyValue(`--tk-colour-blind-${name}`)
      .trim();
  }

  saveColour(name, hex) {
    setToolkitStorageKey(`colour-blind-${name}`, hex);
  }

  loadColour(name, def) {
    return getToolkitStorageKey(`colour-blind-${name}`, def);
  }

  loadColours() {
    var positive = this.loadColour('positive');
    var warning = this.loadColour('warning');
    var negative = this.loadColour('negative');

    this.setColour('positive', positive);
    this.setColour('warning', warning);
    this.setColour('negative', negative);
  }

  saveChanges() {
    var positive = $('.tk-colour-blind-positive input').val();
    var warning = $('.tk-colour-blind-warning input').val();
    var negative = $('.tk-colour-blind-negative input').val();

    this.saveColour('positive', positive);
    this.saveColour('warning', warning);
    this.saveColour('negative', negative);
  }

  cancelChanges() {
    this.loadColours();
  }

  invoke() {
    this.loadColours();
  }

  createOptionButton(name, label, value) {
    var button = $(
      `<button>
        <div class="tk-colour-blind-${name}">
          <input type="color" value="${value}" style="background-color: ${value};"></input>
          <div class="tk-colour-blind-accents">
            <div style="background-color: var(--tk-colour-blind-${name}-lightest);"></div>
            <div style="background-color: var(--tk-colour-blind-${name}-lighter);"></div>
            <div style="background-color: var(--tk-colour-blind-${name}-darker);"></div>
            <div style="background-color: var(--tk-colour-blind-${name}-darkest);"></div>
          </div>
        </div>
        <div class="ynab-new-theme-switcher-label">${label}</div>
      </button>`
    );

    $('input', button).on('input', e => {
      this.setColour(name, e.target.value);
    });

    button.on('click', e => {
      let input = $('input', button);
      if (e.target !== input.get(0)) {
        input.trigger('click');
      }
    });

    return button;
  }

  buildOptionsMenu() {
    let themeSwitcher = $(`.${YNAB_THEME_SWITCHER}`);
    if (themeSwitcher.length === 0) {
      return;
    }

    let colourOptions = $(
      `<div class="ynab-new-theme-switcher-option ${TK_COLOUR_BLIND_OPTION}">
        <h3>Colour Blind Mode</h3>
      </div>`
    );

    let grid = $(`<div class="ynab-new-theme-switcher-grid"></div>`);
    grid.append(this.createOptionButton('positive', 'Positive', this.getColour('positive')));
    grid.append(this.createOptionButton('warning', 'Warning', this.getColour('warning')));
    grid.append(this.createOptionButton('negative', 'Negative', this.getColour('negative')));

    colourOptions.append(grid);
    themeSwitcher.append(colourOptions);

    // Trigger a resize event so the modal adjusts position for its new height
    $(window).trigger('resize');

    // Todo: not this
    $('.ynab-new-theme-switcher .modal-actions .button-primary').on('click', () => {
      this.saveChanges();
    });
    $('.ynab-new-theme-switcher .modal-actions button:last-child').on('click', () => {
      this.cancelChanges();
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (changedNodes.has(`modal-content ${YNAB_THEME_SWITCHER}`)) {
      this.buildOptionsMenu();
    }
  }
}
