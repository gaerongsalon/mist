import { IHistory, IUser } from "..";
import { dateBetween, PeriodType } from "../../utils/period";
import { CollectionInUser } from "./collectionInUser";

export interface IAggregatedHistory {
  categoryIndex: number;
  amount: number;
}

export class HistoryEO extends CollectionInUser<IHistory> {
  constructor(user: IUser) {
    super(user, "histories");
  }

  public findRecent(cond: ICountCondition) {
    return this.filter(
      fromCondition({ budgetIndex: this.user.currentBudgetIndex })
    )
      .sort(descByRegistered)
      .filter(takeN(cond.count || 10));
  }

  public findPast(cond: IPeriodCondition & ICategoryCondition) {
    const dateFilter =
      cond.type !== undefined
        ? dateBetween(this.user.timezoneOffset)[cond.type](cond.ago || 0)
        : () => true;
    return this.filter(
      fromCondition({
        budgetIndex: this.user.currentBudgetIndex
      })
    )
      .filter(categoryFilter(cond))
      .filter(each => dateFilter(each.registered))
      .sort(ascByRegistered);
  }

  public aggregatePast(cond: IPeriodCondition & ICategoryCondition) {
    const dateFilter =
      cond.type !== undefined
        ? dateBetween(this.user.timezoneOffset)[cond.type](cond.ago || 0)
        : () => true;
    return categoryAggregator(
      this.filter(
        fromCondition({
          budgetIndex: this.user.currentBudgetIndex
        })
      )
        .filter(each => dateFilter(each.registered))
        .filter(categoryFilter(cond))
    );
  }

  public get totalUsed() {
    return this.aggregatePast({})
      .map(e => e.amount)
      .reduce((a, b) => a + b, 0);
  }
}

interface IFromCondition {
  budgetIndex: number;
}

interface ICountCondition {
  count: number;
}

interface IPeriodCondition {
  type?: PeriodType;
  ago?: number;
}

interface ICategoryCondition {
  categoryIndex?: number;
}

const fromCondition = (cond: IFromCondition) => (each: IHistory) =>
  cond.budgetIndex === undefined ||
  cond.budgetIndex === -1 ||
  each.budgetIndex === cond.budgetIndex;

const takeN = (count: number) => (_: any, index: number) => index < count;
const ascByRegistered = (
  { registered: a }: IHistory,
  { registered: b }: IHistory
) => a.localeCompare(b);
const descByRegistered = (
  { registered: a }: IHistory,
  { registered: b }: IHistory
) => b.localeCompare(a);

const categoryFilter = (cond: ICategoryCondition) => ({
  categoryIndex
}: IHistory) =>
  cond.categoryIndex === undefined ||
  cond.categoryIndex === -1 ||
  cond.categoryIndex === categoryIndex;

const categoryAggregator = (values: IHistory[]) =>
  Object.entries(
    values.reduce(
      (accumulated, value) =>
        Object.assign(accumulated, {
          [value.categoryIndex]:
            (accumulated[value.categoryIndex] || 0) + value.amount
        }),
      {} as { [categoryIndex: number]: number }
    )
  ).map(
    ([categoryIndex, accumulatedAmount]) =>
      ({
        categoryIndex: +categoryIndex,
        amount: accumulatedAmount
      } as IAggregatedHistory)
  );
