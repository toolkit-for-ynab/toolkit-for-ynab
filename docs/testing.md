# Testing Your Changes
So you've built that awesome feature and want to see how it works in browsers?
Here's the way we test:

## Chrome
Chrome is the easiest platform to test on as it seems the best set up for inspecting
what's going on and is the easiest to refresh when you make changes.

1. Run `yarn build:dev`
2. Go to the URL `chrome://extensions`
3. In the top right corner tick the tickbox titled "Developer Mode"
4. You'll see some buttons appear. Click `Load Unpacked Extension...`
5. Select the folder (relative to the root of the repository) `dist`

You'll see the toolkit loaded in to Chrome and it'll work as normal. Whenever you make
a change to the files in `src` you'll need to run `yarn build` again. Alternatively
you could run `yarn watch` which will rebuild for you when changes are made to the `src`
folder. Sometimes (most often when making changes to options/popup/background/content_scripts)
you'll have to releade the extension. If you find it easier,
[this extension](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
will reload all unpacked extensions when clicked.

## Firefox
1. Run `yarn build:dev`
2. Go to the URL about:debugging
3. Click the checkbox to `Enable add-on debugging`.
4. Click `Load Temporary Add-on`
5. Select the `manifest.json` file from the `dist` folder (relative to the root of the repository).

You'll see the toolkit loaded in Firefox and it'll work as normal. Whenever you make
a change to the files in `src` you'll need to run `yarn build` again. Alternatively
you could run `yarn watch` which will rebuild for you when changes are made to the `src`
folder.

I've not developed much on Firefox other than to make sure the extension works properly
but usually updates to the code are reflected in real time. If you notice this not happening
you can click the `Reload` button on the `about:debugging` page. Note that
temporary extensions are unloaded when Firefox is closed.

## Edge
TODO

## My Code Isn't in the Test Version
The first debugging step is to remove and reinstall the extension to make sure
you've actually got the latest files in there. If you still can't find your files,
remember that browsers often put content scripts in a different area of their
development tools. If you're stuck, ask for help with a new GitHub Issue.
