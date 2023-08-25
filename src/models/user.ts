import { Budget } from "./budget";
import { Category } from "./category";
import { History } from "./history";

export interface User {
  goal: number;
  currency: string;
  timezoneOffset: number;
  currentBudgetIndex: number;
  budgets: Budget[];
  categories: Category[];
  histories: History[];
}

export const emptyUser = (): User => ({
  goal: 0,
  currency: "원",
  timezoneOffset: 9,
  currentBudgetIndex: -1,
  budgets: [],
  categories: [],
  histories: [],
});
