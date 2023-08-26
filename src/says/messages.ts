export type Messages = {
  yes: void;
  hello: void;
  warning: void;
  superWarning: void;
  pleaseNumber: void;
  noHistory: void;
  retryModify: void;
  deleted: void;
  modificationCompleted: void;
  modifyHelp: void;
  modifySelectedHelp: void;
  help: void;
  goalHelp: void;
  categoryHelp: void;
  sumOfCategory: void;
  budgetHelp: void;
  noBudget: void;
  currentBudget: {
    name: string;
    amount: number;
    remain: number;
    currency: string;
    exchangeRate: number;
    decimalPoint: number;
  };
  budgetListItem: {
    name: string;
    amount: number;
    currency: string;
    decimalPoint: number;
  };
  confirmDeleteBudget: {
    name: string;
  };
  resetBudget: void;
  changeBudget: {
    name: string;
  };
  categoryListItem: {
    name: string;
    alias: string;
  };
  historyListItem: {
    index: number;
    categoryName: string;
    comment: string;
    amount: number;
    currency: string;
    decimalPoint: number;
  };
  reportHistoryItem: {
    categoryName: string;
    comment: string;
    amount: number;
    currency: string;
    decimalPoint: number;
  };
  reportHistoryEnd: {
    totalUsed: number;
    totalGoal: number;
    currency: string;
    decimalPoint: number;
  };
  reportSummaryItem: {
    categoryName: string;
    amount: number;
    currency: string;
    decimalPoint: number;
  };
  reportSummaryEnd: {
    totalUsed: number;
    currency: string;
    decimalPoint: number;
  };
  getsetGoal: {
    goal: number;
    currency: string;
    decimalPoint: number;
  };
  getsetTimezone: {
    timezoneOffset: number;
  };
  getsetCurrency: {
    currency: string;
  };
  guideSeparator: void;
  whereAmI: {
    where: string;
  };
  budgetUpdated: void;
  categoryDuplicated: void;
  updateBudgetExchangeRate: {
    exchangeRate: number;
    currency: string;
    name: string;
  };
  updateBudgetDecimalPoint: {
    decimalPoint: number;
    currency: string;
    name: string;
  };
};

export type MessagesMap = {
  [K in keyof Messages]: (args: Messages[K]) => string;
};
