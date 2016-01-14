var entityManager = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.getEntityManager();

subCategories = $("ul.is-sub-category");
$(subCategories).each(function () {
	var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
	var crazyInternalId = "mcbc/2016-01/"+entityManager.getSubCategoryByName(subCategoryName).getEntityId();
	var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
	var status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
	var percent = Math.round(parseFloat(status)*100);
	var budgetedCell = $(this).find("li.budget-table-cell-budgeted")[0];
	budgetedCell.style.background = "-webkit-linear-gradient(top, white, white 13%, rgba(22, 163, 54, 0.0) 13%, rgba(22, 163, 54, 0.00) 84%, white 84%),-webkit-linear-gradient(left, rgba(22, 163, 54, 0.3) " + percent + "%, white " + (100 - percent)+ "%)";
})