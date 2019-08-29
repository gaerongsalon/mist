import { DebugCommand } from "../../commands/debug";
import tk from "../../toolkit";

const routes = tk.routes<DebugCommand>({
  showCurrentState: {
    regex: /^(?:어디).*$/,
    parse: () => undefined
  },
  resetState: {
    regex: /^(?:처음|돌아).*/,
    parse: () => undefined
  }
});

export default tk.stateRoutes({
  empty: routes,
  modify: routes,
  modifySelected: routes,
  deleteBudget: routes
});
