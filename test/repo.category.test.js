const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname + '/../.env') });
const assert = require('assert');

const user = require('../repo.user');
const category = require('../repo.category');

describe('Category module', () => {
  it('load default', () => {
    return category.all('test').then(b => {
      assert.notEqual(b, null);
    });
  });

  it('save and load from user', () => {
    return category.save('test', 1, 'food').then(() => {
      return user.load('test').then(u => {
        assert.notEqual(u.categories, null);
      });
    });
  });

  it('find category from user', () => {
    return user.load('test').then(u => {
      assert.equal(category.find(u.categories, 1).name, 'food');
      assert.equal(category.find(u.categories, 'fo').alias, 1);
    });
  });
});
