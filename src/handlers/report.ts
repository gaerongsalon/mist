import { PeriodType, daysBetween, periodToDays } from "../utils/period";

import { ReportCommand } from "../commands/report";
import { UserEntity } from "../entity";
import says from "../says";
import tk from "../toolkit";

const reportHistory = async (
  t: UserEntity,
  maybeCategoryNameOrAlias: string | undefined,
  type?: PeriodType,
  ago?: number
) => {
  const maybeCategory = t.category.findByNameOrAlias(maybeCategoryNameOrAlias);
  const histories = t.history.findPast({
    categoryIndex: maybeCategory ? maybeCategory.index : -1,
    type,
    ago,
  });
  const totalUsed = histories.map((e) => e.amount).reduce((a, b) => a + b, 0);
  const totalGoal =
    t.value.goal *
    (type
      ? periodToDays(type, 1)
      : daysBetween(histories.map((e) => e.registered)));

  const { userCurrency, userDecimalPoint } = t;
  const texts = [
    ...histories.map((e) =>
      says.reportHistoryItem({
        categoryName: t.category.findNameByIndex(e.categoryIndex),
        comment: e.comment,
        amount: e.amount,
        currency: t.getCurrency(e.budgetIndex),
        decimalPoint: t.getDecimalPoint(e.budgetIndex),
      })
    ),
    says.reportHistoryEnd({
      totalUsed,
      totalGoal,
      currency: userCurrency,
      decimalPoint: userDecimalPoint,
    }),
  ];

  if (totalGoal > 0) {
    const remain = totalGoal - totalUsed;
    if (remain < 0) {
      texts.push(says.superWarning());
    } else if (remain < t.value.goal / 4) {
      texts.push(says.warning());
    }
  }
  return texts.join("\n");
};

export default tk.partialStateHandlers({
  empty: tk.handlers<ReportCommand>({
    today: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Day, 0),
    yesterday: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Day, 1),
    daysAgo2: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Day, 2),
    daysAgo3: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Day, 3),
    daysAgo: ({ context: { t }, maybeCategory, interval }) =>
      reportHistory(t, maybeCategory, PeriodType.Day, interval),

    thisWeek: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Week, 0),
    lastWeek: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Week, 1),
    weeksAgo2: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Week, 2),
    weeksAgo: ({ context: { t }, maybeCategory, interval }) =>
      reportHistory(t, maybeCategory, PeriodType.Week, interval),

    thisMonth: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Month, 0),
    lastMonth: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Month, 1),
    monthsAgo2: ({ context: { t }, maybeCategory }) =>
      reportHistory(t, maybeCategory, PeriodType.Month, 2),
    monthsAgo: ({ context: { t }, maybeCategory, interval }) =>
      reportHistory(t, maybeCategory, PeriodType.Month, interval),

    all: ({ context: { t }, maybeCategory }) => reportHistory(t, maybeCategory),
  }),
});
