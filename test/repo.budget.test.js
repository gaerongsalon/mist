const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname + '/../.env') });
const assert = require('assert');

const user = require('../repo.user');
const budget = require('../repo.budget');

describe('Budget module', () => {
  it('load default', () => {
    return budget.all('test').then(b => {
      assert.notEqual(b, null);
    });
  });

  it('save and load from user', () => {
    return budget
      .save('test', 'swiss', 1100, 'chf')
      .then(r => {
        return user.save('test').budget(r.insertId);
      })
      .then(() => {
        return user.load('test').then(u => {
          assert.notEqual(u.budget, null);
        });
      });
  });

  it('insert and find', () => {
    return budget.save('test', 'germany', 1000, 'eur').then(r => {
      return budget.find('test', 'ger').then(b => {
        assert.equal(b.idx, r.insertId);
      });
    });
  });
});
