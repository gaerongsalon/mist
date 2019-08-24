import { UserEO, UserStateName } from "../repository";
import says from "../says";
import { periodToDays, PeriodType } from "../utils/period";
import { PartialRouteMap, Router } from "./router";

const reportHistory = async (eo: UserEO, type: PeriodType, ago: number) => {
  const histories = eo.history.findPast({ type, ago });
  const totalUsed = histories.map(e => e.amount).reduce((a, b) => a + b, 0);
  const remain = eo.value.goal * periodToDays(type, 1) - totalUsed;

  const { userCurrency } = eo;
  const texts = [
    ...histories.map(e =>
      says.reportHistoryItem({
        categoryName: eo.category.findNameByIndex(e.categoryIndex),
        comment: e.comment,
        amount: e.amount,
        currency: eo.getCurrency(e.budgetIndex)
      })
    ),
    says.reportHistoryEnd({ totalUsed, remain, currency: userCurrency })
  ];
  if (remain < 0) {
    texts.push(says.superWarning());
  } else if (remain < eo.value.goal / 4) {
    texts.push(says.warning());
  }
  return texts.join("\n");
};

const reportSummary = async (
  eo: UserEO,
  maybeCategoryNameOrAlias?: string,
  type?: PeriodType,
  ago?: number
) => {
  const maybeCategory = eo.category.findByNameOrAlias(maybeCategoryNameOrAlias);
  const aggregated = eo.history.aggregatePast({
    categoryIndex: maybeCategory ? maybeCategory.index : -1,
    type,
    ago
  });
  const totalUsed = aggregated.map(e => e.amount).reduce((a, b) => a + b, 0);
  const { userCurrency } = eo;
  return [
    ...aggregated.map(e =>
      says.reportSummaryItem({
        categoryName: eo.category.findNameByIndex(e.categoryIndex),
        amount: e.amount,
        currency: userCurrency
      })
    ),
    says.reportSummaryEnd({ totalUsed, currency: userCurrency })
  ].join("\n");
};

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    // report
    .add(/^오늘[!]*$/, eo => reportHistory(eo, PeriodType.Day, 0))
    .add(/^어제[!]*$/, eo => reportHistory(eo, PeriodType.Day, 1))
    .add(/^그제[!]*$/, eo => reportHistory(eo, PeriodType.Day, 2))
    .add(/^그그제[!]*$/, eo => reportHistory(eo, PeriodType.Day, 3))
    .add(/^([0-9]+)일\s*전[!]*$/, (eo, maybeDayDiff) =>
      reportHistory(eo, PeriodType.Day, +maybeDayDiff)
    )
    .add(/^이번\s*주[!]*$/, eo => reportHistory(eo, PeriodType.Week, 0))
    .add(/^이번\s*달[!]*$/, eo => reportHistory(eo, PeriodType.Month, 0))
    .add(/^지난\s*주[!]*$/, eo => reportHistory(eo, PeriodType.Week, 1))
    .add(/^지난\s*달[!]*$/, eo => reportHistory(eo, PeriodType.Month, 1))
    .add(/^지지난\s*주[!]*$/, eo => reportHistory(eo, PeriodType.Week, 2))
    .add(/^지지난\s*달[!]*$/, eo => reportHistory(eo, PeriodType.Month, 2))
    .add(/^([0-9]+)주\s*전[!]*$/, (eo, maybeWeekDiff) =>
      reportHistory(eo, PeriodType.Week, +maybeWeekDiff)
    )
    .add(/^([0-9]+)달\s*전[!]*$/, (eo, maybeMonthDiff) =>
      reportHistory(eo, PeriodType.Month, +maybeMonthDiff)
    )
    // summary
    .add(/^(?:누적)\s*(?:오늘)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Day, 0)
    )
    .add(/^(?:누적)\s*(?:어제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Day, 1)
    )
    .add(/^(?:누적)\s*(?:그제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Day, 2)
    )
    .add(/^(?:누적)\s*(?:그그제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Day, 3)
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:일\s*전)\s*(.*)?$/,
      (eo, maybeDayDiff, maybeCategory) =>
        reportSummary(
          eo,
          (maybeCategory || "").trim(),
          PeriodType.Day,
          +maybeDayDiff
        )
    )
    .add(/^(?:누적)\s*(?:이번\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Week, 0)
    )
    .add(/^(?:누적)\s*(?:이번\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Month, 0)
    )
    .add(/^(?:누적)\s*(?:지난\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Week, 1)
    )
    .add(/^(?:누적)\s*(?:지난\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Month, 1)
    )
    .add(/^(?:누적)\s*(?:지지난\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Week, 2)
    )
    .add(/^(?:누적)\s*(?:지지난\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, (maybeCategory || "").trim(), PeriodType.Month, 2)
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:주\s*전)\s*(.*)?$/,
      (eo, maybeWeekDiff, maybeCategory) =>
        reportSummary(
          eo,
          (maybeCategory || "").trim(),
          PeriodType.Week,
          +maybeWeekDiff
        )
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:달\s*전)\s*(.*)?$/,
      (eo, maybeMonthDiff, maybeCategory) =>
        reportSummary(
          eo,
          (maybeCategory || "").trim(),
          PeriodType.Month,
          +maybeMonthDiff
        )
    )
    .add(/^(?:누적)\s*(?:전체)?\s*(?:.*)?$/, eo => reportSummary(eo))
};

export default routes;
