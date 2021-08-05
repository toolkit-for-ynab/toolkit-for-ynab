import classNames from 'classnames';
import * as React from 'react';
import { settingsBySection } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { Toggle } from 'toolkit/components/toggle';
import { RadioGroup } from 'toolkit/components/radio-group';

import './styles.scss';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser } from 'toolkit/core/common/web-extensions';

function Setting({ config }: { config: FeatureSettingConfig }) {
  const [featureSetting, setFeatureSetting] = React.useState<FeatureSetting>(false);

  React.useEffect(() => {
    localToolkitStorage.getFeatureSetting(config.name).then((value) => {
      setFeatureSetting(value);
    });
  }, []);

  function handleChange(newValue: FeatureSetting) {
    localToolkitStorage.setFeatureSetting(config.name, newValue).then(() => {
      setFeatureSetting(newValue);
    });
  }

  return (
    <div
      className={classNames('setting', {
        'setting--select': config.type === 'select',
      })}
    >
      {config.type === 'checkbox' && (
        <Toggle
          checked={featureSetting as boolean}
          htmlFor={`${config.name}-toggle`}
          onChange={(checked) => handleChange(checked)}
        />
      )}
      <div className="setting__info">
        <div>
          <label className="setting__title" htmlFor={`${config.name}-toggle`}>
            {config.title}
          </label>
        </div>
        <div className="setting__description">{config.description}</div>
      </div>
      {config.type === 'select' && (
        <RadioGroup
          name={config.name}
          options={config.options}
          value={featureSetting as string}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

function SettingsList({ settings }: { settings: FeatureSettingConfig[] }) {
  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      {settings.map((config) => (
        <Setting key={config.name} config={config} />
      ))}
    </div>
  );
}

function DarkModeToggle() {
  const [isDarkModeEnabled, setIsDarkModeEnabled] = React.useState(
    document.querySelector('html').dataset['theme'] === 'dark'
  );

  React.useEffect(() => {
    if (isDarkModeEnabled) {
      document.querySelector('html').dataset['theme'] = 'dark';
    } else {
      document.querySelector('html').dataset['theme'] = '';
    }
  }, [isDarkModeEnabled]);

  function handleDarkModeClicked() {
    localToolkitStorage.setFeatureSetting('options.dark-mode', !isDarkModeEnabled).then(() => {
      setIsDarkModeEnabled(!isDarkModeEnabled);
    });
  }

  return (
    <div className="dark-mode-toggle nav-bar__action-icon" onClick={handleDarkModeClicked}>
      <FontAwesomeIcon
        className={classNames('dark-mode-toggle__icon', {
          'dark-mode-toggle__icon--active': isDarkModeEnabled,
        })}
        icon={faMoon}
        size="lg"
      />
      <FontAwesomeIcon
        className={classNames('dark-mode-toggle__icon', {
          'dark-mode-toggle__icon--active': !isDarkModeEnabled,
        })}
        icon={faSun}
        size="lg"
        onClick={() => setIsDarkModeEnabled(true)}
      />
    </div>
  );
}

export function ToolkitOptions() {
  const manifest = getBrowser().runtime.getManifest();
  const [currentSettings, setCurrentSettings] = React.useState(settingsBySection[0]);

  return (
    <div className="tk-flex tk-flex-grow tk-flex-column">
      <div className="tk-flex nav-bar">
        <img src="../assets/images/icons/icon32.png" />
        <nav className="nav-bar__nav">
          {settingsBySection.map((settings) => (
            <div
              key={settings.name}
              className={classNames('nav-bar__nav-item', {
                'nav-bar__nav-item--selected': settings.name === currentSettings.name,
              })}
              onClick={() => setCurrentSettings(settings)}
            >
              <div>{settings.name}</div>
            </div>
          ))}
        </nav>
        <div className="nav-bar__actions">
          <FontAwesomeIcon className="nav-bar__action-icon" icon={faFileExport} size="lg" />
          <DarkModeToggle />
        </div>
      </div>
      <main className="tk-flex tk-flex-grow">
        <SettingsList settings={currentSettings.settings} />
      </main>
      <footer className="footer">
        {manifest.name} v{manifest.version}
      </footer>
    </div>
  );
}
