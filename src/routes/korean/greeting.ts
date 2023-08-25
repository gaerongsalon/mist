import { GreetingCommand } from "../../commands/greeting";
import tk from "../../toolkit";

export default tk.partialStateRoutes({
  empty: tk.routes<GreetingCommand>({
    hello: {
      regex: /^(?:안녕|하이|스하).*$/,
      parse: () => undefined,
    },
    help: {
      regex: /^(?:\?|\?\?|\?.\?|도움|도움말|도와줘)[!]*$/,
      parse: () => undefined,
    },
    warn: {
      regex: /^(?:가랑비|낭비).*$/,
      parse: () => undefined,
    },
  }),
});
