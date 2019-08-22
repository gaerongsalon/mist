import { UserStateName } from "../repository";
import says from "../says";
import { withComma } from "../utils/text";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:용돈|목표)\s*(\d+(?:\.\d+)?)(?:\w+)?[!]*$/, (eo, amount) => {
      eo.value.goal = +amount;
      return says.yes;
    })
    .add(
      /^(?:용돈|목표)[!]*$/,
      eo => `목표는 ${withComma(eo.value.goal)}${eo.userCurrency}입니다.`
    )
    .add(/^(?:기본)\s*(?:시간)\s*(-?[0-9]+)?$/, (eo, maybeTimezoneOffset) => {
      if (maybeTimezoneOffset !== undefined) {
        eo.value.timezoneOffset = +maybeTimezoneOffset;
      }
      return `현재 설정된 시간대는 ${eo.value.timezoneOffset}입니다.`;
    })
    .add(/^(?:기본)\s*(?:화폐)\s*(\w+)?$/, (eo, maybeCurrency) => {
      if (maybeCurrency !== undefined) {
        eo.value.currency = maybeCurrency.trim();
      }
      return `현재 설정된 기본 화폐는 ${eo.value.currency}입니다.`;
    })
};

export default routes;
