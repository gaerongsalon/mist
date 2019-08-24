import { UserEO, UserStateName } from "../repository";
import says from "../says";
import { periodToDays, PeriodType } from "../utils/period";
import { PartialRouteMap, Router } from "./router";

const reportHistory = async (
  eo: UserEO,
  type: PeriodType,
  ago: number,
  maybeCategoryNameOrAlias: string
) => {
  const maybeCategory = eo.category.findByNameOrAlias(maybeCategoryNameOrAlias);
  const histories = eo.history.findPast({
    categoryIndex: maybeCategory ? maybeCategory.index : -1,
    type,
    ago
  });
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
  type?: PeriodType,
  ago?: number,
  maybeCategoryNameOrAlias?: string
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
    .add(/^(?:오늘)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Day, 0, maybeCategory)
    )
    .add(/^(?:어제)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Day, 1, maybeCategory)
    )
    .add(/^(?:그제)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Day, 2, maybeCategory)
    )
    .add(/^(?:그그제)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Day, 3, maybeCategory)
    )
    .add(
      /^([0-9]+)(?:일)\s*(?:전)\s*(.*)[!]*$/,
      (eo, maybeDayDiff, maybeCategory) =>
        reportHistory(eo, PeriodType.Day, +maybeDayDiff, maybeCategory)
    )
    .add(/^(?:이번)\s*(?:주)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Week, 0, maybeCategory)
    )
    .add(/^(?:지난)\s*(?:주)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Week, 1, maybeCategory)
    )
    .add(/^(?:지지난)\s*(?:주)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Week, 2, maybeCategory)
    )
    .add(
      /^([0-9]+)(?:주)\s*(?:전)\s*(.*)[!]*$/,
      (eo, maybeWeekDiff, maybeCategory) =>
        reportHistory(eo, PeriodType.Week, +maybeWeekDiff, maybeCategory)
    )
    .add(/^(?:이번)\s*(?:달)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Month, 0, maybeCategory)
    )
    .add(/^(?:지난)\s*(?:달)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Month, 1, maybeCategory)
    )
    .add(/^(?:지지난)\s*(?:달)\s*(.*)[!]*$/, (eo, maybeCategory) =>
      reportHistory(eo, PeriodType.Month, 2, maybeCategory)
    )
    .add(
      /^([0-9]+)(?:달)\s*(?:전)\s*(.*)[!]*$/,
      (eo, maybeMonthDiff, maybeCategory) =>
        reportHistory(eo, PeriodType.Month, +maybeMonthDiff, maybeCategory)
    )
    // summary
    .add(/^(?:누적)\s*(?:오늘)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Day, 0, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:어제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Day, 1, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:그제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Day, 2, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:그그제)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Day, 3, maybeCategory)
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:일\s*전)\s*(.*)?$/,
      (eo, maybeDayDiff, maybeCategory) =>
        reportSummary(eo, PeriodType.Day, +maybeDayDiff, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:이번\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Week, 0, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:이번\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Month, 0, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:지난\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Week, 1, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:지난\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Month, 1, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:지지난\s*주)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Week, 2, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:지지난\s*달)\s*(.*)?$/, (eo, maybeCategory) =>
      reportSummary(eo, PeriodType.Month, 2, maybeCategory)
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:주\s*전)\s*(.*)?$/,
      (eo, maybeWeekDiff, maybeCategory) =>
        reportSummary(eo, PeriodType.Week, +maybeWeekDiff, maybeCategory)
    )
    .add(
      /^(?:누적)\s*([0-9]+)(?:달\s*전)\s*(.*)?$/,
      (eo, maybeMonthDiff, maybeCategory) =>
        reportSummary(eo, PeriodType.Month, +maybeMonthDiff, maybeCategory)
    )
    .add(/^(?:누적)\s*(?:전체)?\s*(?:.*)?$/, eo => reportSummary(eo))
};

export default routes;
