import { SettingCommand } from "../../commands/setting";
import tk from "../../toolkit";

export default tk.partialStateRoutes({
  empty: tk.routes<SettingCommand>({
    helpGoal: {
      regex: /^(?:용돈|목표)\s*(?:도움)(?:말)?[!?]?$/,
      parse: () => undefined
    },
    setGoal: {
      regex: /^(?:용돈|목표)\s*(\d+(?:\.\d+)?)(?:\w+)?[!]*$/,
      parse: ([maybeAmount]) => ({ amount: +maybeAmount })
    },
    getGoal: {
      regex: /^(?:용돈|목표)\s*[!]*$/,
      parse: () => undefined
    },

    setTimezoneOffset: {
      regex: /^(?:기본)\s*(?:시간)\s*(-?[0-9]+)[!]*$/,
      parse: ([maybeTimezoneOffset]) => ({
        timezoneOffset: +maybeTimezoneOffset
      })
    },
    getTimezoneOffset: {
      regex: /^(?:기본)\s*(?:시간)\s*[!]*$/,
      parse: () => undefined
    },

    setCurrency: {
      regex: /^(?:기본)\s*(?:화폐)\s*([^ ]+)[!]*$/,
      parse: ([maybeCurrency]) => ({ currency: maybeCurrency.trim() })
    },
    getCurrency: {
      regex: /^(?:기본)\s*(?:화폐)\s*[!]*$/,
      parse: () => undefined
    }
  })
});
