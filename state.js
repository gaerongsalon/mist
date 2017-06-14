'use strict';

const db = require('./db.js');

let load = id => {
  return db
    .query('SELECT state FROM state WHERE id=?', [id])
    .then(res => {
      const s = res[0];
      if (s === undefined || s.state === undefined) {
        return {};
      }
      return JSON.parse(s.state);
    })
    .catch(console.log);
};

let save = (id, state) => {
  return db
    .query('REPLACE INTO state (id, state) VALUES (?, ?)', [
      id,
      JSON.stringify(state)
    ])
    .catch(console.log);
};

module.exports = {
  load,
  save
};
