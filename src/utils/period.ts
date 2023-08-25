import { DateTime } from "luxon";
import mem from "mem";

export enum PeriodType {
  Day,
  Week,
  Month,
}

const parseUTCDateTime = mem((str: string) => DateTime.fromISO(str).toUTC());

export const dateBetween = (
  timezoneOffset: number,
  now: DateTime = DateTime.utc()
): {
  [type in PeriodType]: (ago: number) => (date: string) => boolean;
} => ({
  [PeriodType.Day]: (ago) => {
    const baseNow = now.toUTC().plus({ hour: timezoneOffset });
    const startOfDay = baseNow.plus({
      day: -ago,
      hour: -baseNow.hour,
      minute: -baseNow.minute,
      second: -baseNow.second,
      millisecond: -baseNow.millisecond,
    });
    return (date) => {
      const diff = parseUTCDateTime(date)
        .plus({ hour: timezoneOffset })
        .diff(startOfDay, "days");
      return 0 <= diff.days && diff.days <= 1;
    };
  },
  [PeriodType.Week]: (ago) => {
    const baseNow = now.plus({
      week: -ago,
      hour: timezoneOffset,
    });
    return (date) => {
      const target = parseUTCDateTime(date).plus({
        hour: timezoneOffset,
      });
      return (
        baseNow.year === target.year && baseNow.weekNumber === target.weekNumber
      );
    };
  },
  [PeriodType.Month]: (ago) => {
    const baseNow = now.plus({
      month: -ago,
      hour: timezoneOffset,
    });
    return (date) => {
      const target = parseUTCDateTime(date).plus({
        hour: timezoneOffset,
      });
      return baseNow.year === target.year && baseNow.month === target.month;
    };
  },
});

export const periodToDays = (type: PeriodType, value: number) => {
  switch (type) {
    case PeriodType.Day:
      return value;
    case PeriodType.Week:
      return value * 7;
    case PeriodType.Month:
      return value * 30;
  }
};

export const daysBetween = (dates: string[]) => {
  const sorted = dates.sort();
  const begin = parseUTCDateTime(sorted[0]);
  const end = parseUTCDateTime(sorted[sorted.length - 1]);
  return Math.ceil(end.diff(begin, "days").days);
};
