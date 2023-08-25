import { Budget, User } from "../../models";

import { EntityElementExtension } from "serverless-stateful-linebot-framework";

export class BudgetComponent extends EntityElementExtension<User, Budget> {
  constructor(user: User) {
    super(user, "budgets");
  }

  public findNameByIndex(index: number) {
    const maybe = this.findByIndex(index);
    return maybe ? maybe.name : undefined;
  }

  public findByName(name: string) {
    return this.find((each) => each.name === name);
  }

  public get current() {
    return this.findByIndex(this.entity.currentBudgetIndex);
  }
}
