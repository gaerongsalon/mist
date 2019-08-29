export type CategoryCommand = {
  help: void;
  list: void;
  addCategory: {
    name: string;
    alias: string;
  };
};
