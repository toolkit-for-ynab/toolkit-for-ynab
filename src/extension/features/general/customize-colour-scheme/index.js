import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const YNAB_THEME_SWITCHER = 'js-ynab-new-theme-switcher-themes';

const TK_CUSTOMIZE_COLOUR_ACCENTS = [
  'l025c020',
  'l030c045',
  'l045c055',
  'l090c090',
  'l100c100',
  'l110c100',
  'l120c050',
  'l125c065',
  'l140c060',
  'l140c075',
  'l150c060',
  'l160c015',
];

/*
MIT License

Copyright (c) 2014 Kevin Kwok <antimatter15@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function lab2rgb(lab) {
  let y = (lab[0] + 16) / 116;
  let x = lab[1] / 500 + y;
  let z = y - lab[2] / 200;

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255,
  ];
}

function rgb2lab(rgb) {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/* END OF LICENSE */

function hex2rgb(hex) {
  if (hex.length !== 7) {
    return [0, 0, 0];
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return [Number.isNaN(r) ? 0 : r, Number.isNaN(g) ? 0 : g, Number.isNaN(b) ? 0 : b];
}

function rgb2hex(rgb) {
  const r = Math.round(rgb[0]).toString(16);
  const g = Math.round(rgb[1]).toString(16);
  const b = Math.round(rgb[2]).toString(16);

  return (
    '#' +
    (r.length === 2 ? r : '0' + r) +
    (g.length === 2 ? g : '0' + g) +
    (b.length === 2 ? b : '0' + b)
  );
}

function lab2lch(lab) {
  const c = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);

  let h = Math.atan2(lab[2], lab[1]);
  if (h > 0) {
    h = (h / Math.PI) * 180;
  } else {
    h = 360 - (Math.abs(h) / Math.PI) * 180;
  }

  return [lab[0], c, h];
}

function lch2lab(lch) {
  const a = Math.cos((lch[2] / 180) * Math.PI) * lch[1];
  const b = Math.sin((lch[2] / 180) * Math.PI) * lch[1];
  return [lch[0], a, b];
}

function hexToLch(hex) {
  return lab2lch(rgb2lab(hex2rgb(hex)));
}

function lchToHex(l, c, h) {
  return rgb2hex(lab2rgb(lch2lab([l, c, h])));
}

export class CustomizeColourScheme extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    const optionMenu = $(`.tk-custom-colours-option`);
    return optionMenu.length === 0;
  }

  calculateAccents(hex) {
    const lch = hexToLch(hex);

    let out = {};

    TK_CUSTOMIZE_COLOUR_ACCENTS.forEach((val) => {
      const l = parseInt(val.substr(1, 3)) / 100;
      const c = parseInt(val.substr(5, 3)) / 100;
      out[val] = lchToHex(lch[0] * l, lch[1] * c, lch[2]);
    });

    return out;
  }

  setEnabled(enabled) {
    if (enabled) {
      document.body.classList.add('tk-custom-colours-enabled');
    } else {
      document.body.classList.remove('tk-custom-colours-enabled');
    }
  }

  getEnabled() {
    return document.body.classList.contains('tk-custom-colours-enabled');
  }

  setColour(name, hex) {
    if (!hex) {
      return;
    }

    document.body.style.setProperty(`--tk-custom-colours-${name}`, hex);

    const accents = this.calculateAccents(hex);

    const keys = Object.keys(accents);
    keys.forEach((key) => {
      document.body.style.setProperty(`--tk-custom-colours-${name}-${key}`, accents[key]);
    });
  }

  getColour(name) {
    return getComputedStyle(document.body).getPropertyValue(`--tk-custom-colours-${name}`).trim();
  }

  resetColour(name) {
    document.body.style.removeProperty(`--tk-custom-colours-${name}`);
  }

  setSquare(name, value) {
    if (value) {
      if (!this.getSquare(name)) {
        document.body.setAttribute(`tk-custom-colours-${name}-square`, true);
      }
    } else if (this.getSquare(name)) {
      document.body.removeAttribute(`tk-custom-colours-${name}-square`);
    }
  }

  getSquare(name) {
    return !!document.body.getAttribute(`tk-custom-colours-${name}-square`);
  }

  loadSetting(name, def) {
    return getToolkitStorageKey(`custom-colours-${name}`, def);
  }

  saveSetting(name, value) {
    setToolkitStorageKey(`custom-colours-${name}`, value);
  }

  loadSettings() {
    const enabled = this.loadSetting('enabled', false);
    this.setEnabled(enabled);

    // Load colours from storage - otherwise use values from style sheet
    const positive = this.loadSetting('colour-positive', this.getColour('positive'));
    const warning = this.loadSetting('colour-warning', this.getColour('warning'));
    const negative = this.loadSetting('colour-negative', this.getColour('negative'));

    this.setColour('positive', positive);
    this.setColour('warning', warning);
    this.setColour('negative', negative);

    this.setSquare('positive', this.loadSetting('square-positive', false));
    this.setSquare('warning', this.loadSetting('square-warning', false));
    this.setSquare('negative', this.loadSetting('square-negative', true)); // On by default
  }

  saveSettings() {
    this.saveSetting('enabled', this.getEnabled());

    this.saveSetting('colour-positive', this.getColour('positive'));
    this.saveSetting('colour-warning', this.getColour('warning'));
    this.saveSetting('colour-negative', this.getColour('negative'));

    this.saveSetting('square-positive', this.getSquare('positive'));
    this.saveSetting('square-warning', this.getSquare('warning'));
    this.saveSetting('square-negative', this.getSquare('negative'));
  }

  cancelChanges() {
    // Reset the live colour preview - this is necessary because if the user has
    // no saved settings the default colour otherwise can't be read
    this.resetColour('positive');
    this.resetColour('warning');
    this.resetColour('negative');

    this.loadSettings();
  }

  invoke() {
    this.loadSettings();
  }

  createColourOption(name, label) {
    const value = this.getColour(name);

    const button = $(
      `<button>
        <div class="tk-custom-colours-${name}">
          <div class="tk-custom-colours-picker-icon"></div>
          <input type="color" value="${value}" class="tk-custom-colours-picker" style="background-color: ${value};"></input>
        </div>
        <div class="ynab-new-theme-switcher-label">${label}</div>
      </button>`
    );

    // Live update colours as they are selected
    $('input', button).on('input', (e) => {
      this.setColour(name, e.target.value);
    });

    // If the user clicks on the button, redirect it to the input
    button.on('click', (e) => {
      const input = $('input', button);
      if (e.target !== input.get(0)) {
        input.trigger('click');
      }
    });

    return button;
  }

  createSquareOption(name) {
    const square = this.getSquare(name);

    const option = $(
      `<div>
        <input type="checkbox" id="tk-custom-colours-${name}-square" ${square ? 'checked' : ''}>
        <label for="tk-custom-colours-${name}-square">Square Corners</label>
      </div>`
    );
    $('input', option).on('click', (e) => {
      this.setSquare(name, e.target.checked);
    });

    return option;
  }

  buildOptionsMenu() {
    const themeSwitcher = $(`.${YNAB_THEME_SWITCHER}`);
    if (themeSwitcher.length === 0) {
      return;
    }

    const optionsMenu = $(
      `<div class="ynab-new-theme-switcher-option tk-custom-colours-option">
        <div class="tk-custom-colours-option-title"><h3>Customize Colour Scheme</h3>
        <input type="checkbox" class="tk-custom-colours-option-enable" ${
          this.getEnabled() ? 'checked' : ''
        }></div>
      </div>`
    );

    $('input', optionsMenu).on('click', (e) => {
      this.setEnabled(e.target.checked);
      $(window).trigger('resize');
    });

    const pickerGrid = $(`<div class="ynab-new-theme-switcher-grid"></div>`);
    pickerGrid.append(this.createColourOption('positive', 'Positive'));
    pickerGrid.append(this.createColourOption('warning', 'Warning'));
    pickerGrid.append(this.createColourOption('negative', 'Negative'));

    const squareGrid = $(
      `<div class="ynab-new-theme-switcher-grid tk-custom-colours-square"></div>`
    );
    squareGrid.append(this.createSquareOption('positive'));
    squareGrid.append(this.createSquareOption('warning'));
    squareGrid.append(this.createSquareOption('negative'));

    optionsMenu.append(squareGrid);
    optionsMenu.append(pickerGrid);
    themeSwitcher.append(optionsMenu);

    // Trigger a resize event so the modal adjusts position for its new height
    $(window).trigger('resize');

    // Todo: not this
    $('.ynab-new-theme-switcher .modal-actions .button-primary').on('click', () => {
      this.saveSettings();
    });
    $('.ynab-new-theme-switcher .modal-actions button:last-child').on('click', () => {
      this.cancelChanges();
    });
    $('.ynab-new-theme-switcher .modal-close').on('click', () => {
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
