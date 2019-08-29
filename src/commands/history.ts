export type HistoryCommand = {
  addHistory: {
    categoryNameOrAlias: string;
    comment: string;
    amount: number;
  };
  startModify: {
    count: number;
  };
};

export type HistoryModifyCommand = {
  startModify: {
    count: number;
  };
  choose: {
    index: number;
  };
  cancel: void;
  help: void;
};

export type HistoryModifySelectedCommand = {
  startModify: {
    count: number;
  };
  choose: {
    index: number;
  };
  update: {
    maybeOmittedCategoryNameOrAlias: string;
    maybeOmittedComment: string;
    maybeOmittedAmount: string;
  };
  delete: void;
  cancel: void;
  help: void;
};
