(function ynabEnhancedHideAoM() {
	var elementForAoM = document.getElementsByClassName("budget-header-days")[0];
    if (elementForAoM) {
        elementForAoM.className = elementForAoM.className + " hidden";
    }
    else
    {
    	setTimeout(ynabEnhancedHideAoM, 250);
    } 	
})();
