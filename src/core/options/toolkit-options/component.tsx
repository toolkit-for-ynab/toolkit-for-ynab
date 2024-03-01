import classNames from 'classnames';
import * as React from 'react';
import { settingsBySection } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  faEyeDropper,
  faUndoAlt,
  faTimes,
  faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons';
import { Toggle } from 'toolkit/components/toggle';
import { RadioGroup } from 'toolkit/components/radio-group';
import fuzzysort from 'fuzzysort';

import './styles.scss';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser } from 'toolkit/core/common/web-extensions';
import { Modal } from 'toolkit/components/modal';
import { DiscordLink, GitHubLink } from 'toolkit/components/links';
import { useDarkModeSetter } from 'toolkit/hooks/useDarkModeSetter';
import ReactMarkdown from 'react-markdown';
import { useToolkitDisabled } from 'toolkit/hooks/useToolkitDisabled';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Button } from 'toolkit/components/button';
import type { FeatureSetting, FeatureSettingConfig } from 'toolkit/types/toolkit/features';

function ColorPicker({
  id,
  resetColor,
  onChange,
  value,
}: {
  resetColor: string;
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

function DarkModeToggle() {
  // default is light mode
  // toggle goes light -> dark -> auto -> light ....

  const [theme, setTheme] = useState(document.querySelector('html')!.dataset['theme'] || 'light');

  function setMode(mode: string) {
    localToolkitStorage.setStorageItem('toolkit-feature:options.dark-mode', mode).then(() => {
      setTheme(mode);
    });
  }

  const icon = theme === 'light' ? faSun : theme === 'dark' ? faMoon : faCircleHalfStroke;
  return (
    <Button
      size="s"
      onClick={() => {
        if (theme === 'light') setMode('dark');
        else if (theme === 'dark') setMode('auto');
        else setMode('light');
      }}
    >
      <FontAwesomeIcon icon={icon} size="lg" width="1rem" />
    </Button>
  );
}

type ImportExportSettings = { key: FeatureName; value: FeatureSetting }[];

function ImportExportModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [allToolkitSettings, setAllToolkitSettings] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

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
      <div className="import-export__instructions">
        Copy and paste the above text into the Import/Export Dialog on your other devices. This is
        currently a manual process and must be done on every new device.
      </div>

      <textarea
        ref={textAreaRef}
        rows={10}
        className="import-export__textarea"
        value={allToolkitSettings}
        onClick={() => textAreaRef.current?.select()}
        onChange={(e) => setAllToolkitSettings(e.target.value)}
      ></textarea>
    </Modal>
  );
}

function HelpModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Frequently Asked Questions"
      cancelText="Close"
    >
      <div className="help-text">
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
            you're viewing off to some other location. Fortunately, the Toolkit is open source
            meaning all the code is made available to you in <GitHubLink>GitHub</GitHubLink>. The
            only time we make "outside requests" is when you encounter an error which resulted in a
            crash of the Toolkit. That error is sent to our error tracking at{' '}
            <a target="_blank" rel="noreferrer noopener" href="https://sentry.io/">
              Sentry.io
            </a>
            . We do not store any data whatsoever. Even the Toolkit settings are stored on your own
            machine. Every time you load YNAB, the Toolkit gets that data from the browser to do
            what it needs to do. If you trust YNAB with your data, then you should feel confident
            that your data is safe.
          </p>
        </div>
        <div>
          <h2>A pop-up appeared telling me something went wrong with the Toolkit. What do I do?</h2>
          <p>
            When you see this pop-up, it's usually because something changed on YNAB's side which
            broke our functionality. At the very least, you should open a{' '}
            <GitHubLink>bug report</GitHubLink> to help us identify we have an issue. If you'd like
            to go a step further, you could try to do some investigation in the{' '}
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
            will always be free! This is a hobby for all of us who work on the Toolkit and we're
            just happy to provide something we believe our users enjoy.
          </p>
        </div>
        <div>
          <h2>Can you add this feature I want?</h2>
          <p>
            We use GitHub to track both feature requests and bugs. If you would like to request a
            feature, search <GitHubLink>GitHub issues</GitHubLink>, there is a chance this feature
            was already requested, don't create duplicate issues. If you didn't find anything,
            create issue with your request on <GitHubLink>GitHub</GitHubLink>.
          </p>
        </div>
        <div>
          <h2>What feature is next?</h2>
          <p>
            Since all the developers who work on the Toolkit do so in their free time, it usually
            works out that the features we find most valuable ourselves are the features we work on
            next. But don't lose hope! We also take into account popularity of feature request (in
            form of comments or thumbs up reaction), so if you found that feature you'd like to see
            in the Toolkit was already requested, give original message thumbs up reaction (or leave
            comment if you have something to say). The higher the vote count (and the higher the
            feasibility of actually building the feature) the more likely it is to get done! If
            you're a developer and there's a feature you really want to added, feel free to open a{' '}
            <GitHubLink>pull request</GitHubLink>! Also, join the <DiscordLink>Discord</DiscordLink>{' '}
            to ask any questions you may have along the way!
          </p>
        </div>
      </div>
    </Modal>
  );
}

function AlertBanner({
  children,
  variant = 'danger',
}: {
  children: React.ReactNode;
  variant?: 'danger';
}) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={classNames('alert', {
        'alert--danger': variant === 'danger',
      })}
    >
      <div className="alert--content">{children}</div>
      <Button size="s" variant="transparent" onClick={() => setIsDismissed(true)}>
        <FontAwesomeIcon aria-label="Dismiss" icon={faTimes} />
      </Button>
    </div>
  );
}

function Setting({ config }: { config: FeatureSettingConfig }) {
  function handleToggleFeature(isEnabled: boolean) {
    let newValue: FeatureSetting = isEnabled;
    if (config.type === 'select' && isEnabled) {
      newValue = config.options[0].value;
    }

    handleFeatureSettingChanged(newValue);
  }

  function handleFeatureSettingChanged(newValue: FeatureSetting) {
    localToolkitStorage.setFeatureSetting(config.name, newValue).then(() => {
      setFeatureSetting(newValue);
    });
  }

  const [featureSetting, setFeatureSetting] = React.useState<FeatureSetting>(false);
  const id = useId();
  const featureEnabled =
    typeof featureSetting === 'boolean' ? featureSetting : featureSetting !== '0';

  useEffect(() => {
    const onSettingChanged = (key: string, newValue: FeatureSetting) => {
      setFeatureSetting(newValue);
    };

    localToolkitStorage.getFeatureSetting(config.name).then((value) => {
      setFeatureSetting(value);
    });

    localToolkitStorage.onFeatureSettingChanged(config.name, onSettingChanged);

    return () => {
      localToolkitStorage.offFeatureSettingChanged(config.name, onSettingChanged);
    };
  }, []);

  return (
    <div className="setting">
      {config.type === 'color' ? (
        <ColorPicker
          id={id}
          resetColor={config.default as string}
          value={featureSetting as string}
          onChange={handleFeatureSettingChanged}
        />
      ) : (
        <Toggle
          className="setting__toggle"
          checked={featureEnabled}
          htmlFor={id}
          onChange={(checked) => handleToggleFeature(checked)}
        />
      )}
      <div className="setting__info">
        <div>
          <label className="setting__title" htmlFor={id}>
            {config.title}
          </label>
        </div>
        <div className="setting__description">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a
                  style={{ color: 'var(--tk-text-color)' }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
            }}
          >
            {config.description}
          </ReactMarkdown>
        </div>
        {config.type === 'select' && (
          <RadioGroup
            className={classNames('setting__options', {
              'setting__options--hidden': !featureEnabled,
            })}
            name={config.name}
            options={config.options}
            value={featureSetting as string}
            onChange={handleFeatureSettingChanged}
          />
        )}
      </div>
    </div>
  );
}

function Section({
  children,
  onEnterViewport,
  onExitViewport,
  name,
}: {
  children: ReactNode;
  onEnterViewport?: VoidFunction;
  onExitViewport?: VoidFunction;
  name: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onEnterViewportRef = useRef(onEnterViewport);
  onEnterViewportRef.current = onEnterViewport;
  const onExitViewportRef = useRef(onExitViewport);
  onExitViewportRef.current = onExitViewport;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onEnterViewportRef.current?.();
        } else {
          onExitViewportRef.current?.();
        }
      },
      { threshold: 0, rootMargin: '-30% 0% -68%' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);
  return (
    <section ref={ref} data-name={name}>
      {children}
    </section>
  );
}

function TocItem({
  title,
  isActive = false,
  onClick,
}: {
  title: string;
  isActive?: boolean;
  onClick: VoidFunction | undefined;
}) {
  return (
    <Button size="s" onClick={onClick} variant={isActive ? 'primary' : 'secondary'}>
      {title}
    </Button>
  );
}

export function ToolkitOptions() {
  useDarkModeSetter();

  const isToolkitDisabled = useToolkitDisabled();
  const manifest = getBrowser().runtime.getManifest();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(settingsBySection[0].name);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return settingsBySection;
    return settingsBySection
      .map((section) => {
        return {
          ...section,
          settings: fuzzysort
            .go(searchQuery, section.settings, {
              threshold: -40000,
              keys: ['name', 'title', 'description'],
            })
            .map((result) => result.obj),
        };
      })
      .filter((section) => section.settings.length !== 0);
  }, [searchQuery]);

  return (
    <div className="tk-options-root">
      <header>
        <img src="../assets/images/logos/toolkitforynab-logo-200.png" />
        <input
          className="tk-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search options"
        />

        <div className="tk-actions">
          <Button size="s" onClick={() => setIsImportModalOpen(true)}>
            Export & Import
          </Button>
          <Button size="s" onClick={() => setIsHelpModalOpen(true)}>
            Help
          </Button>
          <DarkModeToggle />
        </div>
      </header>
      <nav className="tk-toc">
        {filteredSections.map(({ name }) => (
          <TocItem
            isActive={name === activeSection}
            title={name}
            key={name}
            onClick={() => {
              document
                .querySelector(`section[data-name="${name}"]`)
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </nav>
      <div className="tk-content">
        {isToolkitDisabled && (
          <AlertBanner>
            <div>{manifest.name} is currently disabled.</div>
            <Button
              onClick={() => localToolkitStorage.setFeatureSetting('DisableToolkit', false)}
              variant="transparent"
              size="m"
            >
              Enable
            </Button>
          </AlertBanner>
        )}
        {filteredSections.map((section) => {
          return (
            <Section
              name={section.name}
              key={section.name}
              onEnterViewport={() => setActiveSection(section.name)}
            >
              <h2>{section.name}</h2>
              <div className="tk-settings-list">
                {section.settings.map((config) => (
                  <Setting key={config.name} config={config} />
                ))}
              </div>
            </Section>
          );
        })}
      </div>

      <ImportExportModal isOpen={isImportModalOpen} setIsOpen={setIsImportModalOpen} />
      <HelpModal isOpen={isHelpModalOpen} setIsOpen={setIsHelpModalOpen} />
    </div>
  );
}
