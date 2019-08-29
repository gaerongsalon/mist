import { SummaryCommand } from "../commands/summary";
import tk from "../toolkit";
import { newPeriodicRoutes, parseCategory } from "./periodic";

export default tk.partialStateRoutes({
  empty: tk.routes<SummaryCommand>({
    ...newPeriodicRoutes("(?:누적)\\s*"),
    all: {
      regex: /^(?:누적)\s*(?:전체|모든)?\s*(.*)[!]*$/,
      parse: parseCategory
    }
  })
});
