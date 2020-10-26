import * as React from 'react';
import * as PropTypes from 'prop-types';
import './styles.scss';

export function ToolkitReleaseModal({ onClose }) {
  const { assets, name, version } = ynabToolKit;

  return (
    <div className="tk-release-modal">
      <div className="tk-release-modal__logo">
        <img src={assets.logo} />
      </div>
      <div className="tk-release-modal__content">
        <h1 className="tk-release-modal__header">{name} has been updated!</h1>
        <p className="tk-release-modal__message--centered">
          You are now using version{' '}
          <a
            href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            {version}
          </a>
          .
        </p>
        <p className="tk-release-modal__message">
          <strong>{name} is completely separate, and in no way affiliated with YNAB itself.</strong>{' '}
          If you discover a bug, please disable the Toolkit to identify whether the issue is with
          the extension or with YNAB itself and report the issue accordingly.
        </p>
        <p className="tk-release-modal__message">
          Issues with {name} can be reported to the Toolkit team by submitting an issue on our{' '}
          <a
            href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Issues
          </a>{' '}
          page. Please ensure the issue has not already been reported before submitting.
        </p>
        <p className="tk-release-modal__message">
          Finally, if you have the time and the ability, new contributors to the Toolkit are always
          welcome!
        </p>
      </div>
      <div className="tk-release-modal__actions">
        <button className="button button-primary" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}

ToolkitReleaseModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
