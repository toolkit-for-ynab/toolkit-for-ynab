import { faBug, faCog, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import * as React from 'react';
import { Button } from 'toolkit/components/button';
import { GitHubLink } from 'toolkit/components/links';
import { Toggle } from 'toolkit/components/toggle';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';
import { useDarkModeSetter } from 'toolkit/hooks/useDarkModeSetter';
import './styles.scss';

export function ToolkitPopup() {
  useDarkModeSetter();

  const { runtime, tabs } = getBrowser();
  const { version, name } = runtime.getManifest();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isToolkitDisabled, setIsToolkitDisabled] = React.useState(false);
  const handleToolkitDisabledChanged = React.useCallback(
    (_, isDisabled) => setIsToolkitDisabled(isDisabled),
    []
  );

  React.useEffect(() => {
    document.title = `${name} Popup`;
  }, []);

  React.useEffect(() => {
    localToolkitStorage.getFeatureSetting('DisableToolkit').then((isToolkitDisabled) => {
      setIsLoading(false);
      setIsToolkitDisabled(isToolkitDisabled);
    });

    localToolkitStorage.onFeatureSettingChanged('DisableToolkit', handleToolkitDisabledChanged);

    return () =>
      localToolkitStorage.offFeatureSettingChanged('DisableToolkit', handleToolkitDisabledChanged);
  }, []);

  return isLoading ? null : (
    <div className="popup">
      <img
        onClick={() => {
          localToolkitStorage.setFeatureSetting('DisableToolkit', !isToolkitDisabled);
        }}
        className="logo"
        src={runtime.getURL(
          `assets/images/logos/toolkitforynab-logo-200${isToolkitDisabled ? '-disabled' : ''}.png`
        )}
      ></img>
      <h1 className="popup__title">
        The {name} is currently{' '}
        <span
          className={classNames({
            disabled: isToolkitDisabled,
          })}
        >
          {isToolkitDisabled ? 'disabled' : 'enabled'}
        </span>
        ! Click the logo to {isToolkitDisabled ? 'enable' : 'disable'}.
      </h1>
      <div className="popup__actions">
        <Button
          className="popup__action"
          onClick={() => {
            if (getBrowserName() === 'edge') {
              tabs.create({
                url: runtime.getURL('options/index.html'),
              });
            } else {
              runtime.openOptionsPage();
            }
          }}
        >
          <FontAwesomeIcon icon={faCog} /> Open Settings
        </Button>
        <GitHubLink>
          <Button className="popup__action">
            <FontAwesomeIcon icon={faBug} /> Report an Issue
          </Button>
        </GitHubLink>
      </div>
      <div>Version {version}</div>
    </div>
  );
}

// export class Popup {
//   _storage = new ToolkitStorage();

//   _browser = getBrowser();

//   constructor() {
//     const manifest = this._browser.runtime.getManifest();
//     $('#versionNumber').text(manifest.version);
//     $('.toolkit-name').text(manifest.name);

//     Promise.all([
//       this._storage.getFeatureSetting('options.dark-mode', { default: false }),
//       this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, {
//         default: false,
//       }),
//     ]).then(([isDarkMode, isToolkitDisabled]) => {
//       this._applyDarkMode(isDarkMode);
//       this._toggleToolkitDisabledUI(isToolkitDisabled);
//     });
//   }

//   initListeners() {
//     $('#reportBug').click(() => {
//       setTimeout(() => window.close(), 50);
//     });
//     $('#openSettings').click(this._openOptionsPage);
//     $('#logo').click(this._toggleToolkitDisabledSetting);
//     $('#toggleToolkit').click(this._toggleToolkitDisabledSetting);

//     this._storage.onFeatureSettingChanged(
//       TOOLKIT_DISABLED_FEATURE_SETTING,
//       this._toggleToolkitDisabledUI
//     );
//   }

//   _applyDarkMode = (isDarkMode) => {
//     if (isDarkMode) {
//       $('body').addClass('inverted');
//     } else {
//       $('body').removeClass('inverted');
//     }
//   };

//   _openOptionsPage = () => {
//     if (getBrowserName() === 'edge') {
//       this._browser.tabs.create({
//         url: this._browser.runtime.getURL('options/index.html'),
//       });
//     } else {
//       this._browser.runtime.openOptionsPage();
//     }
//   };

//   _toggleToolkitDisabledUI = (_settingName, isToolkitDisabled) => {
//     const logoPath = `assets/images/logos/toolkitforynab-logo-200${
//       isToolkitDisabled ? '-disabled' : ''
//     }.png`;
//     const logoURL = this._browser.runtime.getURL(logoPath);
//     $('#logo').attr('src', logoURL);
//     $('#toggleToolkit > i')
//       .addClass(isToolkitDisabled ? 'fa-toggle-off' : 'fa-toggle-on')
//       .removeClass(isToolkitDisabled ? 'fa-toggle-on' : 'fa-toggle-off');
//   };

//   _toggleToolkitDisabledSetting = () => {
//     this._storage
//       .getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, { default: false })
//       .then((isDisabled) => {
//         this._storage.setFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, !isDisabled);
//       });
//   };
// }
