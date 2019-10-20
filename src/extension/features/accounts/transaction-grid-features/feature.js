export class TransactionGridFeature {
  // Injects css into the DOM if needed for the feature
  injectCSS() {
    return '';
  }

  // Inserts the header for your additional column
  insertHeader() {}

  // Should remove all additional column related elements from the page
  cleanup() {}

  // Can return a promise, will get called during the normal willInvoke cycle
  // of a feature.
  willInvoke() {}

  // Should return a boolean that informs AdditionalColumns feature that it
  // is on a page that should receive the new column.
  shouldInvoke() {}

  // Run any setup your transaction grid feature needs to operate. You want
  // to make this function idempotent because it is likely to be called many times.
  invoke() {}

  // Any logic the feature should perform when the budget changes. (Like re-initialization).
  onBudgetChanged() {}

  // Called during the lifecycle event `didUpdate` in Ember for an Ember Component.
  didUpdate() {}

  // Called when one of the grid rows is getting inserted into the dom but
  // before it actually makes it into the dom. This should be doing the grunt
  // of the work.
  willInsertColumn() {}

  // Called for all the rows that don't need the column data.
  willInsertDeadColumn() {}

  // this is really hacky but I'm not sure what else to do, most of these components
  // double render so the `willInsertElement` works for those but the add rows
  // and footer are weird. add-rows doesn't double render and will work every time
  // after the component has been cached but footer is _always_ a new component WutFace
  handleSingleRenderColumn() {}
}
