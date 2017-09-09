# YNAB Toolkit Development
This folder holds all the source code for the YNAB Toolkit.

The folder structure is as such:

```
|-core
|---listeners
|-features
|---accounts
|---budget
|---general
|---reports
|---toolkitReports
|-helpers
```

`core/`: Contains all the core functionality for the Toolkit such as the observers
and the base `Feature` class.

`features/`: Contains sub-directories for each section of the YNAB application
and house the source code for each individual feature. This is where most
development will take place.

`helpers/`: Contains any helpers shared code for the Toolkit such as looking up
Ember views or normalizing currency values.

## Writing Your First Feature

It is extremely easy to get started with your first feature. In order to do so,
follow these stpes:

1. Determine where your feature belongs in YNAB (budget/accounts/all pages)
2. Create a sub-directory in the proper `features/` sub-directory.
3. Create an index.js file which has the following:
  <!-- spacing is intentionally weird here because of markdown -->
  ```javascript
  import { Feature } from 'core/feature';

  export class MyCoolFeature extends Feature {
     shouldInvoke() {
       return true;
     }

     invoke() {
       console.log('MyCoolFeature is working!')
     }
  }
  ```
4. Run `npm develop`, refresh YNAB and you should see you feature log to the
console!

In order to help you develop cool features, we've created a few API functions
that you get for free when extending `Feature`.

### The `Feature` Class

#### The following functions can be declared inside your Feature Class.

#### `constructor()`
**optional function, not required to be declared**

Your feature's constructor is invoked as soon as the Toolkit is injected onto
the page. You should not attempt a DOM manipulation or access to Ember/YNAB
as it is not guaranteed or likely to be ready when your constructor is invoked.
The job of the base `Feature` constructor is to simply fetch the user settings
of your feature. If `enabled` is set to false for your Feature's settings,
then invoke will not be called.

#### `willInvoke(): <void|Promise>`
**optional function, not required to be declared**

willInvoke() is an optional hook that you can define in your class that allows
you to run synchronous or asynchronous code before your feature is invoked. If
you choose to run asynchronous code, just return a promise from `willInvoke()`.

Note that `willInvoke()` runs before `shouldInvoke()` runs and does not care
about the return value of `shouldInvoke()`.

Running Balance is an example of why you would want to use this. Running Balance
runs over all transactions in every account to initalize the running balance
calculation. If this weren't done before we invoked, there's a chance users would
not see any data in the running balance column.

#### `shouldInvoke(): boolean`
**optional function, not required to be declared**

shouldInvoke is called immediately once the page and YNAB is ready. This function
should perform a synchronous operation to determine whether or not your feature
should be invoked. You should also use this function in your `observe()`, or
`onRouteChanged()` functions to determine whether or not you should invoke.

Example:

```javascript
shouldInvoke() {
  return toolkitHelper.getCurrentRoute().indexOf('accounts') !== -1;
}
```

#### `invoke(): void`
**optional function, not required to be declared**

Invoke is called immediately once the page and YNAB is ready and shouldInvoke()
returns true. This is the entrypoint of your feature. You can be certain that
at this point, the page is ready for manipulation and YNAB is loaded.

#### `injectCSS()`
**optional function, not required to be declared**

injectCSS is called only once when the feature is instantiated, and its job is to
return any global CSS styles you'd like to have placed in a `<style>` tag in the 
`<head>` of the page.

For example, a CSS based feature to hide the referral program banner would look like this:

**index.js**
```javascript
import { Feature } from 'core/feature';

export class HideReferralBanner extends Feature {
  injectCSS() { return require('./index.css'); }
}
```

**index.css**
```css
div.referral-program {
    display: none;
}
```

You can get ahold of the css string you need however you like at runtime, just
be aware that YNAB itself isn't loaded yet. This feature is designed to be used
statically for styles that don't change that your feature requires on the page.

#### `observe(changedNodes: Set): void`
**optional function, not required to be declared**

Observe will be called every time there's a change to the DOM. The underlying
code of observe uses a [Mutation Observer][mutation-observer]. Once a change is
detected from the DOM, we iterate over every node and add the `class` attribute
from the underylying element to a `Set`. `ember-view ` is stripped from every
class name to reduce complexity.

Note that it is extremely likely to receive many calls to observe when things
change on the page and not all changes are sent in the first request. It is for
this reason that you're you should check both `this.shouldInvoke()` and the
`changedNodes` set inside `observe()`.

Example:

```javascript
observe(changedNodes) {
  if (!this.shouldInvoke()) return;

  if (changedNodes.has('element-class-i-care-about')) {
    this.invoke();
  }
}
```

Note: The first line of your `observe()` function should call `this.shouldInvoke()`
and return immediately if the result is false.

#### `onRouteChanged(currentRoute: string): void`
**optional function, not required to be declared**

OnRouteChanged is designed to be called every time the user navigates to a new
page. In order to do this, we've implemented an Ember Observer which watches for
changes to the following attributes:

- `currentRouteName`: Any time the Ember router changes the underlying controller
or view, this gets changed. (ie: Accounts -> Budget or vise versa). This does not
change if you just simply switch which account you're looking at.

- `budgetVersionId`: This will change if the user switches to an entirely different
budget. This can be done natively but going through the three page budget swap
flow or with the Toolkit 'Quck Budget Switch' feature.

- `selectedAccountId`: This handles the case where a user is just flipping through
accounts but still remaining on the 'accounts' route.

- `monthString`: This handles the case where the user is flipping through months
on the budget page.

When one of these things are changed, your `onRouteChanged` handler will get called
with the name of the route the user is currently on. More often than not a simple
call to `this.shouldInvoke()` is all that you need to determine if you care about
the route change.

For convenience, we send in the currentRoute<String>. Your `shouldInvoke` function
likely grabs this value itself and checks against it which is fine. It is recommended
that you always use `shouldInvoke` in these listener functions to avoid
unnecessary processing so feel free to ignore the passed in value and just call
`this.shouldInvoke` if it's all that you need to determine if you care about the
route change.

Example:

```javascript
onRouteChanged() {
  if (!this.shouldInvoke()) return;

  this.invoke();
}
```

[mutation-observer]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
