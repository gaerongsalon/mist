import { IWithIndex } from "serverless-stateful-linebot-framework";

export interface ICategory extends IWithIndex {
  name: string;
  alias: string;
}
