const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname + '/../.env') });
const assert = require('assert');

const user = require('../repo.user');
const history = require('../repo.history');

describe('History module', () => {
  it('load recent', () => {
    return user.load('test').then(u => {
      return history.recent(u, 10);
    });
  });

  it('load today', () => {
    return user.load('test').then(u => {
      return history.today(u);
    });
  });

  it('load yesterday', () => {
    return user.load('test').then(u => {
      return history.yesterday(u);
    });
  });

  it('load week', () => {
    return user.load('test').then(u => {
      return history.week(u);
    });
  });

  it('load month', () => {
    return user.load('test').then(u => {
      return history.month(u);
    });
  });

  it('load sum of today', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryInToday(u, { idx: -1 });
    });
  });

  it('load sum of yesterday', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryInYesterday(u, { idx: -1 });
    });
  });

  it('load sum of week', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryInWeek(u, { idx: -1 });
    });
  });

  it('load sum of month', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryInMonth(u, { idx: -1 });
    });
  });

  it('add and load history', () => {
    return user
      .load('test')
      .then(u => {
        return history.addHistory(u, { idx: 1 }, 'something', 10).then(() => {
          return history.recent(u, 1);
        });
      })
      .then(h => {
        assert.equal(h.length, 1);
      });
  });

  it('delete all histories', () => {
    return user.load('test').then(u => {
      return history.recent(u, 10).then(h => {
        for (let e of h) {
          history.deleteHistory(u.id, e.idx);
        }
      });
    });
  });
});
