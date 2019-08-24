import { UserStateName } from "../repository";
import says from "../says";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:안녕|하이|스하).*$/, () => says.hello())
    .add(/^(?:스투핏|스뚜삣|스튜핏).*$/, () => says.warning())
    .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => says.help())
};

export default routes;
