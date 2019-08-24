export const withComma = (value: number) =>
  ("" + Math.round(value * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const alignTextLines = (texts: string[]) => {
  const maxLength = 1900;
  const msgs: string[] = [];
  let msg: string[] = [];
  for (const text of texts) {
    msg.push(text);
    if (msg.map(e => e.length).reduce((a, b) => a + b, 0) > maxLength) {
      msgs.push(msg.join("\n"));
      msg = [];
    }
  }
  if (msg.length > 0) {
    msgs.push(msg.join("\n"));
  }
  return msgs;
};
