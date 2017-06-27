<p align="center">
  <img src="http://i.imgur.com/SJhwBpU.png" alt="Toolkit for YNAB">
</p>

[![Build Status](https://travis-ci.org/toolkit-for-ynab/toolkit-for-ynab.svg?branch=master)](https://travis-ci.org/toolkit-for-ynab/toolkit-for-ynab)

Toolkit for YNAB is a general purpose YNAB enhancing chrome extension. Have it your way!

YNAB have released an exciting new web version. Lots of power users of the older
versions are asking for options that are easily implemented in a browser extension.
Rather than ask the YNAB team to implement these features, let's just do it
ourselves!

This is what the extension can do for you:

- Localisation - Allows you to use YNAB in an ever-growing list of foreign languages.
- Net Worth Report - Shows you how much your net worth is over time. Includes transactions in tracking accounts.
- Check Number Column - Allows you to enter your check numbers on transactions.
- Enter Transaction Now - Allows you to enter upcoming scheduled transactions in the budget now instead of having to wait for them to populate.
- Days of Buffering Calculation - Forecasts how long it'll take to burn through all your available money using averages. We know there's no such thing as an average month, but some people prefer this calculation over the Age of Money calculation.
- Running balance column - Shows what the balance of an account is after each transaction.
- Colour Blind Mode - Changes colours of some of the numbers to make the interface easier on people with certain visual disabilities.
- Make the calculator work like YNAB4. When you press + or - (etc) the calculator moves to the end of the line so your number isn't lost.
- Printing Improvements: Now when you print your budget or account it looks good!
- Add a budget category to zero button in the inspector.
- Hide the Age of Money calculation.
- Collapse left navigation bar for more screen room
- Change the height of the budget rows so you can fit more on the budget screen.
- Paid in Full (PIF) credit card assistance makes credit card categories in the budget go yellow if their balance doesn't match the account balance for the card and adds a button to fix the problem in the inspector.
- Make all available amounts go red if they're negative on the budget screen.
- Make the Move money dialog larger to make more of it fit on the screen at once.
- Remove categories that have a balance at or below 0 from the cover overspending dialog, as they won't help you anyway!
- Add a button to hide and show the detail of split transactions to make the interface more like YNAB4.
- Search for target category when moving money with an autocomplete you can type into.
- Add a button to collapse and expand all budget rows at the top of the budget screen.
- Show a total of the selected transactions in the account view.
- Make the Move money dialog larger to make more of it fit on the screen at once.
- Add a setting to make enter just save the transaction when adding transactions.
- Show your spending pacing mid-month to ensure you're on track to meet your budget. Now available in two styles: either display the full amount, or display a simple colored indicator. You can enable and disable this setting per budget column by clicking on the value.
- Make negative numbers anywhere in the application have square corners so they stand out even more.
- Larger Clickable Area for Icons: Makes the uncleared, cleared and reconciled icons easier to select.
- Current month indicator to make it easier to see which month is the current month.
- Right click on a transaction when in the Accounts view to display the Edit menu.
- Add a split transaction keyboard shortcut, so typing "split" into the category input will automatically create a split transaction.
- Add buttons within the Account view to easily show and hide upcoming and reconciled transactions with one click.
- Change the default orange label for underfunded goals to blue.
- Change the default green "To Be Budgeted" indicator to yellow if there is still unallocated money waiting to be budgeted.
- Autofill inflow/outflow values with the remaining total when entering split transactions.
- Hide and show the help (?) button.

All of these are configurable with options in the extension options page.

Installing
---------------
The ToolKit is available for Chrome, Firefox, and Safari. The lead platform is Chrome, but we are actively working on making it equal across all three browsers.
If you don't want to build the extension from the source yourself, you can get it for:

- Chrome on the [Chrome Web Store](https://chrome.google.com/webstore/detail/toolkit-for-ynab/lmhdkkhepllpnondndgpgclfjnlofgjl)
- Firefox on the [Firefox Add-on Repository](https://addons.mozilla.org/firefox/addon/toolkit-for-ynab/)
- Safari [on the Safari Extension Gallery](https://safari-extensions.apple.com/details/?id=com.kangoextensions.ynabenhanced-7M68YQDBSE) NOTE: Safari is currently stuck on version 0.4.3 because Apple is still reviewing the update. You can install the latest [from us directly](http://toolkitforynab.com/safari-updates/toolkitforynab_latest.safariextz) but please keep in mind that it won't auto-update.

Roadmap
-------

Features under consideration and the general status of the project and roadmap is on [our Trello Board](https://trello.com/b/EzOvXlil/ynab-enhanced-roadmap). Feel free to vote and comment. To suggest new features, please [visit the YNAB Forum thread here](http://forum.youneedabudget.com/discussion/47568) and comment. Forum user @bluebird8203 is managing the features there and will make sure it ends up in Trello.

Contributions
-------------

Contributions are greatly welcomed. If you want to contribute, it's best if you can let us know so we don't double up on effort. You can see what is being worked on and by whom on the roadmap. If you can't find what you want to build on the roadmap, feel free to put a note up on the github issues board to let the team know you're working on something new. When your code is ready, submit a pull request. You can also contact @blarg on [the YNAB forums](http://forum.youneedabudget.com).

For documentation on how to build a feature, [see the documentation](https://github.com/toolkit-for-ynab/toolkit-for-ynab/blob/master/source/common/res/features/HOW_TO_BUILD_FEATURES.md).

Building the Code
-----------------
This extension uses three main things in its build process:

- ESLint: Checks the style of your code to make sure it matches our style guide as you build.
- Babel: Transpiles ES2015 back to ES5 for browser support of newer JS syntax.
- Kango Extensions: Provide cross browser support for Chrome, Firefox, and Safari. To build:

**Mac / Linux**

1. Clone the repository.
2. Install `node` and `yarn` (both are available through `brew`, tested with node-v6.9.1 and yarn-v0.24.6). You can manage different versions of Node with [nvm](https://github.com/creationix/nvm).
3. Install Python 2.7 (Kango requires 2.7 specifically) and put it in your path so it's accessible with either `python` or `python2`. You can manage different Python versions with [pyenv](https://github.com/yyuu/pyenv).
4. Run `yarn install` within the folder you cloned. This will install all the dependencies needed for the project.
5. Run `./build` from within the folder you cloned which will build the toolkit.
6. Finished extensions for each platform are available in the `output` directory.
7. Load it into Chrome as an unpacked extension, load it into Firefox via the .xpi file, or load it into Safari using the extension builder (Mac only).

**Windows**

1. Clone the repository.
2. Install [node](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/en/docs/install#windows-tab) (tested with node-v6.9.1 and yarn-v0.24.6). You can manage different versions of Node with [nvm](https://github.com/creationix/nvm).
3. Install Python 2.7 (Kango requires 2.7 specifically) in your path so it's accessible with just plain `python`.
4. Run `yarn install` within the folder you cloned. This will install all the dependencies needed for the project.
5. Run `./build` from within the folder you cloned which will build the toolkit.
6. Finished extensions for each platform are available in the `output` directory.
7. Load it into Chrome as an unpacked extension, load it into Firefox via the .xpi file.

# Development Methodology

#### ES2015? What's that?
We've decided that it's better to use the latest and greatest than to wait for browsers to support all the nice new syntax of ES2015. If you're uncomfortable with the new syntax, feel free to use standard Javascript syntax from days of yore. It still works.

#### Your ESLint style checker is annoying as heck! I don't code that way!
We have a large number of contributors who each bring their own style to the code base. It was getting a bit hard to navigate all the features, as they each had their own way of indenting, etc etc. We held a team vote to unify our styles, and decided to follow the AirBNB style guide. It's a pretty good way to go, so give it a shot before you get too upset about having to change your style.

#### How do I build a feature?
We actually have two feature code bases now. Unless you are fixing a legacy feature or you have some inherant need to use the legacy framework, please opt for the new framework:

##### New Framework [Documentation](https://github.com/toolkit-for-ynab/toolkit-for-ynab/tree/adjustable-column-widths/sauce#ynab-toolkit-development)
The new framework was built because the old one required you to include a lot of boilerplate code in every feature. The new one makes heavier use of ES6 features and allows us to remove the burden of boilerplate from new contributions.

The source code for this lives in the `sauce` directory.

##### Old Framework [Documentation](https://github.com/toolkit-for-ynab/toolkit-for-ynab/blob/master/source/common/res/features/HOW_TO_BUILD_FEATURES.md)
The old framework lives in the `source` directory and makes use of `babel` to transpile the javascript before getting built into extensions with Kango.

**Important note about line feeds!!!**
You must ensure that your code editor is configued to use Unix style line feeds (LFs) or the build will fail. This will primarily affect contributors using Windows as the LFs are different on that platform.

Legal Stuff
-----------

**IMPORTANT NOTE:** This extension is not affiliated with YNAB in any way and YNAB has not endorsed this at all. You Need a Budget and YNAB are registered trademarks of Steine LLC and/or one of its subsidiaries.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
