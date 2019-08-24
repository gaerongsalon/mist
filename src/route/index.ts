import { UserStateName } from "../repository";
import budget from "./budget";
import category from "./category";
import greeting from "./greeting";
import history from "./history";
import report from "./report";
import { mergeRoutes, RouteMap, Router } from "./router";
import setting from "./setting";

const routes: RouteMap = mergeRoutes(
  {
    [UserStateName.empty]: new Router(),
    [UserStateName.modify]: new Router(),
    [UserStateName.modifySelected]: new Router(),
    [UserStateName.deleteBudget]: new Router()
  },
  greeting,
  report,
  budget,
  category,
  history,
  setting
);

export default routes;
