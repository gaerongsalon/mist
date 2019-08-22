import { DateTime } from "luxon";
import mem from "mem";

export enum PeriodType {
  Day,
  Week,
  Month
}

const parseUTCDateTime = mem((str: string) => DateTime.fromISO(str).toUTC());
const utcNow = () => new DateTime().toUTC();

export const dateBetween = (
  timezoneOffset: number
): {
  [type in PeriodType]: (ago: number) => (date: string) => boolean;
} => ({
  [PeriodType.Day]: ago => {
    const endDate = utcNow().plus({ day: -ago, hour: timezoneOffset });
    return date => {
      const diff = endDate.diff(
        parseUTCDateTime(date).plus({ hour: timezoneOffset }),
        "days"
      );
      return 0 <= diff.days && diff.days <= 1;
    };
  },
  [PeriodType.Week]: ago => {
    const base = utcNow().plus({ week: -ago, hour: timezoneOffset });
    return date => {
      const target = parseUTCDateTime(date).plus({
        hour: timezoneOffset
      });
      return base.year === target.year && base.weekNumber === target.weekNumber;
    };
  },
  [PeriodType.Month]: ago => {
    const base = utcNow().plus({ month: -ago, hour: timezoneOffset });
    return date => {
      const target = parseUTCDateTime(date).plus({
        hour: timezoneOffset
      });
      return base.year === target.year && base.month === target.month;
    };
  }
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
