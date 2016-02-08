Toolkit for YNAB
=============

Toolkit for YNAB is a general purpose YNAB enhancing chrome extension. Have it your way!

YNAB have released an exciting new web version. Lots of power users of the older
versions are asking for options that are easily implemented in a browser extension.
Rather than ask the YNAB team to implement these features, let's just do it
ourselves!

This is what the extension can do for you:

- Days of Buffering Calculation - Forecasts how long it'll take to burn through all your available money using averages. We know there's no such thing as an average month, but some people prefer this calculation over the Age of Money calculation.
- Export all transactions from the current budget in CSV format.
- Colour Blind Mode - Changes colours of some of the numbers to make the interface easier on people with certain visual disabilities.
- Make the calculator work like YNAB4. When you press + or - (etc) the calculator moves to the end of the line so your number isn't lost.
- Printing Improvements: Now when you print your budget it looks good!
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
- Show your spending pacing mid-month to ensure you're on track to meet your budget. You can enable and disable this setting per budget column by clicking on the value.
- Make negative numbers anywhere in the application have square corners so they stand out even more.
- Larger Clickable Area for Icons: Makes the uncleared, cleared and reconciled icons easier to select.

All of these are configurable with options in the extension options page.

Roadmap
-------

Features under consideration and the general status of the project and roadmap is on [our Trello Board](https://trello.com/b/EzOvXlil/ynab-enhanced-roadmap). Feel free to vote and comment. To suggest new features, please visit the YNAB Forum thread here and comment. Forum user @stephywephy is managing the features there and will make sure it ends up in Trello.

Contributions
-------------

Contributions are greatly welcomed. If you want to contribute, it's best if you can let us know so we don't double up on effort. You can see what is being worked on and by whom on the roadmap. If you can't find what you want to build on the roadmap, feel free to put a note up on the github issues board to let the team know you're working on something new. When your code is ready, submit a pull request. You can also contact @blarg on the forums.

For documentation on how to build a feature, [see the documentation](https://github.com/blargity/toolkit-for-ynab/blob/master/src/common/res/features/HOW_TO_BUILD_FEATURES.md).

Building the Code
-----------------
This extension uses Kango Extensions to provide cross browser support. To build:

**Mac / Linux**

1. Clone the repository
1. Install Python 2.7 (or newer, but I haven't tested that) in your path so it's accessible with just plain ```python``` if you don't have it already.
1. Run ```./build``` from within the folder you cloned above.
1. You'll see platform specific output in the ```output``` folder.
1. Load it into Chrome as an unpacked extension, load it into Firefox via the .xpi file, or load it into Safari using the extension builder.

**Windows**

1. Clone the repository
1. Install Python 2.7 (or newer, but I haven't tested that) in your path so it's accessible with just plain ```python``` if you don't have it already.
1. Run ```build.bat``` from within the folder you cloned above.
1. You'll see platform specific output in the ```output``` folder.
1. Load it into Chrome as an unpacked extension, load it into Firefox via the .xpi file, or load it into Safari using the extension builder.

Installing
---------------
The ToolKit is available for Chrome, Firefox, and Safari. The lead platform is Chrome, but we are actively working on making it equal across all three browsers.
If you don't want to build the extension from the source yourself, you can get it for:

- Chrome on the [Chrome Web Store](https://chrome.google.com/webstore/detail/toolkit-for-ynab/lmhdkkhepllpnondndgpgclfjnlofgjl)
- Firefox on the [Firefox Add-on Repository](https://addons.mozilla.org/firefox/addon/toolkit-for-ynab/)
- Safari [direct from us](http://toolkitforynab.com/safari-updates/toolkitforynab_latest.safariextz)

Development Methodology
-----------------------

**This is janky! Why aren't you using Coffeescript / Typescript / Sass / Less / Compass / etc? Plain JS and CSS, WTF?**
The primary concern for this extension from a development perspective is making it **easy** to work on. Every single one of those technologies above are awesome. I use a lot of them all the time at work. They do make your life easier, but unfortunately they add massively to the learning curve for contributing to the extension. Everyone knows JS and CSS. I want to make sure that working on the extension remains an accessible thing to do.

**How do I build a Feature?**
[Here's some documentation.](https://github.com/blargity/toolkit-for-ynab/blob/master/src/common/res/features/HOW_TO_BUILD_FEATURES.md) If you are still struggling to get up to speed let us know (email's fine!) and we'll make sure we help out.

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
