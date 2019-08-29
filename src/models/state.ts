export type UserState = {
  empty: void;
  modify: {
    data: HistoryModificationData;
  };
  modifySelected: {
    selectedIndex: number;
    data: HistoryModificationData;
  };
  deleteBudget: {
    selectedIndex: number;
  };
};

type HistoryModificationData = Array<{
  index: number;
  text: string;
}>;
