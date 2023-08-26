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
  exchange: {
    rate: number;
  };
  decimal: {
    point: number;
  };
  unuse: void;
  use: {
    name: string;
  };
};

export type BudgetDeleteCommand = {
  delete: void;
  cancelDeletion: void;
};
