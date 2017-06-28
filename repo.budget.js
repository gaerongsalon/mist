'use strict';

const db = require('./db');

let all = id =>
  db
    .query('SELECT idx, name, amount, currency FROM budget WHERE id=?', [id])
    .then(b => [...b]);
let load = idx =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE idx=?',
    [idx],
    {}
  );
let find = (id, name) =>
  db.queryOne(
    'SELECT idx, name, amount, currency FROM budget WHERE id=? AND name LIKE ? LIMIT 1',
    [id, `%${name}%`],
    {}
  );
let save = (id, name, amount, currency) =>
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
