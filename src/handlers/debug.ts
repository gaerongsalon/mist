import { DebugCommand } from "../commands/debug";
import says from "../says";
import tk from "../toolkit";

const debugHandlers = tk.handlers<DebugCommand>({
  showCurrentState: ({ context: { state } }) =>
    says.whereAmI({ where: state.name }),
  resetState: ({ context }) => {
    context.transit("empty", undefined);
    return says.yes();
  }
});

export default tk.stateHandlers({
  empty: debugHandlers,
  modify: debugHandlers,
  modifySelected: debugHandlers,
  deleteBudget: debugHandlers
});
