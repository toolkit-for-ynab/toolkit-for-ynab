import classNames from 'classnames';
import * as React from 'react';
import { settingsBySection } from './utils';

import './styles.scss';
import { localToolkitStorage } from 'toolkit/core/common/storage';

function Toggle({
  checked,
  name,
  onChange,
}: {
  checked: boolean;
  name: string;
  onChange(checked: boolean): void;
}) {
  const id = `${name}-toggle`;

  return (
    <div className="toggle">
      <input
        id={id}
        className="toggle__input"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      ></input>
      <label className="toggle__label" htmlFor={id}>
        <span className="toggle__inner"></span>
        <span className="toggle__switch"></span>
      </label>
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
        name={config.name}
        onChange={(checked) => setIsEnabled(checked)}
      />
      <div className="setting__info">
        <div className="setting__title">{config.title}</div>
        <div className="setting__description">{config.description}</div>
      </div>
    </div>
  );
}

function SettingsList({ settings }: { settings: FeatureSettingConfig[] }) {
  return (
    <>
      {settings.map((config) => (
        <Setting config={config} />
      ))}
    </>
  );
}

export function ToolkitOptions() {
  const [currentSettings, setCurrentSettings] = React.useState(settingsBySection[0]);

  return (
    <div className="tk-flex tk-flex-grow tk-flex-column">
      <nav className="tk-flex options-nav">
        {settingsBySection.map((settings) => (
          <div
            className={classNames('nav-item', {
              'nav-item--selected': settings.name === currentSettings.name,
            })}
            onClick={() => setCurrentSettings(settings)}
          >
            <div>{settings.name}</div>
          </div>
        ))}
      </nav>
      <main style={{ backgroundColor: 'white' }}>
        <SettingsList settings={currentSettings.settings} />
      </main>
    </div>
  );
}
