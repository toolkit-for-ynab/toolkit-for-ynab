/* eslint-disable no-nested-ternary, one-var-declaration-per-line, one-var */

ynabToolKit.shared = (function() {
  let storageKeyPrefix = 'ynab-toolkit-';
  return {
    parseSelectedMonth() {
      // TODO: There's probably a better way to reference this view, but this works better than DOM scraping which seems to fail in Firefox
      if ($('.ember-view .budget-header').length) {
        var headerView = this.getEmberView($('.ember-view .budget-header').attr('id'));
        var selectedMonthUTC = headerView.get('currentMonth').toNativeDate();
        return new Date(selectedMonthUTC.getUTCFullYear(), selectedMonthUTC.getUTCMonth(), 1);
      }

      return null;
    },

    getEmberView(viewId) {
      const registry = this.getEmberViewRegistry();
      return registry[viewId];
    },

    getEmberViewRegistry() {
      return __ynabapp__.__container__.lookup('-view-registry:main');
    },

    showNewReleaseModal() {
      const { assets, environment, name, version } = ynabToolKit;
      // beta concatenates the TRAVIS_BUILD_NUMBER so we do this to strip it for
      // the URL that points to diffs on master for beta/development builds
      const githubVersion = version
        .split('.')
        .slice(0, 3)
        .join('.');
      const githubIssuesLink =
        '<a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues" target="_blank">GitHub Issues</a>';

      const releaseNotes =
        ynabToolKit.environment === 'production'
          ? 'View the <a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/releases" target="_blank">release notes</a>.'
          : `<br><br><div class="message">(Release notes are currently only available for production releases. However,
        ${githubIssuesLink} should be tagged with "beta" if they have made it into the beta build. It may also be helpful
        to see what changed by checking the raw commit log: <a href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/compare/v${githubVersion}...master" target="_blank">here</a>.)
        </div>`;

      const $modal = $(
        `<div class="toolkit-modal">
                      <div class="toolkit-modal-outer"><div class="toolkit-modal-inner"><div class="toolkit-modal-content">

                        <header class="toolkit-modal-header">
                          <img src="` +
          assets.logo +
          `" id="toolkit-modal-logo" />
                        </header>

                        <div class="toolkit-modal-message">
                          <h1>The ${name} extension has been updated!</h1>
                          <span class="version">
                            You are now using version ${version}. ${releaseNotes}
                          </span>
                          <div class="message">
                            <p>
                              <strong>It is important to note that the ${name} extension is completely separate,
                              and in no way affiliated with YNAB itself.</strong> If you discover a bug, please first disable
                              the Toolkit to identify whether the issue is with the extension, or with YNAB itself.
                            </p>
                            <p>
                              Issues with ${name} can be reported to the Toolkit team by submitting an issue on our
                              ${githubIssuesLink} page. Please ensure the issue has not already been reported before
                              submitting${
                                environment !== 'production'
                                  ? ' and mark issue titles with [BETA].'
                                  : '.'
                              }
                            </p>
                            <p>
                              Finally, if you have the time and the ability, new contributors to the Toolkit are always welcome!
                            </p>
                          </div>
                        </div>

                        <footer class="toolkit-modal-actions">
                          <button class="toolkit-modal-action-close">Continue</button>
                        </footer>

                      </div></div></div>
                    </div>`
      );

      $('.toolkit-modal-action-close', $modal).on('click', () => {
        $('.layout .toolkit-modal').remove();
      });

      if (!$('.modal-error').length) {
        $('.layout').append($modal);
      }
    },

    getToolkitStorageKey(key) {
      const value = localStorage.getItem(storageKeyPrefix + key);

      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },

    setToolkitStorageKey(key, value) {
      return localStorage.setItem(storageKeyPrefix + key, value);
    },

    removeToolkitStorageKey(key, value) {
      return localStorage.removeItem(storageKeyPrefix + key, value);
    },

    monthsShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],

    monthsFull: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };
})(); // Keep feature functions contained within this object

// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
  function isYNABReady() {
    return (
      typeof Ember !== 'undefined' &&
      typeof $ !== 'undefined' &&
      !$('.ember-view.is-loading').length &&
      typeof ynabToolKit !== 'undefined' &&
      typeof YNABFEATURES !== 'undefined'
    );
  }

  if (isYNABReady()) {
    ynabToolKit.pageReady = true;

    const latestVersionKey = `latest-version-${ynabToolKit.environment}`;
    let latestVersion = ynabToolKit.shared.getToolkitStorageKey(latestVersionKey);
    if (latestVersion) {
      if (latestVersion !== ynabToolKit.version) {
        ynabToolKit.shared.showNewReleaseModal();
        ynabToolKit.shared.setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
      }
    } else {
      ynabToolKit.shared.setToolkitStorageKey(latestVersionKey, ynabToolKit.version);
    }

    const deprecatedLatestVersion = ynabToolKit.shared.getToolkitStorageKey('latest-version');
    if (deprecatedLatestVersion && deprecatedLatestVersion !== ynabToolKit.version) {
      ynabToolKit.shared.removeToolkitStorageKey('latest-version');
      ynabToolKit.shared.showNewReleaseModal();
    }
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
})();
