import { History, User } from "../../models";
import { PeriodType, dateBetween } from "../../utils/period";

import { EntityElementExtension } from "serverless-stateful-linebot-framework";

export interface AggregatedHistory {
  categoryIndex: number;
  amount: number;
}

export class HistoryComponent extends EntityElementExtension<User, History> {
  constructor(user: User) {
    super(user, "histories");
  }

  public findRecent(cond: CountCondition) {
    return this.filter(
      fromCondition({ budgetIndex: this.entity.currentBudgetIndex })
    )
      .sort(descByRegistered)
      .filter(takeN(cond.count || 10));
  }

  public findPast(cond: PeriodCondition & ICategoryCondition) {
    const dateFilter =
      cond.type !== undefined
        ? dateBetween(this.entity.timezoneOffset)[cond.type](cond.ago || 0)
        : () => true;
    return this.filter(
      fromCondition({
        budgetIndex: this.entity.currentBudgetIndex,
      })
    )
      .filter(categoryFilter(cond))
      .filter((each) => dateFilter(each.registered))
      .sort(ascByRegistered);
  }

  public aggregatePast(cond: PeriodCondition & ICategoryCondition) {
    const dateFilter =
      cond.type !== undefined
        ? dateBetween(this.entity.timezoneOffset)[cond.type](cond.ago || 0)
        : () => true;
    return categoryAggregator(
      this.filter(
        fromCondition({
          budgetIndex: this.entity.currentBudgetIndex,
        })
      )
        .filter((each) => dateFilter(each.registered))
        .filter(categoryFilter(cond))
    );
  }

  public get totalUsed() {
    return this.aggregatePast({})
      .map((e) => e.amount)
      .reduce((a, b) => a + b, 0);
  }
}

interface FromCondition {
  budgetIndex: number;
}

interface CountCondition {
  count: number;
}

interface PeriodCondition {
  type?: PeriodType;
  ago?: number;
}

interface ICategoryCondition {
  categoryIndex?: number;
}

const fromCondition = (cond: FromCondition) => (each: History) =>
  cond.budgetIndex === undefined ||
  cond.budgetIndex === -1 ||
  each.budgetIndex === cond.budgetIndex;

const takeN = (count: number) => (_: any, index: number) => index < count;
const ascByRegistered = (
  { registered: a }: History,
  { registered: b }: History
) => a.localeCompare(b);
const descByRegistered = (
  { registered: a }: History,
  { registered: b }: History
) => b.localeCompare(a);

const categoryFilter =
  (cond: ICategoryCondition) =>
  ({ categoryIndex }: History) =>
    cond.categoryIndex === undefined ||
    cond.categoryIndex === -1 ||
    cond.categoryIndex === categoryIndex;

const categoryAggregator = (values: History[]) =>
  Object.entries(
    values.reduce(
      (accumulated, value) =>
        Object.assign(accumulated, {
          [value.categoryIndex]:
            (accumulated[value.categoryIndex] || 0) + value.amount,
        }),
      {} as { [categoryIndex: number]: number }
    )
  ).map(
    ([categoryIndex, accumulatedAmount]) =>
      ({
        categoryIndex: +categoryIndex,
        amount: accumulatedAmount,
      }) as AggregatedHistory
  );
