<p align="center">
  <img src="http://i.imgur.com/SJhwBpU.png" alt="Toolkit for YNAB">
</p>

[![Build Status](https://travis-ci.org/toolkit-for-ynab/toolkit-for-ynab.svg?branch=master)](https://travis-ci.org/toolkit-for-ynab/toolkit-for-ynab)

Toolkit for YNAB is a browser extension that enhances your experience with the YNAB Web Application.

### Motivation
YNAB have released an exciting new web version. Lots of power users of the older
versions are asking for options that are easily implemented in a browser extension.
Rather than ask the YNAB team to implement these features, let's just do it
ourselves!


### [List of Features](/docs/feature-list.md)
You can find a full list of features [here](/docs/feature-list.md) and also on the options
page of the extension once you have installed it which is where you can configure these
features to be on or off.

### Installing
The Toolkit is available for Chrome and Firefox. The extension is built using [Browser (Web) Extension APIs](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)
which means support for Edge should be imminent as well.

If you don't want to build the extension from the source yourself, you can get it for
each browser at the following links:

- Chrome on the [Chrome Web Store](https://chrome.google.com/webstore/detail/toolkit-for-ynab/lmhdkkhepllpnondndgpgclfjnlofgjl)
- Firefox on the [Firefox Add-on Repository](https://addons.mozilla.org/firefox/addon/toolkit-for-ynab/)

Note: Since the extension is built with Web Extensions and that is not supported by Safari,
the extension itself is not supported on Safari. When/if Safari decides to support Web Extensions
we will do what we can to provide support for their browser.

### Roadmap
Features under consideration and the general status of the project and roadmap is
on [our Trello Board](https://trello.com/b/EzOvXlil/ynab-enhanced-roadmap). Feel
free to vote and comment. To suggest a new feature, please [visit the YNAB Forum for Extensions](https://forum.youneedabudget.com/categories/ynab-extensions)
and create a new thread titled "Toolkit Feature Request: [a short description of the feature]".
Forum user @bluebird8203 is managing the features there and will make sure it ends up in Trello.

### Contributions
Contributions are greatly welcomed. If you want to contribute, it's best if you can let
us know so we don't double up on effort. You can see what is being worked on and by whom
on the roadmap. If you can't find what you want to build on the roadmap, feel free to put
a note up on the github issues board to let the team know you're working on something new.
When your code is ready, submit a pull request. You can also contact @blarg on [the YNAB forums](http://forum.youneedabudget.com).

For documentation on how to build a feature, [see the documentation](https://github.com/toolkit-for-ynab/toolkit-for-ynab/blob/master/docs/building-features.md).

### Building the Code
This extension uses three main things in its build process:

- ESLint: Checks the style of your code to make sure it matches our style guide as you build.
- Babel: Transpiles ES2015 back to ES5 for browser support of newer JS syntax.
- Webpack: Bundles entry points for all Web Extension pages (background, popup, options,
content scripts) into single files and manages most of the build process.

1. Clone the repository.
2. Install `node` and `yarn` (both are available through `brew`, test with node-v9.2.1 and yarn-1.3.2)
3. On OSX, ensure command line developer tools are installed `xcode-select --install`.
4. Run `yarn install` within the folder you cloned. This will install all the dependencies needed for the project.
5. Run `yarn build:development` from within the folder you cloned which will build the Toolkit.
  - Whilst developing, you may prefer to run `yarn watch` which will monitor the project
    directory for changes and run `yarn build:development` automatically for you.
6. The built extension will be available in the `dist/extension` folder. Navigate to `chrome://extensions`
  and select the `dist/extension` folder as the folder that you would like to load.
7. You may need to reload the Chrome plugin if it's been already installed. Visit `chrome://extensions` and click the reload icon ![](https://camo.githubusercontent.com/4d41ad79a8241b062ea59fa332b39028c1469703/68747470733a2f2f636c2e6c792f31633167304633443142316f2f496d616765253230323031382d30362d3034253230617425323031362e32302e33342e706e67)

# Development Methodology

#### ES2015? What's that?
We've decided that it's better to use the latest and greatest than to wait for browsers to
support all the nice newer syntax landing in Javascript. If you have any concerns or questions
don't hesitate to reach out to us in an issue and ask for an invite to our Slack so you can
collaborate with the team.

#### Your ESLint style checker is annoying as heck! I don't code that way!
We have a large number of contributors who each bring their own style to the code base.
It was getting a bit hard to navigate all the features, as they each had their own way
of indenting, etc etc. We held a team vote to unify our styles, and decided to follow
the AirBNB style guide. It's a pretty good way to go, so give it a shot before you
get too upset about having to change your style.

#### How do I build a feature?
If you take a look at the `src` folder of the codebase, you'll find what seems like a
lot going on but for the most part, the only directory you should be concerned with as
a feature developer will be `src/extension/features`. Here, you will find more sub
directories which represent each section of the YNAB application. You should select
the folder which represents the section of the application you'd expect your feature to
run and start building there.

For more documentation see the following:

##### New Framework [Documentation](/docs/building-features.md)
The new framework was built because the old one required you to include a lot of
boilerplate code in every feature. The new one makes heavier use of ES6 features
and allows us to remove the burden of boilerplate from new contributions.

The source code for this lives in the `src/extension/features` directory.

**Important note about line feeds!!!**
You must ensure that your code editor is configured to use Unix style line feeds (LFs)
or the build will fail. This will primarily affect contributors using Windows as
the LFs are different on that platform.

## Legal Stuff
**IMPORTANT NOTE:** This extension is not affiliated with YNAB in any way and YNAB
has not endorsed this at all. You Need a Budget and YNAB are registered trademarks
of Steine LLC and/or one of its subsidiaries.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
