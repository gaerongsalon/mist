import { PeriodType } from "../utils/period";
import { SummaryCommand } from "../commands/summary";
import { UserEntity } from "../entity";
import says from "../says";
import tk from "../toolkit";

const summarizeHistory = async (
  t: UserEntity,
  maybeCategoryNameOrAlias?: string,
  type?: PeriodType,
  ago?: number
) => {
  const maybeCategory = t.category.findByNameOrAlias(maybeCategoryNameOrAlias);
  const aggregated = t.history.aggregatePast({
    categoryIndex: maybeCategory ? maybeCategory.index : -1,
    type,
    ago,
  });
  const totalUsed = aggregated.map((e) => e.amount).reduce((a, b) => a + b, 0);
  const { userCurrency, userDecimalPoint } = t;
  return [
    ...aggregated.map((e) =>
      says.reportSummaryItem({
        categoryName: t.category.findNameByIndex(e.categoryIndex),
        amount: e.amount,
        currency: userCurrency,
        decimalPoint: userDecimalPoint,
      })
    ),
    says.reportSummaryEnd({
      totalUsed,
      currency: userCurrency,
      decimalPoint: userDecimalPoint,
    }),
  ].join("\n");
};

export default tk.partialStateHandlers({
  empty: tk.handlers<SummaryCommand>({
    today: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Day, 0),
    yesterday: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Day, 1),
    daysAgo2: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Day, 2),
    daysAgo3: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Day, 3),
    daysAgo: ({ context: { t }, maybeCategory, interval }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Day, interval),

    thisWeek: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Week, 0),
    lastWeek: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Week, 1),
    weeksAgo2: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Week, 2),
    weeksAgo: ({ context: { t }, maybeCategory, interval }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Week, interval),

    thisMonth: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Month, 0),
    lastMonth: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Month, 1),
    monthsAgo2: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Month, 2),
    monthsAgo: ({ context: { t }, maybeCategory, interval }) =>
      summarizeHistory(t, maybeCategory, PeriodType.Month, interval),

    all: ({ context: { t }, maybeCategory }) =>
      summarizeHistory(t, maybeCategory),
  }),
});
