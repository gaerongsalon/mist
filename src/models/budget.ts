import { IWithIndex } from "serverless-stateful-linebot-framework";

export interface IBudget extends IWithIndex {
  name: string;
  amount: number;
  currency: string;
}
