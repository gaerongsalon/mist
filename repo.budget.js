'use strict';

const db = require('./db');

const all = id =>
  db
    .query('SELECT idx, name, amount, currency FROM budget WHERE id=?', [id])
    .then(b => [...b]);
const load = idx =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE idx=?',
    [idx],
    {}
  );
const find = (id, name) =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE id=? AND name LIKE ? LIMIT 1',
    [id, `%${name}%`],
    {}
  );
const save = (id, name, amount, currency) =>
  db.query(
    'REPLACE INTO budget (id, name, amount, currency) VALUES (?, ?, ?, ?)',
    [id, name, amount, currency.toUpperCase()]
  );

module.exports = {
  all,
  load,
  find,
  save
};
