'use strict';

const db = require('./db.js');

let recent = (id, cnt) => {
  return db.query(
    'SELECT h.idx, c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.category = c.alias WHERE h.id = ? ORDER BY h.registered DESC LIMIT ?',
    [id, cnt]
  );
};
let today = id => {
  return db.query(
    'SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.category = c.alias WHERE h.id = ? AND h.registered >= CURDATE() ORDER BY h.registered ASC',
    [id]
  );
};
let week = id => {
  return db.query(
    'SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR(NOW()) AND WEEKOFYEAR(h.registered)=WEEKOFYEAR(NOW()) ORDER BY h.registered ASC',
    [id]
  );
};
let month = id => {
  return db.query(
    'SELECT c.name AS category, h.comment, h.amount, h.registered FROM payment_history h INNER JOIN category c ON h.category = c.alias WHERE h.id = ? AND YEAR(h.registered)=YEAR(NOW()) AND MONTH(h.registered)=MONTH(NOW()) ORDER BY h.registered ASC',
    [id]
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

module.exports = {
  recent,
  today,
  week,
  month,
  goal,
  setGoal,
  addHistory,
  deleteHistory,
  showCategory,
  addCategory
};
