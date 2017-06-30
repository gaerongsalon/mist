'use strict';

const withComma = number =>
  ('' + Math.round(number * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const merge = texts => {
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

const route = name => {
  const handlers = [];
  let chain;
  const add = (regex, executor) => {
    handlers.push({
      regex,
      executor
    });
    return chain;
  };

  const run = (text, args) => {
    for (let each of handlers) {
      if (each.regex.test(text)) {
        let matches = text.match(each.regex);
        let result = each.executor.apply(each.executor, [
          ...args,
          ...matches.slice(1, matches.le)
        ]);
        return Promise.resolve(result);
      }
    }
    return Promise.resolve(null);
  };
  return (chain = { add, run });
};

const routes = states =>
  Object.keys(states).reduce((map, name) => {
    map[name] = route(name);
    return map;
  }, {});

module.exports = {
  withComma,
  merge,
  route,
  routes
};
