'use strict';

const db = require('./db');

const empty = { idx: -1, absent: true };
const all = id =>
  db
    .query('SELECT idx, alias, name FROM category WHERE id=?', [id])
    .then(c => [...c]);
const save = (id, alias, name) =>
  db.query('REPLACE INTO category (id, alias, name) VALUES (?, ?, ?)', [
    id,
    alias,
    name
  ]);

const find = (all, nameOrAlias) =>
  all.filter(e => e.name.indexOf(nameOrAlias) >= 0 || e.alias == nameOrAlias)[
    0
  ] || empty;
const findInDb = (id, nameOrAlias) =>
  db.queryOne(
    'SELECT idx, alias, name FROM category WHERE id=? AND (name LIKE ? OR alias=?) LIMIT 1',
    [id, `%${nameOrAlias}%`, nameOrAlias],
    empty
  );

module.exports = {
  empty,
  all,
  save,
  find,
  findInDb
};
