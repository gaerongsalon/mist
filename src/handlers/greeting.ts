import { GreetingCommand } from "../commands/greeting";
import says from "../says";
import tk from "../toolkit";

export default tk.partialStateHandlers({
  empty: tk.handlers<GreetingCommand>({
    hello: () => says.hello(),
    help: () => says.help(),
    warn: () => says.warning(),
  }),
});
