import classNames from 'classnames';
import * as React from 'react';
import { settingsBySection } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  faFileExport,
  faQuestionCircle,
  faEyeDropper,
  faUndoAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Toggle } from 'toolkit/components/toggle';
import { RadioGroup } from 'toolkit/components/radio-group';

import './styles.scss';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser } from 'toolkit/core/common/web-extensions';
import { Modal, useModal } from 'toolkit/components/modal';
import { DiscordLink, GitHubLink, TrelloLink } from 'toolkit/components/links';
import { useDarkModeSetter } from 'toolkit/hooks/useDarkModeSetter';

function ColorPicker({
  id,
  resetColor,
  onChange,
  value,
}: {
  resetColor?: string;
  onChange(hex: string): void;
  value: string;
  id: string;
}) {
  return (
    <div className="color-picker">
      <input
        className="color-picker__input"
        id={id}
        type="color"
        onChange={(e) => onChange(e.currentTarget.value)}
        value={value}
      />
      <label className="color-picker__selector" htmlFor={id} style={{ backgroundColor: value }} />
      <div className="color-picker__actions">
        <span className="color-picker__action">
          <FontAwesomeIcon
            className="color-picker__icon"
            icon={faUndoAlt}
            onClick={() => onChange(resetColor)}
          />
        </span>
        <label htmlFor={id} className="color-picker__action">
          <FontAwesomeIcon className="color-picker__icon" icon={faEyeDropper} />
        </label>
      </div>
    </div>
  );
}

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
      {config.type === 'color' && (
        <ColorPicker
          id={`${config.name}-color-picker`}
          resetColor={config.default as string}
          value={featureSetting as string}
          onChange={handleChange}
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

function SupportPage() {
  return (
    <div className="support-page">
      <h1>Frequently Asked Questions</h1>
      <div>
        <h2>Who works on the Toolkit?</h2>
        <p>
          We're a small community of developers (and YNABers) who work on the Toolkit in our free
          time. You can find most of us over in our <DiscordLink>Discord Server</DiscordLink>.
        </p>
      </div>
      <div>
        <h2>Is the Toolkit safe?</h2>
        <p>Simply put, yes.</p>
        <p>
          All browser extensions have the ability to send the data loaded or input into the site
          you're viewing off to some other location. Fortunately, the Toolkit is open source meaning
          all the code is made available to you in <GitHubLink>GitHub</GitHubLink>. The only time we
          make "outside requests" is when you encounter an error which resulted in a crash of the
          Toolkit. That error is sent to our error tracking at{' '}
          <a target="_blank" rel="noreferrer noopener" href="https://sentry.io/">
            Sentry.io
          </a>
          . We do not store any data whatsoever. Even the Toolkit settings are stored on your own
          machine. Every time you load YNAB, the Toolkit gets that data from the browser to do what
          it needs to do. If you trust YNAB with your data, then you should feel confident that your
          data is safe.
        </p>
      </div>
      <div>
        <h2>A pop-up appeared telling me something went wrong with the Toolkit. What do I do?</h2>
        <p>
          When you see this pop-up, it's usually because something changed on YNAB's side which
          broke our functionality. At the very least, you should open a{' '}
          <GitHubLink>bug report</GitHubLink> to help us identify we have an issue. If you'd like to
          go a step further, you could try to do some investigation in the{' '}
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://developer.chrome.com/docs/devtools/open/"
          >
            Developer Console
          </a>{' '}
          to find out what feature broke and include that in your bug report.
        </p>
      </div>
      <div>
        <h2>How much does the Toolkit cost?</h2>
        <p>
          So long as browsers continue to make it free to build extensions, the Toolkit for YNAB
          will always be free! This is a hobby for all of us who work on the Toolkit and we're just
          happy to provide something we believe our users enjoy.
        </p>
      </div>
      <div>
        <h2>Can you add this feature I want?</h2>
        <p>
          You can find all requested features on our <TrelloLink>Trello Board</TrelloLink>. If the
          feature you want doesn't appear there, you should make a request on{' '}
          <GitHubLink>GitHub</GitHubLink>. Once you've made a request for a feature you'd like to
          see built, the rest just comes down to time.
        </p>
      </div>
      <div>
        <h2>What feature is next?</h2>
        <p>
          Since all the developers who work on the Toolkit do so in their free time, it usually
          works out that the features we find most valuable ourselves are the features we work on
          next. But don't lose hope! Once a feature is added to the{' '}
          <TrelloLink>Trello Board</TrelloLink>, you and all members of the community are able to
          vote on the feature. The higher the vote count (and the higher the feasibility of actually
          building the feature) the more likely it is to get done! If you're a developer and there's
          a feature you really want to added, feel free to open a{' '}
          <GitHubLink>pull request</GitHubLink>! Also, join the <DiscordLink>Discord</DiscordLink>{' '}
          to ask any questions you may have along the way!
        </p>
      </div>
    </div>
  );
}

export function ToolkitOptions() {
  useDarkModeSetter();

  const manifest = getBrowser().runtime.getManifest();
  const [currentSettings, setCurrentSettings] = React.useState(settingsBySection[0]);
  const [currentPage, setCurrentPage] = React.useState(settingsBySection[0].name);
  const { isOpen, setIsOpen } = useModal();

  return (
    <div className="tk-flex tk-flex-grow tk-flex-column">
      <ImportExportModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="tk-flex nav-bar">
        <img
          className="nav-bar__logo"
          onClick={() => {
            setCurrentPage(settingsBySection[0].name);
            setCurrentSettings(settingsBySection[0]);
          }}
          src="../assets/images/icons/icon32.png"
        />
        <nav className="nav-bar__nav">
          {settingsBySection.map((settings) => (
            <div
              key={settings.name}
              className={classNames('nav-bar__nav-item', {
                'nav-bar__nav-item--selected':
                  currentPage !== 'support' && settings.name === currentSettings.name,
              })}
              onClick={() => {
                setCurrentPage(settings.name);
                setCurrentSettings(settings);
              }}
            >
              <div>{settings.name}</div>
            </div>
          ))}
        </nav>
        <div className="nav-bar__actions">
          <FontAwesomeIcon
            className="nav-bar__action-icon"
            icon={faQuestionCircle}
            size="lg"
            onClick={() => setCurrentPage('support')}
          />
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
        {currentPage !== 'support' && <SettingsList settings={currentSettings.settings} />}
        {currentPage === 'support' && <SupportPage />}
      </main>
      <footer className="footer">
        {manifest.name} v{manifest.version}
      </footer>
    </div>
  );
}
