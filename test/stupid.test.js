const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname + '/../.env') });
const assert = require('assert');

const stupid = require('../stupid');

describe('Stupid module', () => {
  it('say hello', () => {
    return stupid.handle('itest', '안녕').then(msg => {
      console.log(msg);
      assert.notEqual(msg, null);
    });
  });

  it('show recent', () => {
    return stupid.handle('itest', '수정').then(msg => {
      console.log(msg);
      assert.notEqual(msg, null);
      return stupid.handle('itest', '그만');
    });
  });

  it('show goal', () => {
    return stupid.handle('itest', '목표').then(msg => {
      console.log(msg);
      assert.notEqual(msg, null);
    });
  });

  it('set and confirm currency', () => {
    return stupid.handle('itest', '기본 화폐 CHF').then(msg => {
      return stupid.handle('itest', '기본 화폐').then(msg => {
        console.log(msg);
        assert.equal(msg, '현재 설정된 기본 화폐는 CHF입니다.');
      });
    });
  });

  it('set and confirm tz', () => {
    return stupid.handle('itest', '기본 시간 1').then(msg => {
      return stupid.handle('itest', '기본 시간').then(msg => {
        console.log(msg);
        assert.equal(msg, '현재 설정된 시간대는 1입니다.');
      });
    });
  });

  it('set and confirm goal', () => {
    return stupid.handle('itest', '목표 1000.17').then(msg => {
      return stupid.handle('itest', '목표').then(msg => {
        console.log(msg);
        assert.equal(msg, '목표는 1,000.17CHF입니다.');
      });
    });
  });

  it('show today', () => {
    return stupid.handle('itest', '오늘').then(msg => {
      console.log(msg);
      assert.notEqual(msg, null);
    });
  });

  it('add history and show today', () => {
    return stupid.handle('itest', '1 pizza 342.12').then(msg => {
      console.log(msg);
      return stupid.handle('itest', '오늘').then(msg => {
        console.log(msg);
        assert.notEqual(msg, null);
      });
    });
  });
});
