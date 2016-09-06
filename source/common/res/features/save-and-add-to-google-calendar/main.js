/* eslint-disable no-unused-vars, no-undef, no-shadow */
/**
 * Use this template to add new js functions to your features
 *
 * To help isolate and protect our functions and variables from
 * the production code, we want to contain all of our optional features
 * within the global ynabToolKit object, which is created on page load.
 *
 * Note: Using this.observe() is optional, but we use a MutationObserver instance
 * to evaluate changes on the page and feed those changes to each function
 * that might want to act on a specific change in the DOM.
 */

(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.awesomeFeature = (function () {
      // Pull in Google calendar API
      var CLIENT_ID = '158925675835-uhm7ksaftbi7ef3vp9otk9kng4opg4qb.apps.googleusercontent.com';
      var SCOPES = ['https://www.googleapis.com/auth/calendar'];
      var googleAPI = document.createElement('SCRIPT');
      googleAPI.src = 'https://apis.google.com/js/client.js';
      document.head.appendChild(googleAPI);
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
      function handleAuth(event) {
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
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({ calendarId: 'primary', timeMin: (new Date()).toISOString(), showDeleted: false, singleEvents: true, maxResults: 10, orderBy: 'startTime' });
        request.execute(function (resp) {
          var events = resp.items;
          appendPre('Upcoming events:');
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.summary + ' (' + when + ')');
            }
          } else {
            appendPre('No upcoming events found.');
          }
        });
      }

       /**
        * Append a pre element to the body containing the given message
        * as its text node.
        *
        * @param {string} message Text to be placed in pre element.
        */
      function appendPre(message) {
        var pre = document.getElementsByClassName('nav-main');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

       // Refer to the JavaScript quickstart on how to setup the environment:
       // https://developers.google.com/google-apps/calendar/quickstart/js
       // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
       // stored credentials.

      function newEvent() {
        var getSave = document.getElementsByClassName('ynab-grid-actions')[0].childNodes[4];
        var dateCell = document.querySelectorAll('.ynab-grid-add-rows .ynab-grid-cell-date input');
        var payeeName = document.querySelectorAll('.ynab-grid-add-rows .ynab-grid-cell-payeeName input');
        var date = new Date(dateCell[0].value).toISOString();
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
            'RRULE:FREQ=DAILY;COUNT=1'
          ]
        };

        var request = gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        request.execute(function (event) {
          // appendPre('Event created: ' + name);
          getSave.click();
          alert('Your event was added to your calendar');
        });

        // document.getElementById('eventName').value = '';
        // This was reseting a form field originally??
      }

      /**
       * Adds a button with the option to save and send to Google Calendar
       */
      function saveToCalendarButton() {
        var newButton = document.createElement('BUTTON');
        newButton.setAttribute('class', 'button button-primary calendar-button');
        newButton.addEventListener('click', newEvent);
        newButton.innerHTML = 'Save + Calendar';
        document.getElementsByClassName('ynab-grid-actions')[0].appendChild(newButton);
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
            ynabToolKit.awesomeFeature.invoke();
            // in the set of changed nodes that indicates your function need may need to run.
            // Call this.invoke() to activate your function if you find any class names
          }
        }
      };
    }()); // Keep feature functions contained within this object

    // ynabToolKit.awesomeFeature.invoke(); // Run your script once on page load
  } else {
    setTimeout(poll, 250);
  }
}());
