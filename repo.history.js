'use strict';

const db = require('./db');

const fields = 'h.idx, c.name AS category, h.comment, h.amount, h.registered';
const sumFields = 'c.name AS category, SUM(h.amount) AS amount';

const from =
  'history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias';
let range = {
  today: offset =>
    `(h.registered >= (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR))`,
  yesterday: offset =>
    `(h.registered BETWEEN (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR - INTERVAL 1 DAY) AND (DATE(NOW() + INTERVAL ${offset} HOUR) - INTERVAL ${offset} HOUR))`,
  week: offset =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR)) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR((NOW() - INTERVAL ${offset} HOUR)))`,
  month: offset =>
    `(YEAR(h.registered)=YEAR((NOW() - INTERVAL ${offset} HOUR)) AND MONTH(h.registered)=MONTH((NOW() - INTERVAL ${offset} HOUR)))`
};
let categoryWhere = idx => `(c.idx = ${idx} OR ${idx} = 0)`;

let recent = (u, cnt) =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? ORDER BY h.registered DESC LIMIT ?`,
    [u.id, cnt]
  );

let today = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.today(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
let yesterday = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.yesterday(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
let week = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.week(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );
let month = u =>
  db.query(
    `SELECT ${fields} FROM ${from} WHERE h.id = ? AND ${range.month(u.tz)} ORDER BY h.registered ASC`,
    [u.id]
  );

let sumOfCategoryInToday = (u, cidx) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.today(u.tz)} AND ${categoryWhere(cidx)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
let sumOfCategoryInYesterday = (u, cidx) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.yesterday(u.tz)} AND ${categoryWhere(cidx)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
let sumOfCategoryInWeek = (u, cidx) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.week(u.tz)} AND ${categoryWhere(cidx)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
let sumOfCategoryInMonth = (u, cidx) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${range.month(u.tz)} AND ${categoryWhere(cidx)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );
let sumOfCategoryInWholeRange = (u, cidx) =>
  db.query(
    `SELECT ${sumFields} FROM ${from} WHERE h.id = ? AND ${categoryWhere(cidx)} GROUP BY c.idx ORDER BY c.idx ASC`,
    [u.id]
  );

let addHistory = (id, category, comment, amount) =>
  db.query(
    'INSERT INTO history (id, category, comment, amount) VALUES (?, ?, ?, ?)',
    [id, category, comment, amount]
  );
let deleteHistory = (id, idx) => {
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
