'use strict';

const db = require('./db');

const all = id =>
  db.query('SELECT idx, name, amount, currency FROM budget WHERE id=?', [id]);
const load = idx =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE idx=?',
    [idx],
    { idx: 0, absent: true }
  );
const find = (id, name) =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE id=? AND name LIKE ? LIMIT 1',
    [id, `%${name}%`],
    { idx: 0, absent: true }
  );
const save = (id, name, amount, currency) =>
  db.query(
    'REPLACE INTO budget (id, name, amount, currency) VALUES (?, ?, ?, ?)',
    [id, name, amount, currency.toUpperCase()]
  );
const remove = (id, idx) =>
  db
    .query('DELETE FROM budget WHERE id=? AND idx=?', [id, idx])
    .then(() =>
      db.query('DELETE FROM history WHERE id=? AND budget_idx=?', [id, idx])
    );

module.exports = {
  all,
  load,
  find,
  save,
  remove
};
