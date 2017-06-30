'use strict';

const db = require('./db');

const fields = 'h.idx, c.name AS category, h.comment, h.amount, h.registered';
const sumFields = 'c.name AS category, SUM(h.amount) AS amount';

const from = `history h
    INNER JOIN category c ON h.id = c.id AND h.category = c.idx
    INNER JOIN user u ON h.id = u.id AND h.budget_idx = u.current_budget_idx`;
const range = {
  today: offset =>
    `(h.registered >= (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR))`,
  yesterday: offset =>
    `(h.registered BETWEEN (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR - INTERVAL 1 DAY) AND (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR))`,
  week: offset =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR)) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR((NOW() - INTERVAL ${offset} HOUR)))`,
  month: offset =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR)) AND MONTH(h.registered)=MONTH((NOW() - INTERVAL ${offset} HOUR)))`
};
const categoryWhere = c => `(c.idx = ${c.idx} OR ${c.idx} = -1)`;

const recent = (u, cnt) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? ORDER BY h.registered DESC LIMIT ?`,
    [u.id, cnt]
  );

const today = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.today(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
const yesterday = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.yesterday(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
const week = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.week(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
const month = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.month(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );

const sumOfCategoryInToday = (u, c) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.today(u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryInYesterday = (u, c) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.yesterday(u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryInWeek = (u, c) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.week(u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
const sumOfCategoryInMonth = (u, c) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.month(u.tz)} AND ${categoryWhere(c)} GROUP BY c.idx ORDER BY c.idx ASC`,
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
  today,
  yesterday,
  week,
  month,
  sumOfCategoryInToday,
  sumOfCategoryInYesterday,
  sumOfCategoryInWeek,
  sumOfCategoryInMonth,
  sumOfCategoryInWholeRange,
  addHistory,
  deleteHistory
};
