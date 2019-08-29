export type BudgetCommand = {
  help: void;
  list: void;
  addOrUpdate: {
    name: string;
    amount: number;
    currency: string;
  };
  startToDelete: {
    name: string;
  };
  use: {
    name: string;
  };
  unuse: void;
};

export type BudgetDeleteCommand = {
  delete: void;
  cancelDeletion: void;
};
