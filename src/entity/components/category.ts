import { EntityElementExtension } from "serverless-stateful-linebot-framework";
import { ICategory, IUser } from "../../models";

const unknownCategoryName = "Unknown";

export class CategoryComponent extends EntityElementExtension<
  IUser,
  ICategory
> {
  constructor(user: IUser) {
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

export const filterCategoryByNameOrAlias = (nameOrAlias: string) => (
  each: ICategory
) => each.name.includes(nameOrAlias) || each.alias === nameOrAlias;
