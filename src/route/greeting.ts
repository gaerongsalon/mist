import { $enum } from "ts-enum-util";
import { UserStateName } from "../repository";
import says from "../says";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:안녕|하이|스하).*$/, () => says.hello())
    .add(/^(?:가랑비|낭비).*$/, () => says.warning())
    .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => says.help())
};

for (const state of $enum(UserStateName).values()) {
  const router = routes[state] || (routes[state] = new Router());
  router
    .add(/^(?:어디).*$/, eo => says.whereAmI({ where: eo.state.get().name }))
    .add(/^(?:처음|돌아).*/, eo => {
      eo.state.reset();
      return says.yes();
    });
}

export default routes;
