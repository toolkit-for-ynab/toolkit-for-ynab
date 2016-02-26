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
    if (typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true) {

        ynabToolKit.googleFontsSelector = new function() {

            // Supporting functions,
            // or variables, etc
            console.info('ynabToolKit.googleFontsSelector INIT');

            this.invoke = function() {

                console.log(selectedGoogleFont)

                // WebFontConfig = {
                //    google: { families: [ selectedGoogleFont ] }
                //  };
                //  (function() {
                //    var wf = document.createElement('script');
                //    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                //      '://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js';
                //    wf.type = 'text/javascript';
                //    wf.async = 'true';
                //    var s = document.getElementsByTagName('script')[0];
                //    s.parentNode.insertBefore(wf, s);
                //  })();


            },

                this.observe = function(changedNodes) {

                    console.log('changedNodes', changedNodes);

                    // if ( changedNodes.has('class-name-of-interest') ) {
                    //   ynabToolKit.googleFontsSelector.invoke();
                    //   // Call this.invoke() to activate your function if you find any class names
                    //   // in the set of changed nodes that indicates your function need may need to run.
                    // }

                }

        }; // Keep feature functions contained within this object

        ynabToolKit.googleFontsSelector.invoke(); // Run your script once on page load

    } else {
        setTimeout(poll, 250);
    }
})();
