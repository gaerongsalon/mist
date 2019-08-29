import { IBudget } from "./budget";
import { ICategory } from "./category";
import { IHistory } from "./history";

export interface IUser {
  goal: number;
  currency: string;
  timezoneOffset: number;
  currentBudgetIndex: number;
  budgets: IBudget[];
  categories: ICategory[];
  histories: IHistory[];
}

export const emptyUser = (): IUser => ({
  goal: 0,
  currency: "원",
  timezoneOffset: 9,
  currentBudgetIndex: -1,
  budgets: [],
  categories: [],
  histories: []
});
