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

const reportToday = u => {
  return history.today(u).then(res => reportHistory(u, res, 1));
};
const reportYesterday = u => {
  return history.yesterday(u).then(res => reportHistory(u, res, 1));
};
const reportWeek = u => {
  return history.week(u).then(res => reportHistory(u, res, 7));
};
const reportMonth = u => {
  return history.month(u).then(res => reportHistory(u, res, 30));
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
const summarizeToday = (u, categoryNameOrAlias) => {
  return history
    .sumOfCategoryInToday(u, u.findCategory(categoryNameOrAlias))
    .then(res => reportSummary(u, res));
};
const summarizeYesterday = (u, categoryNameOrAlias) => {
  return history
    .sumOfCategoryInYesterday(u, u.findCategory(categoryNameOrAlias))
    .then(res => reportSummary(u, res));
};
const summarizeWeek = (u, categoryNameOrAlias) => {
  return history
    .sumOfCategoryInWeek(u, u.findCategory(categoryNameOrAlias))
    .then(res => reportSummary(u, res));
};
const summarizeMonth = (u, categoryNameOrAlias) => {
  return history
    .sumOfCategoryInMonth(u, u.findCategory(categoryNameOrAlias))
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
  reportToday,
  reportYesterday,
  reportWeek,
  reportMonth,
  summarizeToday,
  summarizeYesterday,
  summarizeWeek,
  summarizeMonth,
  summarizeTotal,
  startModify,
  selectModifyNumber,
  deleteSelectedHistory,
  cancelModification
};
