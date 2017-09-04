'use strict';

const db = require('./db');

const fields = 'h.idx, c.name AS category, h.comment, h.amount, h.registered';
const sumFields = 'c.name AS category, SUM(h.amount) AS amount';

const from = `history h
    INNER JOIN category c ON h.id = c.id AND h.category = c.idx
    INNER JOIN user u ON h.id = u.id AND h.budget_idx = u.current_budget_idx`;
const range = {
  byDayDiff: (dayDiff, offset) =>
    `(h.registered BETWEEN (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR - INTERVAL ${dayDiff + 1} DAY) AND (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR - INTERVAL ${dayDiff} DAY))`,
  byWeekDiff: (weekDiff, offset) =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR - INTERVAL ${weekDiff} WEEK)) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR((NOW() - INTERVAL ${offset} HOUR - INTERVAL ${weekDiff} WEEK)))`,
  byMonthDiff: (monthDiff, offset) =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR - INTERVAL ${monthDiff} MONTH)) AND MONTH(h.registered)=MONTH((NOW() - INTERVAL ${offset} HOUR - INTERVAL ${monthDiff} MONTH)))`
};
const categoryWhere = c => `(c.idx = ${c.idx} OR ${c.idx} = -1)`;

const recent = (u, cnt) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? ORDER BY h.registered DESC LIMIT ?`,
    [u.id, cnt]
  );

const byDayDiff = (u, dayDiff) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.byDayDiff(dayDiff, u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
const byWeekDiff = (u, weekDiff) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.byWeekDiff(weekDiff, u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
const byMonthDiff = (u, monthDiff) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.byMonthDiff(monthDiff, u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );

const sumOfCategoryByDayDiff = (u, c, dayDiff) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.byDayDiff(dayDiff, u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryByWeekDiff = (u, c, weekDiff) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.byWeekDiff(weekDiff, u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryByMonthDiff = (u, c, monthDiff) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.byMonthDiff(monthDiff, u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryInWholeRange = (u, c) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );

const addHistory = (u, c, comment, amount) =>
  db.query(
    'INSERT INTO history (id, budget_idx, category, comment, amount, currency) VALUES (?, ?, ?, ?, ?, ?)',
    [u.id, u.budget.idx, c.idx, comment, amount, u.currentCurrency]
  );
const deleteHistory = (id, idx) => {
  return db.query('DELETE FROM history WHERE id = ? AND idx = ?', [id, idx]);
};

module.exports = {
  recent,
  byDayDiff,
  byWeekDiff,
  byMonthDiff,
  sumOfCategoryByDayDiff,
  sumOfCategoryByWeekDiff,
  sumOfCategoryByMonthDiff,
  sumOfCategoryInWholeRange,
  addHistory,
  deleteHistory
};
