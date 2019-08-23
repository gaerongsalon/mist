import { deepEqual } from "fast-equals";
import { IUser } from "..";
import { deepCopyUser } from "../user";
import { BudgetEO } from "./budget";
import { CategoryEO } from "./category";
import { HistoryEO } from "./history";
import { UserStateEO } from "./userState";

const defaultCurrency = `원`;

export class UserEO {
  public readonly budget: BudgetEO;
  public readonly category: CategoryEO;
  public readonly state: UserStateEO;
  public readonly history: HistoryEO;

  // For dirty-check
  private copied: IUser;

  constructor(
    public readonly value: IUser,
    private readonly writeback: (newValue: IUser) => Promise<void>
  ) {
    this.budget = new BudgetEO(value);
    this.category = new CategoryEO(value);
    this.state = new UserStateEO(value);
    this.history = new HistoryEO(value);
    this.copied = deepCopyUser(value);
  }

  public async store() {
    if (deepEqual(this.value, this.copied)) {
      console.log(`Equal deeply so I skip to store.`);
      return;
    } else {
      console.log(`Write back an user [${JSON.stringify(this.value)}]`);
    }
    await this.writeback(this.value);
    this.copied = deepCopyUser(this.value);
    return true;
  }

  public get userCurrency() {
    const maybeBudget = this.budget.findByIndex(this.value.currentBudgetIndex);
    return (maybeBudget
      ? maybeBudget.currency
      : this.value.currency || defaultCurrency
    ).toUpperCase();
  }

  public getCurrency(budgetIndex: number) {
    const maybeBudget = this.budget.findByIndex(budgetIndex);
    return (maybeBudget
      ? maybeBudget.currency
      : this.userCurrency
    ).toUpperCase();
  }

  public get remain() {
    if (!this.budget.current) {
      return 0;
    }
    return this.budget.current.amount - this.history.totalUsed;
  }
}
