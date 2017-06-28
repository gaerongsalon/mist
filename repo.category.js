'use strict';

const db = require('./db');

let all = id =>
  db
    .query('SELECT idx, alias, name FROM category WHERE id=?', [id])
    .then(c => [...c]);
let save = (id, alias, name) =>
  db.query('REPLACE INTO category (id, alias, name) VALUES (?, ?, ?)', [
    id,
    alias,
    name
  ]);

let find = (all, nameOrAlias) =>
  all.filter(e => e.name.indexOf(nameOrAlias) >= 0 || e.alias == nameOrAlias)[
    0
  ];
let findInDb = (id, nameOrAlias) =>
  db.queryOne(
    'SELECT idx, alias, name FROM category WHERE id=? AND (name LIKE ? OR alias=?) LIMIT 1',
    [id, `%${nameOrAlias}%`, nameOrAlias],
    { idx: -1 }
  );

module.exports = {
  all,
  find,
  save
};
