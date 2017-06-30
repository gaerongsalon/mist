'use strict';

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname + '/.env') });
}

const util = require('./util');
const say = require('./say');
const states = require('./states');
const pocket = require('./pocket');
const user = require('./repo.user');
const category = require('./repo.category');
const history = require('./repo.history');
const budget = require('./repo.budget');

const routes = util.routes(states);

const showCategory = u =>
  (u.categories.length == 0
    ? say.categoryHelp
    : util.merge(u.categories.map(e => `[${e.alias}] ${e.name}`)));

const showBudgets = u =>
  budget
    .all(u.id)
    .then(
      budgets =>
        (budgets.length == 0
          ? say.budgetHelp
          : util.merge(
              budgets.map(
                e => `[${e.name}] ${util.withComma(e.amount)}${e.currency}`
              )
            ))
    );

routes[states.empty]
  // greetings
  .add(/^(?:안녕|하이|스하).*$/, () => say.hello)
  .add(/^(?:스투핏|스뚜삣|스튜핏).*$/, () => say.stupid)
  .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => say.help)
  // report
  .add(/^오늘[!]*$/, pocket.reportToday)
  .add(/^어제[!]*$/, pocket.reportYesterday)
  .add(/^이번\s*주[!]*$/, pocket.reportWeek)
  .add(/^이번\s*달[!]*$/, pocket.reportMonth)
  // summary
  .add(/^(?:누적)\s*(?:오늘)\s*(.*)?$/, pocket.summarizeToday)
  .add(/^(?:누적)\s*(?:어제)\s*(.*)?$/, pocket.summarizeYesterday)
  .add(/^(?:누적)\s*(?:이번\s*주)\s*(.*)?$/, pocket.summarizeWeek)
  .add(/^(?:누적)\s*(?:이번\s*달)\s*(.*)?$/, pocket.summarizeMonth)
  .add(/^(?:누적)\s*(?:전체)?\s*(.*)?$/, pocket.summarizeTotal)
  // property
  .add(/^(?:용돈|목표)\s*(\d+(?:\.\d+)?)(?:\w+)?[!]*$/, (u, amount) =>
    user.save(u.id).goal(amount).then(() => say.yes)
  )
  .add(
    /^(?:용돈|목표)[!]*$/,
    u => `목표는 ${util.withComma(u.goal)}${u.currentCurrency}입니다.`
  )
  .add(
    /^(?:기본)\s*(?:시간)\s*(-?[0-9]+)?$/,
    (u, tz) =>
      (tz
        ? user.save(u.id).tz(+tz).then(() => say.yes)
        : `현재 설정된 시간대는 ${u.tz}입니다.`)
  )
  .add(
    /^(?:기본)\s*(?:화폐)\s*(\w+)?$/,
    (u, currency) =>
      (currency
        ? user.save(u.id).currency(currency.trim()).then(() => say.yes)
        : `현재 설정된 기본 화폐는 ${u.currency}입니다.`)
  )
  // category
  .add(/^(?:카테고리|분류)[!]*$/, showCategory)
  .add(/^(?:카테고리|분류)\s+(\d+)\s+(.+)(?:추가)[!]*$/, (u, alias, name) =>
    category.save(u.id, alias, name.trim()).then(() => say.yes)
  );

// modify history
routes[states.empty]
  .add(
    /^([\d\w]+)\s*(.+)\s+(\d+(?:\.\d+)?)(?:\w+)?[!]*$/,
    (u, categoryNameOrAlias, comment, amount) => {
      const c = u.findCategory(categoryNameOrAlias);
      return c.absent
        ? showCategory(u)
        : history.addHistory(u, c, comment, +amount).then(() => say.yes);
    }
  )
  .add(/^수정\s*(\d+)?(?:개)?[!]*$/, pocket.startModify);

routes[states.modify]
  .add(/^수정\s*(\d+)?(?:개)?[!]*$/, pocket.startModify)
  .add(/^(\d+)(?:번)?[!]*$/, pocket.selectModifyNumber)
  .add(/^(?:ㅂㅂ|그만|취소)[!]*$/, pocket.cancelModification)
  .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => say.modifyHelp);

routes[states.modifySelected]
  .add(/^수정\s*(\d+)?(?:개)?[!]*$/, pocket.startModify)
  .add(/^(\d+)(?:번)?[!]*$/, pocket.selectModifyNumber)
  .add(/^(?:ㅂㅂ|그만|취소)[!]*$/, pocket.cancelModification)
  .add(/^(?:ㅇㅇ|지워|삭제)[!]*$/, pocket.deleteSelectedHistory)
  .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => say.modifySelectedHelp);

// budget
routes[states.empty]
  .add(/^(?:예산\s*도움말)[!?]?/, () => say.budgetHelp)
  .add(
    /^(?:예산)$/,
    u =>
      (u.budget.absent
        ? say.noBudget
        : history.sumOfCategoryInWholeRange(u, category.empty).then(res => {
            const totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
            const remain = u.budget.amount - totalUsed;
            return `현재 예산은 [${u.budget.name}] ${u.budget.amount}${u.budget.currency}이고, 남은 금액은 ${remain}${u.budget.currency}입니다.`;
          }))
  )
  .add(/^(?:예산\s*목록)$/, showBudgets)
  .add(
    /^(?:예산)\s*(?:설정|책정)\s*(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    (u, amount, currency, name) =>
      (name
        ? budget.save(u.id, name.trim(), +amount, currency).then(() => say.yes)
        : say.budgetHelp)
  )
  .add(/^(?:예산)\s*(?:삭제)\s*(.+)$/, (u, name) => {
    return budget.find(u.id, name).then(b => {
      if (b.absent) {
        return say.noBudget;
      }
      return user
        .save(u.id)
        .state({ name: states.deleteBudget, budget: b })
        .then(() => {
          return `예산 [${b.name}]을 정말 삭제할까요? 해당 예산 내의 모든 이력이 삭제됩니다.`;
        });
    });
  })
  .add(/^(?:예산)\s*(?:취소)$/, (u, name) =>
    user.save(u.id).budget(0).then(() => `예산 모드를 초기화합니다.`)
  )
  .add(/^(?:예산)\s*(?:설정)?\s*(.+)$/, (u, name) =>
    budget.find(u.id, name).then(b => {
      if (b.absent) {
        return say.noBudget;
      }
      return user
        .save(u.id)
        .budget(b.idx)
        .then(() => `예산을 [${b.name}]으로 변경합니다.`);
    })
  );

routes[states.deleteBudget]
  .add(/^(?:ㅇㅇ|지워|삭제)[!]*$/, u => {
    return budget
      .remove(u.id, u.state.budget.idx)
      .then(() => user.save(u.id).state({ name: states.empty }))
      .then(() => say.deleted);
  })
  .add(/^(?:ㅂㅂ|ㄴㄴ|아니|취소)[!]*$/, u =>
    user
      .save(u.id)
      .state({ name: states.empty })
      .then(() => say.modificationCompleted)
  );

const handle = (id, text) => {
  console.log(`user[${id}] requests a text[${text}]`);
  return user.load(id).then(u => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`current user is ${u}`);
    }
    const cmd = (text || '').trim();
    const state = u.state && u.state.name ? u.state.name : states.empty;
    const result = routes[state].run(cmd, [u]);
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `result of cmd[${cmd}] in user[${u.id}]'s state[${state}] is result[${result}]`
      );
    }
    return Promise.resolve(result);
  });
};

module.exports = {
  handle
};

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname + '/.env') });

  const id = process.argv[2];
  const text = process.argv[3];
  console.log(`id=[${id}], text=[${text}]`);

  handle(id, text).then(console.log).catch(console.log);
}
