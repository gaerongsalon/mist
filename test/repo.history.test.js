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
      return history.byDayDiff(u, 0);
    });
  });

  it('load yesterday', () => {
    return user.load('test').then(u => {
      return history.byDayDiff(u, 1);
    });
  });

  it('load week', () => {
    return user.load('test').then(u => {
      return history.byWeekDiff(u, 0);
    });
  });

  it('load month', () => {
    return user.load('test').then(u => {
      return history.byMonthDiff(u, 0);
    });
  });

  it('load sum of today', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryByDayDiff(u, { idx: -1 }, 0);
    });
  });

  it('load sum of yesterday', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryByDayDiff(u, { idx: -1 }, 1);
    });
  });

  it('load sum of week', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryByWeekDiff(u, { idx: -1 }, 0);
    });
  });

  it('load sum of month', () => {
    return user.load('test').then(u => {
      return history.sumOfCategoryByMonthDiff(u, { idx: -1 }, 0);
    });
  });

  it('add and load history', () => {
    return user
      .load('test')
      .then(u => {
        return history
          .addHistory(u, { idx: u.categories[0].idx }, 'something', 10)
          .then(() => {
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
