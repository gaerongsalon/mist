import { ReportCommand } from "../../commands/report";
import { newPeriodicRoutes } from "./periodic";
import tk from "../../toolkit";

export default tk.partialStateRoutes({
  empty: tk.routes<ReportCommand>({
    ...newPeriodicRoutes(),
  }),
});
