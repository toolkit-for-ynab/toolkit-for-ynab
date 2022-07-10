export enum YNABAccountType {
  AutoLoan = 'AutoLoan',
  Cash = 'Cash',
  Checking = 'Checking',
  CreditCard = 'CreditCard',
  LineOfCredit = 'LineOfCredit',
  MedicalDebt = 'MedicalDebt',
  Mortgage = 'Mortgage',
  OtherAsset = 'OtherAsset',
  OtherDebt = 'OtherDebt',
  OtherLiability = 'OtherLiability',
  PersonalLoan = 'PersonalLoan',
  Savings = 'Savings',
  StudentLoan = 'StudentLoan',
}

export enum YNABMoneyMovementType {
  AutoAssignAssignedLastMonth = 'auto_assign_assigned_last_month',
  AutoAssignAverageAssigned = 'auto_assign_average_assigned',
  AutoAssignAveragePaid = 'auto_assign_average_paid',
  AutoAssignAverageSpent = 'auto_assign_average_spent',
  AutoAssignDueDate = 'auto_assign_due_date',
  AutoAssignGoalTarget = 'auto_assign_goal_target',
  AutoAssignPaidLastMonth = 'auto_assign_paid_last_month',
  AutoAssignRemoveSurplus = 'auto_assign_remove_surplus',
  AutoAssignReset = 'auto_assign_reset',
  AutoAssignSetToZero = 'auto_assign_set_to_zero',
  AutoAssignSpentLastMonth = 'auto_assign_spent_last_month',
  AutoAssignUnderfunded = 'auto_assign_underfunded',
  AutoAssignUpcoming = 'auto_assign_upcoming',
  CategoryDeletion = 'category_deletion',
  ManualAssign = 'manual_assign',
  ManualMovement = 'manual_movement',
}

export interface YNABEnums {
  AccountType: typeof YNABAccountType;
  MoneyMovementType: typeof YNABMoneyMovementType;
}
