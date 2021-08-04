import classNames from 'classnames';
import * as React from 'react';
import { settingsBySection } from './utils';

import './styles.scss';
import { localToolkitStorage } from 'toolkit/core/common/storage';

function Toggle({
  checked,
  htmlFor,
  onChange,
}: {
  checked: boolean;
  htmlFor: string;
  onChange(checked: boolean): void;
}) {
  return (
    <div className="toggle">
      <input
        id={htmlFor}
        className="toggle__input"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      ></input>
      <label className="toggle__label" htmlFor={htmlFor}></label>
    </div>
  );
}

function Setting({ config }: { config: FeatureSettingConfig }) {
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    localToolkitStorage.getFeatureSetting(config.name).then((value) => {
      console.log({ value });
      setIsEnabled(value);
    });
  }, []);

  return (
    <div className="setting">
      <Toggle
        checked={isEnabled}
        htmlFor={`${config.name}-toggle`}
        onChange={(checked) => setIsEnabled(checked)}
      />
      <div className="setting__info">
        <div>
          <label className="setting__title" htmlFor={`${config.name}-toggle`}>
            {config.title}
          </label>
        </div>
        <div className="setting__description">{config.description}</div>
      </div>
    </div>
  );
}

function SettingsList({ settings }: { settings: FeatureSettingConfig[] }) {
  return (
    <div className="settings-list">
      {settings.map((config) => (
        <Setting config={config} />
      ))}
    </div>
  );
}

export function ToolkitOptions() {
  const [currentSettings, setCurrentSettings] = React.useState(settingsBySection[0]);

  return (
    <div className="tk-flex tk-flex-grow tk-flex-column">
      <div className="tk-flex nav-bar">
        <img src="../assets/images/icons/icon32.png" />
        <nav className="nav-bar__nav">
          {settingsBySection.map((settings) => (
            <div
              className={classNames('nav-bar__nav-item', {
                'nav-bar__nav-item--selected': settings.name === currentSettings.name,
              })}
              onClick={() => setCurrentSettings(settings)}
            >
              <div>{settings.name}</div>
            </div>
          ))}
        </nav>
        <div className="nav-bar__settings"></div>
      </div>
      <main>
        <SettingsList settings={currentSettings.settings} />
      </main>
    </div>
  );
}
