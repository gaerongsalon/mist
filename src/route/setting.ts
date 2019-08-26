import { UserStateName } from "../repository";
import says from "../says";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:용돈|목표)\s*(?:도움)(?:말)?[!?]?$/, () => says.goalHelp())
    .add(/^(?:용돈|목표)\s*(\d+(?:\.\d+)?)(?:\w+)?[!]*$/, (eo, amount) => {
      eo.value.goal = +amount;
      return says.getsetGoal({
        goal: eo.value.goal,
        currency: eo.userCurrency
      });
    })
    .add(/^(?:용돈|목표)[!]*$/, eo =>
      says.getsetGoal({
        goal: eo.value.goal,
        currency: eo.userCurrency
      })
    )
    .add(/^(?:기본)\s*(?:시간)\s*(-?[0-9]+)?$/, (eo, maybeTimezoneOffset) => {
      if (maybeTimezoneOffset !== undefined) {
        eo.value.timezoneOffset = +maybeTimezoneOffset;
      }
      return says.getsetTimezone({ timezoneOffset: eo.value.timezoneOffset });
    })
    .add(/^(?:기본)\s*(?:화폐)\s*(\w+)?$/, (eo, maybeCurrency) => {
      if (maybeCurrency !== undefined) {
        eo.value.currency = maybeCurrency.trim();
      }
      return says.getsetCurrency({ currency: eo.value.currency });
    })
};

export default routes;
