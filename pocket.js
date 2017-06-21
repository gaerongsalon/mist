'use strict';

const db = require('./db.js');

let recent = (id, cnt) => {
  return db.query(
    'SELECT h.idx, c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? ORDER BY h.registered DESC LIMIT ?',
    [id, cnt]
  );
};
let offset = id => {
  return db.queryOne('SELECT offset FROM tz WHERE id = ?', [id], { offset: 9 });
};
let today = id => {
  return offset(id).then(tz => {
    return db.query(
      `SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND h.registered >= (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR) ORDER BY h.registered ASC`,
      [id]
    );
  });
};
let yesterday = id => {
  return offset(id).then(tz => {
    return db.query(
      `SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND h.registered BETWEEN (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR - INTERVAL 1 DAY) AND (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR) ORDER BY h.registered ASC`,
      [id]
    );
  });
};
let week = id => {
  return offset(id).then(tz => {
    return db.query(
      `SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR((NOW() - INTERVAL ${tz.offset} HOUR)) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR((NOW() - INTERVAL ${tz.offset} HOUR)) ORDER BY h.registered ASC`,
      [id]
    );
  });
};
let month = id => {
  return offset(id).then(tz => {
    return db.query(
      `SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR((NOW() - INTERVAL ${tz.offset} HOUR)) AND MONTH(h.registered)=MONTH((NOW() - INTERVAL ${tz.offset} HOUR)) ORDER BY h.registered ASC`,
      [id]
    );
  });
};

let sumOfCategoryInToday = (id, categoryIdx) => {
  return Promise.all([offset(id)]).then(res => {
    let tz = res[0];
    return db.query(
      `SELECT c.name AS category, SUM(h.amount) AS amount FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND h.registered >= (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR) AND (c.idx = ? OR ? = 0) GROUP BY c.idx ORDER BY c.idx ASC`,
      [id, categoryIdx, categoryIdx]
    );
  });
};
let sumOfCategoryInYesterday = (id, categoryIdx) => {
  return Promise.all([offset(id)]).then(res => {
    let tz = res[0];
    return db.query(
      `SELECT c.name AS category, SUM(h.amount) AS amount FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND h.registered BETWEEN (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR - INTERVAL 1 DAY) AND (DATE(NOW() + INTERVAL ${tz.offset} HOUR) - INTERVAL ${tz.offset} HOUR) AND (c.idx = ? OR ? = 0) GROUP BY c.idx ORDER BY c.idx ASC`,
      [id, categoryIdx, categoryIdx]
    );
  });
};
let sumOfCategoryInWeek = (id, categoryIdx) => {
  return Promise.all([offset(id)]).then(res => {
    let tz = res[0];
    return db.query(
      `SELECT c.name AS category, SUM(h.amount) AS amount FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR((NOW() - INTERVAL ${tz.offset} HOUR)) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR((NOW() - INTERVAL ${tz.offset} HOUR)) AND (c.idx = ? OR ? = 0) GROUP BY c.idx ORDER BY c.idx ASC`,
      [id, categoryIdx, categoryIdx]
    );
  });
};
let sumOfCategoryInMonth = (id, categoryIdx) => {
  return Promise.all([offset(id)]).then(res => {
    let tz = res[0];
    return db.query(
      `SELECT c.name AS category, SUM(h.amount) AS amount FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR((NOW() - INTERVAL ${tz.offset} HOUR)) AND MONTH(h.registered)=MONTH((NOW() - INTERVAL ${tz.offset} HOUR)) AND (c.idx = ? OR ? = 0) GROUP BY c.idx ORDER BY c.idx ASC`,
      [id, categoryIdx, categoryIdx]
    );
  });
};
let sumOfCategoryInWholeRange = (id, categoryIdx) => {
  return db.query(
    `SELECT c.name AS category, SUM(h.amount) AS amount FROM payment_history h INNER JOIN category c ON h.id = c.id AND h.category = c.alias WHERE h.id = ? AND (c.idx = ? OR ? = 0) GROUP BY c.idx ORDER BY c.idx ASC`,
    [id, categoryIdx, categoryIdx]
  );
};

let goal = id => {
  return db.queryOne('SELECT amount FROM goal WHERE id = ?', [id], {
    amount: 0
  });
};
let setGoal = (id, amount) => {
  return db.query('REPLACE INTO goal (id, amount) VALUES (?, ?)', [id, amount]);
};

let addHistory = (id, category, comment, amount) => {
  return db.query(
    'INSERT INTO payment_history (id, category, comment, amount) VALUES (?, ?, ?, ?)',
    [id, category, comment, amount]
  );
};
let deleteHistory = (id, idx) => {
  return db.query('DELETE FROM payment_history WHERE id = ? AND idx = ?', [
    id,
    idx
  ]);
};

let showCategory = id => {
  return db.query('SELECT alias, name FROM category WHERE id = ?', [id]);
};
let addCategory = (id, alias, name) => {
  return db.query('REPLACE INTO category (id, alias, name) VALUES (?, ?, ?)', [
    id,
    alias,
    name
  ]);
};
let findCategoryIdx = (id, nameOrAlias) => {
  if (nameOrAlias === undefined) {
    return Promise.resolve({ idx: 0 });
  }
  return db.queryOne(
    'SELECT idx FROM category WHERE id = ? AND (name LIKE ? OR alias = ?)',
    [id, `%${nameOrAlias}%`, nameOrAlias],
    { idx: -1 }
  );
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
  goal,
  setGoal,
  addHistory,
  deleteHistory,
  showCategory,
  addCategory,
  findCategoryIdx
};
