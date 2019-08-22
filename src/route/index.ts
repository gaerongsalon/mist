import { UserRepository, UserStateName } from "../repository";
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

const route = async (userId: string, text: string) => {
  console.log(`user[${userId}] requests a text[${text}]`);
  const repository = new UserRepository(userId);
  const eo = await repository.eo();
  if (process.env.NODE_ENV !== "test") {
    console.log(`current user is ${JSON.stringify(eo.value)}`);
  }

  const userState = eo.state.get();
  const cmd = (text || "").trim();
  try {
    console.log(`Handle text[${text}] on user[${JSON.stringify(eo.value)}]`);
    const result = await routes[userState.name].run(cmd, eo);
    // if (process.env.NODE_ENV !== "test") {
    console.log(
      `result of cmd[${cmd}] in user[${userId}]'s state[${JSON.stringify(
        userState
      )}] is result[${JSON.stringify(result)}]`
    );
    // }
    return result;
  } finally {
    await eo.store();
  }
};

export default route;
