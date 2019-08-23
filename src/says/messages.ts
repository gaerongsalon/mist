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
  };
  budgetListItem: {
    name: string;
    amount: number;
    currency: string;
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
  };
  reportHistoryItem: {
    categoryName: string;
    comment: string;
    amount: number;
    currency: string;
  };
  reportHistoryEnd: {
    totalUsed: number;
    remain: number;
    currency: string;
  };
  reportSummaryItem: {
    categoryName: string;
    amount: number;
    currency: string;
  };
  reportSummaryEnd: {
    totalUsed: number;
    currency: string;
  };
  getsetGoal: {
    goal: number;
    currency: string;
  };
  getsetTimezone: {
    timezoneOffset: number;
  };
  getsetCurrency: {
    currency: string;
  };
};
