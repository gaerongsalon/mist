'use strict';

const pocket = require('./pocket.js');
const state = require('./state.js');

const commandParsers = {
  hello: /^(?:안녕|하이|스하).*$/,
  stupid: /^(?:스투핏|스뚜삣|스튜핏).*$/,
  modify: /^수정\s*(\d+)?(?:개)?[!]*$/,
  modifyNumber: /^(\d+)(?:번)?[!]*$/,
  modifyDelete: /^(?:ㅇㅇ|지워|삭제)[!]*$/,
  modifyCancel: /^(?:ㅂㅂ|그만|취소)[!]*$/,
  today: /^오늘[!]*$/,
  week: /^이번\s*주[!]*$/,
  month: /^이번\s*달[!]*$/,
  setGoal: /^(?:용돈|목표)\s*(\d+)(?:원)?[!]*$/,
  goal: /^(?:용돈|목표)[!]*$/,
  addHistory: /^(\d+)\s*(.+)\s+(\d+)(?:원)?[!]*$/,
  showCategory: /^(?:카테고리|분류)[!]*$/,
  addCategory: /^(?:카테고리|분류)\s+(\d+)\s+(.+)(?:추가)[!]*$/,
  help: /^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/,
  modifyHelp: /^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/,
  modifySelectedHelp: /^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/
};
const commands = Object.keys(commandParsers).reduce((m, e) => {
  m[e] = e;
  return m;
}, {});

const states = {
  empty: 'empty',
  modify: 'modify',
  modifySelected: 'modifySelected'
};

const stateCommands = {
  [states.empty]: [
    commands.modify,
    commands.today,
    commands.week,
    commands.month,
    commands.setGoal,
    commands.goal,
    commands.addHistory,
    commands.showCategory,
    commands.addCategory,
    commands.help,
    commands.stupid,
    commands.hello
  ],
  [states.modify]: [
    commands.modify,
    commands.modifyNumber,
    commands.modifyCancel,
    commands.modifyHelp
  ],
  [states.modifySelected]: [
    commands.modify,
    commands.modifyNumber,
    commands.modifyCancel,
    commands.modifyDelete,
    commands.modifySelectedHelp
  ]
};

const says = {
  yes: '네!',
  hello: '안녕하세요!',
  stupid: '스투핏!',
  pleaseNumber: '번호를 다시 입력해주세요..!',
  noHistory: '최근 결제 내역이 없습니다!',
  retryModify: '처음부터 다시 수정해주세요 ㅜㅜ',
  deleted: '지웠습니다!',
  modificationCompleted: '수정을 완료합니다 :)',
  modifyHelp: '[숫자]를 입력하여 선택한 내역을 삭제하거나, [그만]을 하여 수정을 그만 둘 수 있어요.',
  modifySelectedHelp:
    '[숫자]를 다시 입력하여 선택한 내역을 바꾸거나, [지워]를 써서 선택된 내역을 지우거나, [그만]을 하여 수정을 그만 둘 수 있어요.',
  help:
    '[분류]를 확인하고, [목표 (원)]으로 목표를 설정합니다. [(분류) (내역) (금액)]을 써서 내역을 입력한 후, [수정]을 할 수도 있습니다. 그리고 [오늘], [이번 주], [이번 달]의 내역을 조회할 수 있어요.',
  goalHelp: '[(목표) 20000원]과 같이 목표를 설정해보세요!',
  categoryHelp: '[(분류) (번호) (이름) 추가]로 분류를 추가해보세요!'
};

let withComma = number => ('' + number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
let merge = texts => {
  console.log('merge=' + JSON.stringify(texts));
  const maxLength = 1900;

  let msgs = [];
  let msg = [];
  for (let text of texts) {
    msg.push(text);
    if (msg.map(e => e.length).reduce((a, b) => a + b, 0) > maxLength) {
      msgs.push(msg.join('\n'));
      msg.removeAll();
    }
  }
  if (msg.length > 0) {
    msgs.push(msg.join('\n'));
  }
  return msgs;
};

let handlers = {
  [commands.modify]: (id, s, cnt) => {
    return pocket.recent(id, cnt || 10).then(res => {
      if (res.length == 0) {
        return says.noHistory;
      }
      res.reverse();
      var number = 1;
      let data = res.map(e => {
        return {
          idx: e.idx,
          text: `[${number++}] (${e.category}) ${e.comment} ${withComma(
            e.amount
          )}`
        };
      });
      return state.save(id, { name: states.modify, data: data }).then(() => {
        return merge(data.map(e => e.text));
      });
    });
  },
  [commands.modifyNumber]: (id, s, n) => {
    if (n === undefined) {
      return says.pleaseNumber;
    }
    const target = +n - 1;
    if (n < 0 && n >= s.data.length) {
      return says.pleaseNumber;
    }
    return state
      .save(id, { name: states.modifySelected, n: target, data: s.data })
      .then(() => s.data[target].text);
  },
  [commands.modifyDelete]: (id, s) => {
    if (s.n === undefined) {
      return says.pleaseNumber;
    }
    const target = s.data[+s.n].idx;
    if (target === undefined) {
      return state
        .save(id, { name: states.empty })
        .then(() => says.retryModfiy);
    }
    return pocket
      .deleteHistory(id, target)
      .then(() => state.save(id, { name: states.modifySelected, idx: s.idx }))
      .then(() => says.deleted);
  },
  [commands.modifyCancel]: id => {
    return state
      .save(id, { name: states.empty })
      .then(() => says.modificationCompleted);
  },
  [commands.modifyHelp]: () => says.modifyHelp,
  [commands.modifySelectedHelp]: () => says.modifySelectedHelp,
  [commands.today]: id => {
    return pocket.goal(id).then(goal => {
      return pocket.today(id).then(res => {
        let totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
        return merge([
          ...res.map(
            e => `[${e.category}] ${e.comment} ${withComma(e.amount)}`
          ),
          `총 ${withComma(totalUsed)}원 사용했고, ${withComma(
            goal.amount - totalUsed
          )}원 남았습니다.`
        ]);
      });
    });
  },
  [commands.week]: id => {
    return pocket.week(id).then(res => {
      let totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
      return merge([
        ...res.map(e => `[${e.category}] ${e.comment} ${withComma(e.amount)}`),
        `총 ${withComma(totalUsed)}원 사용했습니다.`
      ]);
    });
  },
  [commands.month]: id => {
    return pocket.month(id).then(res => {
      let totalUsed = res.map(e => e.amount).reduce((a, b) => a + b, 0);
      return merge([
        ...res.map(e => `[${e.category}] ${e.comment} ${withComma(e.amount)}`),
        `총 ${withComma(totalUsed)}원 사용했습니다.`
      ]);
    });
  },
  [commands.setGoal]: (id, s, amount) => {
    return pocket.setGoal(id, amount).then(() => says.yes);
  },
  [commands.goal]: id => {
    return pocket
      .goal(id)
      .then(
        res =>
          res.amount === 0 ? says.goalHelp : `목표는 ${withComma(res.amount)}원입니다.`
      );
  },
  [commands.addHistory]: (id, s, category, comment, amount) => {
    return pocket
      .addHistory(id, +category, comment, +amount)
      .then(() => says.yes);
  },
  [commands.showCategory]: id => {
    return pocket
      .showCategory(id)
      .then(res => 
        res.length === 0
          ? says.categoryHelp
          : merge(res.map(e => `[${e.alias}] ${e.name}`)));
  },
  [commands.addCategory]: (id, s, alias, name) => {
    return pocket.addCategory(id, +alias, name.trim()).then(res => says.yes);
  },
  [commands.help]: () => says.help,
  [commands.hello]: () => says.hello,
  [commands.stupid]: () => says.stupid
};

let handle = (id, text) => {
  console.log(`user[${id}] requests a text[${text}]`);
  return state.load(id).then(currentState => {
    if (
      currentState.name === undefined ||
      states[currentState.name] === undefined
    ) {
      currentState.name = states.empty;
    }
    console.log(`current state is ${JSON.stringify(currentState)}`);
    const trimmed = (text || '').trim();
    const stateName = states[currentState.name];
    for (let cmd of stateCommands[stateName]) {
      let regex = commandParsers[cmd];
      if (regex.test(trimmed)) {
        console.log(`execute command: ${cmd}`);
        let handler = handlers[cmd];
        if (handler !== undefined) {
          let matches = trimmed.match(regex);
          let result = handler.apply(handler, [
            id,
            currentState,
            ...matches.slice(1, matches.length)
          ]);
          console.log(`result of command[${cmd}] is ${JSON.stringify(result)}`);
          return Promise.resolve(result);
        }
      }
    }
    console.log(`command[${text}] is not found`);
    return Promise.resolve(null);
  });
};

module.exports = {
  handle
};

if (require.main === module) {
  const id = process.argv[2];
  const text = process.argv[3];
  console.log(`id=[${id}], text=[${text}]`);

  handle(id, text).then(console.log).catch(console.log);
}
