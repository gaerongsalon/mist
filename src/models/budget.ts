import { WithIndex } from "serverless-stateful-linebot-framework";

export interface Budget extends WithIndex {
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  decimalPoint: number;
}
