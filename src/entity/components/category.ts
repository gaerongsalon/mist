import { Category, User } from "../../models";

import { EntityElementExtension } from "serverless-stateful-linebot-framework";

const unknownCategoryName = "Unknown";

export class CategoryComponent extends EntityElementExtension<User, Category> {
  constructor(user: User) {
    super(user, "categories");
  }

  public findByNameOrAlias(maybeNameOrAlias?: string) {
    if (!maybeNameOrAlias) {
      return undefined;
    }
    return this.find(filterCategoryByNameOrAlias(maybeNameOrAlias.trim()));
  }

  public findNameByIndex(index: number) {
    const maybe = this.findByIndex(index);
    return maybe ? maybe.name : unknownCategoryName;
  }
}

export const filterCategoryByNameOrAlias =
  (nameOrAlias: string) => (each: Category) =>
    each.name.includes(nameOrAlias) || each.alias === nameOrAlias;
