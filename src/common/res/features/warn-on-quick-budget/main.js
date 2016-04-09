(function poll() {

  if (typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.warnOnQuickBudget = (function(){

      return {
      
        invoke: function() {
          
          // target only buttons so other elements with same class can be added without forcing confirmation, 
          // which can break the quick budget functionality for quick budget items added by the Toolkit
          $('button.budget-inspector-button').click(function(e) {

          	if (!confirm('Are you sure you want to do this?'))
			{
	          	e.preventDefault();
          		e.stopPropagation();
          		return false;
          	}
          });
        },

        observe: function(changedNodes) {

          if (changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector')) {
              ynabToolKit.warnOnQuickBudget.invoke();
          }
        }
        
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.warnOnQuickBudget.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
