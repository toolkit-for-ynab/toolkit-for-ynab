import { faBug, faCog, faStop, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Button } from 'toolkit/components/button';
import { GitHubLink } from 'toolkit/components/links';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';
import { useDarkModeSetter } from 'toolkit/hooks/useDarkModeSetter';
import { useToolkitDisabled } from 'toolkit/hooks/useToolkitDisabled';
import './styles.scss';

export function ToolkitPopup() {
  useDarkModeSetter();

  const isToolkitDisabled = useToolkitDisabled();
  const { runtime, tabs } = getBrowser();
  const { version, name } = runtime.getManifest();

  React.useEffect(() => {
    document.title = `${name} Popup`;
  }, []);

  return (
    <div className="popup">
      <img
        className="logo"
        src={runtime.getURL(
          `assets/images/logos/toolkitforynab-logo-200${isToolkitDisabled ? '-disabled' : ''}.png`
        )}
      ></img>

      <div className="status">
        The {name} is currently {isToolkitDisabled ? 'disabled' : 'enabled'}
      </div>
      <div className="actions">
        <Button
          onClick={() =>
            localToolkitStorage.setFeatureSetting('DisableToolkit', !isToolkitDisabled)
          }
        >
          <FontAwesomeIcon icon={isToolkitDisabled ? faPlay : faStop} />{' '}
          <div>{isToolkitDisabled ? 'Enable' : 'Disable'}</div>
        </Button>
        <Button
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
          <FontAwesomeIcon icon={faCog} /> <div>Open Settings</div>
        </Button>
        <GitHubLink>
          <Button>
            <FontAwesomeIcon icon={faBug} /> <div>Report an Issue</div>
          </Button>
        </GitHubLink>
      </div>
      <div className="version">Version {version}</div>
    </div>
  );
}
