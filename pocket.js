'use strict';

const util = require('./util');
const say = require('./say');
const user = require('./repo.user');
const history = require('./repo.history');
const states = require('./states');

// report
const reportHistory = (u, res, days) => {
  const totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
  const remain = u.goal * days - totalUsed;
  const texts = [
    ...res.map(
      e =>
        `[${e.category}] ${e.comment} ${util.withComma(e.amount)}${u.currentCurrency}`
    ),
    `총 ${util.withComma(totalUsed)}${u.currentCurrency} 사용했고, ${util.withComma(remain)}${u.currentCurrency} 남았습니다.`
  ];
  if (remain < 0) {
    texts.push(say.superStupid);
  } else if (remain < u.goal / 4) {
    texts.push(say.stupid);
  }
  return util.merge(texts);
};

const reportByDayDiff = (u, dayDiff) => {
  return history.byDayDiff(u, dayDiff).then(res => reportHistory(u, res, 1));
};
const reportByWeekDiff = (u, weekDiff) => {
  return history.byWeekDiff(u, weekDiff).then(res => reportHistory(u, res, 7));
};
const reportByMonthDiff = (u, monthDiff) => {
  return history
    .byMonthDiff(u, monthDiff)
    .then(res => reportHistory(u, res, 30));
};

const reportSummary = (u, res) => {
  const totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
  return util.merge([
    ...res.map(
      e => `[${e.category}] ${util.withComma(e.amount)}${u.currentCurrency}`
    ),
    `총 ${util.withComma(totalUsed)}${u.currentCurrency} 사용했습니다.`
  ]);
};

// summarize
const summarizeByDayDiff = (u, categoryNameOrAlias, dayDiff) => {
  return history
    .sumOfCategoryByDayDiff(u, u.findCategory(categoryNameOrAlias), dayDiff)
    .then(res => reportSummary(u, res));
};
const summarizeByWeekDiff = (u, categoryNameOrAlias, weekDiff) => {
  return history
    .sumOfCategoryByWeekDiff(u, u.findCategory(categoryNameOrAlias), weekDiff)
    .then(res => reportSummary(u, res));
};
const summarizeByMonthDiff = (u, categoryNameOrAlias, monthDiff) => {
  return history
    .sumOfCategoryByMonthDiff(u, u.findCategory(categoryNameOrAlias), monthDiff)
    .then(res => reportSummary(u, res));
};
const summarizeTotal = (u, categoryNameOrAlias) => {
  return history
    .sumOfCategoryInWholeRange(u, u.findCategory(categoryNameOrAlias))
    .then(res => reportSummary(u, res));
};

// modify history
const startModify = (u, cnt) => {
  return history.recent(u, cnt || 10).then(res => {
    if (res.length == 0) {
      return say.noHistory;
    }
    res.reverse();
    var number = 1;
    const data = res.map(e => {
      return {
        idx: e.idx,
        text: `[${number++}] (${e.category}) ${e.comment} ${util.withComma(e.amount)}${u.currentCurrency}`
      };
    });
    return user
      .save(u.id)
      .state({ name: states.modify, data: data })
      .then(() => {
        return util.merge(data.map(e => e.text));
      });
  });
};

const selectModifyNumber = (u, n) => {
  if (n === undefined) {
    return say.pleaseNumber;
  }
  const target = +n - 1;
  if (n < 0 && n >= u.state.data.length) {
    return say.pleaseNumber;
  }
  return user
    .save(u.id)
    .state({
      name: states.modifySelected,
      n: target,
      data: u.state.data
    })
    .then(() => u.state.data[target].text);
};

const deleteSelectedHistory = u => {
  if (u.state.n === undefined) {
    return say.pleaseNumber;
  }
  const target = u.state.data[+u.state.n].idx;
  if (target === undefined) {
    return user
      .save(u.id)
      .state({ name: states.empty })
      .then(() => say.retryModfiy);
  }
  return history
    .deleteHistory(u.id, target)
    .then(() =>
      user.save(u.id).state({ name: states.modifySelected, idx: u.state.idx })
    )
    .then(() => say.deleted);
};

const cancelModification = u => {
  return user
    .save(u.id)
    .state({ name: states.empty })
    .then(() => say.modificationCompleted);
};

module.exports = {
  reportByDayDiff,
  reportByWeekDiff,
  reportByMonthDiff,
  summarizeByDayDiff,
  summarizeByWeekDiff,
  summarizeByMonthDiff,
  summarizeTotal,
  startModify,
  selectModifyNumber,
  deleteSelectedHistory,
  cancelModification
};
