export type SettingCommand = {
  helpGoal: void;
  setGoal: {
    amount: number;
  };
  getGoal: void;

  setTimezoneOffset: {
    timezoneOffset: number;
  };
  getTimezoneOffset: void;

  setCurrency: {
    currency: string;
  };
  getCurrency: void;
};
