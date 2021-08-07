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
import { Modal, useModal } from 'toolkit/components/modal';

function Setting({ config }: { config: FeatureSettingConfig }) {
  const [featureSetting, setFeatureSetting] = React.useState<FeatureSetting>(false);
  const onSettingChanged = React.useCallback((key, newValue) => {
    setFeatureSetting(newValue);
  }, []);

  React.useEffect(() => {
    localToolkitStorage.getFeatureSetting(config.name).then((value) => {
      setFeatureSetting(value);
    });
  }, []);

  React.useEffect(() => {
    localToolkitStorage.onFeatureSettingChanged(config.name, onSettingChanged);

    return () => {
      localToolkitStorage.offFeatureSettingChanged(config.name, onSettingChanged);
    };
  });

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

type ImportExportSettings = { key: string; value: FeatureSetting }[];

function ImportExportModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const textAreaRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [allToolkitSettings, setAllToolkitSettings] = React.useState('');

  React.useEffect(() => {
    localToolkitStorage.getStoredFeatureSettings().then((keys) =>
      Promise.all(
        keys.map((settingKey) =>
          localToolkitStorage
            .getFeatureSetting(settingKey)
            .then((settingValue) => ({ key: settingKey, value: settingValue }))
        )
      ).then((allSettings) => {
        setAllToolkitSettings(JSON.stringify(allSettings));
        setIsLoading(false);
      })
    );
  }, []);

  function handleSubmit() {
    let parsedSettings: ImportExportSettings = [];
    try {
      parsedSettings = JSON.parse(allToolkitSettings);
    } catch {
      /* ignore */
    }

    Promise.all(
      parsedSettings.map(({ key, value }) => localToolkitStorage.setFeatureSetting(key, value))
    ).then(() => {
      setIsOpen(false);
    });
  }

  return (
    <Modal
      isOpen={isOpen && !isLoading}
      setIsOpen={setIsOpen}
      title="Import/Export Settings"
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textAreaRef}
        rows={10}
        className="import-export__textarea"
        value={allToolkitSettings}
        onClick={() => textAreaRef.current?.select()}
        onChange={(e) => setAllToolkitSettings(e.target.value)}
      ></textarea>
      <div className="import-export__instructions">
        Copy and paste the above text into the Import/Export Dialog on your other devices. This is
        currently a manual process and must be done on every new device.
      </div>
    </Modal>
  );
}

export function ToolkitOptions() {
  const manifest = getBrowser().runtime.getManifest();
  const [currentSettings, setCurrentSettings] = React.useState(settingsBySection[0]);
  const { isOpen, setIsOpen } = useModal();

  return (
    <div className="tk-flex tk-flex-grow tk-flex-column">
      <ImportExportModal isOpen={isOpen} setIsOpen={setIsOpen} />
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
          <FontAwesomeIcon
            className="nav-bar__action-icon"
            icon={faFileExport}
            size="lg"
            onClick={() => setIsOpen(true)}
          />
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
