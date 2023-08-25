import { WithIndex } from "serverless-stateful-linebot-framework";

export interface Category extends WithIndex {
  name: string;
  alias: string;
}
