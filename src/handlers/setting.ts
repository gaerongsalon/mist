import { SettingCommand } from "../commands/setting";
import says from "../says";
import tk from "../toolkit";

export default tk.partialStateHandlers({
  empty: tk.handlers<SettingCommand>({
    helpGoal: () => says.goalHelp(),
    setGoal: ({ context: { t }, amount }) => {
      t.value.goal = amount;
      return says.getsetGoal({
        goal: t.value.goal,
        currency: t.userCurrency
      });
    },
    getGoal: ({ context: { t } }) =>
      says.getsetGoal({ goal: t.value.goal, currency: t.userCurrency }),

    setTimezoneOffset: ({ context: { t }, timezoneOffset }) => {
      t.value.timezoneOffset = timezoneOffset;
      return says.getsetTimezone({ timezoneOffset: t.value.timezoneOffset });
    },
    getTimezoneOffset: ({ context: { t } }) =>
      says.getsetTimezone({ timezoneOffset: t.value.timezoneOffset }),

    setCurrency: ({ context: { t }, currency }) => {
      t.value.currency = currency;
      return says.getsetCurrency({ currency: t.value.currency });
    },
    getCurrency: ({ context: { t } }) =>
      says.getsetCurrency({ currency: t.value.currency })
  })
});
