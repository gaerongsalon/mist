const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname + '/../.env') });
const assert = require('assert');

const user = require('../repo.user');

describe('User module', () => {
  it('load default', () => {
    return user.load('test').then(u => {
      assert.notEqual(u, null);
      assert.notEqual(u, undefined);
      return u;
    });
  });

  it('save goal', () => {
    return user
      .save('test')
      .goal(1000)
      .then(() => {
        return user.load('test');
      })
      .then(u => {
        assert.equal(u.goal, 1000);
      });
  });

  it('save tz', () => {
    return user
      .save('test')
      .tz(-1)
      .then(() => {
        return user.load('test');
      })
      .then(u => {
        assert.equal(u.tz, -1);
      });
  });

  it('save currency', () => {
    return user
      .save('test')
      .currency('eur')
      .then(() => {
        return user.load('test');
      })
      .then(u => {
        assert.equal(u.currency, 'EUR');
      });
  });

  it('save korea currency', () => {
    return user
      .save('test')
      .currency('원')
      .then(() => {
        return user.load('test');
      })
      .then(u => {
        assert.equal(u.currency, '원');
      });
  });

  it('save state', () => {
    return user
      .save('test')
      .state({ name: 'empty', value: ['a', 'b', 'c'] })
      .then(() => {
        return user.load('test');
      })
      .then(u => {
        assert.equal(u.state.name, 'empty');
        assert.equal(u.state.value.length, 3);
        assert.equal(u.state.value[0], 'a');
        assert.equal(u.state.value[1], 'b');
        assert.equal(u.state.value[2], 'c');
      });
  });
});
