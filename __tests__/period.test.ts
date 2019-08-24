import { DateTime } from "luxon";
import { dateBetween, PeriodType } from "../src/utils/period";

const data = [
  "2019-08-20T22:07:48.766Z",
  "2019-08-21T08:35:33.189Z",
  "2019-08-21T09:03:45.622Z",
  "2019-08-21T09:35:51.170Z",
  "2019-08-21T10:14:17.142Z",
  "2019-08-21T11:36:26.848Z",
  "2019-08-22T08:05:45.479Z",
  "2019-08-22T12:26:52.244Z",
  "2019-08-22T12:31:05.605Z",
  "2019-08-22T18:37:16.906Z",
  "2019-08-23T12:38:01.102Z",
  "2019-08-23T13:18:11.775Z",
  "2019-08-23T13:27:42.985Z"
];
const timezoneOffset = 2;

test("day-today", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Day](0)
  );
  expect(result.length).toBe(3);
});

test("day-today-edge-in", () => {
  const todayYet = DateTime.fromISO("2019-08-23T21:59:59.999Z");
  const result = data.filter(
    dateBetween(timezoneOffset, todayYet)[PeriodType.Day](0)
  );
  expect(result.length).toBe(3);
});

test("day-today-edge-out", () => {
  const tomorrow = DateTime.fromISO("2019-08-23T22:00:00.000Z");
  const empty = data.filter(
    dateBetween(timezoneOffset, tomorrow)[PeriodType.Day](0)
  );
  expect(empty.length).toBe(0);
});

test("day-yesterday", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Day](1)
  );
  expect(result.length).toBe(4);
});

test("the-day-before-yesterday", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Day](2)
  );
  expect(result.length).toBe(6);
});

test("week-this-week", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Week](0)
  );
  expect(result.length).toBe(13);
});

test("week-last-week", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Week](1)
  );
  expect(result.length).toBe(0);
});

test("month-this-month", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Month](0)
  );
  expect(result.length).toBe(13);
});

test("month-last-month", () => {
  const now = DateTime.fromISO("2019-08-23T15:00:00.000Z");
  const result = data.filter(
    dateBetween(timezoneOffset, now)[PeriodType.Month](1)
  );
  expect(result.length).toBe(0);
});
