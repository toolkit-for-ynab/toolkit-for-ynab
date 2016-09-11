(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.addToGoogleCalendar = (function () {
      // Pull in Google calendar API
      var CLIENT_ID = '158925675835-uhm7ksaftbi7ef3vp9otk9kng4opg4qb.apps.googleusercontent.com';
      var SCOPES = ['https://www.googleapis.com/auth/calendar'];
      var googleAPI = document.createElement('SCRIPT');
      googleAPI.src = 'https://apis.google.com/js/client.js';
      document.head.appendChild(googleAPI);
      var recurValue = '';
      /**
       * Add a button with the option to save and send to Google Calendar
       */
      function saveToCalendarButton() {
        var newButton = document.createElement('BUTTON');
        newButton.setAttribute('class', 'button button-primary calendar-button');
        newButton.addEventListener('click', newEvent);
        newButton.innerHTML = 'Save + Calendar';
        document.getElementsByClassName('ynab-grid-actions')[0].appendChild(newButton);
      }
      /**
       * BEGIN BLOCK FROM GOOGLE API SITE
       *
       * Check if current user has authorized this application.
       * */
      function checkAuth() {
        gapi.auth.authorize(
          { client_id: CLIENT_ID, scope: SCOPES.join(' '), immediate: true }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          // Load client library.
          loadCalendarApi();
        } else {
           // If not logged in and authorized return to authorize window
          handleAuth();
        }
      }

      /**
       * Initiate auth flow in response to user clicking save to calendar button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuth() {
        gapi.auth.authorize(
        { client_id: CLIENT_ID, scope: SCOPES, immediate: false },
        handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3');
      }


      /*
       * set event parameters and send to calendar
       */
      function newEvent() {
        console.log(recurValue);
        var getSave = document.getElementsByClassName('ynab-grid-actions')[0].childNodes[4];
        var dateCell = document.querySelectorAll('.ynab-grid-add-rows .ynab-grid-cell-date input');
        var payeeName = document.querySelectorAll('.ynab-grid-add-rows .ynab-grid-cell-payeeName input');
        var date = new Date(dateCell[0].value).toISOString();
        var recurrence = getRecur();
        var outflow = document.querySelectorAll('.ynab-grid-add-rows .ynab-grid-cell-outflow input');
        var event = {
          summary: payeeName[0].value,
          location: '$' + outflow[0].value,
          start: {
            date: date.substr(0, 10)
          },
          end: {
            date: date.substr(0, 10)
          },
          recurrence: [
            recurrence
          ]
        };

        var request = gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        request.execute(function () {
          getSave.click();
        });
      }

      /*
       * Set RRULE's for each option in the ynab calendar select box
       *
       * I have yet to figure out 'TwiceAMonth'
       */
      function getRecur() {
        switch (recurValue) {
          case 'Never': return 'RRULE:FREQ=DAILY;COUNT=1';
          case 'Daily': return 'RRULELFREQ=DAILY';
          case 'Weekly': return 'RRULE:FREQ=WEEKLY';
          case 'EveryOtherWeek': return 'RRULE:FREQ=WEEKLY;INTERVAL=2';
          case 'TwiceAMonth': return 'RRULE:FREQ=MONTHLY;BYMONTHDAY=1,15';
          case 'Every4Weeks': return 'RRULE:FREQ=WEEKLY;INTERVAL=4';
          case 'Monthly': return 'RRULE:FREQ=MONTHLY';
          case 'EveryOtherMonth': return 'RRULE:FREQ=MONTHLY;INTERVAL=2';
          case 'Every3Months': return 'RRULE:FREQ=MONTHLY;INTERVAL=3';
          case 'Every4Months': return 'RRULE:FREQ=MONTHLY;INTERVAL=4';
          case 'TwiceAYear': return 'RRULE:FREQ=MONTHLY;INTERVAL=6';
          case 'Yearly': return 'RRULE:FREQ=YEARLY';
          case 'EveryOtherYear': return 'RRULE:FREQ=YEARLY;INTERVAL=2';
        }
      }

      /*
       * set global value from select box before modal closes
       */
      function addRecurrence() {
        var recurSelect = document.getElementsByClassName('ember-select');
        recurValue = recurSelect[0].value;
        console.log(recurValue);
      }

      return {
        invoke() {
          // Code you expect to run each time your feature needs to update or modify YNAB's state
          checkAuth();
          saveToCalendarButton();
        },

        observe(changedNodes) {
          var calendarButton = document.getElementsByClassName('calendar-button');
          if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active') && calendarButton.length < 1) {
            ynabToolKit.addToGoogleCalendar.invoke();
            // in the set of changed nodes that indicates your function need may need to run.
            // Call this.invoke() to activate your function if you find any class names
          }
          if (changedNodes.has('ynab-u modal-account-calendar ember-view modal-overlay active')) {
            document.getElementsByClassName('ember-select')[0].addEventListener('click', addRecurrence);
          }
        }
      };
    }()); // Keep feature functions contained within this object

    // ynabToolKit.addToGoogleCalendar.invoke(); // Run your script once on page load
  } else {
    setTimeout(poll, 250);
  }
}());
