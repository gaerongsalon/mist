import { ReportCommand } from "../../commands/report";
import tk from "../../toolkit";
import { newPeriodicRoutes } from "./periodic";

export default tk.partialStateRoutes({
  empty: tk.routes<ReportCommand>({
    ...newPeriodicRoutes()
  })
});
