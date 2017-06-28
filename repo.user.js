'use strict';

const db = require('./db');
const budget = require('./repo.budget');
const category = require('./repo.category');

let load = id =>
  db
    .queryOne(
      'SELECT id, goal, tz, current_budget_idx, currency, state FROM user WHERE id=?',
      [id],
      { id }
    )
    .then(u => {
      if (u.state === undefined) {
        u.state = { name: 'empty' };
      } else {
        u.state = JSON.parse(u.state);
      }
      let budget_idx = u.current_budget_idx || 0;
      return Promise.all([
        budget_idx > 0 ? budget.load(budget_idx) : Promise.resolve(null),
        category.all(id)
      ]).then(res => {
        u.budget = res[0];
        u.categories = res[1];
        return u;
      });
    });
let save = id => {
  let goal = amount =>
    db.query(
      'INSERT INTO user (id, goal) VALUES (?, ?) ON DUPLICATE KEY UPDATE goal=VALUES(goal)',
      [id, amount]
    );
  let tz = offset =>
    db.query(
      'INSERT INTO user (id, tz) VALUES (?, ?) ON DUPLICATE KEY UPDATE tz=VALUES(tz)',
      [id, offset || 9]
    );
  let currency = value =>
    db.query(
      'INSERT INTO user (id, currency) VALUES (?, ?) ON DUPLICATE KEY UPDATE currency=VALUES(currency)',
      [id, (value || '원').toUpperCase()]
    );
  let budget = idx =>
    db.query(
      'INSERT INTO user (id, current_budget_idx) VALUES (?, ?) ON DUPLICATE KEY UPDATE current_budget_idx=VALUES(current_budget_idx)',
      [id, idx]
    );
  let state = obj =>
    db.query(
      'INSERT INTO user (id, state) VALUES (?, ?) ON DUPLICATE KEY UPDATE state=VALUES(state)',
      [id, JSON.stringify(obj || { name: 'empty' })]
    );
  return { goal, tz, currency, budget, state };
};

module.exports = {
  load,
  save
};
