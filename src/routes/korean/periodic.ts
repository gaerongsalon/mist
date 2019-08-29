import { PeriodicCommand } from "../../commands/periodic";
import tk from "../../toolkit";

export const parseCategory = ([maybeCategory]: string[]) => ({
  maybeCategory: (maybeCategory || "").trim()
});

export const parseIntervalWithCategory = ([
  maybeInterval,
  maybeCategory
]: string[]) => ({
  interval: +maybeInterval,
  maybeCategory: (maybeCategory || "").trim()
});

export const newPeriodicRoutes = (prefix: string = "") =>
  tk.routes<PeriodicCommand>({
    today: {
      regex: new RegExp("^" + prefix + "(?:오늘)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    yesterday: {
      regex: new RegExp("^" + prefix + "(?:어제)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    daysAgo2: {
      regex: new RegExp("^" + prefix + "(?:그제)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    daysAgo3: {
      regex: new RegExp("^" + prefix + "(?:그그제)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    daysAgo: {
      regex: new RegExp("^" + prefix + "([0-9]+)(?:일)\\s*(?:전)\\s*(.*)[!]*$"),
      parse: parseIntervalWithCategory
    },

    thisWeek: {
      regex: new RegExp("^" + prefix + "(?:이번)\\s*(?:주)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    lastWeek: {
      regex: new RegExp("^" + prefix + "(?:지난)\\s*(?:주)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    weeksAgo2: {
      regex: new RegExp("^" + prefix + "(?:지지난)\\s*(?:주)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    weeksAgo: {
      regex: new RegExp("^" + prefix + "([0-9]+)(?:주)\\s*(?:전)\\s*(.*)[!]*$"),
      parse: parseIntervalWithCategory
    },

    thisMonth: {
      regex: new RegExp("^" + prefix + "(?:이번)\\s*(?:달)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    lastMonth: {
      regex: new RegExp("^" + prefix + "(?:지난)\\s*(?:달)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    monthsAgo2: {
      regex: new RegExp("^" + prefix + "(?:지지난)\\s*(?:달)\\s*(.*)[!]*$"),
      parse: parseCategory
    },
    monthsAgo: {
      regex: new RegExp("^" + prefix + "([0-9]+)(?:달)\\s*(?:전)\\s*(.*)[!]*$"),
      parse: parseIntervalWithCategory
    },

    all: {
      regex: new RegExp("^" + prefix + "(?:전체|모든)\\s*(.*)[!]*$"),
      parse: parseCategory
    }
  });
