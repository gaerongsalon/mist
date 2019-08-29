import { EntityElementExtension } from "serverless-stateful-linebot-framework";
import { IBudget, IUser } from "../../models";

export class BudgetComponent extends EntityElementExtension<IUser, IBudget> {
  constructor(user: IUser) {
    super(user, "budgets");
  }

  public findNameByIndex(index: number) {
    const maybe = this.findByIndex(index);
    return maybe ? maybe.name : undefined;
  }

  public findByName(name: string) {
    return this.find(each => each.name === name);
  }

  public get current() {
    return this.findByIndex(this.entity.currentBudgetIndex);
  }
}
