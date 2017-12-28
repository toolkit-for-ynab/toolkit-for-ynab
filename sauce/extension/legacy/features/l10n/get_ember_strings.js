// var page = require('webpage').create();
// page.onConsoleMessage = function(msg) {
//   console.log('Page title is ' + msg);
// };
// page.open('https://app.youneedabudget.com/', function(status) {
//   page.evaluate(function() {
//     console.log(Object.keys(Ember.I18n.translations));
//   });
//   phantom.exit();
// });
var page = require('webpage').create();
page.open('https://app.youneedabudget.com/', function(status) {
  var translations = page.evaluate(function() {
    return JSON.stringify(Ember.I18n.translations, null, 2);
  });
  console.log(translations);
  phantom.exit();
});
