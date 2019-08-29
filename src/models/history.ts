import { IWithIndex } from "serverless-stateful-linebot-framework";

export interface IHistory extends IWithIndex {
  categoryIndex: number;
  budgetIndex: number;
  comment: string;
  amount: number;
  currency: string;
  registered: string;
}
