import { UserEO } from "./eo";
import { SimpleGetSetRepository } from "./internal";

export interface IIndexTuple {
  index: number;
}

export interface IBudget extends IIndexTuple {
  name: string;
  amount: number;
  currency: string;
}

export interface ICategory extends IIndexTuple {
  name: string;
  alias: string;
}

export interface IHistory extends IIndexTuple {
  categoryIndex: number;
  budgetIndex: number;
  comment: string;
  amount: number;
  currency: string;
  registered: string;
}

export interface IUser {
  id: string;
  goal: number;
  currency: string;

  timezoneOffset: number;
  state?: string;

  currentBudgetIndex: number;
  budgets: IBudget[];
  categories: ICategory[];
  histories: IHistory[];
}

export const deepCopyUser = (value: IUser) => ({
  ...value,
  budgets: value.budgets.map(each => ({ ...each })),
  categories: value.categories.map(each => ({ ...each })),
  histories: value.histories.map(each => ({ ...each }))
});

const newUser = (id: string): IUser => ({
  id,
  goal: 0,
  currency: "원",
  timezoneOffset: 9,
  currentBudgetIndex: -1,
  state: undefined,
  budgets: [],
  categories: [],
  histories: []
});

export class UserRepository extends SimpleGetSetRepository<IUser> {
  constructor(userId: string) {
    super("user", userId);
  }

  public async get(): Promise<IUser> {
    const user = await super.get();
    return user || newUser(this.id);
  }

  public async eo(): Promise<UserEO> {
    return new UserEO(await this.get(), value => this.set(value));
  }
}
