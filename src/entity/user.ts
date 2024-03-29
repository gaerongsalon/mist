import { BudgetComponent } from "./components/budget";
import { CategoryComponent } from "./components/category";
import { HistoryComponent } from "./components/history";
import { User } from "../models";

const defaultCurrency = `원`;

export class UserEntity {
  public readonly budget: BudgetComponent;
  public readonly category: CategoryComponent;
  public readonly history: HistoryComponent;

  constructor(public readonly value: User) {
    this.budget = new BudgetComponent(value);
    this.category = new CategoryComponent(value);
    this.history = new HistoryComponent(value);
  }

  public get userCurrency() {
    return (
      this.budget.current?.currency ??
      this.value.currency ??
      defaultCurrency
    ).toUpperCase();
  }

  public get userDecimalPoint() {
    return this.budget.current?.decimalPoint ?? 0;
  }

  public getCurrency(budgetIndex: number) {
    return (
      this.budget.findByIndex(budgetIndex)?.currency ?? this.userCurrency
    ).toUpperCase();
  }

  public getDecimalPoint(budgetIndex: number) {
    const maybeBudget = this.budget.findByIndex(budgetIndex);
    return maybeBudget?.decimalPoint ?? 0;
  }

  public get remain() {
    if (!this.budget.current) {
      return 0;
    }
    return this.budget.current.amount - this.history.totalUsed;
  }
}
