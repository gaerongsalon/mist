import { WithIndex } from "serverless-stateful-linebot-framework";

export interface History extends WithIndex {
  categoryIndex: number;
  budgetIndex: number;
  comment: string;
  amount: number;
  currency: string;
  registered: string;
}
