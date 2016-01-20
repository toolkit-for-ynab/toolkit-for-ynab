  /**
   * To help isolate and protect our functions and variables from 
   * the production code, we want to contain all of our optional features
   * within the global ynabToolKit object, which is created by /shared/main.js
   * 
   * We are working to refactor our existing feature scripts to be contained
   * within the ynabToolKit object. We are also working on moving away from
   * depending on setTimeOut to handle changes to the page. When that's done, 
   * this example document will be updated.
   * 
   * In the meanimte, you can use the following example in your own main.js file
   * and adapt it as needed. Replace 'awesomeFeature' etc with your own names.
   **/


(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.awesomeFeature = function ()  { // Keep feature functions contained within this


      awesomeFunction() {
        // Do awesome things
      };

      setUpAwesome () {
        // Maybe some other awesome things
      };


      setTimeout(setUpAwesome, 250); // We are working on deprecating the need for this soon

    }; // Keep feature functions contained within this
    ynabToolKit.awesomeFeature(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);  
  }
})();
